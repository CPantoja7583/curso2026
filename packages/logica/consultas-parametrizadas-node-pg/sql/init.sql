CREATE TABLE IF NOT EXISTS clientes (
  rut VARCHAR(15) PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  edad INTEGER NOT NULL
);

INSERT INTO clientes (rut, nombre, edad)
SELECT *
FROM (VALUES
  ('11111111-1', 'Ana Torres', 31),
  ('22222222-2', 'Bruno Diaz', 44),
  ('33333333-3', 'Camila Rojas', 31),
  ('44444444-4', 'Daniela Soto', 27),
  ('55555555-5', 'Esteban Mena', 52)
) AS seed(rut, nombre, edad)
WHERE NOT EXISTS (SELECT 1 FROM clientes);
