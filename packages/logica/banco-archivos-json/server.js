const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const {
  canDeleteRutAccount,
  canDeleteSavingsAccount,
  normalizeNewClient,
  validateAccount,
  validateNewClientPayload
} = require("./rules");

const HOST = "127.0.0.1";
const PORT = Number(process.env.PORT) || 3006;
const dataFilePath = path.join(__dirname, "data.json");
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
  if (extension === ".svg") return "image/svg+xml";
  return "application/octet-stream";
}

async function readData() {
  const content = await fs.readFile(dataFilePath, "utf8");
  return JSON.parse(content);
}

async function writeData(data) {
  await fs.writeFile(dataFilePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
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

  if (requestUrl.pathname === "/api/clientes") {
    if (request.method === "GET") {
      const onlyRut = requestUrl.searchParams.get("soloRut");

      try {
        const data = await readData();
        if (onlyRut === "true") {
          const filtered = data.filter((client) => Boolean(client.cuentaRut));
          sendJson(response, 200, filtered);
          return;
        }

        sendJson(response, 200, data);
      } catch (error) {
        sendJson(response, 500, { error: "No se pudieron leer los datos.", details: error.message });
      }
      return;
    }

    if (request.method === "POST") {
      try {
        const body = await collectRequestBody(request);
        const payload = JSON.parse(body);
        const data = await readData();

        const validation = validateNewClientPayload(payload);
        if (!validation.valid) {
          sendJson(response, 400, { error: validation.error });
          return;
        }

        const nextId = data.length ? Math.max(...data.map((item) => item.idCliente)) + 1 : 1;
        const newClient = normalizeNewClient(payload, nextId);

        data.push(newClient);
        await writeData(data);
        sendJson(response, 201, newClient);
      } catch (error) {
        sendJson(response, 400, { error: "JSON invalido.", details: error.message });
      }
      return;
    }

    sendJson(response, 405, { error: `Metodo ${request.method} no permitido.` });
    return;
  }

  if (requestUrl.pathname === "/api/clientes/rut") {
    if (request.method === "GET") {
      try {
        const data = await readData();
        sendJson(response, 200, data.filter((client) => Boolean(client.cuentaRut)));
      } catch (error) {
        sendJson(response, 500, { error: "No se pudieron leer los datos.", details: error.message });
      }
      return;
    }

    sendJson(response, 405, { error: `Metodo ${request.method} no permitido.` });
    return;
  }

  const clientRouteMatch = requestUrl.pathname.match(/^\/api\/clientes\/(\d+)$/);
  if (clientRouteMatch) {
    const clientId = Number(clientRouteMatch[1]);

    if (request.method === "DELETE") {
      const data = await readData();
      const filtered = data.filter((client) => client.idCliente !== clientId);

      if (filtered.length === data.length) {
        sendJson(response, 404, { error: "Cliente no encontrado." });
        return;
      }

      await writeData(filtered);
      sendJson(response, 200, { mensaje: "Cliente y cuentas eliminados correctamente." });
      return;
    }

    sendJson(response, 405, { error: `Metodo ${request.method} no permitido.` });
    return;
  }

  const accountsRouteMatch = requestUrl.pathname.match(/^\/api\/clientes\/(\d+)\/cuentas$/);
  if (accountsRouteMatch) {
    const clientId = Number(accountsRouteMatch[1]);

    if (request.method === "POST") {
      try {
        const body = await collectRequestBody(request);
        const payload = JSON.parse(body);
        const data = await readData();
        const client = data.find((item) => item.idCliente === clientId);

        if (!client) {
          sendJson(response, 404, { error: "Cliente no encontrado." });
          return;
        }

        if (payload.tipo === "rut") {
          if (client.cuentaRut) {
            sendJson(response, 400, { error: "El cliente ya tiene una cuenta RUT." });
            return;
          }

          if (!validateAccount(payload.cuenta)) {
            sendJson(response, 400, { error: "Datos invalidos para cuenta RUT." });
            return;
          }

          client.cuentaRut = {
            numero: payload.cuenta.numero.trim(),
            saldo: Number(payload.cuenta.saldo)
          };

          await writeData(data);
          sendJson(response, 201, client);
          return;
        }

        if (payload.tipo === "ahorro") {
          if (!validateAccount(payload.cuenta)) {
            sendJson(response, 400, { error: "Datos invalidos para cuenta de AHORRO." });
            return;
          }

          client.cuentasAhorro.push({
            numero: payload.cuenta.numero.trim(),
            saldo: Number(payload.cuenta.saldo)
          });

          await writeData(data);
          sendJson(response, 201, client);
          return;
        }

        sendJson(response, 400, { error: "Debes indicar tipo=rut o tipo=ahorro." });
      } catch (error) {
        sendJson(response, 400, { error: "JSON invalido.", details: error.message });
      }
      return;
    }

    sendJson(response, 405, { error: `Metodo ${request.method} no permitido.` });
    return;
  }

  const rutDeleteMatch = requestUrl.pathname.match(/^\/api\/clientes\/(\d+)\/cuenta-rut$/);
  if (rutDeleteMatch) {
    const clientId = Number(rutDeleteMatch[1]);

    if (request.method === "DELETE") {
      const data = await readData();
      const client = data.find((item) => item.idCliente === clientId);

      if (!client) {
        sendJson(response, 404, { error: "Cliente no encontrado." });
        return;
      }

      if (!client.cuentaRut) {
        sendJson(response, 404, { error: "El cliente no tiene cuenta RUT." });
        return;
      }

      if (!canDeleteRutAccount(client)) {
        sendJson(response, 400, { error: "No es posible dejar al cliente sin cuenta RUT ni cuenta de AHORRO." });
        return;
      }

      client.cuentaRut = null;
      await writeData(data);
      sendJson(response, 200, { mensaje: "Cuenta RUT eliminada correctamente." });
      return;
    }

    sendJson(response, 405, { error: `Metodo ${request.method} no permitido.` });
    return;
  }

  const savingsDeleteMatch = requestUrl.pathname.match(/^\/api\/clientes\/(\d+)\/cuentas-ahorro$/);
  if (savingsDeleteMatch) {
    const clientId = Number(savingsDeleteMatch[1]);

    if (request.method === "DELETE") {
      const numero = requestUrl.searchParams.get("numero")?.trim();
      if (!numero) {
        sendJson(response, 400, { error: "Debes indicar el numero de la cuenta de AHORRO." });
        return;
      }

      const data = await readData();
      const client = data.find((item) => item.idCliente === clientId);

      if (!client) {
        sendJson(response, 404, { error: "Cliente no encontrado." });
        return;
      }

      const filteredSavings = client.cuentasAhorro.filter((account) => account.numero.trim() !== numero);
      if (filteredSavings.length === client.cuentasAhorro.length) {
        sendJson(response, 404, { error: "Cuenta de AHORRO no encontrada." });
        return;
      }

      if (!canDeleteSavingsAccount(client, numero)) {
        sendJson(response, 400, { error: "No es posible dejar al cliente sin cuenta RUT ni cuenta de AHORRO." });
        return;
      }

      client.cuentasAhorro = filteredSavings;
      await writeData(data);
      sendJson(response, 200, { mensaje: "Cuenta de AHORRO eliminada correctamente." });
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
  console.log(`Banco Archivos JSON disponible en http://${HOST}:${PORT}`);
});
