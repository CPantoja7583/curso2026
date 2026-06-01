CREATE TABLE IF NOT EXISTS peliculas (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  anio INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS actores (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  fecha_nacimiento DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS peliculas_actores (
  pelicula_id INTEGER NOT NULL REFERENCES peliculas(id) ON DELETE CASCADE,
  actor_id INTEGER NOT NULL REFERENCES actores(id) ON DELETE CASCADE,
  PRIMARY KEY (pelicula_id, actor_id)
);

INSERT INTO peliculas (titulo, anio)
SELECT 'Matrix', 1999
WHERE NOT EXISTS (SELECT 1 FROM peliculas WHERE titulo = 'Matrix');

INSERT INTO peliculas (titulo, anio)
SELECT 'John Wick', 2014
WHERE NOT EXISTS (SELECT 1 FROM peliculas WHERE titulo = 'John Wick');

INSERT INTO actores (nombre, fecha_nacimiento)
SELECT 'Keanu Reeves', '1964-09-02'
WHERE NOT EXISTS (SELECT 1 FROM actores WHERE nombre = 'Keanu Reeves');

INSERT INTO actores (nombre, fecha_nacimiento)
SELECT 'Carrie-Anne Moss', '1967-08-21'
WHERE NOT EXISTS (SELECT 1 FROM actores WHERE nombre = 'Carrie-Anne Moss');
