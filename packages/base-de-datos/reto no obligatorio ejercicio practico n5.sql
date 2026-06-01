-- Reto no obligatorio
-- Ejercicio Práctico - n° 5
--
-- Supuesto de estructura:
-- banda(id_banda, nombre, pais)
-- disco(id_disco, nombre, anio_publicacion, id_banda)

-- 1. Listar todos los discos de bandas NO alemanas
-- que hayan sido publicados desde el 2000 en adelante.
SELECT d.nombre AS disco, b.nombre AS banda, b.pais, d.anio_publicacion
FROM disco d
INNER JOIN banda b ON b.id_banda = d.id_banda
WHERE b.pais <> 'Alemania'
  AND d.anio_publicacion >= 2000
ORDER BY d.anio_publicacion, d.nombre;

-- 2. Listar el disco mas reciente de las bandas inglesas que terminan en 's'.
SELECT b.nombre AS banda, d.nombre AS disco, d.anio_publicacion
FROM disco d
INNER JOIN banda b ON b.id_banda = d.id_banda
WHERE b.pais = 'Inglaterra'
  AND b.nombre LIKE '%s'
  AND d.anio_publicacion = (
    SELECT MAX(d2.anio_publicacion)
    FROM disco d2
    INNER JOIN banda b2 ON b2.id_banda = d2.id_banda
    WHERE b2.pais = 'Inglaterra'
      AND b2.nombre LIKE '%s'
  );

-- 3. Listar todas las bandas alemanas con al menos una letra K en su nombre
-- que tengan discos publicados en 1999 o superior.
SELECT DISTINCT b.nombre AS banda, b.pais
FROM banda b
INNER JOIN disco d ON d.id_banda = b.id_banda
WHERE b.pais = 'Alemania'
  AND b.nombre LIKE '%K%'
  AND d.anio_publicacion >= 1999
ORDER BY b.nombre;

-- 4. Listar todas las bandas y el numero de discos registrados.
SELECT b.nombre AS banda, COUNT(d.id_disco) AS cantidad_discos
FROM banda b
LEFT JOIN disco d ON d.id_banda = b.id_banda
GROUP BY b.id_banda, b.nombre
ORDER BY b.nombre;

-- 5. Mostrar todos los años en que todas las bandas sacaron un disco.
-- Ordenar la lista por año.
SELECT d.anio_publicacion
FROM disco d
GROUP BY d.anio_publicacion
HAVING COUNT(DISTINCT d.id_banda) = (SELECT COUNT(*) FROM banda)
ORDER BY d.anio_publicacion;

-- 6. Listar todas las bandas que tienen un disco con nombre empezado en A.
-- Listar nombre de la banda y del disco.
SELECT b.nombre AS banda, d.nombre AS disco
FROM banda b
INNER JOIN disco d ON d.id_banda = b.id_banda
WHERE d.nombre LIKE 'A%'
ORDER BY b.nombre, d.nombre;

-- 7. Listar todas las bandas que tengan discos con mas de una palabra.
-- Listar nombre de la banda y del disco.
SELECT b.nombre AS banda, d.nombre AS disco
FROM banda b
INNER JOIN disco d ON d.id_banda = b.id_banda
WHERE d.nombre LIKE '% %'
ORDER BY b.nombre, d.nombre;

-- 8. Listar todas las bandas que tengan discos con mas de una palabra.
-- Listar el nombre de la banda y la cantidad de discos.
SELECT b.nombre AS banda, COUNT(d.id_disco) AS cantidad_discos_con_mas_de_una_palabra
FROM banda b
INNER JOIN disco d ON d.id_banda = b.id_banda
WHERE d.nombre LIKE '% %'
GROUP BY b.id_banda, b.nombre
ORDER BY b.nombre;
