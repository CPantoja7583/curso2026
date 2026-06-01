const test = require("node:test");
const assert = require("node:assert/strict");

const {
  asignarActorTransaccional,
  buildErrorResponse,
  buildOkResponse,
  normalizeActorPayload,
  normalizeAsignacionPayload,
  normalizePeliculaPayload,
  validateActorPayload,
  validateAsignacionPayload,
  validatePeliculaPayload,
} = require("../src/catalogo");

test("normalizePeliculaPayload recorta titulo y convierte anio", () => {
  assert.deepEqual(normalizePeliculaPayload({ titulo: " Matrix ", anio: "1999" }), {
    titulo: "Matrix",
    anio: 1999,
  });
});

test("validatePeliculaPayload exige titulo y anio entero", () => {
  assert.deepEqual(validatePeliculaPayload({ titulo: "", anio: "abc" }), {
    valid: false,
    errores: ["titulo es obligatorio", "anio debe ser un entero valido"],
  });
});

test("normalizeActorPayload recorta nombre y fecha", () => {
  assert.deepEqual(normalizeActorPayload({ nombre: " Keanu Reeves ", fecha_nacimiento: " 1964-09-02 " }), {
    nombre: "Keanu Reeves",
    fecha_nacimiento: "1964-09-02",
  });
});

test("validateActorPayload exige nombre y fecha ISO", () => {
  assert.deepEqual(validateActorPayload({ nombre: "", fecha_nacimiento: "02/09/1964" }), {
    valid: false,
    errores: ["nombre es obligatorio", "fecha_nacimiento debe usar formato YYYY-MM-DD"],
  });
});

test("normalizeAsignacionPayload convierte ids", () => {
  assert.deepEqual(normalizeAsignacionPayload({ pelicula_id: "1", actor_id: "2" }), {
    pelicula_id: 1,
    actor_id: 2,
  });
});

test("validateAsignacionPayload exige ids positivos", () => {
  assert.deepEqual(validateAsignacionPayload({ pelicula_id: "0", actor_id: "x" }), {
    valid: false,
    errores: ["pelicula_id debe ser un entero positivo", "actor_id debe ser un entero positivo"],
  });
});

test("buildOkResponse y buildErrorResponse usan formato coherente", () => {
  assert.deepEqual(buildOkResponse({ id: 1 }, "Creado"), { ok: true, mensaje: "Creado", data: { id: 1 } });
  assert.deepEqual(buildErrorResponse("Datos invalidos", ["titulo es obligatorio"]), {
    ok: false,
    mensaje: "Datos invalidos",
    errores: ["titulo es obligatorio"],
  });
});

test("asignarActorTransaccional crea vinculo dentro de transaction", async () => {
  const calls = [];
  const sequelize = {
    async transaction(callback) {
      calls.push("BEGIN");
      const result = await callback({ id: "tx1" });
      calls.push("COMMIT");
      return result;
    },
  };
  const Pelicula = {
    async findByPk(id, options) {
      calls.push(["pelicula", id, options.transaction.id]);
      return { id, titulo: "Matrix" };
    },
  };
  const Actor = {
    async findByPk(id, options) {
      calls.push(["actor", id, options.transaction.id]);
      return { id, nombre: "Keanu Reeves" };
    },
  };
  const PeliculasActores = {
    async findOrCreate(options) {
      calls.push(["findOrCreate", options.where, options.transaction.id]);
      return [{ pelicula_id: 1, actor_id: 2 }, true];
    },
  };

  const result = await asignarActorTransaccional(
    { sequelize, Pelicula, Actor, PeliculasActores },
    { pelicula_id: 1, actor_id: 2 },
  );

  assert.equal(result.creado, true);
  assert.deepEqual(calls, [
    "BEGIN",
    ["pelicula", 1, "tx1"],
    ["actor", 2, "tx1"],
    ["findOrCreate", { pelicula_id: 1, actor_id: 2 }, "tx1"],
    "COMMIT",
  ]);
});
