function cleanText(value) {
  return String(value || "").trim();
}

function parseAge(value, fieldName = "edad") {
  const age = Number(value);

  if (!Number.isInteger(age) || age < 0) {
    throw new Error(`El campo ${fieldName} debe ser numerico.`);
  }

  return age;
}

function buildSelectClientesQuery(filters) {
  const rut = cleanText(filters.rut);
  const nombre = cleanText(filters.nombre);
  const edad = cleanText(filters.edad);
  const edadMin = cleanText(filters.edadMin);
  const edadMax = cleanText(filters.edadMax);

  if (rut) {
    return {
      text: "SELECT rut, nombre, edad FROM clientes WHERE rut = $1 ORDER BY nombre",
      values: [rut],
      mode: "rut"
    };
  }

  if (edad) {
    return {
      text: "SELECT rut, nombre, edad FROM clientes WHERE edad = $1 ORDER BY nombre",
      values: [parseAge(edad)],
      mode: "edad"
    };
  }

  if (edadMin || edadMax) {
    if (!edadMin || !edadMax) {
      throw new Error("Debes enviar edadMin y edadMax para filtrar por rango.");
    }

    return {
      text: "SELECT rut, nombre, edad FROM clientes WHERE edad BETWEEN $1 AND $2 ORDER BY edad, nombre",
      values: [parseAge(edadMin, "edadMin"), parseAge(edadMax, "edadMax")],
      mode: "rango"
    };
  }

  if (nombre) {
    return {
      text: "SELECT rut, nombre, edad FROM clientes WHERE nombre ILIKE $1 ORDER BY nombre",
      values: [`${nombre}%`],
      mode: "nombre"
    };
  }

  return {
    text: "SELECT rut, nombre, edad FROM clientes ORDER BY nombre",
    values: [],
    mode: "all"
  };
}

function buildDeleteClientesQuery(filters) {
  const rut = cleanText(filters.rut);
  const edad = cleanText(filters.edad);
  const edadMin = cleanText(filters.edadMin);
  const edadMax = cleanText(filters.edadMax);

  if (rut) {
    return {
      text: "DELETE FROM clientes WHERE rut = $1 RETURNING rut, nombre, edad",
      values: [rut],
      mode: "rut"
    };
  }

  if (edad) {
    return {
      text: "DELETE FROM clientes WHERE edad = $1 RETURNING rut, nombre, edad",
      values: [parseAge(edad)],
      mode: "edad"
    };
  }

  if (edadMin || edadMax) {
    if (!edadMin || !edadMax) {
      throw new Error("Debes enviar edadMin y edadMax para eliminar por rango.");
    }

    return {
      text: "DELETE FROM clientes WHERE edad BETWEEN $1 AND $2 RETURNING rut, nombre, edad",
      values: [parseAge(edadMin, "edadMin"), parseAge(edadMax, "edadMax")],
      mode: "rango"
    };
  }

  throw new Error("Debes indicar rut, edad o rango de edad para eliminar.");
}

function buildUpdateClienteQuery(rut, payload) {
  const cleanRut = cleanText(rut);
  const nombre = cleanText(payload.nombre);

  if (!cleanRut) {
    throw new Error("Debes indicar el rut del cliente.");
  }

  if (!nombre) {
    throw new Error("Solo se permite modificar el nombre y no puede estar vacio.");
  }

  return {
    text: "UPDATE clientes SET nombre = $1 WHERE rut = $2 RETURNING rut, nombre, edad",
    values: [nombre, cleanRut]
  };
}

function validateClientePayload(payload) {
  if (!payload || !cleanText(payload.rut)) {
    return { valid: false, error: "Debes enviar rut." };
  }

  if (!cleanText(payload.nombre)) {
    return { valid: false, error: "Debes enviar nombre." };
  }

  try {
    parseAge(payload.edad);
  } catch (error) {
    return { valid: false, error: error.message };
  }

  return { valid: true };
}

function normalizeClientePayload(payload) {
  return {
    rut: cleanText(payload.rut),
    nombre: cleanText(payload.nombre),
    edad: parseAge(payload.edad)
  };
}

module.exports = {
  buildDeleteClientesQuery,
  buildSelectClientesQuery,
  buildUpdateClienteQuery,
  normalizeClientePayload,
  validateClientePayload
};
