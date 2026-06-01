const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs/promises");
const os = require("os");
const path = require("path");

const { createApp } = require("../index");

let server;
let baseUrl;
let tempDir;

test.before(async () => {
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "catalogo-libros-"));
  const dataPath = path.join(tempDir, "catalogo.json");

  await fs.writeFile(
    dataPath,
    `${JSON.stringify([
      { id: 1, titulo: "Cien anos de soledad", autor: "Gabriel Garcia Marquez", anio: 1967 },
      { id: 2, titulo: "1984", autor: "George Orwell", anio: 1949 }
    ], null, 2)}\n`,
    "utf8"
  );

  const app = createApp({ dataPath });

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

test("GET /libros devuelve el catalogo inicial", async () => {
  const response = await fetch(`${baseUrl}/libros`);
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.ok, true);
  assert.equal(payload.data.length, 2);
});

test("POST /libros crea un libro nuevo", async () => {
  const response = await fetch(`${baseUrl}/libros`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      titulo: "Rayuela",
      autor: "Julio Cortazar",
      anio: 1963
    })
  });
  const payload = await response.json();

  assert.equal(response.status, 201);
  assert.equal(payload.ok, true);
  assert.equal(payload.data.id, 3);
  assert.equal(payload.data.titulo, "Rayuela");
});

test("PUT /libros/:id actualiza un libro existente", async () => {
  const response = await fetch(`${baseUrl}/libros/1`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      titulo: "Cien anos de soledad",
      autor: "G. G. Marquez",
      anio: 1967
    })
  });
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.ok, true);
  assert.equal(payload.data.autor, "G. G. Marquez");
});

test("DELETE /libros/:id elimina un libro existente", async () => {
  const response = await fetch(`${baseUrl}/libros/2`, { method: "DELETE" });
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.ok, true);
  assert.equal(payload.data.id, 2);
});

test("responde 400 y 404 en casos invalidos", async () => {
  const invalidPost = await fetch(`${baseUrl}/libros`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ titulo: "", autor: "Anonimo", anio: 2020 })
  });
  const invalidBody = await invalidPost.json();

  assert.equal(invalidPost.status, 400);
  assert.equal(invalidBody.ok, false);

  const missingPut = await fetch(`${baseUrl}/libros/999`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      titulo: "No existe",
      autor: "Nadie",
      anio: 2024
    })
  });
  const missingPutBody = await missingPut.json();

  assert.equal(missingPut.status, 404);
  assert.equal(missingPutBody.ok, false);

  const missingDelete = await fetch(`${baseUrl}/libros/999`, { method: "DELETE" });
  const missingDeleteBody = await missingDelete.json();

  assert.equal(missingDelete.status, 404);
  assert.equal(missingDeleteBody.ok, false);
});
