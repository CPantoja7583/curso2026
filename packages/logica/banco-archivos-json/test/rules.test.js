const assert = require("node:assert/strict");
const test = require("node:test");

const {
  canDeleteRutAccount,
  canDeleteSavingsAccount,
  normalizeNewClient,
  validateNewClientPayload
} = require("../rules");

test("validateNewClientPayload rejects a client without cuenta RUT and without cuentas de ahorro", () => {
  const result = validateNewClientPayload({
    nombre: "Cliente incompleto",
    cuentaRut: null,
    cuentasAhorro: []
  });

  assert.equal(result.valid, false);
  assert.match(result.error, /al menos una cuenta/i);
});

test("validateNewClientPayload accepts a new client with only cuenta RUT", () => {
  const result = validateNewClientPayload({
    nombre: "Ana",
    cuentaRut: { numero: "12345678-9", saldo: 10000 },
    cuentasAhorro: []
  });

  assert.equal(result.valid, true);
});

test("validateNewClientPayload accepts a new client with one cuenta de ahorro", () => {
  const result = validateNewClientPayload({
    nombre: "Bruno",
    cuentaRut: null,
    cuentasAhorro: [{ numero: "AH-100", saldo: 5000 }]
  });

  assert.equal(result.valid, true);
});

test("normalizeNewClient trims account numbers and converts balances", () => {
  const client = normalizeNewClient(
    {
      nombre: " Ana ",
      cuentaRut: { numero: " 12345678-9 ", saldo: "10000" },
      cuentasAhorro: [{ numero: " AH-100 ", saldo: "5000" }]
    },
    9
  );

  assert.deepEqual(client, {
    idCliente: 9,
    nombre: "Ana",
    cuentaRut: { numero: "12345678-9", saldo: 10000 },
    cuentasAhorro: [{ numero: "AH-100", saldo: 5000 }]
  });
});

test("canDeleteRutAccount blocks deleting the last account from a client", () => {
  assert.equal(canDeleteRutAccount({ cuentaRut: { numero: "1", saldo: 0 }, cuentasAhorro: [] }), false);
  assert.equal(canDeleteRutAccount({ cuentaRut: { numero: "1", saldo: 0 }, cuentasAhorro: [{ numero: "A", saldo: 0 }] }), true);
});

test("canDeleteSavingsAccount blocks deleting the only account from a client", () => {
  const onlySavings = { cuentaRut: null, cuentasAhorro: [{ numero: "A", saldo: 0 }] };
  const twoSavings = { cuentaRut: null, cuentasAhorro: [{ numero: "A", saldo: 0 }, { numero: "B", saldo: 0 }] };
  const rutAndSavings = { cuentaRut: { numero: "1", saldo: 0 }, cuentasAhorro: [{ numero: "A", saldo: 0 }] };

  assert.equal(canDeleteSavingsAccount(onlySavings, "A"), false);
  assert.equal(canDeleteSavingsAccount(twoSavings, "A"), true);
  assert.equal(canDeleteSavingsAccount(rutAndSavings, "A"), true);
});
