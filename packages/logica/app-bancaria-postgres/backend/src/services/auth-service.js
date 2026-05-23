const bcrypt = require("bcryptjs");
const { query } = require("../config/db");
const { HttpError } = require("../utils/http-error");
const { generateAuthTokens, hashToken, verifyRefreshToken } = require("../utils/tokens");
const { createUserWithAccount, findUserWithPasswordByEmail, findUserContextById } = require("./user-service");

async function persistRefreshToken(userId, tokens) {
  const payload = verifyRefreshToken(tokens.refreshToken);
  const expiresAt = new Date(payload.exp * 1000);
  await query(
    `INSERT INTO refresh_tokens (user_id, token_id, token_hash, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [userId, tokens.tokenId, hashToken(tokens.refreshToken), expiresAt]
  );
}

async function buildSession(userId, providedTokens) {
  const context = await findUserContextById(userId);
  const tokens = providedTokens || generateAuthTokens(context.user);

  if (!providedTokens) {
    await persistRefreshToken(userId, tokens);
  }

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: context.user,
    account: context.account
  };
}

async function register(payload) {
  const { fullName, email, password } = payload;

  if (!fullName || !email || !password) {
    throw new HttpError(400, "Debes enviar nombre, correo y password.");
  }

  if (password.length < 8) {
    throw new HttpError(400, "La password debe tener al menos 8 caracteres.");
  }

  const created = await createUserWithAccount({ fullName, email, password, role: "user" });
  const tokens = generateAuthTokens(created.user);
  await persistRefreshToken(created.user.id, tokens);

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: created.user,
    account: created.account
  };
}

async function login(payload) {
  const { email, password } = payload;

  if (!email || !password) {
    throw new HttpError(400, "Debes enviar correo y password.");
  }

  const user = await findUserWithPasswordByEmail(email);
  if (!user) {
    throw new HttpError(401, "Credenciales invalidas.");
  }

  const matches = await bcrypt.compare(password, user.password_hash);
  if (!matches) {
    throw new HttpError(401, "Credenciales invalidas.");
  }

  if (user.status === "blocked") {
    throw new HttpError(403, "Tu cuenta esta bloqueada. Contacta al administrador.");
  }

  const tokens = generateAuthTokens(user);
  await persistRefreshToken(user.id, tokens);
  return buildSession(user.id, tokens);
}

async function refresh(refreshToken) {
  if (!refreshToken) {
    throw new HttpError(400, "Debes enviar el refresh token.");
  }

  const payload = verifyRefreshToken(refreshToken);
  const stored = await query(
    `SELECT user_id, token_id, revoked_at, expires_at
     FROM refresh_tokens
     WHERE token_id = $1 AND token_hash = $2`,
    [payload.tid, hashToken(refreshToken)]
  );

  if (!stored.rowCount) {
    throw new HttpError(401, "Refresh token invalido.");
  }

  const tokenRow = stored.rows[0];
  if (tokenRow.revoked_at || new Date(tokenRow.expires_at) < new Date()) {
    throw new HttpError(401, "Refresh token expirado o revocado.");
  }

  await query("DELETE FROM refresh_tokens WHERE token_id = $1", [payload.tid]);
  const context = await findUserContextById(tokenRow.user_id);

  if (!context || context.user.status === "blocked") {
    throw new HttpError(403, "Usuario no disponible para renovar sesion.");
  }

  const tokens = generateAuthTokens(context.user);
  await persistRefreshToken(context.user.id, tokens);

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: context.user,
    account: context.account
  };
}

async function logout(refreshToken) {
  if (!refreshToken) {
    return { message: "Sesion cerrada." };
  }

  try {
    const payload = verifyRefreshToken(refreshToken);
    await query("DELETE FROM refresh_tokens WHERE token_id = $1", [payload.tid]);
  } catch {
    return { message: "Sesion cerrada." };
  }

  return { message: "Sesion cerrada." };
}

module.exports = {
  register,
  login,
  refresh,
  logout
};
