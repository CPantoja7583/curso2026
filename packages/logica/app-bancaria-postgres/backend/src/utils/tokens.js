const crypto = require("node:crypto");
const jwt = require("jsonwebtoken");
const env = require("../config/env");

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function generateAuthTokens(user) {
  const tokenId = crypto.randomUUID();
  const accessToken = jwt.sign(
    {
      sub: String(user.id),
      email: user.email,
      role: user.role,
      status: user.status
    },
    env.jwtSecret,
    { expiresIn: env.accessTokenTtl }
  );

  const refreshToken = jwt.sign(
    {
      sub: String(user.id),
      tid: tokenId,
      type: "refresh"
    },
    env.jwtRefreshSecret,
    { expiresIn: env.refreshTokenTtl }
  );

  return {
    accessToken,
    refreshToken,
    tokenId
  };
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwtRefreshSecret);
}

module.exports = {
  hashToken,
  generateAuthTokens,
  verifyAccessToken,
  verifyRefreshToken
};
