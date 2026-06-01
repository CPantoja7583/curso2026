const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");

const HOST = "127.0.0.1";
const PORT = Number(process.env.PORT) || 3002;
const productsFilePath = path.join(__dirname, "productos.txt");
const publicDir = path.join(__dirname, "public");

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
  if (extension === ".png") return "image/png";
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".svg") return "image/svg+xml";
  return "application/octet-stream";
}

async function readProducts() {
  const content = await fs.readFile(productsFilePath, "utf8");
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [namePart, pricePart] = line.split(",");
      return {
        nombre: namePart.trim(),
        precio: Number(pricePart.trim())
      };
    });
}

async function addProduct(product) {
  const line = `\n${product.nombre}, ${product.precio}`;
  await fs.appendFile(productsFilePath, line, "utf8");
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

  if (requestUrl.pathname === "/api/productos") {
    if (request.method === "GET") {
      try {
        const products = await readProducts();
        sendJson(response, 200, products);
      } catch (error) {
        sendJson(response, 500, { error: "No se pudieron leer los productos.", details: error.message });
      }
      return;
    }

    if (request.method === "POST") {
      try {
        const body = await collectRequestBody(request);
        const product = JSON.parse(body);

        if (
          typeof product.nombre !== "string" ||
          !product.nombre.trim() ||
          !Number.isFinite(Number(product.precio))
        ) {
          sendJson(response, 400, { error: "Debes enviar nombre y precio validos." });
          return;
        }

        const newProduct = {
          nombre: product.nombre.trim(),
          precio: Number(product.precio)
        };

        await addProduct(newProduct);
        sendJson(response, 201, newProduct);
      } catch (error) {
        sendJson(response, 400, { error: "JSON invalido.", details: error.message });
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
  console.log(`Servidor ejecutandose en http://${HOST}:${PORT}`);
});
