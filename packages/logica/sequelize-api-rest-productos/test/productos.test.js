const test = require("node:test");
const assert = require("node:assert/strict");

const {
  buildProductoResponse,
  normalizeProductoPayload,
  validateProductoPayload,
} = require("../src/productos");

test("normalizeProductoPayload recorta nombre y convierte numeros", () => {
  assert.deepEqual(
    normalizeProductoPayload({ nombre: " Teclado ", precio: "19990", stock: "7" }),
    { nombre: "Teclado", precio: 19990, stock: 7 },
  );
});

test("validateProductoPayload exige nombre, precio y stock validos", () => {
  assert.deepEqual(validateProductoPayload({ nombre: "", precio: "-1", stock: "abc" }), {
    valid: false,
    errores: [
      "nombre es obligatorio",
      "precio debe ser un numero mayor o igual a 0",
      "stock debe ser un entero mayor o igual a 0",
    ],
  });
});

test("validateProductoPayload permite payload parcial para actualizar", () => {
  assert.deepEqual(validateProductoPayload({ stock: "3" }, { partial: true }), {
    valid: true,
    errores: [],
  });
});

test("buildProductoResponse usa formato consistente", () => {
  assert.deepEqual(buildProductoResponse({ id: 1, nombre: "Mouse", precio: 9990, stock: 5 }), {
    ok: true,
    data: { id: 1, nombre: "Mouse", precio: 9990, stock: 5 },
  });
});
