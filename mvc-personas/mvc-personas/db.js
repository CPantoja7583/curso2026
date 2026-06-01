// ============================================
// Conexión a PostgreSQL
// ============================================
// Centralizamos el pool aquí para que TODOS los modelos lo usen.

require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

pool.query("SELECT NOW()")
  .then(() => console.log("✓ Conectado a PostgreSQL"))
  .catch(err => console.error("✗ Error conectando:", err.message));

module.exports = { pool };
