function clean(value) {
  return String(value ?? "").trim();
}

function validateEdad(value) {
  if (value === undefined || value === null || clean(value) === "") {
    return { valid: false, value: null, mensaje: "edad es obligatoria" };
  }

  const numberValue = Number(value);
  if (!Number.isInteger(numberValue)) {
    return { valid: false, value: null, mensaje: "edad debe ser numerica" };
  }

  if (numberValue < 0) {
    return { valid: false, value: null, mensaje: "edad debe ser mayor o igual a 0" };
  }

  return { valid: true, value: numberValue };
}

function normalizeCliente(payload = {}) {
  const cliente = {
    rut: clean(payload.rut),
    nombre: clean(payload.nombre),
  };

  if (payload.edad !== undefined) {
    cliente.edad = Number(payload.edad);
  }

  return cliente;
}

function validateCliente(payload = {}, options = {}) {
  const requireRut = options.requireRut !== false;
  const requireEdad = options.requireEdad !== false;
  const cliente = normalizeCliente(payload);
  const errores = [];

  if (requireRut && !cliente.rut) {
    errores.push("rut es obligatorio");
  }

  if (!cliente.nombre) {
    errores.push("nombre es obligatorio");
  }

  if (requireEdad) {
    const edad = validateEdad(payload.edad);
    if (!edad.valid) {
      errores.push(edad.mensaje);
    }
  }

  return {
    valid: errores.length === 0,
    errores,
  };
}

function buildSelectClientesQuery(filters = {}) {
  const rut = clean(filters.rut);
  const edad = clean(filters.edad);
  const nombre = clean(filters.nombre);

  if (rut) {
    return {
      text: "SELECT rut, nombre, edad FROM clientes WHERE rut = $1 ORDER BY nombre ASC, rut ASC",
      values: [rut],
    };
  }

  if (edad) {
    return {
      text: "SELECT rut, nombre, edad FROM clientes WHERE edad = $1 ORDER BY nombre ASC, rut ASC",
      values: [Number(edad)],
    };
  }

  if (nombre) {
    return {
      text: "SELECT rut, nombre, edad FROM clientes WHERE nombre ILIKE $1 ORDER BY nombre ASC, rut ASC",
      values: [`${nombre}%`],
    };
  }

  return {
    text: "SELECT rut, nombre, edad FROM clientes ORDER BY nombre ASC, rut ASC",
    values: [],
  };
}

function buildCreateClienteQuery(payload) {
  const cliente = normalizeCliente(payload);

  return {
    text: "INSERT INTO clientes (rut, nombre, edad) VALUES ($1, $2, $3) RETURNING rut, nombre, edad",
    values: [cliente.rut, cliente.nombre, cliente.edad],
  };
}

function buildUpdateNombreQuery(rut, payload) {
  const cliente = normalizeCliente(payload);

  return {
    text: "UPDATE clientes SET nombre = $1 WHERE rut = $2 RETURNING rut, nombre, edad",
    values: [cliente.nombre, clean(rut)],
  };
}

function buildDeleteByRutQuery(rut) {
  return {
    text: "DELETE FROM clientes WHERE rut = $1 RETURNING rut, nombre, edad",
    values: [clean(rut)],
  };
}

function buildDeleteCandidateQuery(filters = {}) {
  return buildSelectClientesQuery(filters);
}

function successResponse(payload = {}) {
  return { ok: true, ...payload };
}

function failureResponse(mensaje, extra = {}) {
  return { ok: false, mensaje, ...extra };
}

module.exports = {
  buildCreateClienteQuery,
  buildDeleteByRutQuery,
  buildDeleteCandidateQuery,
  buildSelectClientesQuery,
  buildUpdateNombreQuery,
  failureResponse,
  normalizeCliente,
  successResponse,
  validateCliente,
  validateEdad,
};
