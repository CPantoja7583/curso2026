const { createSequelize } = require("./src/database");
const { defineModels } = require("./src/models");
const { createApp } = require("./src/app");

const PORT = Number(process.env.PORT || 3000);

async function main() {
  const sequelize = createSequelize();
  const models = defineModels(sequelize);

  await sequelize.authenticate();
  await sequelize.sync();

  const app = createApp(models);
  app.listen(PORT, () => {
    console.log(`API en http://localhost:${PORT}`);
  });
}

if (require.main === module) {
  main().catch((error) => {
    console.error("No se pudo iniciar la aplicacion", error);
    process.exit(1);
  });
}

module.exports = {
  main,
};
