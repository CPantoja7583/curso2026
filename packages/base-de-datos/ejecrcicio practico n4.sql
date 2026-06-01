-- Tarea 13
-- Actividad 5: consultas SQL sobre la tabla serie_netflix
--
-- Supuesto de estructura:
-- serie_netflix(nombre, temporadas, genero, anio_estreno)

-- 1. Insertar 9 series adicionales.
INSERT INTO serie_netflix (nombre, temporadas, genero, anio_estreno) VALUES
('Breaking Bad', 5, 'Drama', 2008),
('Dark', 3, 'Ciencia Ficcion', 2017),
('Friends', 10, 'Comedia', 1994),
('Sherlock', 4, 'Crimen', 2010),
('The Crown', 6, 'Drama Historico', 2016),
('Stranger Things', 5, 'Ciencia Ficcion', 2016),
('Vikings', 6, 'Accion', 2013),
('The Office', 9, 'Comedia', 2005),
('Peaky Blinders', 6, 'Drama', 2013);

-- 2. Listar todas las series con mas de 3 temporadas ordenadas por año de estreno descendente.
SELECT *
FROM serie_netflix
WHERE temporadas > 3
ORDER BY anio_estreno DESC;

-- 3. Listar el año de la serie mas antigua.
SELECT MIN(anio_estreno) AS anio_mas_antiguo
FROM serie_netflix;

-- 4. Listar el año de la serie mas nueva.
SELECT MAX(anio_estreno) AS anio_mas_nuevo
FROM serie_netflix;

-- 5. Mostrar el promedio de año de estreno de las series.
SELECT AVG(anio_estreno) AS promedio_anio_estreno
FROM serie_netflix;

-- 6. Listar el promedio de temporadas de todas las series.
SELECT AVG(temporadas) AS promedio_temporadas
FROM serie_netflix;

-- 7. Listar las series que tengan 1, 2, 4, 5 o 7 temporadas.
SELECT *
FROM serie_netflix
WHERE temporadas IN (1, 2, 4, 5, 7);

-- 8. Listar las series que NO tengan 1, 2, 4, 5 o 7 temporadas.
SELECT *
FROM serie_netflix
WHERE temporadas NOT IN (1, 2, 4, 5, 7);

-- 9. Borrar todas las series con año de estreno superior a 2010.
-- Se guarda respaldo para poder reinsertarlas en el punto 10.
CREATE TABLE series_borradas AS
SELECT *
FROM serie_netflix
WHERE anio_estreno > 2010;

DELETE FROM serie_netflix
WHERE anio_estreno > 2010;

-- 10. Reinsertar los datos recien borrados.
INSERT INTO serie_netflix (nombre, temporadas, genero, anio_estreno)
SELECT nombre, temporadas, genero, anio_estreno
FROM series_borradas;

-- 11. Agregar la serie Doctor House, 8, 'Drama Medico', 2004.
INSERT INTO serie_netflix (nombre, temporadas, genero, anio_estreno)
VALUES ('Doctor House', 8, 'Drama Medico', 2004);

-- 12. Listar todas las series estrenadas entre 2005 y 2020.
SELECT *
FROM serie_netflix
WHERE anio_estreno BETWEEN 2005 AND 2020;

-- 13. Listar todas aquellas series con nombre comenzado en B o terminado en e.
SELECT *
FROM serie_netflix
WHERE nombre LIKE 'B%'
   OR nombre LIKE '%e';

-- 14. Listar aquellas series cuyo año de estreno mas la cantidad de temporadas excede 2010.
SELECT *
FROM serie_netflix
WHERE anio_estreno + temporadas > 2010;
