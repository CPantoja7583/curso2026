const { Pool } = require("pg");
const env = require("./env");

const pool = new Pool({
  connectionString: env.databaseUrl
});

pool.on("error", (error) => {
  console.error("PostgreSQL pool error:", error);
});

async function query(text, params = []) {
  return pool.query(text, params);
}

async function withTransaction(run) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const result = await run(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  pool,
  query,
  withTransaction
};
