const Cursor = require("pg-cursor");

function clean(value) {
  return String(value ?? "").trim();
}

function nonNegativeInteger(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  return Number.isInteger(Number(value)) && Number(value) >= 0 ? Number(value) : null;
}

function normalizePaisPayload(payload = {}) {
  return {
    nombre: clean(payload.nombre),
    continente: clean(payload.continente),
    poblacion: Number(payload.poblacion),
    pib_2019: Number(payload.pib_2019),
    pib_2020: Number(payload.pib_2020),
  };
}

function validatePaisPayload(payload = {}) {
  const pais = normalizePaisPayload(payload);
  const errores = [];

  if (!pais.nombre) {
    errores.push("nombre es obligatorio");
  }

  if (!pais.continente) {
    errores.push("continente es obligatorio");
  }

  if (nonNegativeInteger(payload.poblacion) === null) {
    errores.push("poblacion debe ser un entero mayor o igual a 0");
  }

  if (nonNegativeInteger(payload.pib_2019) === null) {
    errores.push("pib_2019 debe ser un entero mayor o igual a 0");
  }

  if (nonNegativeInteger(payload.pib_2020) === null) {
    errores.push("pib_2020 debe ser un entero mayor o igual a 0");
  }

  return {
    valid: errores.length === 0,
    errores,
  };
}

function buildCursorResponse(rows, { cursorId, exhausted, limit }) {
  return {
    ok: true,
    data: rows,
    cursor: {
      id: exhausted ? null : cursorId,
      hasNext: !exhausted,
      limit,
    },
  };
}

class CursorManager {
  constructor(pool) {
    this.pool = pool;
    this.cursors = new Map();
  }

  async next(limit, cursorId) {
    const normalizedLimit = [5, 10, 20].includes(Number(limit)) ? Number(limit) : 5;
    let state = cursorId ? this.cursors.get(cursorId) : null;

    if (!state) {
      const client = await this.pool.connect();
      const cursor = client.query(
        new Cursor(`
          SELECT p.nombre, p.continente, p.poblacion, pib.pib_2019, pib.pib_2020
          FROM paises p
          JOIN paises_pib pib ON pib.nombre = p.nombre
          ORDER BY p.nombre ASC
        `),
      );
      state = {
        id: cursorId || cryptoRandomId(),
        client,
        cursor,
      };
      this.cursors.set(state.id, state);
    }

    const rows = await readCursor(state.cursor, normalizedLimit);
    const exhausted = rows.length < normalizedLimit;

    if (exhausted) {
      await this.close(state.id);
    }

    return buildCursorResponse(rows, {
      cursorId: state.id,
      exhausted,
      limit: normalizedLimit,
    });
  }

  async close(id) {
    const state = this.cursors.get(id);
    if (!state) {
      return;
    }

    this.cursors.delete(id);
    await new Promise((resolve) => state.cursor.close(resolve));
    state.client.release();
  }
}

function readCursor(cursor, limit) {
  return new Promise((resolve, reject) => {
    cursor.read(limit, (error, rows) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(rows);
    });
  });
}

function cryptoRandomId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function createPais(pool, payload) {
  const validation = validatePaisPayload(payload);
  if (!validation.valid) {
    const error = new Error(validation.errores.join(", "));
    error.statusCode = 400;
    throw error;
  }

  const pais = normalizePaisPayload(payload);
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const paisResult = await client.query({
      text: "INSERT INTO paises (nombre, continente, poblacion) VALUES ($1, $2, $3) RETURNING nombre, continente, poblacion",
      values: [pais.nombre, pais.continente, pais.poblacion],
    });

    await client.query({
      text: "INSERT INTO paises_pib (nombre, pib_2019, pib_2020) VALUES ($1, $2, $3)",
      values: [pais.nombre, pais.pib_2019, pais.pib_2020],
    });

    await client.query({
      text: "INSERT INTO paises_data_web (nombre_pais, accion) VALUES ($1, $2)",
      values: [pais.nombre, 1],
    });

    await client.query("COMMIT");
    return { ...paisResult.rows[0], pib_2019: pais.pib_2019, pib_2020: pais.pib_2020 };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function deletePais(pool, nombre) {
  const cleanName = clean(nombre);
  if (!cleanName) {
    const error = new Error("nombre es obligatorio");
    error.statusCode = 400;
    throw error;
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query({
      text: "DELETE FROM paises_pib WHERE nombre = $1",
      values: [cleanName],
    });

    const deleted = await client.query({
      text: "DELETE FROM paises WHERE nombre = $1 RETURNING nombre",
      values: [cleanName],
    });

    if (deleted.rowCount === 0) {
      const error = new Error("Pais no encontrado");
      error.statusCode = 404;
      throw error;
    }

    await client.query({
      text: "INSERT INTO paises_data_web (nombre_pais, accion) VALUES ($1, $2)",
      values: [cleanName, 0],
    });

    await client.query("COMMIT");
    return { nombre: cleanName };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  CursorManager,
  buildCursorResponse,
  createPais,
  deletePais,
  normalizePaisPayload,
  validatePaisPayload,
};
