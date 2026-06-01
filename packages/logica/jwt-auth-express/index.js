require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("node:path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const auth = require("./middlewares/auth");
const {
  buildErrorResponse,
  buildOkResponse,
  normalizeCredentials,
  validateCredentials,
} = require("./src/auth-utils");
const { addUser, findUserByEmail, readUsers, writeUsers } = require("./src/users-store");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/auth/register", async (req, res) => {
  const validation = validateCredentials(req.body);
  if (!validation.valid) {
    return res.status(400).json(buildErrorResponse("Email y password son requeridos", validation.errores));
  }

  const { email, password } = normalizeCredentials(req.body);
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    return res.status(409).json(buildErrorResponse("Email ya registrado"));
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await addUser({ email, passwordHash, role: "user" });
  return res.status(201).json(buildOkResponse({ email: user.email, role: user.role }, { mensaje: "Usuario registrado" }));
});

app.post("/auth/login", async (req, res) => {
  const validation = validateCredentials(req.body);
  if (!validation.valid) {
    return res.status(400).json(buildErrorResponse("Email y password son requeridos", validation.errores));
  }

  const { email, password } = normalizeCredentials(req.body);
  const user = await findUserByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json(buildErrorResponse("Credenciales invalidas"));
  }

  const token = jwt.sign(
    { sub: email, email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES || "15m" },
  );

  return res.status(200).json({ ok: true, token });
});

app.get("/api/perfil", auth, (req, res) => {
  return res.json(buildOkResponse({ email: req.user.email, role: req.user.role }));
});

async function ensureSeedUser() {
  const users = await readUsers();
  if (users.length > 0) {
    return;
  }

  const passwordHash = await bcrypt.hash("123456", 10);
  await writeUsers([
    {
      email: "demo@mail.com",
      passwordHash,
      role: "user",
    },
  ]);
}

const PORT = Number(process.env.PORT || 3000);

async function main() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET no configurado");
  }

  await ensureSeedUser();

  app.listen(PORT, () => {
    console.log(`API segura en http://localhost:${PORT}`);
  });
}

if (require.main === module) {
  main().catch((error) => {
    console.error("No se pudo iniciar la aplicacion", error);
    process.exit(1);
  });
}

module.exports = {
  app,
  ensureSeedUser,
  main,
};
