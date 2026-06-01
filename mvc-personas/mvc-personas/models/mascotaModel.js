const { pool } = require("../db");

// Trae todas las personas
async function obtenerTodas() {
    const r = await pool.query("SELECT * FROM MASCOTAS ORDER BY id");
    return r.rows;
  }

  module.exports = { obtenerTodas};
