
require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

pool.query("SELECT NOW()")
  .then(() => console.log("✓ Conectado a PostgreSQL"))
  .catch(err => console.error("✗ Error de conexión:", err.message));


app.get("/cuentas", async (req, res) => {
  const r = await pool.query("SELECT * FROM cuentas ORDER BY id");
  res.json(r.rows);
});

app.post("/transferir", async (req, res) => {
  const { origen, destino, monto } = req.body;

  // Validación básica de formato
  if (!origen || !destino || !monto || monto <= 0) {
    return res.status(400).json({
      error: "Se requiere origen, destino y monto (positivo)"
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");                       // abrir transacción

    // 1. Restar del origen
    await client.query(
      "UPDATE cuentas SET saldo = saldo - $1 WHERE id = $2",
      [monto, origen]
    );

    // 2. Verificar que el origen no quedó en negativo
    const r = await client.query(
      "SELECT saldo FROM cuentas WHERE id = $1",
      [origen]
    );

    if (r.rows.length === 0) {
      throw new Error("La cuenta de origen no existe");
    }
    if (r.rows[0].saldo < 0) {
      // Lanzar el error dispara el catch -> ROLLBACK
      throw new Error("Saldo insuficiente");
    }

    // 3. Sumar al destino
    const destinoResult = await client.query(
      "UPDATE cuentas SET saldo = saldo + $1 WHERE id = $2",
      [monto, destino]
    );

    if (destinoResult.rowCount === 0) {
      throw new Error("La cuenta de destino no existe");
    }

    // 4. Todo salió bien -> confirmar
    await client.query("COMMIT");

    // Devolver los saldos actualizados
    const saldos = await client.query("SELECT * FROM cuentas ORDER BY id");
    res.json({
      ok: true,
      mensaje: `Transferencia de ${monto} realizada`,
      cuentas: saldos.rows
    });

  } catch (err) {
    // Algo falló -> deshacer TODO (incluido el UPDATE del origen)
    await client.query("ROLLBACK");
    res.status(400).json({
      ok: false,
      error: err.message,
      nota: "Se hizo ROLLBACK: ningún saldo fue modificado"
    });

  } finally {
    // Pase lo que pase, devolver la conexión al pool
    client.release();
  }
});



app.get("/", (req, res) => {
  res.json({
    demo: "Transacciones con PostgreSQL",
    endpoints: [
      "GET  /cuentas      - ver saldos actuales",
      "POST /transferir   - transferir { origen, destino, monto }"
    ]
  });
});


app.listen(3000, () => {
  console.log("Servidor en http://localhost:3000");
});
