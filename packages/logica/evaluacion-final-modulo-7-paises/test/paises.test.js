const test = require("node:test");
const assert = require("node:assert/strict");

const {
  buildCursorResponse,
  createPais,
  deletePais,
  normalizePaisPayload,
  validatePaisPayload,
} = require("../src/paises-service");

test("normalizePaisPayload recorta textos y convierte numeros", () => {
  assert.deepEqual(
    normalizePaisPayload({
      nombre: " Chile ",
      continente: " America ",
      poblacion: "19107216",
      pib_2019: "16280",
      pib_2020: "15850",
    }),
    {
      nombre: "Chile",
      continente: "America",
      poblacion: 19107216,
      pib_2019: 16280,
      pib_2020: 15850,
    },
  );
});

test("validatePaisPayload exige campos y numeros enteros", () => {
  assert.deepEqual(
    validatePaisPayload({
      nombre: "",
      continente: "",
      poblacion: "x",
      pib_2019: "",
      pib_2020: "-1",
    }),
    {
      valid: false,
      errores: [
        "nombre es obligatorio",
        "continente es obligatorio",
        "poblacion debe ser un entero mayor o igual a 0",
        "pib_2019 debe ser un entero mayor o igual a 0",
        "pib_2020 debe ser un entero mayor o igual a 0",
      ],
    },
  );
});

test("buildCursorResponse informa cursor siguiente cuando hay mas registros", () => {
  assert.deepEqual(
    buildCursorResponse([{ nombre: "Chile" }], { cursorId: "abc", exhausted: false, limit: 5 }),
    {
      ok: true,
      data: [{ nombre: "Chile" }],
      cursor: {
        id: "abc",
        hasNext: true,
        limit: 5,
      },
    },
  );
});

test("createPais hace commit cuando insert a paises, paises_pib y paises_data_web resulta bien", async () => {
  const fake = createFakeClient();
  const result = await createPais(fake.pool, {
    nombre: "Peru",
    continente: "America",
    poblacion: 34000000,
    pib_2019: 7000,
    pib_2020: 6500,
  });

  assert.equal(result.nombre, "Peru");
  assert.deepEqual(fake.client.commands, ["BEGIN", "COMMIT", "RELEASE"]);
  assert.equal(fake.client.queries.length, 3);
});

test("deletePais hace rollback si falla la insercion en paises_data_web", async () => {
  const fake = createFakeClient({ failOnActionInsert: true });

  await assert.rejects(
    () => deletePais(fake.pool, "Luxemburgo"),
    /accion/,
  );

  assert.deepEqual(fake.client.commands, ["BEGIN", "ROLLBACK", "RELEASE"]);
});

function createFakeClient(options = {}) {
  const client = {
    commands: [],
    queries: [],
    async query(input) {
      if (typeof input === "string") {
        this.commands.push(input);
        return { rows: [], rowCount: 0 };
      }

      this.queries.push(input);

      if (input.text.startsWith("DELETE FROM paises_pib")) {
        return { rows: [], rowCount: 1 };
      }

      if (input.text.startsWith("DELETE FROM paises ")) {
        return { rows: [{ nombre: input.values[0] }], rowCount: 1 };
      }

      if (input.text.startsWith("INSERT INTO paises_data_web") && options.failOnActionInsert) {
        throw new Error("Error al registrar accion");
      }

      if (input.text.startsWith("INSERT INTO paises ")) {
        return { rows: [{ nombre: input.values[0], continente: input.values[1], poblacion: input.values[2] }], rowCount: 1 };
      }

      if (input.text.startsWith("INSERT INTO paises_pib")) {
        return { rows: [], rowCount: 1 };
      }

      if (input.text.startsWith("INSERT INTO paises_data_web")) {
        return { rows: [], rowCount: 1 };
      }

      throw new Error(`Unexpected query: ${input.text}`);
    },
    release() {
      this.commands.push("RELEASE");
    },
  };

  return {
    client,
    pool: {
      async connect() {
        return client;
      },
    },
  };
}
