CREATE DATABASE clientes_db;

-- Conectate a clientes_db antes de ejecutar lo siguiente si lo usas manualmente:
-- \c clientes_db

CREATE TABLE IF NOT EXISTS clientes (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE
);
