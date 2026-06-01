const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const { Pool } = require("pg");

const HOST = process.env.HOST || "127.0.0.1";
const PORT = Number(process.env.PORT) || 3008;
const publicDir = path.join(__dirname, "public");

function buildConfigPoolOptions(env = process.env) {
  return {
    host: env.DB_HOST || "localhost",
    port: Number(env.DB_PORT) || 5432,
    user: env.DB_USER || "postgres",
    password: env.DB_PASSWORD || "",
    database: env.DB_NAME || "curso_modulo_5"
  };
}

function buildConnectionStringPoolOptions(env = process.env) {
  return {
    connectionString:
      env.DATABASE_URL ||
      `postgres://${env.DB_USER || "postgres"}:${env.DB_PASSWORD || ""}@${env.DB_HOST || "localhost"}:${Number(env.DB_PORT) || 5432}/${env.DB_NAME || "curso_modulo_5"}`
  };
}

const configPool = new Pool(buildConfigPoolOptions());
const connectionStringPool = new Pool(buildConnectionStringPoolOptions());

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload, null, 2));
}

function sendText(response, statusCode, message) {
  response.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8" });
  response.end(message);
}

function formatDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function formatFinanza(row) {
  return {
    id: Number(row.id),
    descripcion: row.descripcion,
    categoria: row.categoria,
    monto: Number(row.monto),
    fecha: formatDate(row.fecha)
  };
}

function formatCliente(row) {
  return {
    id: Number(row.id),
    nombre: row.nombre,
    email: row.email,
    telefono: row.telefono
  };
}

async function initializeFinanzasTable() {
  await configPool.query(`
    CREATE TABLE IF NOT EXISTS finanzas_personales (
      id SERIAL PRIMARY KEY,
      descripcion VARCHAR(120) NOT NULL,
      categoria VARCHAR(60) NOT NULL,
      monto INTEGER NOT NULL,
      fecha DATE NOT NULL DEFAULT CURRENT_DATE
    )
  `);

  const result = await configPool.query("SELECT COUNT(*)::int AS total FROM finanzas_personales");
  if (result.rows[0].total === 0) {
    await configPool.query(`
      INSERT INTO finanzas_personales (descripcion, categoria, monto, fecha) VALUES
        ('Sueldo mensual', 'Ingreso', 850000, '2026-05-01'),
        ('Arriendo', 'Gasto fijo', 320000, '2026-05-05'),
        ('Supermercado', 'Alimentacion', 95000, '2026-05-10'),
        ('Transporte', 'Movilidad', 42000, '2026-05-12')
    `);
  }
}

async function initializeClientesTable() {
  await connectionStringPool.query(`
    CREATE TABLE IF NOT EXISTS clientes (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(120) NOT NULL,
      email VARCHAR(140) NOT NULL,
      telefono VARCHAR(30) NOT NULL
    )
  `);

  const result = await connectionStringPool.query("SELECT COUNT(*)::int AS total FROM clientes");
  if (result.rows[0].total === 0) {
    await connectionStringPool.query(`
      INSERT INTO clientes (nombre, email, telefono) VALUES
        ('Ana Torres', 'ana.torres@example.com', '+56911111111'),
        ('Carlos Rojas', 'carlos.rojas@example.com', '+56922222222'),
        ('Sofia Medina', 'sofia.medina@example.com', '+56933333333')
    `);
  }
}

async function initializeDatabase() {
  await initializeFinanzasTable();
  await initializeClientesTable();
}

async function listFinanzas() {
  const result = await configPool.query(
    "SELECT id, descripcion, categoria, monto, fecha FROM finanzas_personales ORDER BY fecha DESC, id DESC"
  );
  return result.rows.map(formatFinanza);
}

async function listClientes() {
  const result = await connectionStringPool.query(
    "SELECT id, nombre, email, telefono FROM clientes ORDER BY id"
  );
  return result.rows.map(formatCliente);
}

function getContentType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".html") return "text/html; charset=utf-8";
  if (extension === ".css") return "text/css; charset=utf-8";
  if (extension === ".js") return "application/javascript; charset=utf-8";
  if (extension === ".svg") return "image/svg+xml";
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
  const relativePath = requestedPath.replace(/^\/+/, "");
  const filePath = path.resolve(rootDir, relativePath);
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

  if (requestUrl.pathname === "/finanzas" || requestUrl.pathname === "/api/finanzas") {
    if (request.method !== "GET") {
      sendJson(response, 405, { error: `Metodo ${request.method} no permitido.` });
      return;
    }

    try {
      sendJson(response, 200, await listFinanzas());
    } catch (error) {
      sendJson(response, 500, {
        error: "No se pudieron obtener las finanzas personales.",
        details: error.message
      });
    }
    return;
  }

  if (requestUrl.pathname === "/clientes" || requestUrl.pathname === "/api/clientes") {
    if (request.method !== "GET") {
      sendJson(response, 405, { error: `Metodo ${request.method} no permitido.` });
      return;
    }

    try {
      sendJson(response, 200, await listClientes());
    } catch (error) {
      sendJson(response, 500, {
        error: "No se pudieron obtener los clientes.",
        details: error.message
      });
    }
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
    console.log(`Servidor Node + pg disponible en http://${HOST}:${PORT}`);
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
  buildConfigPoolOptions,
  buildConnectionStringPoolOptions,
  formatCliente,
  formatFinanza,
  getStaticFilePath,
  handleRequest,
  initializeDatabase,
  listClientes,
  listFinanzas,
  startServer
};
