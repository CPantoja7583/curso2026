const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");

const HOST = process.env.HOST || "127.0.0.1";
const PORT = Number(process.env.PORT) || 3007;
const dataFilePath = path.join(__dirname, "mascotas.json");
const publicDir = path.join(__dirname, "public");

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload, null, 2));
}

function sendText(response, statusCode, message) {
  response.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8" });
  response.end(message);
}

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizeForCompare(value) {
  return normalizeText(value).toLowerCase();
}

function validateMascota(payload) {
  if (!payload || typeof payload.nombre !== "string" || !normalizeText(payload.nombre)) {
    return { valid: false, error: "Debes enviar un nombre de mascota valido." };
  }

  if (typeof payload.rut !== "string" || !normalizeText(payload.rut)) {
    return { valid: false, error: "Debes enviar el rut del dueno." };
  }

  return { valid: true };
}

function normalizeMascota(payload) {
  return {
    nombre: normalizeText(payload.nombre),
    rut: normalizeText(payload.rut)
  };
}

function filterMascotas(mascotas, filters) {
  const nombre = normalizeForCompare(filters.nombre);
  const rut = normalizeForCompare(filters.rut);

  if (nombre) {
    return mascotas.filter((mascota) => normalizeForCompare(mascota.nombre) === nombre);
  }

  if (rut) {
    return mascotas.filter((mascota) => normalizeForCompare(mascota.rut) === rut);
  }

  return mascotas;
}

function deleteMascotasByNombre(mascotas, nombre) {
  const searchName = normalizeForCompare(nombre);
  const filtered = mascotas.filter((mascota) => normalizeForCompare(mascota.nombre) !== searchName);

  return {
    deleted: mascotas.length - filtered.length,
    mascotas: filtered
  };
}

function deleteMascotasByRut(mascotas, rut) {
  const searchRut = normalizeForCompare(rut);
  const filtered = mascotas.filter((mascota) => normalizeForCompare(mascota.rut) !== searchRut);

  return {
    deleted: mascotas.length - filtered.length,
    mascotas: filtered
  };
}

async function ensureDataFile() {
  try {
    await fs.access(dataFilePath);
  } catch {
    await fs.writeFile(dataFilePath, "[]\n", "utf8");
  }
}

async function readMascotas() {
  await ensureDataFile();
  const content = await fs.readFile(dataFilePath, "utf8");
  const data = JSON.parse(content || "[]");
  return Array.isArray(data) ? data : [];
}

async function writeMascotas(mascotas) {
  await fs.writeFile(dataFilePath, `${JSON.stringify(mascotas, null, 2)}\n`, "utf8");
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

async function handleMascotasRequest(request, response, requestUrl) {
  if (request.method === "GET") {
    try {
      const mascotas = await readMascotas();
      const result = filterMascotas(mascotas, {
        nombre: requestUrl.searchParams.get("nombre"),
        rut: requestUrl.searchParams.get("rut")
      });
      sendJson(response, 200, result);
    } catch (error) {
      sendJson(response, 500, { error: "No se pudieron leer las mascotas.", details: error.message });
    }
    return;
  }

  if (request.method === "POST") {
    try {
      const body = await collectRequestBody(request);
      const payload = JSON.parse(body || "{}");
      const validation = validateMascota(payload);

      if (!validation.valid) {
        sendJson(response, 400, { error: validation.error });
        return;
      }

      const mascotas = await readMascotas();
      const mascota = normalizeMascota(payload);
      mascotas.push(mascota);
      await writeMascotas(mascotas);
      sendJson(response, 201, mascota);
    } catch (error) {
      sendJson(response, 400, { error: "JSON invalido.", details: error.message });
    }
    return;
  }

  if (request.method === "DELETE") {
    const nombre = requestUrl.searchParams.get("nombre");
    const rut = requestUrl.searchParams.get("rut");

    if (!normalizeText(nombre) && !normalizeText(rut)) {
      sendJson(response, 400, { error: "Debes indicar nombre o rut para eliminar." });
      return;
    }

    try {
      const mascotas = await readMascotas();
      const result = normalizeText(nombre)
        ? deleteMascotasByNombre(mascotas, nombre)
        : deleteMascotasByRut(mascotas, rut);

      if (result.deleted === 0) {
        sendJson(response, 404, { error: "No se encontraron mascotas para eliminar." });
        return;
      }

      await writeMascotas(result.mascotas);
      sendJson(response, 200, {
        mensaje: `Se eliminaron ${result.deleted} mascota(s).`,
        eliminadas: result.deleted
      });
    } catch (error) {
      sendJson(response, 500, { error: "No se pudieron eliminar las mascotas.", details: error.message });
    }
    return;
  }

  sendJson(response, 405, { error: `Metodo ${request.method} no permitido.` });
}

async function handleRequest(request, response) {
  const requestUrl = new URL(request.url, `http://${request.headers.host}`);

  if (requestUrl.pathname === "/api/mascotas") {
    await handleMascotasRequest(request, response, requestUrl);
    return;
  }

  if (request.method !== "GET") {
    sendText(response, 405, `Metodo ${request.method} no permitido.`);
    return;
  }

  await serveStaticFile(requestUrl, response);
}

async function startServer() {
  await ensureDataFile();

  const server = http.createServer(handleRequest);
  server.listen(PORT, HOST, () => {
    console.log(`Registro Civil de mascotas disponible en http://${HOST}:${PORT}`);
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
  deleteMascotasByNombre,
  deleteMascotasByRut,
  filterMascotas,
  getStaticFilePath,
  handleRequest,
  normalizeMascota,
  readMascotas,
  startServer,
  validateMascota,
  writeMascotas
};
