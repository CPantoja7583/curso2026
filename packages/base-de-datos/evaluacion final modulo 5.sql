-- Evaluacion final modulo 5
-- Basado en:
-- 1. Evaluación final módulo 5.pdf
-- 2. complemento evaluacion módulo 5.sql

-- =========================================================
-- PARTE 1: JOIN
-- =========================================================

-- 1. Actores que participaron en ambas teleseries, sueldo en cada una
-- y suma de ambos sueldos, ordenado por nombre.
SELECT
  s.nombre AS actor,
  s.sueldo AS sueldo_soltera_otra_vez,
  p.sueldo AS sueldo_papi_ricky,
  s.sueldo + p.sueldo AS sueldo_total
FROM reparto_soltera_otra_vez s
INNER JOIN reparto_papi_ricky p
  ON s.nombre = p.nombre
ORDER BY s.nombre;

-- 2. Actores exclusivamente en Soltera Otra Vez con sueldo mayor a 90.
SELECT
  s.nombre,
  s.sueldo
FROM reparto_soltera_otra_vez s
LEFT JOIN reparto_papi_ricky p
  ON s.nombre = p.nombre
WHERE p.nombre IS NULL
  AND s.sueldo > 90
ORDER BY s.nombre;

-- 3. Actores con sueldo inferior a 85 que actuaron en cualquiera de las dos
-- teleseries, pero no en ambas.
SELECT nombre, sueldo, teleserie
FROM (
  SELECT
    s.nombre,
    s.sueldo,
    'Soltera otra vez' AS teleserie
  FROM reparto_soltera_otra_vez s
  LEFT JOIN reparto_papi_ricky p
    ON s.nombre = p.nombre
  WHERE p.nombre IS NULL
    AND s.sueldo < 85

  UNION ALL

  SELECT
    p.nombre,
    p.sueldo,
    'Papi Ricky' AS teleserie
  FROM reparto_papi_ricky p
  LEFT JOIN reparto_soltera_otra_vez s
    ON p.nombre = s.nombre
  WHERE s.nombre IS NULL
    AND p.sueldo < 85
) AS actores_exclusivos
ORDER BY nombre;

-- =========================================================
-- PARTE 2: MODELO ENTIDAD RELACION
-- =========================================================

DROP TABLE IF EXISTS reparto;
DROP TABLE IF EXISTS teleserie;
DROP TABLE IF EXISTS actor;

CREATE TABLE actor (
  id_actor INT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE teleserie (
  id_teleserie INT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL UNIQUE,
  cantidad_emisiones INT NOT NULL CHECK (cantidad_emisiones > 0),
  unidad_emision VARCHAR(20) NOT NULL CHECK (unidad_emision IN ('temporadas', 'capitulos'))
);

CREATE TABLE reparto (
  id_reparto INT PRIMARY KEY,
  id_actor INT NOT NULL REFERENCES actor(id_actor),
  id_teleserie INT NOT NULL REFERENCES teleserie(id_teleserie),
  protagonico BOOLEAN NOT NULL,
  sueldo INT NOT NULL CHECK (sueldo >= 0),
  UNIQUE (id_actor, id_teleserie)
);

-- =========================================================
-- INSERTS adaptados desde las tablas originales
-- =========================================================

INSERT INTO teleserie (id_teleserie, nombre, cantidad_emisiones, unidad_emision) VALUES
(1, 'Soltera otra vez', 3, 'temporadas'),
(2, 'Papi Ricky', 135, 'capitulos');

INSERT INTO actor (id_actor, nombre) VALUES
(1, 'Paz Bascuñán'),
(2, 'Pablo Macaya'),
(3, 'Cristián Arriagada'),
(4, 'Josefina Montané'),
(5, 'Loreto Aravena'),
(6, 'Lorena Bosch'),
(7, 'Nicolás Poblete'),
(8, 'Héctor Morales'),
(9, 'Aranzazú Yankovic'),
(10, 'Luis Gnecco'),
(11, 'Catalina Guerra'),
(12, 'Solange Lackington'),
(13, 'Ignacio Garmendia'),
(14, 'Julio González'),
(15, 'Antonella Orsini'),
(16, 'Tamara Acosta'),
(17, 'Silvia Santelices'),
(18, 'Alejandro Trejo'),
(19, 'Grimanesa Jiménez'),
(20, 'Jorge Zabaleta'),
(21, 'Belén Soto'),
(22, 'María Elena Swett'),
(23, 'Juan Falcón'),
(24, 'Leonardo Perucci'),
(25, 'Teresita Reyes'),
(26, 'Remigio Remedy'),
(27, 'María Paz Grandjean'),
(28, 'César Caillet'),
(29, 'José Tomás Guzmán'),
(30, 'Manuel Aguirre');

INSERT INTO reparto (id_reparto, id_actor, id_teleserie, protagonico, sueldo) VALUES
(1, 1, 1, true, 100),
(2, 2, 1, true, 100),
(3, 3, 1, true, 95),
(4, 4, 1, true, 90),
(5, 5, 1, true, 95),
(6, 6, 1, true, 90),
(7, 7, 1, true, 85),
(8, 8, 1, true, 80),
(9, 9, 1, true, 80),
(10, 10, 1, true, 95),
(11, 11, 1, true, 90),
(12, 12, 1, true, 70),
(13, 13, 1, true, 70),
(14, 14, 1, true, 75),
(15, 15, 1, true, 70),
(16, 16, 1, false, 60),
(17, 17, 1, false, 55),
(18, 18, 1, false, 55),
(19, 19, 1, false, 60),

(20, 20, 2, true, 100),
(21, 21, 2, true, 100),
(22, 16, 2, true, 100),
(23, 22, 2, true, 100),
(24, 23, 2, true, 95),
(25, 17, 2, true, 85),
(26, 24, 2, true, 85),
(27, 25, 2, true, 80),
(28, 10, 2, true, 75),
(29, 18, 2, true, 65),
(30, 19, 2, true, 60),
(31, 26, 2, true, 60),
(32, 27, 2, true, 55),
(33, 8, 2, true, 50),
(34, 28, 2, true, 40),
(35, 29, 2, true, 25),
(36, 30, 2, true, 30);

-- =========================================================
-- Consulta parte 2:
-- todas las teleseries y todos los actores asociados,
-- sin incluir actores de rol secundario.
-- =========================================================

SELECT
  t.nombre AS teleserie,
  a.nombre AS actor,
  r.sueldo
FROM teleserie t
INNER JOIN reparto r
  ON t.id_teleserie = r.id_teleserie
INNER JOIN actor a
  ON a.id_actor = r.id_actor
WHERE r.protagonico = true
ORDER BY t.nombre, a.nombre;
