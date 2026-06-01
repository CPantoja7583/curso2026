const express = require("express");
const fs = require("fs/promises");
const path = require("path");

const DEFAULT_DATA_PATH = path.join(__dirname, "catalogo.json");

function createApp(options = {}) {
  const app = express();
  const dataPath = options.dataPath || process.env.CATALOGO_PATH || DEFAULT_DATA_PATH;

  app.use(express.json());

  async function leerCatalogo() {
    try {
      const raw = await fs.readFile(dataPath, "utf8");
      const parsed = JSON.parse(raw);

      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      if (error.code === "ENOENT") {
        await fs.writeFile(dataPath, "[]\n", "utf8");
        return [];
      }

      throw error;
    }
  }

  async function escribirCatalogo(libros) {
    await fs.writeFile(dataPath, `${JSON.stringify(libros, null, 2)}\n`, "utf8");
  }

  function validarLibro(payload) {
    if (!payload || typeof payload !== "object") {
      return false;
    }

    const { titulo, autor, anio } = payload;

    return (
      typeof titulo === "string" &&
      titulo.trim() !== "" &&
      typeof autor === "string" &&
      autor.trim() !== "" &&
      Number.isInteger(anio) &&
      anio > 0
    );
  }

  app.get("/libros", async (_req, res) => {
    try {
      const libros = await leerCatalogo();
      res.status(200).json({ ok: true, data: libros });
    } catch (_error) {
      res.status(500).json({ ok: false, mensaje: "No fue posible leer el catalogo." });
    }
  });

  app.post("/libros", async (req, res) => {
    if (!validarLibro(req.body)) {
      return res.status(400).json({ ok: false, mensaje: "Datos invalidos." });
    }

    try {
      const libros = await leerCatalogo();
      const nuevoId = Math.max(0, ...libros.map((libro) => libro.id || 0)) + 1;
      const nuevoLibro = {
        id: nuevoId,
        titulo: req.body.titulo.trim(),
        autor: req.body.autor.trim(),
        anio: req.body.anio
      };

      libros.push(nuevoLibro);
      await escribirCatalogo(libros);

      res.status(201).json({ ok: true, data: nuevoLibro });
    } catch (_error) {
      res.status(500).json({ ok: false, mensaje: "No fue posible guardar el libro." });
    }
  });

  app.put("/libros/:id", async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0 || !validarLibro(req.body)) {
      return res.status(400).json({ ok: false, mensaje: "Datos invalidos." });
    }

    try {
      const libros = await leerCatalogo();
      const indice = libros.findIndex((libro) => libro.id === id);

      if (indice === -1) {
        return res.status(404).json({ ok: false, mensaje: "Libro no encontrado." });
      }

      const libroActualizado = {
        id,
        titulo: req.body.titulo.trim(),
        autor: req.body.autor.trim(),
        anio: req.body.anio
      };

      libros[indice] = libroActualizado;
      await escribirCatalogo(libros);

      res.status(200).json({ ok: true, data: libroActualizado });
    } catch (_error) {
      res.status(500).json({ ok: false, mensaje: "No fue posible actualizar el libro." });
    }
  });

  app.delete("/libros/:id", async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ ok: false, mensaje: "ID invalido." });
    }

    try {
      const libros = await leerCatalogo();
      const indice = libros.findIndex((libro) => libro.id === id);

      if (indice === -1) {
        return res.status(404).json({ ok: false, mensaje: "Libro no encontrado." });
      }

      const [libroEliminado] = libros.splice(indice, 1);
      await escribirCatalogo(libros);

      res.status(200).json({ ok: true, data: libroEliminado });
    } catch (_error) {
      res.status(500).json({ ok: false, mensaje: "No fue posible eliminar el libro." });
    }
  });

  app.use((_req, res) => {
    res.status(404).json({ ok: false, mensaje: "Ruta no encontrada." });
  });

  return app;
}

if (require.main === module) {
  const app = createApp();
  const port = Number(process.env.PORT) || 3007;

  app.listen(port, () => {
    console.log(`Servidor de libros disponible en http://127.0.0.1:${port}`);
  });
}

module.exports = { createApp };
