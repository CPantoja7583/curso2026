CREATE TABLE IF NOT EXISTS finanzas_personales (
  id SERIAL PRIMARY KEY,
  descripcion VARCHAR(120) NOT NULL,
  categoria VARCHAR(60) NOT NULL,
  monto INTEGER NOT NULL,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE
);

INSERT INTO finanzas_personales (descripcion, categoria, monto, fecha)
SELECT *
FROM (VALUES
  ('Sueldo mensual', 'Ingreso', 850000, DATE '2026-05-01'),
  ('Arriendo', 'Gasto fijo', 320000, DATE '2026-05-05'),
  ('Supermercado', 'Alimentacion', 95000, DATE '2026-05-10'),
  ('Transporte', 'Movilidad', 42000, DATE '2026-05-12')
) AS seed(descripcion, categoria, monto, fecha)
WHERE NOT EXISTS (SELECT 1 FROM finanzas_personales);

CREATE TABLE IF NOT EXISTS clientes (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  email VARCHAR(140) NOT NULL,
  telefono VARCHAR(30) NOT NULL
);

INSERT INTO clientes (nombre, email, telefono)
SELECT *
FROM (VALUES
  ('Ana Torres', 'ana.torres@example.com', '+56911111111'),
  ('Carlos Rojas', 'carlos.rojas@example.com', '+56922222222'),
  ('Sofia Medina', 'sofia.medina@example.com', '+56933333333')
) AS seed(nombre, email, telefono)
WHERE NOT EXISTS (SELECT 1 FROM clientes);
