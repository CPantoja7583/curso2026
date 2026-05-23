const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const { app } = require("../src/app");
const { ensureDatabaseReady, resetDatabase, closeDatabase } = require("../src/db/init");

test.before(async () => {
  await ensureDatabaseReady();
});

test.beforeEach(async () => {
  await resetDatabase();
});

test.after(async () => {
  await closeDatabase();
});

test("permite login y consulta de perfil", async () => {
  const loginResponse = await request(app)
    .post("/auth/login")
    .send({
      email: "lucia@aurora-bank.cl",
      password: "User1234!"
    });

  assert.equal(loginResponse.statusCode, 200);
  assert.ok(loginResponse.body.accessToken);

  const meResponse = await request(app)
    .get("/me")
    .set("Authorization", `Bearer ${loginResponse.body.accessToken}`);

  assert.equal(meResponse.statusCode, 200);
  assert.equal(meResponse.body.user.email, "lucia@aurora-bank.cl");
});

test("crea una transferencia real entre usuarios", async () => {
  const luciaLogin = await request(app)
    .post("/auth/login")
    .send({
      email: "lucia@aurora-bank.cl",
      password: "User1234!"
    });

  const martinLogin = await request(app)
    .post("/auth/login")
    .send({
      email: "martin@aurora-bank.cl",
      password: "User1234!"
    });

  const martinAccount = martinLogin.body.account.accountNumber;

  const transferResponse = await request(app)
    .post("/transfers")
    .set("Authorization", `Bearer ${luciaLogin.body.accessToken}`)
    .send({
      destinationAccountNumber: martinAccount,
      amount: 50000,
      reference: "Pago de prueba"
    });

  assert.equal(transferResponse.statusCode, 201);
  assert.equal(transferResponse.body.amount, 50000);
  assert.equal(transferResponse.body.receiver.accountNumber, martinAccount);
});

test("rechaza acceso admin desde rol user", async () => {
  const loginResponse = await request(app)
    .post("/auth/login")
    .send({
      email: "lucia@aurora-bank.cl",
      password: "User1234!"
    });

  const adminResponse = await request(app)
    .get("/admin/users")
    .set("Authorization", `Bearer ${loginResponse.body.accessToken}`);

  assert.equal(adminResponse.statusCode, 403);
});

test("admin puede bloquear un usuario y luego ese usuario no puede autenticarse", async () => {
  const adminLogin = await request(app)
    .post("/auth/login")
    .send({
      email: "admin@aurora-bank.cl",
      password: "Admin1234!"
    });

  const usersResponse = await request(app)
    .get("/admin/users")
    .set("Authorization", `Bearer ${adminLogin.body.accessToken}`);

  const lucia = usersResponse.body.find((user) => user.email === "lucia@aurora-bank.cl");

  const blockResponse = await request(app)
    .patch(`/admin/users/${lucia.id}/status`)
    .set("Authorization", `Bearer ${adminLogin.body.accessToken}`)
    .send({ status: "blocked" });

  assert.equal(blockResponse.statusCode, 200);
  assert.equal(blockResponse.body.user.status, "blocked");

  const relogin = await request(app)
    .post("/auth/login")
    .send({
      email: "lucia@aurora-bank.cl",
      password: "User1234!"
    });

  assert.equal(relogin.statusCode, 403);
});
