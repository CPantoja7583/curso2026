-- ============================================================
-- SCRIPT DE PRÁCTICA: Base de datos de Clientes
-- Para ejecutar en pgAdmin paso a paso
-- ============================================================

CREATE SCHEMA practica_clientes;
SET search_path TO practica_clientes;


-- IMPORTANTE: Después de crear la base, conectarse a "practica_clientes"
-- en pgAdmin antes de ejecutar los siguientes pasos.


-- ============================================================
-- PASO 2: Crear la tabla clientes
-- ============================================================

CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    edad INT,
    ciudad VARCHAR(50),
    pais VARCHAR(50),
    saldo DECIMAL(10, 2) DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    fecha_registro DATE DEFAULT CURRENT_DATE
);


-- ============================================================
-- PASO 3: Insertar datos de ejemplo
-- ============================================================

INSERT INTO clientes (nombre, apellido, email, edad, ciudad, pais, saldo, activo, fecha_registro) VALUES
('Juan',    'Pérez',    'juan.perez@mail.com',    28, 'Santiago',     'Chile',     150000.50, TRUE,  '2024-01-15'),
('María',   'González', 'maria.g@mail.com',       34, 'Valparaíso',   'Chile',     250000.00, TRUE,  '2024-02-20'),
('Carlos',  'Rodríguez','carlos.r@mail.com',      45, 'Buenos Aires', 'Argentina',  50000.00, TRUE,  '2024-03-10'),
('Ana',     'Martínez', 'ana.m@mail.com',         22, 'Lima',         'Perú',       75000.00, FALSE, '2024-04-05'),
('Pedro',   'López',    'pedro.l@mail.com',       52, 'Santiago',     'Chile',     500000.00, TRUE,  '2023-11-12'),
('Laura',   'Sánchez',  'laura.s@mail.com',       29, 'Bogotá',       'Colombia',  120000.75, TRUE,  '2024-05-18'),
('Diego',   'Fernández','diego.f@mail.com',       38, 'Mendoza',      'Argentina', 180000.00, TRUE,  '2024-06-01'),
('Sofía',   'Ramírez',  'sofia.r@mail.com',       26, 'Concepción',   'Chile',      30000.00, FALSE, '2024-07-22'),
('Miguel',  'Torres',   'miguel.t@mail.com',      41, 'Medellín',     'Colombia',  220000.00, TRUE,  '2024-08-30'),
('Valeria', 'Díaz',     'valeria.d@mail.com',     31, 'Santiago',     'Chile',      95000.50, TRUE,  '2024-09-14'),
('Roberto', 'Morales',  'roberto.m@mail.com',     60, 'Quito',        'Ecuador',   310000.00, TRUE,  '2023-12-05'),
('Camila',  'Herrera',  'camila.h@mail.com',      24, 'Lima',         'Perú',        0.00,    TRUE,  '2024-10-01');
