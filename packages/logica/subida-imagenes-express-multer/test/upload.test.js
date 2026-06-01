const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs/promises");
const os = require("os");
const path = require("path");

const { createApp } = require("../server");

let server;
let baseUrl;
let tempDir;
let uploadDir;

function tinyPngBuffer() {
  return Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9p7h0N0AAAAASUVORK5CYII=",
    "base64"
  );
}

test.before(async () => {
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "upload-imagenes-"));
  uploadDir = path.join(tempDir, "uploads");

  const app = createApp({
    uploadDir,
    publicDir: path.join(__dirname, "..", "public")
  });

  server = await new Promise((resolve) => {
    const startedServer = app.listen(0, () => resolve(startedServer));
  });

  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }

  if (tempDir) {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test("POST /upload guarda una imagen valida", async () => {
  const form = new FormData();
  form.append("foto", new Blob([tinyPngBuffer()], { type: "image/png" }), "foto.png");

  const response = await fetch(`${baseUrl}/upload`, {
    method: "POST",
    body: form
  });
  const payload = await response.json();

  assert.equal(response.status, 201);
  assert.equal(payload.ok, true);
  assert.match(payload.archivo, /\.png$/);

  const files = await fs.readdir(uploadDir);
  assert.equal(files.length, 1);
});

test("POST /upload rechaza archivos no permitidos", async () => {
  const form = new FormData();
  form.append("foto", new Blob(["hola"], { type: "text/plain" }), "nota.txt");

  const response = await fetch(`${baseUrl}/upload`, {
    method: "POST",
    body: form
  });
  const payload = await response.json();

  assert.equal(response.status, 415);
  assert.equal(payload.ok, false);
});

test("POST /upload rechaza imagenes sobre 5 MB", async () => {
  const largeBuffer = Buffer.alloc(5 * 1024 * 1024 + 1, 1);
  const form = new FormData();
  form.append("foto", new Blob([largeBuffer], { type: "image/png" }), "grande.png");

  const response = await fetch(`${baseUrl}/upload`, {
    method: "POST",
    body: form
  });
  const payload = await response.json();

  assert.equal(response.status, 400);
  assert.equal(payload.ok, false);
  assert.match(payload.mensaje, /5 MB/);
});
