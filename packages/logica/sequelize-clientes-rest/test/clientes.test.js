const test = require("node:test");
const assert = require("node:assert/strict");

const {
  buildClienteResponse,
  buildErrorResponse,
  normalizeClientePayload,
  validateClientePayload,
} = require("../src/clientes");

test("normalizeClientePayload recorta nombre y email", () => {
  assert.deepEqual(normalizeClientePayload({ nombre: " Ana Perez ", email: " ANA@EXAMPLE.COM " }), {
    nombre: "Ana Perez",
    email: "ana@example.com",
  });
});

test("validateClientePayload exige nombre y email", () => {
  assert.deepEqual(validateClientePayload({ nombre: "", email: "" }), {
    valid: false,
    errores: ["nombre es obligatorio", "email es obligatorio"],
  });
});

test("validateClientePayload rechaza email sin formato basico", () => {
  assert.deepEqual(validateClientePayload({ nombre: "Ana", email: "ana" }), {
    valid: false,
    errores: ["email debe tener un formato valido"],
  });
});

test("buildClienteResponse entrega formato ok con data", () => {
  assert.deepEqual(buildClienteResponse([{ id: 1, nombre: "Ana", email: "ana@example.com" }]), {
    ok: true,
    data: [{ id: 1, nombre: "Ana", email: "ana@example.com" }],
  });
});

test("buildErrorResponse entrega formato de error", () => {
  assert.deepEqual(buildErrorResponse("Datos invalidos", ["email es obligatorio"]), {
    ok: false,
    mensaje: "Datos invalidos",
    errores: ["email es obligatorio"],
  });
});
