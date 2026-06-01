const express = require("express");
const cors = require("cors");
const path = require("node:path");
const { UniqueConstraintError, ValidationError } = require("sequelize");

const {
  buildClienteResponse,
  buildErrorResponse,
  normalizeClientePayload,
  validateClientePayload,
} = require("./clientes");

function createApp({ Cliente }) {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.static(path.join(__dirname, "..", "public")));

  app.get("/clientes", async (_request, response, next) => {
    try {
      const clientes = await Cliente.findAll({ order: [["id", "ASC"]] });
      response.json(buildClienteResponse(clientes));
    } catch (error) {
      next(error);
    }
  });

  app.post("/clientes", async (request, response, next) => {
    try {
      const validation = validateClientePayload(request.body);
      if (!validation.valid) {
        response.status(400).json(buildErrorResponse("Datos invalidos", validation.errores));
        return;
      }

      const cliente = await Cliente.create(normalizeClientePayload(request.body));
      response.status(201).json(buildClienteResponse(cliente, { mensaje: "Cliente creado" }));
    } catch (error) {
      next(error);
    }
  });

  app.use((error, _request, response, _next) => {
    if (error instanceof UniqueConstraintError) {
      response.status(409).json(buildErrorResponse("Ya existe un cliente con ese email"));
      return;
    }

    if (error instanceof ValidationError) {
      response.status(400).json(
        buildErrorResponse(
          "Datos invalidos",
          error.errors.map((item) => item.message),
        ),
      );
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
