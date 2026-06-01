DROP TABLE IF EXISTS personas;

CREATE TABLE personas (
  id          SERIAL PRIMARY KEY,
  nombres     VARCHAR(100) NOT NULL,
  apellidos   VARCHAR(100) NOT NULL,
  edad        INTEGER,
  creado_en   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO personas (nombres, apellidos, edad) VALUES
  ('Maria',  'Lopez', 28),
  ('Juan',   'Perez', 35),
  ('Camila', 'Rodriguez', 24);


  CREATE TABLE mascotas (
    id          SERIAL PRIMARY KEY,
    nombres     VARCHAR(100) NOT NULL,
    raza   VARCHAR(100) NOT NULL,
    edad        INTEGER,
    creado_en   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  INSERT INTO mascotas (nombres, raza, edad) VALUES
    ('Nacho',  'Gato Gris', 4),
    ('Mimi',   'Gata', 5),
    ('Neron', 'Perro', 8);