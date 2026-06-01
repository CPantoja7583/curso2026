const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const { Pool } = require("pg");
const {
  buildDeleteClientesQuery,
  buildSelectClientesQuery,
  buildUpdateClienteQuery,
  normalizeClientePayload,
  validateClientePayload
} = require("./queries");

const HOST = process.env.HOST || "127.0.0.1";
const PORT = Number(process.env.PORT) || 3009;
const publicDir = path.join(__dirname, "public");

const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT) || 5432,
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "curso_modulo_6"
      }
);

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload, null, 2));
}

function sendText(response, statusCode, message) {
  response.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8" });
  response.end(message);
}

function collectRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk.toString();
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

function mapCliente(row) {
  return {
    rut: row.rut,
    nombre: row.nombre,
    edad: Number(row.edad)
  };
}

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS clientes (
      rut VARCHAR(15) PRIMARY KEY,
      nombre VARCHAR(120) NOT NULL,
      edad INTEGER NOT NULL
    )
  `);

  const result = await pool.query("SELECT COUNT(*)::int AS total FROM clientes");
  if (result.rows[0].total === 0) {
    await pool.query(`
      INSERT INTO clientes (rut, nombre, edad) VALUES
        ('11111111-1', 'Ana Torres', 31),
        ('22222222-2', 'Bruno Diaz', 44),
        ('33333333-3', 'Camila Rojas', 31),
        ('44444444-4', 'Daniela Soto', 27),
        ('55555555-5', 'Esteban Mena', 52)
    `);
  }
}

function getNoMatchMessage(mode) {
  if (mode === "rut") return "cliente no existe";
  return "no hay clientes que cumplan con el criterio";
}

async function handleGetClientes(requestUrl, response) {
  try {
    const query = buildSelectClientesQuery(Object.fromEntries(requestUrl.searchParams.entries()));
    const result = await pool.query(query.text, query.values);

    if (!result.rows.length && query.mode !== "all") {
      sendJson(response, query.mode === "rut" ? 404 : 200, {
        mensaje: getNoMatchMessage(query.mode),
        clientes: []
      });
      return;
    }

    sendJson(response, 200, result.rows.map(mapCliente));
  } catch (error) {
    sendJson(response, 400, { error: error.message });
  }
}

async function handlePostCliente(request, response) {
  try {
    const payload = JSON.parse(await collectRequestBody(request) || "{}");
    const validation = validateClientePayload(payload);

    if (!validation.valid) {
      sendJson(response, 400, { error: validation.error });
      return;
    }

    const cliente = normalizeClientePayload(payload);
    const result = await pool.query(
      "INSERT INTO clientes (rut, nombre, edad) VALUES ($1, $2, $3) RETURNING rut, nombre, edad",
      [cliente.rut, cliente.nombre, cliente.edad]
    );

    sendJson(response, 201, mapCliente(result.rows[0]));
  } catch (error) {
    if (error.code === "23505") {
      sendJson(response, 409, { error: "Ya existe un cliente con ese rut." });
      return;
    }

    sendJson(response, 400, { error: "JSON invalido o datos no procesables.", details: error.message });
  }
}

async function handleDeleteCliente(requestUrl, routeRut, response) {
  try {
    const filters = routeRut
      ? { rut: routeRut }
      : Object.fromEntries(requestUrl.searchParams.entries());
    const query = buildDeleteClientesQuery(filters);
    const result = await pool.query(query.text, query.values);

    if (!result.rows.length) {
      sendJson(response, query.mode === "rut" ? 404 : 200, {
        mensaje: query.mode === "rut" ? "cliente no existe" : "no hay clientes que cumplan con el criterio",
        eliminados: []
      });
      return;
    }

    sendJson(response, 200, {
      mensaje: `Se eliminaron ${result.rows.length} cliente(s).`,
      eliminados: result.rows.map(mapCliente),
      nombres: result.rows.map((row) => row.nombre)
    });
  } catch (error) {
    sendJson(response, 400, { error: error.message });
  }
}

async function handlePutCliente(request, routeRut, response) {
  try {
    const payload = JSON.parse(await collectRequestBody(request) || "{}");
    const query = buildUpdateClienteQuery(routeRut, payload);
    const result = await pool.query(query.text, query.values);

    if (!result.rows.length) {
      sendJson(response, 404, { error: "cliente no existe" });
      return;
    }

    sendJson(response, 200, mapCliente(result.rows[0]));
  } catch (error) {
    sendJson(response, 400, { error: error.message });
  }
}

function getContentType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".html") return "text/html; charset=utf-8";
  if (extension === ".css") return "text/css; charset=utf-8";
  if (extension === ".js") return "application/javascript; charset=utf-8";
  return "application/octet-stream";
}

function getStaticFilePath(urlPath, rootDir = publicDir) {
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(urlPath);
  } catch {
    return null;
  }

  const requestedPath = decodedPath === "/" ? "/index.html" : decodedPath;
  const filePath = path.resolve(rootDir, requestedPath.replace(/^\/+/, ""));
  const rootPath = path.resolve(rootDir);

  if (filePath !== rootPath && !filePath.startsWith(`${rootPath}${path.sep}`)) {
    return null;
  }

  return filePath;
}

async function serveStaticFile(requestUrl, response) {
  const filePath = getStaticFilePath(requestUrl.pathname);

  if (!filePath) {
    sendText(response, 404, "Recurso no encontrado.");
    return;
  }

  try {
    const file = await fs.readFile(filePath);
    response.writeHead(200, { "Content-Type": getContentType(filePath) });
    response.end(file);
  } catch {
    sendText(response, 404, "Recurso no encontrado.");
  }
}

async function handleRequest(request, response) {
  const requestUrl = new URL(request.url, `http://${request.headers.host}`);
  const clientRutMatch = requestUrl.pathname.match(/^\/clientes\/([^/]+)$/);

  if (requestUrl.pathname === "/clientes") {
    if (request.method === "GET") {
      await handleGetClientes(requestUrl, response);
      return;
    }

    if (request.method === "POST") {
      await handlePostCliente(request, response);
      return;
    }

    if (request.method === "DELETE") {
      await handleDeleteCliente(requestUrl, null, response);
      return;
    }

    sendJson(response, 405, { error: `Metodo ${request.method} no permitido.` });
    return;
  }

  if (clientRutMatch) {
    const routeRut = decodeURIComponent(clientRutMatch[1]);

    if (request.method === "DELETE") {
      await handleDeleteCliente(requestUrl, routeRut, response);
      return;
    }

    if (request.method === "PUT") {
      await handlePutCliente(request, routeRut, response);
      return;
    }

    sendJson(response, 405, { error: `Metodo ${request.method} no permitido.` });
    return;
  }

  if (request.method !== "GET") {
    sendText(response, 405, `Metodo ${request.method} no permitido.`);
    return;
  }

  await serveStaticFile(requestUrl, response);
}

async function startServer() {
  await initializeDatabase();
  const server = http.createServer(handleRequest);
  server.listen(PORT, HOST, () => {
    console.log(`Consultas parametrizadas disponible en http://${HOST}:${PORT}`);
  });
  return server;
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error("No se pudo iniciar el servidor:", error.message);
    process.exit(1);
  });
}

module.exports = {
  handleRequest,
  initializeDatabase,
  startServer
};
