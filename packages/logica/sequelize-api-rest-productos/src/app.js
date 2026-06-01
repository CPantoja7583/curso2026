const express = require("express");
const cors = require("cors");
const path = require("node:path");
const { UniqueConstraintError, ValidationError } = require("sequelize");

const {
  buildErrorResponse,
  buildProductoResponse,
  normalizeProductoPayload,
  validateProductoPayload,
} = require("./productos");

function createApp({ Producto }) {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.static(path.join(__dirname, "..", "public")));

  app.get("/api/productos", async (request, response, next) => {
    try {
      const productos = await Producto.findAll({ order: [["id", "ASC"]] });
      response.json(buildProductoResponse(productos));
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/productos/:id", async (request, response, next) => {
    try {
      const producto = await Producto.findByPk(request.params.id);
      if (!producto) {
        response.status(404).json(buildErrorResponse("Producto no encontrado"));
        return;
      }

      response.json(buildProductoResponse(producto));
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/productos", async (request, response, next) => {
    try {
      const validation = validateProductoPayload(request.body);
      if (!validation.valid) {
        response.status(400).json(buildErrorResponse("Datos invalidos", { errores: validation.errores }));
        return;
      }

      const producto = await Producto.create(normalizeProductoPayload(request.body));
      response.status(201).json(buildProductoResponse(producto, { mensaje: "Producto creado" }));
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/productos/:id", async (request, response, next) => {
    try {
      const validation = validateProductoPayload(request.body, { partial: true });
      if (!validation.valid) {
        response.status(400).json(buildErrorResponse("Datos invalidos", { errores: validation.errores }));
        return;
      }

      const producto = await Producto.findByPk(request.params.id);
      if (!producto) {
        response.status(404).json(buildErrorResponse("Producto no encontrado"));
        return;
      }

      await producto.update(normalizeProductoPayload(request.body));
      response.json(buildProductoResponse(producto, { mensaje: "Producto actualizado" }));
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/productos/:id", async (request, response, next) => {
    try {
      const producto = await Producto.findByPk(request.params.id);
      if (!producto) {
        response.status(404).json(buildErrorResponse("Producto no encontrado"));
        return;
      }

      await producto.destroy();
      response.json(buildProductoResponse(producto, { mensaje: "Producto eliminado" }));
    } catch (error) {
      next(error);
    }
  });

  app.use((error, request, response, next) => {
    if (error instanceof UniqueConstraintError || error instanceof ValidationError) {
      response.status(400).json(buildErrorResponse("Datos invalidos", { errores: error.errors.map((item) => item.message) }));
      return;
    }

    console.error(error);
    response.status(500).json(buildErrorResponse("Error interno del servidor"));
  });

  return app;
}

module.exports = {
  createApp,
};
