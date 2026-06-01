const assert = require("node:assert/strict");
const test = require("node:test");

const {
  buildDeleteClientesQuery,
  buildSelectClientesQuery,
  buildUpdateClienteQuery,
  normalizeClientePayload,
  validateClientePayload
} = require("../queries");

test("buildSelectClientesQuery returns all clients without filters", () => {
  assert.deepEqual(buildSelectClientesQuery({}), {
    text: "SELECT rut, nombre, edad FROM clientes ORDER BY nombre",
    values: [],
    mode: "all"
  });
});

test("buildSelectClientesQuery filters by rut with one parameter", () => {
  assert.deepEqual(buildSelectClientesQuery({ rut: "11111111-1" }), {
    text: "SELECT rut, nombre, edad FROM clientes WHERE rut = $1 ORDER BY nombre",
    values: ["11111111-1"],
    mode: "rut"
  });
});

test("buildSelectClientesQuery filters by exact age", () => {
  assert.deepEqual(buildSelectClientesQuery({ edad: "35" }), {
    text: "SELECT rut, nombre, edad FROM clientes WHERE edad = $1 ORDER BY nombre",
    values: [35],
    mode: "edad"
  });
});

test("buildSelectClientesQuery filters by age range", () => {
  assert.deepEqual(buildSelectClientesQuery({ edadMin: "25", edadMax: "40" }), {
    text: "SELECT rut, nombre, edad FROM clientes WHERE edad BETWEEN $1 AND $2 ORDER BY edad, nombre",
    values: [25, 40],
    mode: "rango"
  });
});

test("buildSelectClientesQuery filters by name prefix using ILIKE", () => {
  assert.deepEqual(buildSelectClientesQuery({ nombre: "an" }), {
    text: "SELECT rut, nombre, edad FROM clientes WHERE nombre ILIKE $1 ORDER BY nombre",
    values: ["an%"],
    mode: "nombre"
  });
});

test("buildDeleteClientesQuery deletes by rut", () => {
  assert.deepEqual(buildDeleteClientesQuery({ rut: "11111111-1" }), {
    text: "DELETE FROM clientes WHERE rut = $1 RETURNING rut, nombre, edad",
    values: ["11111111-1"],
    mode: "rut"
  });
});

test("buildDeleteClientesQuery deletes by age range", () => {
  assert.deepEqual(buildDeleteClientesQuery({ edadMin: "30", edadMax: "50" }), {
    text: "DELETE FROM clientes WHERE edad BETWEEN $1 AND $2 RETURNING rut, nombre, edad",
    values: [30, 50],
    mode: "rango"
  });
});

test("buildUpdateClienteQuery modifies only nombre", () => {
  assert.deepEqual(buildUpdateClienteQuery("11111111-1", { nombre: "Ana Nueva" }), {
    text: "UPDATE clientes SET nombre = $1 WHERE rut = $2 RETURNING rut, nombre, edad",
    values: ["Ana Nueva", "11111111-1"]
  });
});

test("validateClientePayload rejects invalid age", () => {
  const result = validateClientePayload({ rut: "1", nombre: "Ana", edad: "abc" });
  assert.equal(result.valid, false);
  assert.match(result.error, /edad/i);
});

test("normalizeClientePayload trims text and converts edad", () => {
  assert.deepEqual(normalizeClientePayload({ rut: " 1 ", nombre: " Ana ", edad: "31" }), {
    rut: "1",
    nombre: "Ana",
    edad: 31
  });
});
