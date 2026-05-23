const { ensureDatabaseReady, closeDatabase } = require("./init");

async function run() {
  try {
    await ensureDatabaseReady();
    console.log("Esquema PostgreSQL y datos semilla listos.");
  } catch (error) {
    console.error("No se pudo inicializar la base de datos.", error);
    process.exitCode = 1;
  } finally {
    await closeDatabase();
  }
}

run();
