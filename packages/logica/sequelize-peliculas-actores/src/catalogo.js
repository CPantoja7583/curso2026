function clean(value) {
  return String(value ?? "").trim();
}

function isPositiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}

function isIsoDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function normalizePeliculaPayload(payload = {}) {
  return {
    titulo: clean(payload.titulo),
    anio: Number(payload.anio),
  };
}

function validatePeliculaPayload(payload = {}) {
  const pelicula = normalizePeliculaPayload(payload);
  const errores = [];

  if (!pelicula.titulo) {
    errores.push("titulo es obligatorio");
  }

  if (!Number.isInteger(pelicula.anio)) {
    errores.push("anio debe ser un entero valido");
  }

  return {
    valid: errores.length === 0,
    errores,
  };
}

function normalizeActorPayload(payload = {}) {
  return {
    nombre: clean(payload.nombre),
    fecha_nacimiento: clean(payload.fecha_nacimiento),
  };
}

function validateActorPayload(payload = {}) {
  const actor = normalizeActorPayload(payload);
  const errores = [];

  if (!actor.nombre) {
    errores.push("nombre es obligatorio");
  }

  if (!isIsoDate(actor.fecha_nacimiento)) {
    errores.push("fecha_nacimiento debe usar formato YYYY-MM-DD");
  }

  return {
    valid: errores.length === 0,
    errores,
  };
}

function normalizeAsignacionPayload(payload = {}) {
  return {
    pelicula_id: Number(payload.pelicula_id),
    actor_id: Number(payload.actor_id),
  };
}

function validateAsignacionPayload(payload = {}) {
  const asignacion = normalizeAsignacionPayload(payload);
  const errores = [];

  if (!isPositiveInteger(asignacion.pelicula_id)) {
    errores.push("pelicula_id debe ser un entero positivo");
  }

  if (!isPositiveInteger(asignacion.actor_id)) {
    errores.push("actor_id debe ser un entero positivo");
  }

  return {
    valid: errores.length === 0,
    errores,
  };
}

function buildOkResponse(data, mensaje) {
  const response = { ok: true };
  if (mensaje) {
    response.mensaje = mensaje;
  }
  response.data = data;
  return response;
}

function buildErrorResponse(mensaje, errores) {
  const response = { ok: false, mensaje };
  if (errores) {
    response.errores = errores;
  }
  return response;
}

async function asignarActorTransaccional(models, payload) {
  const validation = validateAsignacionPayload(payload);
  if (!validation.valid) {
    const error = new Error(validation.errores.join(", "));
    error.statusCode = 400;
    throw error;
  }

  const asignacion = normalizeAsignacionPayload(payload);
  const { sequelize, Pelicula, Actor, PeliculasActores } = models;

  return sequelize.transaction(async (transaction) => {
    const pelicula = await Pelicula.findByPk(asignacion.pelicula_id, { transaction });
    if (!pelicula) {
      const error = new Error("Pelicula no encontrada");
      error.statusCode = 404;
      throw error;
    }

    const actor = await Actor.findByPk(asignacion.actor_id, { transaction });
    if (!actor) {
      const error = new Error("Actor no encontrado");
      error.statusCode = 404;
      throw error;
    }

    const [vinculo, creado] = await PeliculasActores.findOrCreate({
      where: {
        pelicula_id: asignacion.pelicula_id,
        actor_id: asignacion.actor_id,
      },
      defaults: {
        pelicula_id: asignacion.pelicula_id,
        actor_id: asignacion.actor_id,
      },
      transaction,
    });

    return {
      creado,
      vinculo,
      pelicula,
      actor,
    };
  });
}

module.exports = {
  asignarActorTransaccional,
  buildErrorResponse,
  buildOkResponse,
  normalizeActorPayload,
  normalizeAsignacionPayload,
  normalizePeliculaPayload,
  validateActorPayload,
  validateAsignacionPayload,
  validatePeliculaPayload,
};
