const { createSequelize } = require("./src/database");
const { defineModels } = require("./src/models");
const { createApp } = require("./src/app");

const PORT = Number(process.env.PORT || 3013);

async function seed(Producto) {
  const total = await Producto.count();
  if (total > 0) {
    return;
  }

  await Producto.bulkCreate([
    { nombre: "Teclado mecanico", precio: 35000, stock: 8 },
    { nombre: "Mouse optico", precio: 12000, stock: 15 },
    { nombre: "Monitor 24 pulgadas", precio: 140000, stock: 4 },
  ]);
}

async function main() {
  const sequelize = createSequelize();
  const models = defineModels(sequelize);
  await sequelize.authenticate();
  await sequelize.sync();
  await seed(models.Producto);

  const app = createApp(models);
  app.listen(PORT, () => {
    console.log(`Servidor disponible en http://127.0.0.1:${PORT}`);
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
  seed,
};
