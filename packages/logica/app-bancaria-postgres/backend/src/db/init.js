const fs = require("node:fs/promises");
const path = require("node:path");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const env = require("../config/env");
const { pool, query, withTransaction } = require("../config/db");
const { generateUniqueAccountNumber } = require("../utils/account-number");

const schemaPath = path.join(__dirname, "schema.sql");

function parseDatabaseConfig() {
  const connectionUrl = new URL(env.databaseUrl);
  const databaseName = connectionUrl.pathname.replace(/^\//, "");

  if (!/^[a-zA-Z0-9_]+$/.test(databaseName)) {
    throw new Error("El nombre de la base de datos contiene caracteres no soportados.");
  }

  connectionUrl.pathname = "/postgres";

  return {
    databaseName,
    adminConnectionString: connectionUrl.toString()
  };
}

async function ensureDatabaseExists() {
  const { databaseName, adminConnectionString } = parseDatabaseConfig();
  const adminPool = new Pool({
    connectionString: adminConnectionString
  });

  try {
    const exists = await adminPool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [databaseName]
    );

    if (!exists.rowCount) {
      try {
        await adminPool.query(`CREATE DATABASE "${databaseName}"`);
      } catch (error) {
        if (!["42P04", "23505"].includes(error.code)) {
          throw error;
        }
      }
    }
  } finally {
    await adminPool.end();
  }
}

async function applySchema() {
  const sql = await fs.readFile(schemaPath, "utf8");
  await query(sql);
}

async function createSeedUser(client, { fullName, email, password, role, balance }) {
  const passwordHash = await bcrypt.hash(password, 10);
  const userResult = await client.query(
    `INSERT INTO users (full_name, email, password_hash, role, status)
     VALUES ($1, $2, $3, $4, 'active')
     RETURNING id`,
    [fullName, email.toLowerCase(), passwordHash, role]
  );

  const userId = userResult.rows[0].id;
  const accountNumber = await generateUniqueAccountNumber(client);

  await client.query(
    `INSERT INTO accounts (user_id, account_number, balance, currency, status)
     VALUES ($1, $2, $3, 'CLP', 'active')`,
    [userId, accountNumber, balance]
  );
}

async function seedDatabase() {
  const countResult = await query("SELECT COUNT(*)::int AS total FROM users");
  const total = countResult.rows[0].total;

  if (total > 0) {
    return;
  }

  await withTransaction(async (client) => {
    await createSeedUser(client, {
      fullName: "Administrador Aurora",
      email: env.adminEmail,
      password: env.adminPassword,
      role: "admin",
      balance: 900000
    });

    await createSeedUser(client, {
      fullName: "Lucia Herrera",
      email: "lucia@aurora-bank.cl",
      password: "User1234!",
      role: "user",
      balance: 500000
    });

    await createSeedUser(client, {
      fullName: "Martin Silva",
      email: "martin@aurora-bank.cl",
      password: "User1234!",
      role: "user",
      balance: 350000
    });
  });
}

async function ensureDatabaseReady() {
  await ensureDatabaseExists();
  await applySchema();
  await seedDatabase();
}

async function resetDatabase() {
  await query("TRUNCATE TABLE refresh_tokens, transfers, accounts, users RESTART IDENTITY CASCADE");
  await seedDatabase();
}

async function closeDatabase() {
  await pool.end();
}

module.exports = {
  ensureDatabaseReady,
  resetDatabase,
  closeDatabase
};
