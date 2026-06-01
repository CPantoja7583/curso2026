function cleanText(value) {
  return String(value ?? "").trim();
}

function isNumericAge(value) {
  if (value === "" || value === null || value === undefined) {
    return false;
  }

  const age = Number(value);
  return Number.isInteger(age) && age >= 0;
}

function normalizeClientePayload(payload = {}) {
  const normalized = {
    rut: cleanText(payload.rut),
    nombre: cleanText(payload.nombre),
  };

  if (payload.edad !== undefined) {
    normalized.edad = Number(payload.edad);
  }

  return normalized;
}

function validateClientePayload(payload = {}, options = {}) {
  const requireRut = options.requireRut !== false;
  const requireEdad = options.requireEdad !== false;
  const normalized = normalizeClientePayload(payload);
  const errors = [];

  if (requireRut && !normalized.rut) {
    errors.push("rut es obligatorio");
  }

  if (!normalized.nombre) {
    errors.push("nombre es obligatorio");
  }

  if (requireEdad && !isNumericAge(payload.edad)) {
    errors.push("edad debe ser numerica");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function buildSelectClientesQuery() {
  return {
    text: "SELECT rut, nombre, edad FROM clientes ORDER BY nombre ASC, rut ASC",
    values: [],
  };
}

function buildCreateClienteQuery(payload) {
  const cliente = normalizeClientePayload(payload);

  return {
    text: "INSERT INTO clientes (rut, nombre, edad) VALUES ($1, $2, $3) RETURNING rut, nombre, edad",
    values: [cliente.rut, cliente.nombre, cliente.edad],
  };
}

function buildUpdateClienteQuery(rut, payload) {
  const cliente = normalizeClientePayload(payload);

  return {
    text: "UPDATE clientes SET nombre = $1 WHERE rut = $2 RETURNING rut, nombre, edad",
    values: [cliente.nombre, cleanText(rut)],
  };
}

function buildDeleteClienteQuery(rut) {
  return {
    text: "DELETE FROM clientes WHERE rut = $1 RETURNING rut, nombre, edad",
    values: [cleanText(rut)],
  };
}

module.exports = {
  buildCreateClienteQuery,
  buildDeleteClienteQuery,
  buildSelectClientesQuery,
  buildUpdateClienteQuery,
  normalizeClientePayload,
  validateClientePayload,
};
