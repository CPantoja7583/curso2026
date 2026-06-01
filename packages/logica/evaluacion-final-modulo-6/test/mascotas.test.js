const assert = require("node:assert/strict");
const test = require("node:test");

const {
  deleteMascotasByNombre,
  deleteMascotasByRut,
  filterMascotas,
  normalizeMascota,
  validateMascota
} = require("../server");

const mascotas = [
  { nombre: "Luna", rut: "11111111-1" },
  { nombre: "Milo", rut: "22222222-2" },
  { nombre: "Toby", rut: "11111111-1" }
];

test("validateMascota accepts nombre and rut strings with content", () => {
  assert.equal(validateMascota({ nombre: " Luna ", rut: " 11111111-1 " }).valid, true);
});

test("validateMascota rejects incomplete payloads", () => {
  assert.equal(validateMascota({ nombre: "", rut: "11111111-1" }).valid, false);
  assert.equal(validateMascota({ nombre: "Luna" }).valid, false);
});

test("normalizeMascota trims nombre and rut", () => {
  assert.deepEqual(normalizeMascota({ nombre: " Luna ", rut: " 11111111-1 " }), {
    nombre: "Luna",
    rut: "11111111-1"
  });
});

test("filterMascotas returns all records when no filters are provided", () => {
  assert.deepEqual(filterMascotas(mascotas, {}), mascotas);
});

test("filterMascotas returns one pet by nombre", () => {
  assert.deepEqual(filterMascotas(mascotas, { nombre: "luna" }), [
    { nombre: "Luna", rut: "11111111-1" }
  ]);
});

test("filterMascotas returns all pets by rut", () => {
  assert.deepEqual(filterMascotas(mascotas, { rut: "11111111-1" }), [
    { nombre: "Luna", rut: "11111111-1" },
    { nombre: "Toby", rut: "11111111-1" }
  ]);
});

test("deleteMascotasByNombre removes matching pets and reports count", () => {
  const result = deleteMascotasByNombre(mascotas, "milo");

  assert.equal(result.deleted, 1);
  assert.deepEqual(result.mascotas, [
    { nombre: "Luna", rut: "11111111-1" },
    { nombre: "Toby", rut: "11111111-1" }
  ]);
});

test("deleteMascotasByRut removes every pet owned by the rut", () => {
  const result = deleteMascotasByRut(mascotas, "11111111-1");

  assert.equal(result.deleted, 2);
  assert.deepEqual(result.mascotas, [
    { nombre: "Milo", rut: "22222222-2" }
  ]);
});
