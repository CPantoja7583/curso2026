const test = require("node:test");
const assert = require("node:assert/strict");

const {
  buildCreateClienteQuery,
  buildDeleteClienteQuery,
  buildSelectClientesQuery,
  buildUpdateClienteQuery,
  normalizeClientePayload,
  validateClientePayload,
} = require("../cliente-queries");

test("buildSelectClientesQuery lista todos los clientes ordenados por nombre", () => {
  const query = buildSelectClientesQuery();

  assert.equal(query.text, "SELECT rut, nombre, edad FROM clientes ORDER BY nombre ASC, rut ASC");
  assert.deepEqual(query.values, []);
});

test("buildCreateClienteQuery usa parametros para rut, nombre y edad", () => {
  const query = buildCreateClienteQuery({ rut: "11.111.111-1", nombre: "Ana Perez", edad: 31 });

  assert.equal(
    query.text,
    "INSERT INTO clientes (rut, nombre, edad) VALUES ($1, $2, $3) RETURNING rut, nombre, edad",
  );
  assert.deepEqual(query.values, ["11.111.111-1", "Ana Perez", 31]);
});

test("buildUpdateClienteQuery modifica unicamente nombre por rut", () => {
  const query = buildUpdateClienteQuery("22.222.222-2", { nombre: "Luis Soto" });

  assert.equal(
    query.text,
    "UPDATE clientes SET nombre = $1 WHERE rut = $2 RETURNING rut, nombre, edad",
  );
  assert.deepEqual(query.values, ["Luis Soto", "22.222.222-2"]);
});

test("buildDeleteClienteQuery elimina por rut usando parametro", () => {
  const query = buildDeleteClienteQuery("33.333.333-3");

  assert.equal(query.text, "DELETE FROM clientes WHERE rut = $1 RETURNING rut, nombre, edad");
  assert.deepEqual(query.values, ["33.333.333-3"]);
});

test("validateClientePayload exige rut, nombre y edad numerica al crear", () => {
  const result = validateClientePayload({ rut: "", nombre: "Ana", edad: "abc" });

  assert.equal(result.valid, false);
  assert.deepEqual(result.errors, ["rut es obligatorio", "edad debe ser numerica"]);
});

test("validateClientePayload permite validar solo nombre para actualizar", () => {
  const result = validateClientePayload({ nombre: "Camila Rojas", edad: 99 }, { requireRut: false, requireEdad: false });

  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

test("normalizeClientePayload recorta texto y convierte edad a numero", () => {
  const result = normalizeClientePayload({ rut: " 44.444.444-4 ", nombre: " Maria Lopez ", edad: "28" });

  assert.deepEqual(result, { rut: "44.444.444-4", nombre: "Maria Lopez", edad: 28 });
});
