const chalkModule = require("chalk");
const chalk = chalkModule.default || chalkModule;
const dayjs = require("dayjs");

const now = dayjs().format("DD/MM/YYYY HH:mm:ss");

console.log(`Fecha y hora actual: ${now}`);
console.log(chalk.green("Bienvenido a la aplicacion Node.js con paquetes externos."));
console.log(chalk.yellow(`Mensaje adicional con fecha y hora actual: ${now}`));
