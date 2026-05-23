const bcrypt = require("bcryptjs");
const { query, withTransaction } = require("../config/db");
const env = require("../config/env");
const { generateUniqueAccountNumber } = require("../utils/account-number");
const { serializeAccount, serializeUser } = require("../utils/serializers");
const { HttpError } = require("../utils/http-error");

async function createUserWithAccount({ fullName, email, password, role = "user" }) {
  const normalizedEmail = email.trim().toLowerCase();
  const exists = await query("SELECT id FROM users WHERE email = $1", [normalizedEmail]);

  if (exists.rowCount) {
    throw new HttpError(409, "Ya existe un usuario registrado con este correo.");
  }

  return withTransaction(async (client) => {
    const passwordHash = await bcrypt.hash(password, 10);
    const userResult = await client.query(
      `INSERT INTO users (full_name, email, password_hash, role, status)
       VALUES ($1, $2, $3, $4, 'active')
       RETURNING id, full_name, email, role, status, created_at`,
      [fullName.trim(), normalizedEmail, passwordHash, role]
    );

    const user = userResult.rows[0];
    const accountNumber = await generateUniqueAccountNumber(client);
    const accountResult = await client.query(
      `INSERT INTO accounts (user_id, account_number, balance, currency, status)
       VALUES ($1, $2, $3, 'CLP', 'active')
       RETURNING id, user_id, account_number, balance, currency, status, created_at`,
      [user.id, accountNumber, env.defaultOpeningBalance]
    );

    return {
      user: serializeUser(user),
      account: serializeAccount(accountResult.rows[0])
    };
  });
}

async function findUserWithPasswordByEmail(email) {
  const result = await query(
    `SELECT id, full_name, email, password_hash, role, status, created_at
     FROM users
     WHERE email = $1`,
    [email.trim().toLowerCase()]
  );

  return result.rows[0] || null;
}

async function findUserContextById(id) {
  const result = await query(
    `SELECT
       u.id,
       u.full_name,
       u.email,
       u.role,
       u.status,
       u.created_at,
       a.id AS account_id,
       a.user_id,
       a.account_number,
       a.balance,
       a.currency,
       a.status AS account_status,
       a.created_at AS account_created_at
     FROM users u
     JOIN accounts a ON a.user_id = u.id
     WHERE u.id = $1`,
    [id]
  );

  if (!result.rowCount) {
    return null;
  }

  const row = result.rows[0];
  return {
    user: {
      id: Number(row.id),
      fullName: row.full_name,
      email: row.email,
      role: row.role,
      status: row.status,
      createdAt: row.created_at
    },
    account: {
      id: Number(row.account_id),
      userId: Number(row.user_id),
      accountNumber: row.account_number,
      balance: Number(row.balance),
      currency: row.currency,
      status: row.account_status,
      createdAt: row.account_created_at
    }
  };
}

async function getMyProfile(userId) {
  const context = await findUserContextById(userId);

  if (!context) {
    throw new HttpError(404, "Usuario no encontrado.");
  }

  return context;
}

async function listUsers() {
  const result = await query(
    `SELECT
       u.id,
       u.full_name,
       u.email,
       u.role,
       u.status,
       u.created_at,
       a.account_number,
       a.balance,
       a.currency
     FROM users u
     JOIN accounts a ON a.user_id = u.id
     ORDER BY u.created_at ASC`
  );

  return result.rows.map((row) => ({
    id: Number(row.id),
    fullName: row.full_name,
    email: row.email,
    role: row.role,
    status: row.status,
    createdAt: row.created_at,
    account: {
      accountNumber: row.account_number,
      balance: Number(row.balance),
      currency: row.currency
    }
  }));
}

async function updateUserStatus(userId, status) {
  if (!["active", "blocked"].includes(status)) {
    throw new HttpError(400, "Estado invalido. Usa active o blocked.");
  }

  return withTransaction(async (client) => {
    const result = await client.query(
      `UPDATE users
       SET status = $2
       WHERE id = $1
       RETURNING id, full_name, email, role, status, created_at`,
      [userId, status]
    );

    if (!result.rowCount) {
      throw new HttpError(404, "Usuario no encontrado.");
    }

    await client.query(
      "UPDATE accounts SET status = $2 WHERE user_id = $1",
      [userId, status]
    );

    const accountResult = await client.query(
      `SELECT id, user_id, account_number, balance, currency, status, created_at
       FROM accounts
       WHERE user_id = $1`,
      [userId]
    );

    return {
      user: serializeUser(result.rows[0]),
      account: serializeAccount(accountResult.rows[0])
    };
  });
}

module.exports = {
  createUserWithAccount,
  findUserWithPasswordByEmail,
  findUserContextById,
  getMyProfile,
  listUsers,
  updateUserStatus
};
