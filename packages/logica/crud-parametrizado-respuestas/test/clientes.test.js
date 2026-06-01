const test = require("node:test");
const assert = require("node:assert/strict");

const {
  buildCreateClienteQuery,
  buildDeleteByRutQuery,
  buildDeleteCandidateQuery,
  buildSelectClientesQuery,
  buildUpdateNombreQuery,
  failureResponse,
  normalizeCliente,
  successResponse,
  validateCliente,
  validateEdad,
} = require("../clientes");

test("buildSelectClientesQuery sin filtros lista ordenado", () => {
  assert.deepEqual(buildSelectClientesQuery({}), {
    text: "SELECT rut, nombre, edad FROM clientes ORDER BY nombre ASC, rut ASC",
    values: [],
  });
});

test("buildSelectClientesQuery filtra por rut con query object", () => {
  assert.deepEqual(buildSelectClientesQuery({ rut: "11.111.111-1" }), {
    text: "SELECT rut, nombre, edad FROM clientes WHERE rut = $1 ORDER BY nombre ASC, rut ASC",
    values: ["11.111.111-1"],
  });
});

test("buildSelectClientesQuery filtra por edad numerica", () => {
  assert.deepEqual(buildSelectClientesQuery({ edad: "31" }), {
    text: "SELECT rut, nombre, edad FROM clientes WHERE edad = $1 ORDER BY nombre ASC, rut ASC",
    values: [31],
  });
});

test("buildSelectClientesQuery filtra por prefijo de nombre con ILIKE", () => {
  assert.deepEqual(buildSelectClientesQuery({ nombre: "Ana" }), {
    text: "SELECT rut, nombre, edad FROM clientes WHERE nombre ILIKE $1 ORDER BY nombre ASC, rut ASC",
    values: ["Ana%"],
  });
});

test("buildCreateClienteQuery inserta con parametros y returning", () => {
  assert.deepEqual(
    buildCreateClienteQuery({ rut: "22.222.222-2", nombre: "Luis Soto", edad: "24" }),
    {
      text: "INSERT INTO clientes (rut, nombre, edad) VALUES ($1, $2, $3) RETURNING rut, nombre, edad",
      values: ["22.222.222-2", "Luis Soto", 24],
    },
  );
});

test("buildUpdateNombreQuery modifica solo nombre por rut", () => {
  assert.deepEqual(buildUpdateNombreQuery("33.333.333-3", { nombre: "Camila Rojas" }), {
    text: "UPDATE clientes SET nombre = $1 WHERE rut = $2 RETURNING rut, nombre, edad",
    values: ["Camila Rojas", "33.333.333-3"],
  });
});

test("buildDeleteByRutQuery elimina por rut con parametro", () => {
  assert.deepEqual(buildDeleteByRutQuery("44.444.444-4"), {
    text: "DELETE FROM clientes WHERE rut = $1 RETURNING rut, nombre, edad",
    values: ["44.444.444-4"],
  });
});

test("buildDeleteCandidateQuery busca candidatos por nombre sin borrar aun", () => {
  assert.deepEqual(buildDeleteCandidateQuery({ nombre: "Lu" }), {
    text: "SELECT rut, nombre, edad FROM clientes WHERE nombre ILIKE $1 ORDER BY nombre ASC, rut ASC",
    values: ["Lu%"],
  });
});

test("validateEdad exige entero no negativo", () => {
  assert.deepEqual(validateEdad("abc"), { valid: false, value: null, mensaje: "edad debe ser numerica" });
  assert.deepEqual(validateEdad("-1"), { valid: false, value: null, mensaje: "edad debe ser mayor o igual a 0" });
  assert.deepEqual(validateEdad("30"), { valid: true, value: 30 });
});

test("validateCliente exige rut, nombre y edad al crear", () => {
  assert.deepEqual(validateCliente({ rut: "", nombre: "", edad: "x" }), {
    valid: false,
    errores: ["rut es obligatorio", "nombre es obligatorio", "edad debe ser numerica"],
  });
});

test("normalizeCliente recorta textos y convierte edad", () => {
  assert.deepEqual(normalizeCliente({ rut: " 11 ", nombre: " Ana ", edad: "30" }), {
    rut: "11",
    nombre: "Ana",
    edad: 30,
  });
});

test("successResponse y failureResponse usan formato estandar", () => {
  assert.deepEqual(successResponse({ data: [{ rut: "1" }] }), { ok: true, data: [{ rut: "1" }] });
  assert.deepEqual(successResponse({ rowCount: 1, mensaje: "Actualizado correctamente" }), {
    ok: true,
    rowCount: 1,
    mensaje: "Actualizado correctamente",
  });
  assert.deepEqual(failureResponse("Cliente no existe"), { ok: false, mensaje: "Cliente no existe" });
});
