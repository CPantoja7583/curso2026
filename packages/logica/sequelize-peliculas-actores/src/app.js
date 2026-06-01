const express = require("express");
const cors = require("cors");
const path = require("node:path");
const { UniqueConstraintError, ValidationError } = require("sequelize");

const {
  asignarActorTransaccional,
  buildErrorResponse,
  buildOkResponse,
  normalizeActorPayload,
  normalizePeliculaPayload,
  validateActorPayload,
  validatePeliculaPayload,
} = require("./catalogo");

function createApp(models) {
  const { Pelicula, Actor } = models;
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.static(path.join(__dirname, "..", "public")));

  app.get("/peliculas", async (_request, response, next) => {
    try {
      const peliculas = await Pelicula.findAll({
        include: { model: Actor, through: { attributes: [] } },
        order: [["id", "ASC"]],
      });
      response.json(buildOkResponse(peliculas));
    } catch (error) {
      next(error);
    }
  });

  app.post("/peliculas", async (request, response, next) => {
    try {
      const validation = validatePeliculaPayload(request.body);
      if (!validation.valid) {
        response.status(400).json(buildErrorResponse("Datos invalidos", validation.errores));
        return;
      }

      const pelicula = await Pelicula.create(normalizePeliculaPayload(request.body));
      if (Array.isArray(request.body.actores_ids) && request.body.actores_ids.length > 0) {
        await pelicula.setActors(request.body.actores_ids);
      }

      const creada = await Pelicula.findByPk(pelicula.id, {
        include: { model: Actor, through: { attributes: [] } },
      });
      response.status(201).json(buildOkResponse(creada, "Pelicula creada"));
    } catch (error) {
      next(error);
    }
  });

  app.get("/actores", async (_request, response, next) => {
    try {
      const actores = await Actor.findAll({
        include: { model: Pelicula, through: { attributes: [] } },
        order: [["id", "ASC"]],
      });
      response.json(buildOkResponse(actores));
    } catch (error) {
      next(error);
    }
  });

  app.post("/actores", async (request, response, next) => {
    try {
      const validation = validateActorPayload(request.body);
      if (!validation.valid) {
        response.status(400).json(buildErrorResponse("Datos invalidos", validation.errores));
        return;
      }

      const actor = await Actor.create(normalizeActorPayload(request.body));
      response.status(201).json(buildOkResponse(actor, "Actor creado"));
    } catch (error) {
      next(error);
    }
  });

  app.post("/asignar-actor", async (request, response, next) => {
    try {
      const asignacion = await asignarActorTransaccional(models, request.body);
      response.status(201).json(buildOkResponse(asignacion, "Actor asignado a pelicula"));
    } catch (error) {
      next(error);
    }
  });

  app.use((error, _request, response, _next) => {
    if (error.statusCode) {
      response.status(error.statusCode).json(buildErrorResponse(error.message));
      return;
    }

    if (error instanceof UniqueConstraintError || error instanceof ValidationError) {
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
