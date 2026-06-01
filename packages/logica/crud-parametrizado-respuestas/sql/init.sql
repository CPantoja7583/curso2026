CREATE TABLE IF NOT EXISTS clientes (
  rut VARCHAR(20) PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  edad INT NOT NULL
);

INSERT INTO clientes (rut, nombre, edad)
VALUES
  ('11.111.111-1', 'Ana Perez', 31),
  ('22.222.222-2', 'Luis Soto', 24),
  ('33.333.333-3', 'Camila Rojas', 29),
  ('44.444.444-4', 'Diego Morales', 36)
ON CONFLICT (rut) DO NOTHING;
