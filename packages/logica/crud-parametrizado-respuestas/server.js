const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const { Pool } = require("pg");

const {
  buildCreateClienteQuery,
  buildDeleteByRutQuery,
  buildDeleteCandidateQuery,
  buildSelectClientesQuery,
  buildUpdateNombreQuery,
  failureResponse,
  successResponse,
  validateCliente,
  validateEdad,
} = require("./clientes");

const PORT = Number(process.env.PORT || 3011);
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
  await pool.query({
    text: `
      CREATE TABLE IF NOT EXISTS clientes (
        rut VARCHAR(20) PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        edad INT NOT NULL
      )
    `,
    values: [],
  });

  const { rows } = await pool.query({
    text: "SELECT COUNT(*)::int AS total FROM clientes",
    values: [],
  });

  if (rows[0].total > 0) {
    return;
  }

  await pool.query({
    text: `
      INSERT INTO clientes (rut, nombre, edad)
      VALUES
        ($1, $2, $3),
        ($4, $5, $6),
        ($7, $8, $9),
        ($10, $11, $12)
    `,
    values: [
      "11.111.111-1",
      "Ana Perez",
      31,
      "22.222.222-2",
      "Luis Soto",
      24,
      "33.333.333-3",
      "Camila Rojas",
      29,
      "44.444.444-4",
      "Diego Morales",
      36,
    ],
  });
}

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

function methodNotAllowed(response) {
  sendJson(response, 405, failureResponse("Metodo no permitido"));
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

function getFilters(searchParams) {
  const filters = {};
  for (const key of ["rut", "edad", "nombre"]) {
    const value = searchParams.get(key);
    if (value !== null && value.trim() !== "") {
      filters[key] = value;
    }
  }
  return filters;
}

function hasFilters(filters) {
  return Boolean(filters.rut || filters.edad || filters.nombre);
}

function validateFilterTypes(filters) {
  if (filters.edad) {
    const edad = validateEdad(filters.edad);
    if (!edad.valid) {
      return edad.mensaje;
    }
  }

  return null;
}

async function handleGetClientes(response, filters) {
  const filterError = validateFilterTypes(filters);
  if (filterError) {
    sendJson(response, 400, failureResponse(filterError));
    return;
  }

  const { rows } = await pool.query(buildSelectClientesQuery(filters));
  if (hasFilters(filters) && rows.length === 0) {
    sendJson(response, 404, failureResponse("Cliente no existe"));
    return;
  }

  sendJson(response, 200, successResponse({ data: rows }));
}

async function handlePostCliente(request, response) {
  const body = await readJsonBody(request);
  const validation = validateCliente(body);

  if (!validation.valid) {
    sendJson(response, 400, failureResponse("Datos invalidos", { errores: validation.errores }));
    return;
  }

  try {
    const { rows } = await pool.query(buildCreateClienteQuery(body));
    sendJson(response, 201, successResponse({ data: rows[0] }));
  } catch (error) {
    if (error.code === "23505") {
      sendJson(response, 409, failureResponse("Rut duplicado"));
      return;
    }
    throw error;
  }
}

async function handlePutCliente(request, response, rut) {
  const body = await readJsonBody(request);
  const validation = validateCliente(body, { requireRut: false, requireEdad: false });

  if (!rut || !validation.valid) {
    sendJson(response, 400, failureResponse("Datos invalidos", { errores: validation.errores }));
    return;
  }

  const result = await pool.query(buildUpdateNombreQuery(rut, body));
  if (result.rowCount === 0) {
    sendJson(response, 404, failureResponse("Cliente no existe"));
    return;
  }

  sendJson(
    response,
    200,
    successResponse({ rowCount: result.rowCount, mensaje: "Actualizado correctamente", data: result.rows[0] }),
  );
}

async function deleteSingleByRut(response, rut) {
  const result = await pool.query(buildDeleteByRutQuery(rut));
  if (result.rowCount === 0) {
    sendJson(response, 404, failureResponse("Cliente no existe"));
    return;
  }

  sendJson(
    response,
    200,
    successResponse({ rowCount: result.rowCount, mensaje: "Eliminado correctamente", data: result.rows[0] }),
  );
}

async function handleDeleteCliente(response, filters) {
  const filterError = validateFilterTypes(filters);
  if (filterError) {
    sendJson(response, 400, failureResponse(filterError));
    return;
  }

  if (filters.rut) {
    await deleteSingleByRut(response, filters.rut);
    return;
  }

  if (!filters.nombre && !filters.edad) {
    sendJson(response, 400, failureResponse("Debe indicar rut, nombre o edad para eliminar"));
    return;
  }

  const candidates = await pool.query(buildDeleteCandidateQuery(filters));
  if (candidates.rowCount === 0) {
    sendJson(response, 404, failureResponse("Cliente no existe"));
    return;
  }

  if (candidates.rowCount > 1) {
    sendJson(response, 400, failureResponse("Hay mas de un cliente; refine el criterio antes de eliminar"));
    return;
  }

  await deleteSingleByRut(response, candidates.rows[0].rut);
}

async function serveStatic(request, response, pathname) {
  const requestedPath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.normalize(path.join(PUBLIC_DIR, requestedPath));

  if (!filePath.startsWith(PUBLIC_DIR)) {
    sendJson(response, 403, failureResponse("Ruta no permitida"));
    return;
  }

  try {
    const file = await fs.readFile(filePath);
    response.writeHead(200, { "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream" });
    response.end(file);
  } catch (error) {
    sendJson(response, 404, failureResponse("Recurso no encontrado"));
  }
}

async function routeRequest(request, response) {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const pathname = decodeURIComponent(url.pathname);
  const updateMatch = pathname.match(/^\/clientes\/([^/]+)$/);

  try {
    if (pathname === "/clientes") {
      const filters = getFilters(url.searchParams);

      if (request.method === "GET") {
        await handleGetClientes(response, filters);
        return;
      }

      if (request.method === "POST") {
        await handlePostCliente(request, response);
        return;
      }

      if (request.method === "DELETE") {
        await handleDeleteCliente(response, filters);
        return;
      }

      methodNotAllowed(response);
      return;
    }

    if (updateMatch) {
      if (request.method === "PUT") {
        await handlePutCliente(request, response, updateMatch[1]);
        return;
      }

      methodNotAllowed(response);
      return;
    }

    if (request.method === "GET") {
      await serveStatic(request, response, pathname);
      return;
    }

    methodNotAllowed(response);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const message = statusCode === 500 ? "Error interno del servidor" : error.message;
    sendJson(response, statusCode, failureResponse(message));
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
