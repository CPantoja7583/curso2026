const fs = require("node:fs/promises");
const path = require("node:path");
const express = require("express");
const initSqlJs = require("sql.js");

const PORT = Number(process.env.PORT) || 3001;
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function rowsFromStatement(statement) {
  const rows = [];

  while (statement.step()) {
    rows.push(statement.getAsObject());
  }

  statement.free();
  return rows;
}

async function buildDatabase() {
  const SQL = await initSqlJs({
    locateFile: (file) => path.join(__dirname, "node_modules", "sql.js", "dist", file)
  });

  const sqlFilePath = path.resolve(__dirname, "..", "..", "..", "materiales", "enunciados", "actividad2.sql");
  const sqlScript = await fs.readFile(sqlFilePath, "utf8");
  const db = new SQL.Database();
  db.run(sqlScript);
  return db;
}

async function main() {
  const db = await buildDatabase();

  app.get("/conductores", (_request, response) => {
    const statement = db.prepare("SELECT nombre, edad FROM conductores ORDER BY nombre;");
    response.status(200).json(rowsFromStatement(statement));
  });

  app.get("/automoviles", (_request, response) => {
    const statement = db.prepare("SELECT marca, patente, nombre_conductor FROM automoviles ORDER BY patente;");
    response.status(200).json(rowsFromStatement(statement));
  });

  app.get("/conductoressinauto", (request, response) => {
    const edad = Number(request.query.edad);

    if (!Number.isInteger(edad)) {
      response.status(400).json({ error: "Debes enviar el parametro edad como numero entero." });
      return;
    }

    const statement = db.prepare(`
      SELECT c.nombre, c.edad
      FROM conductores c
      LEFT JOIN automoviles a
        ON a.nombre_conductor = c.nombre
      WHERE c.edad < ?
        AND a.nombre_conductor IS NULL
      ORDER BY c.nombre;
    `);

    statement.bind([edad]);
    response.status(200).json(rowsFromStatement(statement));
  });

  app.get("/solitos", (_request, response) => {
    const conductoresStatement = db.prepare(`
      SELECT c.nombre, c.edad
      FROM conductores c
      LEFT JOIN automoviles a
        ON a.nombre_conductor = c.nombre
      WHERE a.nombre_conductor IS NULL
      ORDER BY c.nombre;
    `);

    const autosStatement = db.prepare(`
      SELECT a.marca, a.patente, a.nombre_conductor
      FROM automoviles a
      LEFT JOIN conductores c
        ON c.nombre = a.nombre_conductor
      WHERE c.nombre IS NULL
      ORDER BY a.patente;
    `);

    response.status(200).json({
      conductoresSinAutomovil: rowsFromStatement(conductoresStatement),
      automovilesSinConductor: rowsFromStatement(autosStatement)
    });
  });

  app.get("/auto", (request, response) => {
    const { patente, iniciopatente } = request.query;

    if (typeof patente === "string" && patente.trim()) {
      const statement = db.prepare(`
        SELECT
          a.marca,
          a.patente,
          a.nombre_conductor,
          c.edad AS edad_conductor
        FROM automoviles a
        LEFT JOIN conductores c
          ON c.nombre = a.nombre_conductor
        WHERE a.patente = ?
      `);

      statement.bind([patente.trim()]);
      const rows = rowsFromStatement(statement);

      if (rows.length === 0) {
        response.status(404).json({ error: "No existe un automovil con esa patente." });
        return;
      }

      response.status(200).json(rows[0]);
      return;
    }

    if (typeof iniciopatente === "string" && iniciopatente.trim()) {
      const pattern = `${iniciopatente.trim()}%`;
      const statement = db.prepare(`
        SELECT
          a.marca,
          a.patente,
          a.nombre_conductor,
          c.edad AS edad_conductor
        FROM automoviles a
        LEFT JOIN conductores c
          ON c.nombre = a.nombre_conductor
        WHERE a.patente LIKE ?
        ORDER BY a.patente
      `);

      statement.bind([pattern]);
      response.status(200).json(rowsFromStatement(statement));
      return;
    }

    response.status(400).json({
      error: "Debes enviar patente=<string> o iniciopatente=<letra>."
    });
  });

  app.listen(PORT, () => {
    console.log(`Servidor API ejecutandose en http://127.0.0.1:${PORT}`);
  });
}

main().catch((error) => {
  console.error("No se pudo iniciar la aplicacion:", error);
  process.exit(1);
});
