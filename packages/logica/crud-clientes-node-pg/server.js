const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const { Pool } = require("pg");

const {
  buildCreateClienteQuery,
  buildDeleteClienteQuery,
  buildSelectClientesQuery,
  buildUpdateClienteQuery,
  validateClientePayload,
} = require("./cliente-queries");

const PORT = Number(process.env.PORT || 3010);
const PUBLIC_DIR = path.join(__dirname, "public");

const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT || 5432),
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "postgres",
        database: process.env.DB_NAME || "curso_modulo_6",
      },
);

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS clientes (
      rut VARCHAR(20) PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      edad INT NOT NULL
    )
  `);

  const { rows } = await pool.query("SELECT COUNT(*)::int AS total FROM clientes");
  if (rows[0].total > 0) {
    return;
  }

  await pool.query(`
    INSERT INTO clientes (rut, nombre, edad)
    VALUES
      ('11.111.111-1', 'Ana Perez', 31),
      ('22.222.222-2', 'Luis Soto', 24),
      ('33.333.333-3', 'Camila Rojas', 29),
      ('44.444.444-4', 'Diego Morales', 36)
  `);
}

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

function sendMethodNotAllowed(response) {
  response.writeHead(405, {
    "Content-Type": "application/json; charset=utf-8",
    Allow: "GET, POST, PUT, DELETE",
  });
  response.end(JSON.stringify({ mensaje: "Metodo no permitido" }));
}

async function readJsonBody(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch (error) {
    const invalidJsonError = new Error("JSON invalido");
    invalidJsonError.statusCode = 400;
    throw invalidJsonError;
  }
}

async function serveStatic(request, response, pathname) {
  const requestedPath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.normalize(path.join(PUBLIC_DIR, requestedPath));

  if (!filePath.startsWith(PUBLIC_DIR)) {
    sendJson(response, 403, { mensaje: "Ruta no permitida" });
    return;
  }

  try {
    const content = await fs.readFile(filePath);
    const extension = path.extname(filePath);
    response.writeHead(200, { "Content-Type": mimeTypes[extension] || "application/octet-stream" });
    response.end(content);
  } catch (error) {
    sendJson(response, 404, { mensaje: "Recurso no encontrado" });
  }
}

async function handleGetClientes(response) {
  const { rows } = await pool.query(buildSelectClientesQuery());
  sendJson(response, 200, { clientes: rows });
}

async function handleCreateCliente(request, response) {
  const body = await readJsonBody(request);
  const validation = validateClientePayload(body);

  if (!validation.valid) {
    sendJson(response, 400, { mensaje: "Datos invalidos", errores: validation.errors });
    return;
  }

  try {
    const { rows } = await pool.query(buildCreateClienteQuery(body));
    sendJson(response, 201, { mensaje: "Cliente creado", cliente: rows[0] });
  } catch (error) {
    if (error.code === "23505") {
      sendJson(response, 409, { mensaje: "Ya existe un cliente con ese rut" });
      return;
    }

    throw error;
  }
}

async function handleUpdateCliente(request, response, rut) {
  const body = await readJsonBody(request);
  const validation = validateClientePayload(body, { requireRut: false, requireEdad: false });

  if (!rut || !validation.valid) {
    sendJson(response, 400, { mensaje: "Datos invalidos", errores: validation.errors });
    return;
  }

  const { rows } = await pool.query(buildUpdateClienteQuery(rut, body));
  if (rows.length === 0) {
    sendJson(response, 404, { mensaje: "Cliente no encontrado" });
    return;
  }

  sendJson(response, 200, { mensaje: "Cliente actualizado", cliente: rows[0] });
}

async function handleDeleteCliente(response, rut) {
  if (!rut) {
    sendJson(response, 400, { mensaje: "rut es obligatorio" });
    return;
  }

  const { rows } = await pool.query(buildDeleteClienteQuery(rut));
  if (rows.length === 0) {
    sendJson(response, 404, { mensaje: "Cliente no encontrado" });
    return;
  }

  sendJson(response, 200, { mensaje: "Cliente eliminado", cliente: rows[0] });
}

async function routeRequest(request, response) {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const pathname = decodeURIComponent(url.pathname);
  const clienteRutMatch = pathname.match(/^\/clientes\/([^/]+)$/);

  try {
    if (pathname === "/clientes") {
      if (request.method === "GET") {
        await handleGetClientes(response);
        return;
      }

      if (request.method === "POST") {
        await handleCreateCliente(request, response);
        return;
      }

      sendMethodNotAllowed(response);
      return;
    }

    if (clienteRutMatch) {
      const rut = clienteRutMatch[1];

      if (request.method === "PUT") {
        await handleUpdateCliente(request, response, rut);
        return;
      }

      if (request.method === "DELETE") {
        await handleDeleteCliente(response, rut);
        return;
      }

      sendMethodNotAllowed(response);
      return;
    }

    if (request.method === "GET") {
      await serveStatic(request, response, pathname);
      return;
    }

    sendMethodNotAllowed(response);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const message = statusCode === 500 ? "Error interno del servidor" : error.message;
    sendJson(response, statusCode, { mensaje: message });
    if (statusCode === 500) {
      console.error(error);
    }
  }
}

const server = http.createServer(routeRequest);

if (require.main === module) {
  initializeDatabase()
    .then(() => {
      server.listen(PORT, () => {
        console.log(`Servidor disponible en http://127.0.0.1:${PORT}`);
      });
    })
    .catch((error) => {
      console.error("No se pudo inicializar la base de datos", error);
      process.exit(1);
    });
}

module.exports = {
  initializeDatabase,
  routeRequest,
  server,
};
