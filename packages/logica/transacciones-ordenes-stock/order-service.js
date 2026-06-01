class StockError extends Error {
  constructor(message) {
    super(message);
    this.name = "StockError";
  }
}

function clean(value) {
  return String(value ?? "").trim();
}

function toPositiveInteger(value) {
  const numberValue = Number(value);
  return Number.isInteger(numberValue) && numberValue > 0 ? numberValue : null;
}

function validateOrdenPayload(payload = {}) {
  const errores = [];
  const productos = Array.isArray(payload.productos) ? payload.productos : [];

  if (!clean(payload.rut)) {
    errores.push("rut es obligatorio");
  }

  if (!toPositiveInteger(payload.id_direccion)) {
    errores.push("id_direccion es obligatorio");
  }

  if (productos.length === 0) {
    errores.push("debe incluir al menos un producto");
  }

  productos.forEach((producto, index) => {
    if (!toPositiveInteger(producto.id_producto)) {
      errores.push(`producto ${index + 1}: id_producto invalido`);
    }

    if (!toPositiveInteger(producto.cantidad_producto)) {
      errores.push(`producto ${index + 1}: cantidad_producto invalida`);
    }
  });

  return {
    valid: errores.length === 0,
    errores,
  };
}

function normalizeOrdenPayload(payload = {}) {
  return {
    rut: clean(payload.rut),
    id_direccion: Number(payload.id_direccion),
    productos: (Array.isArray(payload.productos) ? payload.productos : []).map((producto) => ({
      id_producto: Number(producto.id_producto),
      cantidad_producto: Number(producto.cantidad_producto),
    })),
  };
}

function buildFilterQuery(params = {}) {
  const filtro = clean(params.filtro);

  if (filtro === "productos" && params.orden) {
    return {
      text: [
        "SELECT lp.id_orden, lp.id_producto, p.nombre, lp.cantidad_producto, lp.precio_unitario",
        "FROM lista_productos lp",
        "JOIN productos p ON p.id_producto = lp.id_producto",
        "WHERE lp.id_orden = $1",
        "ORDER BY lp.id_producto ASC",
      ].join(" "),
      values: [Number(params.orden)],
    };
  }

  if (filtro === "productos" && params.id) {
    return {
      text: "SELECT id_producto, nombre, precio, stock FROM productos WHERE id_producto = $1",
      values: [Number(params.id)],
    };
  }

  if (filtro === "productos") {
    return {
      text: "SELECT id_producto, nombre, precio, stock FROM productos ORDER BY id_producto ASC",
      values: [],
    };
  }

  if (filtro === "ordenes" && params.rut) {
    return {
      text: [
        "SELECT o.id_orden, o.rut_cliente, c.nombre AS cliente, o.total, o.created_at",
        "FROM ordenes o",
        "JOIN clientes c ON c.rut = o.rut_cliente",
        "WHERE o.rut_cliente = $1",
        "ORDER BY o.id_orden DESC",
      ].join(" "),
      values: [clean(params.rut)],
    };
  }

  if (filtro === "clientes" && params.rut) {
    return {
      text: "SELECT rut, nombre, email FROM clientes WHERE rut = $1",
      values: [clean(params.rut)],
    };
  }

  if (filtro === "clientes") {
    return {
      text: "SELECT rut, nombre, email FROM clientes ORDER BY nombre ASC",
      values: [],
    };
  }

  if (filtro === "direcciones" && params.rut) {
    return {
      text: "SELECT id_direccion, rut_cliente, direccion, comuna, ciudad FROM direcciones WHERE rut_cliente = $1 ORDER BY id_direccion ASC",
      values: [clean(params.rut)],
    };
  }

  if (filtro === "despachos" && params.orden) {
    return {
      text: [
        "SELECT d.id_despacho, d.id_orden, d.id_direccion, di.direccion, di.comuna, di.ciudad, d.estado, d.created_at",
        "FROM despachos d",
        "JOIN direcciones di ON di.id_direccion = d.id_direccion",
        "WHERE d.id_orden = $1",
      ].join(" "),
      values: [Number(params.orden)],
    };
  }

  return null;
}

async function createOrdenTransaccional(pool, payload) {
  const validation = validateOrdenPayload(payload);
  if (!validation.valid) {
    const error = new Error(validation.errores.join(", "));
    error.statusCode = 400;
    throw error;
  }

  const orden = normalizeOrdenPayload(payload);
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const productosConDetalle = [];
    let total = 0;

    for (const item of orden.productos) {
      const productResult = await client.query({
        text: "SELECT id_producto, nombre, precio, stock FROM productos WHERE id_producto = $1 FOR UPDATE",
        values: [item.id_producto],
      });

      if (productResult.rowCount === 0) {
        throw new StockError(`Producto ${item.id_producto} no existe`);
      }

      const producto = productResult.rows[0];
      const nuevoStock = Number(producto.stock) - item.cantidad_producto;

      if (nuevoStock < 0) {
        throw new StockError(`Falta de stock para ${producto.nombre}. Disponible: ${producto.stock}`);
      }

      const precioUnitario = Number(producto.precio);
      total += precioUnitario * item.cantidad_producto;
      productosConDetalle.push({
        ...item,
        nombre: producto.nombre,
        precio_unitario: precioUnitario,
        stock_final: nuevoStock,
      });
    }

    const ordenResult = await client.query({
      text: "INSERT INTO ordenes (rut_cliente, total) VALUES ($1, $2) RETURNING id_orden, rut_cliente, total, created_at",
      values: [orden.rut, total],
    });
    const ordenCreada = ordenResult.rows[0];

    const despachoResult = await client.query({
      text: "INSERT INTO despachos (id_orden, id_direccion, estado) VALUES ($1, $2, $3) RETURNING id_despacho, id_orden, id_direccion, estado, created_at",
      values: [ordenCreada.id_orden, orden.id_direccion, "pendiente"],
    });

    for (const item of productosConDetalle) {
      await client.query({
        text: "INSERT INTO lista_productos (id_orden, id_producto, cantidad_producto, precio_unitario) VALUES ($1, $2, $3, $4)",
        values: [ordenCreada.id_orden, item.id_producto, item.cantidad_producto, item.precio_unitario],
      });

      await client.query({
        text: "UPDATE productos SET stock = $1 WHERE id_producto = $2",
        values: [item.stock_final, item.id_producto],
      });
    }

    await client.query("COMMIT");

    return {
      ...ordenCreada,
      total,
      despacho: despachoResult.rows[0],
      productos: productosConDetalle,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  StockError,
  buildFilterQuery,
  createOrdenTransaccional,
  normalizeOrdenPayload,
  validateOrdenPayload,
};
