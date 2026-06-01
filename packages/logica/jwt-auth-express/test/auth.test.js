const test = require("node:test");
const assert = require("node:assert/strict");

const {
  buildErrorResponse,
  buildOkResponse,
  extractBearerToken,
  normalizeCredentials,
  validateCredentials,
} = require("../src/auth-utils");

test("normalizeCredentials recorta email y password", () => {
  assert.deepEqual(
    normalizeCredentials({ email: " DEMO@mail.com ", password: " 123456 " }),
    { email: "demo@mail.com", password: "123456" },
  );
});

test("validateCredentials exige email y password", () => {
  assert.deepEqual(validateCredentials({ email: "", password: "" }), {
    valid: false,
    errores: ["email es requerido", "password es requerido"],
  });
});

test("validateCredentials rechaza email invalido", () => {
  assert.deepEqual(validateCredentials({ email: "demo", password: "123456" }), {
    valid: false,
    errores: ["email debe tener un formato valido"],
  });
});

test("extractBearerToken obtiene token correcto", () => {
  assert.equal(extractBearerToken("Bearer abc.def.ghi"), "abc.def.ghi");
  assert.equal(extractBearerToken("Basic xyz"), null);
  assert.equal(extractBearerToken(""), null);
});

test("buildOkResponse y buildErrorResponse usan formato coherente", () => {
  assert.deepEqual(buildOkResponse({ email: "demo@mail.com" }), {
    ok: true,
    data: { email: "demo@mail.com" },
  });
  assert.deepEqual(buildErrorResponse("Credenciales invalidas"), {
    ok: false,
    mensaje: "Credenciales invalidas",
  });
});
