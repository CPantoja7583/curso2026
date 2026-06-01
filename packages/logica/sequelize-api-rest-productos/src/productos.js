function clean(value) {
  return String(value ?? "").trim();
}

function normalizeProductoPayload(payload = {}) {
  const normalized = {};

  if (payload.nombre !== undefined) {
    normalized.nombre = clean(payload.nombre);
  }

  if (payload.precio !== undefined) {
    normalized.precio = Number(payload.precio);
  }

  if (payload.stock !== undefined) {
    normalized.stock = Number(payload.stock);
  }

  return normalized;
}

function validateProductoPayload(payload = {}, options = {}) {
  const partial = options.partial === true;
  const normalized = normalizeProductoPayload(payload);
  const errores = [];

  if (!partial || payload.nombre !== undefined) {
    if (!normalized.nombre) {
      errores.push("nombre es obligatorio");
    }
  }

  if (!partial || payload.precio !== undefined) {
    if (!Number.isFinite(normalized.precio) || normalized.precio < 0) {
      errores.push("precio debe ser un numero mayor o igual a 0");
    }
  }

  if (!partial || payload.stock !== undefined) {
    if (!Number.isInteger(normalized.stock) || normalized.stock < 0) {
      errores.push("stock debe ser un entero mayor o igual a 0");
    }
  }

  if (partial && Object.keys(normalized).length === 0) {
    errores.push("debe enviar al menos un campo para actualizar");
  }

  return {
    valid: errores.length === 0,
    errores,
  };
}

function buildProductoResponse(data, extra = {}) {
  return { ok: true, data, ...extra };
}

function buildErrorResponse(mensaje, extra = {}) {
  return { ok: false, mensaje, ...extra };
}

module.exports = {
  buildErrorResponse,
  buildProductoResponse,
  normalizeProductoPayload,
  validateProductoPayload,
};
