const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const { Pool } = require("pg");

const HOST = process.env.HOST || "127.0.0.1";
const PORT = Number(process.env.PORT) || 3006;
const publicDir = path.join(__dirname, "public");

const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT) || 5432,
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "reto_modulo_6"
      }
);

function generateCartonNumbers() {
  const numbers = Array.from({ length: 30 }, (_, index) => index + 1);

  for (let index = numbers.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [numbers[index], numbers[randomIndex]] = [numbers[randomIndex], numbers[index]];
  }

  return numbers.slice(0, 15).sort((left, right) => left - right);
}

function mapCartonRow(row) {
  return {
    serie: Number(row.serie),
    numeros: row.numeros.map(Number)
  };
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload, null, 2));
}

function sendText(response, statusCode, message) {
  response.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8" });
  response.end(message);
}

function getContentType(filePath) {
  const extension = path.extname(filePath).toLowerCase();

  if (extension === ".html") return "text/html; charset=utf-8";
  if (extension === ".css") return "text/css; charset=utf-8";
  if (extension === ".js") return "application/javascript; charset=utf-8";
  if (extension === ".svg") return "image/svg+xml";
  if (extension === ".png") return "image/png";
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
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

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cartones (
      serie SERIAL PRIMARY KEY,
      numeros INTEGER[] NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  const result = await pool.query("SELECT COUNT(*)::int AS total FROM cartones");
  const total = result.rows[0].total;

  if (total === 0) {
    for (let index = 0; index < 5; index += 1) {
      await insertCarton();
    }
  }
}

async function listCartones() {
  const result = await pool.query("SELECT serie, numeros FROM cartones ORDER BY serie");
  return result.rows.map(mapCartonRow);
}

async function insertCarton() {
  const numbers = generateCartonNumbers();
  const result = await pool.query(
    "INSERT INTO cartones (numeros) VALUES ($1::integer[]) RETURNING serie, numeros",
    [numbers]
  );

  return mapCartonRow(result.rows[0]);
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

  if (requestUrl.pathname === "/api/cartones") {
    if (request.method === "GET") {
      try {
        sendJson(response, 200, await listCartones());
      } catch (error) {
        sendJson(response, 500, {
          error: "No se pudieron leer los cartones.",
          details: error.message
        });
      }
      return;
    }

    if (request.method === "POST") {
      try {
        sendJson(response, 201, await insertCarton());
      } catch (error) {
        sendJson(response, 500, {
          error: "No se pudo crear el carton.",
          details: error.message
        });
      }
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
    console.log(`Servidor ejecutandose en http://${HOST}:${PORT}`);
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
  generateCartonNumbers,
  getStaticFilePath,
  handleRequest,
  initializeDatabase,
  insertCarton,
  listCartones,
  mapCartonRow,
  startServer
};
