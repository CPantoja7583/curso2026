const assert = require("node:assert/strict");
const test = require("node:test");

const {
  buildConfigPoolOptions,
  buildConnectionStringPoolOptions,
  formatCliente,
  formatFinanza,
  getStaticFilePath
} = require("../server");

test("buildConfigPoolOptions creates pg config from environment values", () => {
  const options = buildConfigPoolOptions({
    DB_HOST: "localhost",
    DB_PORT: "5432",
    DB_USER: "postgres",
    DB_PASSWORD: "secret",
    DB_NAME: "curso"
  });

  assert.deepEqual(options, {
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "secret",
    database: "curso"
  });
});

test("buildConnectionStringPoolOptions uses DATABASE_URL", () => {
  const options = buildConnectionStringPoolOptions({
    DATABASE_URL: "postgres://postgres:secret@localhost:5432/curso"
  });

  assert.deepEqual(options, {
    connectionString: "postgres://postgres:secret@localhost:5432/curso"
  });
});

test("formatFinanza returns a clean JSON shape", () => {
  assert.deepEqual(formatFinanza({
    id: "3",
    descripcion: "Arriendo",
    categoria: "Gasto",
    monto: "350000",
    fecha: "2026-05-24"
  }), {
    id: 3,
    descripcion: "Arriendo",
    categoria: "Gasto",
    monto: 350000,
    fecha: "2026-05-24"
  });
});

test("formatCliente returns a clean JSON shape", () => {
  assert.deepEqual(formatCliente({
    id: "2",
    nombre: "Ana",
    email: "ana@example.com",
    telefono: "+56911111111"
  }), {
    id: 2,
    nombre: "Ana",
    email: "ana@example.com",
    telefono: "+56911111111"
  });
});

test("getStaticFilePath prevents traversal outside public directory", () => {
  const root = "C:\\app\\public";

  assert.equal(getStaticFilePath("/", root), "C:\\app\\public\\index.html");
  assert.equal(getStaticFilePath("/app.js", root), "C:\\app\\public\\app.js");
  assert.equal(getStaticFilePath("/../server.js", root), null);
});
