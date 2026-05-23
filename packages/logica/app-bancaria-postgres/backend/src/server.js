const env = require("./config/env");
const { app } = require("./app");
const { ensureDatabaseReady } = require("./db/init");

async function start() {
  await ensureDatabaseReady();

  app.listen(env.port, "127.0.0.1", () => {
    console.log(`Aurora Bank API disponible en http://127.0.0.1:${env.port}`);
  });
}

start().catch((error) => {
  console.error("No se pudo iniciar la API.", error);
  process.exit(1);
});
