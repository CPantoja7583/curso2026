const { createSequelize } = require("./src/database");
const { defineModels } = require("./src/models");
const { createApp } = require("./src/app");

const PORT = Number(process.env.PORT || 3015);

async function seed(models) {
  const { Pelicula, Actor } = models;
  const totalPeliculas = await Pelicula.count();
  const totalActores = await Actor.count();

  if (totalPeliculas === 0) {
    await Pelicula.bulkCreate([
      { titulo: "Matrix", anio: 1999 },
      { titulo: "John Wick", anio: 2014 },
    ]);
  }

  if (totalActores === 0) {
    await Actor.bulkCreate([
      { nombre: "Keanu Reeves", fecha_nacimiento: "1964-09-02" },
      { nombre: "Carrie-Anne Moss", fecha_nacimiento: "1967-08-21" },
    ]);
  }
}

async function main() {
  const sequelize = createSequelize();
  const models = defineModels(sequelize);

  await sequelize.authenticate();
  await sequelize.sync();
  await seed(models);

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
