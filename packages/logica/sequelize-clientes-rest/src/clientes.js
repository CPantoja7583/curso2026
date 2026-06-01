function clean(value) {
  return String(value ?? "").trim();
}

function normalizeClientePayload(payload = {}) {
  return {
    nombre: clean(payload.nombre),
    email: clean(payload.email).toLowerCase(),
  };
}

function hasBasicEmailFormat(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateClientePayload(payload = {}) {
  const cliente = normalizeClientePayload(payload);
  const errores = [];

  if (!cliente.nombre) {
    errores.push("nombre es obligatorio");
  }

  if (!cliente.email) {
    errores.push("email es obligatorio");
  } else if (!hasBasicEmailFormat(cliente.email)) {
    errores.push("email debe tener un formato valido");
  }

  return {
    valid: errores.length === 0,
    errores,
  };
}

function buildClienteResponse(data, extra = {}) {
  return { ok: true, data, ...extra };
}

function buildErrorResponse(mensaje, errores) {
  const response = { ok: false, mensaje };
  if (errores) {
    response.errores = errores;
  }
  return response;
}

module.exports = {
  buildClienteResponse,
  buildErrorResponse,
  normalizeClientePayload,
  validateClientePayload,
};
