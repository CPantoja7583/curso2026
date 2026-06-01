const http = require("node:http");

const PORT = 3000;
const HOST = "127.0.0.1";
const DAY_NAMES = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miercoles",
  "Jueves",
  "Viernes",
  "Sabado"
];

function htmlPage(title, body) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      font-family: Arial, sans-serif;
      background: linear-gradient(180deg, #f5f7fb 0%, #e8eef9 100%);
      color: #1d2733;
    }
    main {
      width: min(720px, calc(100% - 32px));
      background: #ffffff;
      border: 1px solid #d6dfeb;
      border-radius: 20px;
      padding: 28px;
      box-shadow: 0 20px 40px rgba(24, 48, 80, 0.08);
    }
    h1 {
      margin-top: 0;
      font-size: 2rem;
    }
    .value {
      margin-top: 14px;
      padding: 16px;
      border-radius: 14px;
      background: #f4f8ff;
      font-size: 1.05rem;
      line-height: 1.7;
    }
    code {
      background: #edf2f7;
      padding: 2px 6px;
      border-radius: 6px;
    }
  </style>
</head>
<body>
  <main>${body}</main>
</body>
</html>`;
}

function getCurrentDateParts() {
  const now = new Date();

  return {
    dayName: DAY_NAMES[now.getDay()],
    dayNumber: now.getDate(),
    monthNumber: now.getMonth() + 1,
    year: now.getFullYear(),
    hour: now.getHours(),
    minutes: now.getMinutes(),
    seconds: now.getSeconds()
  };
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomWord() {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  const length = randomInt(3, 10);
  let word = "";

  for (let index = 0; index < length; index += 1) {
    word += alphabet[randomInt(0, alphabet.length - 1)];
  }

  return word;
}

function sendHtml(response, statusCode, html) {
  response.writeHead(statusCode, { "Content-Type": "text/html; charset=utf-8" });
  response.end(html);
}

function sendText(response, statusCode, message) {
  response.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8" });
  response.end(message);
}

const server = http.createServer((request, response) => {
  const { method, url } = request;

  if (url === "/" && method === "GET") {
    const currentDate = getCurrentDateParts();
    const body = `
      <h1>Fecha y hora del servidor</h1>
      <div class="value">
        <div><strong>Dia:</strong> ${currentDate.dayName}</div>
        <div><strong>Numero de dia:</strong> ${currentDate.dayNumber}</div>
        <div><strong>Mes:</strong> ${currentDate.monthNumber}</div>
        <div><strong>Año:</strong> ${currentDate.year}</div>
        <div><strong>Hora:</strong> ${currentDate.hour}</div>
        <div><strong>Minutos:</strong> ${currentDate.minutes}</div>
        <div><strong>Segundos:</strong> ${currentDate.seconds}</div>
      </div>
      <p>Prueba tambien <code>GET /random-data</code> y <code>PUT /random-data</code>.</p>
    `;

    sendHtml(response, 200, htmlPage("Fecha y hora", body));
    return;
  }

  if (url === "/random-data") {
    if (method === "GET") {
      const body = `
        <h1>Palabra aleatoria</h1>
        <div class="value">${randomWord()}</div>
      `;

      sendHtml(response, 200, htmlPage("Random data GET", body));
      return;
    }

    if (method === "PUT") {
      const body = `
        <h1>Numero aleatorio</h1>
        <div class="value">${randomInt(10, 50000)}</div>
      `;

      sendHtml(response, 200, htmlPage("Random data PUT", body));
      return;
    }

    sendText(response, 405, `Aún no estoy preparado para responder al método ${method}`);
    return;
  }

  if (url === "/" && method !== "GET") {
    sendText(response, 405, `Aún no estoy preparado para responder al método ${method}`);
    return;
  }

  sendText(response, 404, "Ruta no encontrada");
});

server.listen(PORT, HOST, () => {
  console.log(`Servidor ejecutandose en http://${HOST}:${PORT}`);
});
