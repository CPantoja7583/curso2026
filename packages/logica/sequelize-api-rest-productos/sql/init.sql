CREATE TABLE IF NOT EXISTS productos_sequelize (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  precio INTEGER NOT NULL CHECK (precio >= 0),
  stock INTEGER NOT NULL CHECK (stock >= 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

INSERT INTO productos_sequelize (nombre, precio, stock)
SELECT 'Teclado mecanico', 35000, 8
WHERE NOT EXISTS (SELECT 1 FROM productos_sequelize WHERE nombre = 'Teclado mecanico');

INSERT INTO productos_sequelize (nombre, precio, stock)
SELECT 'Mouse optico', 12000, 15
WHERE NOT EXISTS (SELECT 1 FROM productos_sequelize WHERE nombre = 'Mouse optico');

INSERT INTO productos_sequelize (nombre, precio, stock)
SELECT 'Monitor 24 pulgadas', 140000, 4
WHERE NOT EXISTS (SELECT 1 FROM productos_sequelize WHERE nombre = 'Monitor 24 pulgadas');
