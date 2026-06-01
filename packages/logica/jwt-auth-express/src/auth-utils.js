function clean(value) {
  return String(value ?? "").trim();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeCredentials(payload = {}) {
  return {
    email: clean(payload.email).toLowerCase(),
    password: clean(payload.password),
  };
}

function validateCredentials(payload = {}) {
  const credentials = normalizeCredentials(payload);
  const errores = [];

  if (!credentials.email) {
    errores.push("email es requerido");
  } else if (!isValidEmail(credentials.email)) {
    errores.push("email debe tener un formato valido");
  }

  if (!credentials.password) {
    errores.push("password es requerido");
  }

  return {
    valid: errores.length === 0,
    errores,
  };
}

function extractBearerToken(header) {
  const [type, token] = String(header || "").split(" ");
  return type === "Bearer" && token ? token : null;
}

function buildOkResponse(data, extra = {}) {
  return { ok: true, ...extra, ...(data !== undefined ? { data } : {}) };
}

function buildErrorResponse(mensaje, errores) {
  const response = { ok: false, mensaje };
  if (errores) {
    response.errores = errores;
  }
  return response;
}

module.exports = {
  buildErrorResponse,
  buildOkResponse,
  extractBearerToken,
  normalizeCredentials,
  validateCredentials,
};
