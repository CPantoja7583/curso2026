const test = require("node:test");
const assert = require("node:assert/strict");

const {
  StockError,
  buildFilterQuery,
  createOrdenTransaccional,
  validateOrdenPayload,
} = require("../order-service");

test("buildFilterQuery lista productos", () => {
  assert.deepEqual(buildFilterQuery({ filtro: "productos" }), {
    text: "SELECT id_producto, nombre, precio, stock FROM productos ORDER BY id_producto ASC",
    values: [],
  });
});

test("buildFilterQuery busca producto por id", () => {
  assert.deepEqual(buildFilterQuery({ filtro: "productos", id: "2" }), {
    text: "SELECT id_producto, nombre, precio, stock FROM productos WHERE id_producto = $1",
    values: [2],
  });
});

test("buildFilterQuery lista productos de una orden", () => {
  assert.deepEqual(buildFilterQuery({ filtro: "productos", orden: "7" }), {
    text: [
      "SELECT lp.id_orden, lp.id_producto, p.nombre, lp.cantidad_producto, lp.precio_unitario",
      "FROM lista_productos lp",
      "JOIN productos p ON p.id_producto = lp.id_producto",
      "WHERE lp.id_orden = $1",
      "ORDER BY lp.id_producto ASC",
    ].join(" "),
    values: [7],
  });
});

test("buildFilterQuery lista ordenes por rut", () => {
  assert.deepEqual(buildFilterQuery({ filtro: "ordenes", rut: "11.111.111-1" }), {
    text: [
      "SELECT o.id_orden, o.rut_cliente, c.nombre AS cliente, o.total, o.created_at",
      "FROM ordenes o",
      "JOIN clientes c ON c.rut = o.rut_cliente",
      "WHERE o.rut_cliente = $1",
      "ORDER BY o.id_orden DESC",
    ].join(" "),
    values: ["11.111.111-1"],
  });
});

test("validateOrdenPayload exige rut, direccion y productos validos", () => {
  assert.deepEqual(validateOrdenPayload({ rut: "", id_direccion: "", productos: [] }), {
    valid: false,
    errores: [
      "rut es obligatorio",
      "id_direccion es obligatorio",
      "debe incluir al menos un producto",
    ],
  });
});

test("createOrdenTransaccional hace COMMIT cuando hay stock suficiente", async () => {
  const fake = createFakePool({
    productsById: {
      1: { id_producto: 1, nombre: "Teclado", precio: 15000, stock: 5 },
    },
    ordenId: 10,
    despachoId: 20,
  });

  const result = await createOrdenTransaccional(fake.pool, {
    rut: "11.111.111-1",
    id_direccion: 1,
    productos: [{ id_producto: 1, cantidad_producto: 2 }],
  });

  assert.equal(result.id_orden, 10);
  assert.equal(result.total, 30000);
  assert.deepEqual(fake.client.commands, ["BEGIN", "COMMIT", "RELEASE"]);
  assert.equal(fake.client.updatedStock[1], 3);
});

test("createOrdenTransaccional hace ROLLBACK si falta stock", async () => {
  const fake = createFakePool({
    productsById: {
      1: { id_producto: 1, nombre: "Teclado", precio: 15000, stock: 1 },
    },
    ordenId: 10,
    despachoId: 20,
  });

  await assert.rejects(
    () =>
      createOrdenTransaccional(fake.pool, {
        rut: "11.111.111-1",
        id_direccion: 1,
        productos: [{ id_producto: 1, cantidad_producto: 2 }],
      }),
    StockError,
  );

  assert.deepEqual(fake.client.commands, ["BEGIN", "ROLLBACK", "RELEASE"]);
  assert.deepEqual(fake.client.updatedStock, {});
});

function createFakePool({ productsById, ordenId, despachoId }) {
  const client = {
    commands: [],
    updatedStock: {},
    async query(queryObject) {
      const text = typeof queryObject === "string" ? queryObject : queryObject.text;
      const values = typeof queryObject === "string" ? [] : queryObject.values;

      if (text === "BEGIN" || text === "COMMIT" || text === "ROLLBACK") {
        this.commands.push(text);
        return { rows: [], rowCount: 0 };
      }

      if (text.includes("FROM productos WHERE id_producto = $1 FOR UPDATE")) {
        const product = productsById[values[0]];
        return { rows: product ? [product] : [], rowCount: product ? 1 : 0 };
      }

      if (text.startsWith("INSERT INTO ordenes")) {
        return { rows: [{ id_orden: ordenId, rut_cliente: values[0], total: values[1] }], rowCount: 1 };
      }

      if (text.startsWith("INSERT INTO despachos")) {
        return { rows: [{ id_despacho: despachoId, id_orden: values[0], id_direccion: values[1] }], rowCount: 1 };
      }

      if (text.startsWith("INSERT INTO lista_productos")) {
        return { rows: [], rowCount: 1 };
      }

      if (text.startsWith("UPDATE productos SET stock")) {
        this.updatedStock[values[1]] = values[0];
        return { rows: [], rowCount: 1 };
      }

      throw new Error(`Unexpected query: ${text}`);
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
