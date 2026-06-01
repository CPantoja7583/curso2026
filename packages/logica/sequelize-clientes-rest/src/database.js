const { Sequelize } = require("sequelize");

function createSequelize() {
  if (process.env.DATABASE_URL) {
    return new Sequelize(process.env.DATABASE_URL, {
      dialect: "postgres",
      logging: false,
    });
  }

  return new Sequelize(
    process.env.DB_NAME || "clientes_db",
    process.env.DB_USER || "postgres",
    process.env.DB_PASS || process.env.DB_PASSWORD || "postgres",
    {
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT || 5432),
      dialect: "postgres",
      logging: false,
    },
  );
}

module.exports = {
  createSequelize,
};
