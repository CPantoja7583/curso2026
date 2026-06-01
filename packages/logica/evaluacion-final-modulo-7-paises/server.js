const { createPool } = require("./src/database");
const { createApp } = require("./src/app");

const PORT = Number(process.env.PORT || 3016);

function main() {
  const pool = createPool();
  const app = createApp(pool);

  app.listen(PORT, () => {
    console.log(`Servidor disponible en http://127.0.0.1:${PORT}`);
  });
}

if (require.main === module) {
  main();
}

module.exports = {
  main,
};
