-- ============================================
-- Tabla de cuentas para el ejercicio de transferencias
-- ============================================

DROP TABLE IF EXISTS cuentas;

CREATE TABLE cuentas (
  id      SERIAL PRIMARY KEY,
  titular VARCHAR(100) NOT NULL,
  saldo   INTEGER NOT NULL
);

INSERT INTO cuentas (titular, saldo) VALUES
  ('Maria', 100000),
  ('Juan',  50000);

SELECT * FROM cuentas;
