CREATE TABLE IF NOT EXISTS clientes (
  rut VARCHAR(20) PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL
);

CREATE TABLE IF NOT EXISTS direcciones (
  id_direccion SERIAL PRIMARY KEY,
  rut_cliente VARCHAR(20) NOT NULL REFERENCES clientes(rut) ON DELETE CASCADE,
  direccion VARCHAR(160) NOT NULL,
  comuna VARCHAR(80) NOT NULL,
  ciudad VARCHAR(80) NOT NULL
);

CREATE TABLE IF NOT EXISTS productos (
  id_producto SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  precio INTEGER NOT NULL CHECK (precio >= 0),
  stock INTEGER NOT NULL CHECK (stock >= 0)
);

CREATE TABLE IF NOT EXISTS ordenes (
  id_orden SERIAL PRIMARY KEY,
  rut_cliente VARCHAR(20) NOT NULL REFERENCES clientes(rut),
  total INTEGER NOT NULL CHECK (total >= 0),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS despachos (
  id_despacho SERIAL PRIMARY KEY,
  id_orden INTEGER NOT NULL REFERENCES ordenes(id_orden) ON DELETE CASCADE,
  id_direccion INTEGER NOT NULL REFERENCES direcciones(id_direccion),
  estado VARCHAR(40) NOT NULL DEFAULT 'pendiente',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lista_productos (
  id_orden INTEGER NOT NULL REFERENCES ordenes(id_orden) ON DELETE CASCADE,
  id_producto INTEGER NOT NULL REFERENCES productos(id_producto),
  cantidad_producto INTEGER NOT NULL CHECK (cantidad_producto > 0),
  precio_unitario INTEGER NOT NULL CHECK (precio_unitario >= 0),
  PRIMARY KEY (id_orden, id_producto)
);

INSERT INTO clientes (rut, nombre, email)
VALUES
  ('11.111.111-1', 'Ana Perez', 'ana@example.com'),
  ('22.222.222-2', 'Luis Soto', 'luis@example.com')
ON CONFLICT (rut) DO NOTHING;

INSERT INTO direcciones (rut_cliente, direccion, comuna, ciudad)
SELECT '11.111.111-1', 'Av. Siempre Viva 742', 'Providencia', 'Santiago'
WHERE NOT EXISTS (SELECT 1 FROM direcciones WHERE rut_cliente = '11.111.111-1' AND direccion = 'Av. Siempre Viva 742');

INSERT INTO direcciones (rut_cliente, direccion, comuna, ciudad)
SELECT '11.111.111-1', 'Los Aromos 123', 'Nunoa', 'Santiago'
WHERE NOT EXISTS (SELECT 1 FROM direcciones WHERE rut_cliente = '11.111.111-1' AND direccion = 'Los Aromos 123');

INSERT INTO direcciones (rut_cliente, direccion, comuna, ciudad)
SELECT '22.222.222-2', 'Costanera 456', 'Valparaiso', 'Valparaiso'
WHERE NOT EXISTS (SELECT 1 FROM direcciones WHERE rut_cliente = '22.222.222-2' AND direccion = 'Costanera 456');

INSERT INTO productos (nombre, precio, stock)
SELECT 'Teclado mecanico', 35000, 8
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Teclado mecanico');

INSERT INTO productos (nombre, precio, stock)
SELECT 'Mouse optico', 12000, 15
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Mouse optico');

INSERT INTO productos (nombre, precio, stock)
SELECT 'Monitor 24 pulgadas', 140000, 4
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Monitor 24 pulgadas');

INSERT INTO productos (nombre, precio, stock)
SELECT 'Notebook oficina', 520000, 2
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Notebook oficina');
