-- Ejercicio Practico
-- SQL: Llaves, DDL/DML y Consultas de Agregacion
-- Ajustado al PDF "Ejercicio práctico SQL LLAVES.pdf"

-- =========================================================
-- 1. Crear tablas y llaves
-- =========================================================

DROP TABLE IF EXISTS Cuentas;
DROP TABLE IF EXISTS Clientes;

CREATE TABLE Clientes (
    id_cliente INT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    edad INT CHECK (edad BETWEEN 18 AND 85) NOT NULL
);

CREATE TABLE Cuentas (
    id_cuenta INT PRIMARY KEY,
    id_cliente INT NOT NULL,
    saldo NUMERIC(10, 2) CHECK (saldo BETWEEN -5000.00 AND 100000.00) NOT NULL,
    CONSTRAINT fk_cliente
        FOREIGN KEY (id_cliente)
        REFERENCES Clientes(id_cliente)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- Secuencias del ejemplo del PDF
CREATE SEQUENCE seq_cliente_id START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_cuenta_id START WITH 1 INCREMENT BY 1;

-- =========================================================
-- 2. Insertar 5 clientes y 15 cuentas
-- =========================================================

INSERT INTO Clientes (id_cliente, nombre, edad) VALUES (1, 'Ana García', 78);
INSERT INTO Clientes (id_cliente, nombre, edad) VALUES (2, 'Luis Pérez', 25);
INSERT INTO Clientes (id_cliente, nombre, edad) VALUES (3, 'Maria Soto', 40);
INSERT INTO Clientes (id_cliente, nombre, edad) VALUES (4, 'Carlos Ruiz', 80);
INSERT INTO Clientes (id_cliente, nombre, edad) VALUES (5, 'Elena Torres', 32);

INSERT INTO Cuentas (id_cuenta, id_cliente, saldo) VALUES (101, 1, 50000.00);
INSERT INTO Cuentas (id_cuenta, id_cliente, saldo) VALUES (102, 1, -1200.50);
INSERT INTO Cuentas (id_cuenta, id_cliente, saldo) VALUES (103, 1, 100.00);

INSERT INTO Cuentas (id_cuenta, id_cliente, saldo) VALUES (201, 2, 850.75);
INSERT INTO Cuentas (id_cuenta, id_cliente, saldo) VALUES (202, 2, -500.00);

INSERT INTO Cuentas (id_cuenta, id_cliente, saldo) VALUES (301, 3, 15000.00);
INSERT INTO Cuentas (id_cuenta, id_cliente, saldo) VALUES (302, 3, 200.00);
INSERT INTO Cuentas (id_cuenta, id_cliente, saldo) VALUES (303, 3, -4999.99);
INSERT INTO Cuentas (id_cuenta, id_cliente, saldo) VALUES (304, 3, 75000.00);

INSERT INTO Cuentas (id_cuenta, id_cliente, saldo) VALUES (401, 4, 1000.00);
INSERT INTO Cuentas (id_cuenta, id_cliente, saldo) VALUES (402, 4, 2000.00);
INSERT INTO Cuentas (id_cuenta, id_cliente, saldo) VALUES (403, 4, 3000.00);

INSERT INTO Cuentas (id_cuenta, id_cliente, saldo) VALUES (501, 5, 50.00);
INSERT INTO Cuentas (id_cuenta, id_cliente, saldo) VALUES (502, 5, 120.00);
INSERT INTO Cuentas (id_cuenta, id_cliente, saldo) VALUES (503, 5, 900.00);

-- =========================================================
-- DML del PDF
-- =========================================================

UPDATE Cuentas
SET saldo = saldo + 500.00
WHERE id_cuenta = 402;

DELETE FROM Cuentas
WHERE id_cuenta = 503;

-- =========================================================
-- 3. Listar el saldo de cada cuenta del cliente con más años de edad.
-- =========================================================

SELECT c.nombre, cu.id_cuenta, cu.saldo
FROM Clientes c
INNER JOIN Cuentas cu ON cu.id_cliente = c.id_cliente
WHERE c.edad = (SELECT MAX(edad) FROM Clientes);

-- =========================================================
-- 4. Listar el promedio de edad de los clientes con saldo negativo.
-- =========================================================

SELECT AVG(DISTINCT c.edad) AS promedio_edad
FROM Clientes c
INNER JOIN Cuentas cu ON cu.id_cliente = c.id_cliente
WHERE cu.saldo < 0;

-- =========================================================
-- 5. Listar el nombre y cantidad de cuentas de quienes tienen más de una.
-- =========================================================

SELECT c.nombre, COUNT(cu.id_cuenta) AS cantidad_cuentas
FROM Clientes c
INNER JOIN Cuentas cu ON cu.id_cliente = c.id_cliente
GROUP BY c.id_cliente, c.nombre
HAVING COUNT(cu.id_cuenta) > 1;

-- =========================================================
-- 6. Listar el saldo combinado (suma) de cada cliente con más de una cuenta.
-- =========================================================

SELECT c.nombre, SUM(cu.saldo) AS saldo_combinado
FROM Clientes c
INNER JOIN Cuentas cu ON cu.id_cliente = c.id_cliente
GROUP BY c.id_cliente, c.nombre
HAVING COUNT(cu.id_cuenta) > 1;

-- =========================================================
-- 7. Listar todos los clientes y su saldo combinado
-- de aquellos clientes que tengan al menos una cuenta con saldo negativo.
-- =========================================================

SELECT c.nombre, SUM(cu.saldo) AS saldo_combinado
FROM Clientes c
INNER JOIN Cuentas cu ON cu.id_cliente = c.id_cliente
WHERE c.id_cliente IN (
    SELECT DISTINCT id_cliente
    FROM Cuentas
    WHERE saldo < 0
)
GROUP BY c.id_cliente, c.nombre;
