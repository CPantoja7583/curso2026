const express = require("express");
const cors = require("cors");
const path = require("node:path");

const { CursorManager, createPais, deletePais } = require("./paises-service");

function createApp(pool) {
  const app = express();
  const cursorManager = new CursorManager(pool);

  app.use(cors());
  app.use(express.json());
  app.use(express.static(path.join(__dirname, "..", "public")));

  app.get("/api/paises", async (request, response, next) => {
    try {
      const limit = Number(request.query.limit || 5);
      const cursorId = request.query.cursorId || null;
      const data = await cursorManager.next(limit, cursorId);
      response.json(data);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/paises", async (request, response, next) => {
    try {
      const pais = await createPais(pool, request.body);
      response.status(201).json({ ok: true, mensaje: "Pais agregado", data: pais });
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/paises/:nombre", async (request, response, next) => {
    try {
      const result = await deletePais(pool, request.params.nombre);
      response.json({ ok: true, mensaje: "Pais eliminado", data: result });
    } catch (error) {
      next(error);
    }
  });

  app.use((error, _request, response, _next) => {
    const message = error.code === "23505" ? "La operacion viola una restriccion de unicidad o accion registrada" : error.message;
    const statusCode = error.statusCode || (error.code === "23505" ? 409 : 500);
    if (statusCode === 500) {
      console.error(error);
    }
    response.status(statusCode).json({ ok: false, mensaje: message });
  });

  return app;
}

module.exports = {
  createApp,
};
