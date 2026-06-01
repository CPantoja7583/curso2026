const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const { Pool } = require("pg");

const { StockError, buildFilterQuery, createOrdenTransaccional } = require("./order-service");

const PORT = Number(process.env.PORT || 3012);
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
};

async function initializeDatabase() {
  const sql = await fs.readFile(path.join(__dirname, "sql", "init.sql"), "utf8");
  await pool.query(sql);
}

function json(response, statusCode, body) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
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
    const invalid = new Error("JSON invalido");
    invalid.statusCode = 400;
    throw invalid;
  }
}

function paramsFromUrl(searchParams) {
  return Object.fromEntries(searchParams.entries());
}

async function handleGet(response, url) {
  const params = paramsFromUrl(url.searchParams);
  const query = buildFilterQuery(params);

  if (!query) {
    await serveStatic(response, url.pathname);
    return;
  }

  const { rows } = await pool.query(query);
  json(response, 200, { ok: true, data: rows });
}

async function handlePostOrden(request, response) {
  const payload = await readJsonBody(request);

  try {
    const orden = await createOrdenTransaccional(pool, payload);
    json(response, 201, { ok: true, mensaje: "Orden creada", data: orden });
  } catch (error) {
    if (error instanceof StockError) {
      json(response, 409, { ok: false, mensaje: error.message });
      return;
    }

    if (error.statusCode === 400) {
      json(response, 400, { ok: false, mensaje: error.message });
      return;
    }

    throw error;
  }
}

async function serveStatic(response, pathname) {
  const requestedPath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.normalize(path.join(PUBLIC_DIR, requestedPath));

  if (!filePath.startsWith(PUBLIC_DIR)) {
    json(response, 403, { ok: false, mensaje: "Ruta no permitida" });
    return;
  }

  try {
    const file = await fs.readFile(filePath);
    response.writeHead(200, { "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream" });
    response.end(file);
  } catch (error) {
    json(response, 404, { ok: false, mensaje: "Recurso no encontrado" });
  }
}

async function routeRequest(request, response) {
  const url = new URL(request.url, `http://${request.headers.host}`);

  try {
    if (request.method === "GET") {
      await handleGet(response, url);
      return;
    }

    if (request.method === "POST" && url.pathname === "/orden") {
      await handlePostOrden(request, response);
      return;
    }

    json(response, 405, { ok: false, mensaje: "Metodo no permitido" });
  } catch (error) {
    console.error(error);
    json(response, error.statusCode || 500, { ok: false, mensaje: error.statusCode ? error.message : "Error interno" });
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
