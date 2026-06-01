const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");

const HOST = "127.0.0.1";
const PORT = Number(process.env.PORT) || 3004;
const publicDir = path.join(__dirname, "public");
const moviesFilePath = path.join(__dirname, "peliculas.txt");
const seriesFilePath = path.join(__dirname, "series.txt");

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
  return "application/octet-stream";
}

function resolveCatalog(type) {
  if (type === "peliculas") {
    return { filePath: moviesFilePath, type };
  }

  if (type === "series") {
    return { filePath: seriesFilePath, type };
  }

  return null;
}

async function readCatalog(type) {
  const catalog = resolveCatalog(type);
  if (!catalog) {
    throw new Error("Tipo de catalogo no valido.");
  }

  const content = await fs.readFile(catalog.filePath, "utf8");
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(",").map((part) => part.trim());

      if (type === "peliculas") {
        return {
          nombre: parts[0],
          director: parts[1],
          anioEstreno: Number(parts[2])
        };
      }

      return {
        nombre: parts[0],
        anioEstreno: Number(parts[1]),
        numeroTemporadas: Number(parts[2])
      };
    });
}

async function appendCatalogItem(type, item) {
  const catalog = resolveCatalog(type);
  if (!catalog) {
    throw new Error("Tipo de catalogo no valido.");
  }

  let line = "";
  if (type === "peliculas") {
    line = `\n${item.nombre}, ${item.director}, ${item.anioEstreno}`;
  } else {
    line = `\n${item.nombre}, ${item.anioEstreno}, ${item.numeroTemporadas}`;
  }

  await fs.appendFile(catalog.filePath, line, "utf8");
}

async function deleteCatalogItem(type, name) {
  const catalog = resolveCatalog(type);
  if (!catalog) {
    throw new Error("Tipo de catalogo no valido.");
  }

  const content = await fs.readFile(catalog.filePath, "utf8");
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const filteredLines = lines.filter((line) => {
    const [itemName] = line.split(",");
    return itemName.trim().toLowerCase() !== name.trim().toLowerCase();
  });

  if (filteredLines.length === lines.length) {
    return false;
  }

  await fs.writeFile(catalog.filePath, `${filteredLines.join("\n")}${filteredLines.length ? "\n" : ""}`, "utf8");
  return true;
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

async function serveStaticFile(urlPath, response) {
  const normalizedPath = urlPath === "/" ? "/index.html" : urlPath;
  const safePath = path.normalize(normalizedPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(publicDir, safePath);

  try {
    const file = await fs.readFile(filePath);
    response.writeHead(200, { "Content-Type": getContentType(filePath) });
    response.end(file);
    return true;
  } catch {
    return false;
  }
}

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host}`);

  if (requestUrl.pathname === "/api/catalogo") {
    if (request.method === "GET") {
      const type = requestUrl.searchParams.get("tipo");

      try {
        const data = await readCatalog(type);
        sendJson(response, 200, data);
      } catch (error) {
        sendJson(response, 400, { error: error.message });
      }
      return;
    }

    if (request.method === "POST") {
      try {
        const body = await collectRequestBody(request);
        const payload = JSON.parse(body);
        const type = payload.tipo;

        if (type === "peliculas") {
          if (
            typeof payload.nombre !== "string" ||
            !payload.nombre.trim() ||
            typeof payload.director !== "string" ||
            !payload.director.trim() ||
            !Number.isInteger(Number(payload.anioEstreno))
          ) {
            sendJson(response, 400, { error: "Datos invalidos para pelicula." });
            return;
          }

          const newMovie = {
            nombre: payload.nombre.trim(),
            director: payload.director.trim(),
            anioEstreno: Number(payload.anioEstreno)
          };

          await appendCatalogItem(type, newMovie);
          sendJson(response, 201, newMovie);
          return;
        }

        if (type === "series") {
          if (
            typeof payload.nombre !== "string" ||
            !payload.nombre.trim() ||
            !Number.isInteger(Number(payload.anioEstreno)) ||
            !Number.isInteger(Number(payload.numeroTemporadas))
          ) {
            sendJson(response, 400, { error: "Datos invalidos para serie." });
            return;
          }

          const newSeries = {
            nombre: payload.nombre.trim(),
            anioEstreno: Number(payload.anioEstreno),
            numeroTemporadas: Number(payload.numeroTemporadas)
          };

          await appendCatalogItem(type, newSeries);
          sendJson(response, 201, newSeries);
          return;
        }

        sendJson(response, 400, { error: "Debes indicar tipo=peliculas o tipo=series." });
      } catch (error) {
        sendJson(response, 400, { error: "JSON invalido.", details: error.message });
      }
      return;
    }

    if (request.method === "DELETE") {
      const type = requestUrl.searchParams.get("tipo");
      const nombre = requestUrl.searchParams.get("nombre");

      if (!type || !nombre) {
        sendJson(response, 400, { error: "Debes enviar tipo y nombre en la URL." });
        return;
      }

      try {
        const deleted = await deleteCatalogItem(type, nombre);
        if (!deleted) {
          sendJson(response, 404, { error: "No se encontro un registro con ese nombre." });
          return;
        }

        sendJson(response, 200, { mensaje: "Registro eliminado correctamente." });
      } catch (error) {
        sendJson(response, 400, { error: error.message });
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

  const served = await serveStaticFile(requestUrl.pathname, response);
  if (!served) {
    sendText(response, 404, "Recurso no encontrado.");
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Servidor Netflix disponible en http://${HOST}:${PORT}`);
});
