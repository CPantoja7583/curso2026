const path = require("node:path");
const dotenv = require("dotenv");

dotenv.config({
  path: path.join(__dirname, "../../.env")
});

module.exports = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 4000,
  frontendOrigin: process.env.FRONTEND_ORIGIN || "http://127.0.0.1:5173",
  databaseUrl: process.env.DATABASE_URL || "postgres://postgres:postgres@127.0.0.1:5432/app_bancaria",
  jwtSecret: process.env.JWT_SECRET || "change_me_access_secret",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "change_me_refresh_secret",
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL || "15m",
  refreshTokenTtl: process.env.REFRESH_TOKEN_TTL || "7d",
  defaultOpeningBalance: Number(process.env.DEFAULT_OPENING_BALANCE) || 250000,
  adminEmail: process.env.ADMIN_EMAIL || "admin@aurora-bank.cl",
  adminPassword: process.env.ADMIN_PASSWORD || "Admin1234!"
};
