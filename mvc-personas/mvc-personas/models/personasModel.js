// ============================================
// MODELO: personasModel.js
// ============================================
// Esta capa SOLO sabe de la base de datos.
// No conoce req, res, HTML ni nada de HTTP.

const { pool } = require("../db");

// Trae todas las personas
async function obtenerTodas() {
  const r = await pool.query("SELECT * FROM personas ORDER BY id");
  return r.rows;
}

// Inserta una persona nueva
async function crear({ nombres, apellidos, edad }) {
  const r = await pool.query(
    `INSERT INTO personas (nombres, apellidos, edad)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [nombres, apellidos, edad]
  );
  return r.rows[0];
}

// Elimina todas las personas
async function eliminarPersonas() {
  const r = await pool.query("DELETE FROM personas");
  return r.rows;
}

module.exports = { obtenerTodas, crear, eliminarPersonas };
