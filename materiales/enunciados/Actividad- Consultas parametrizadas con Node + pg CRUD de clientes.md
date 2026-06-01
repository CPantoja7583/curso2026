Introducción / Objetivo
Implementar un servidor web en Node.js que acceda a una tabla clientes usando consultas parametrizadas con pg (PostgreSQL). Se busca ejercitar operaciones CRUD, validaciones de entrada y exposición de endpoints REST. Además, desarrollar un frontend que consuma los servicios para crear, consultar, modificar y eliminar registros.

Descripción de la actividad
PARTE 1 — Backend (Node + pg)
Utilice una tabla clientes con campos rut, nombre, edad (si no existe, créela y cargue algunos datos). El servidor debe exponer:

GET /clientes → retorna todos los registros.

POST /clientes → crea un registro. Requiere rut, nombre, edad. Validar:

llave duplicada (conflicto)

edad numérica

DELETE /clientes/:rut → elimina por rut.

PUT /clientes/:rut → permite modificar únicamente nombre.

PARTE 2 — Frontend
Cree un cliente web con formularios separados para: crear, modificar, consultar y eliminar clientes. Debe consumir los endpoints de la PARTE 1 y mostrar resultados ordenados.

Guías técnicas (opcionales)
Consultas parametrizadas con pg:

const { rows } = await pool.query(
'SELECT rut, nombre, edad FROM clientes WHERE rut = $1',
[rut]
);
Esquema mínimo sugerido (ajústelo si ya existe la tabla):

CREATE TABLE IF NOT EXISTS clientes (
rut VARCHAR(20) PRIMARY KEY,
nombre VARCHAR(100) NOT NULL,
edad INT NOT NULL
);
Convenciones útiles:

Content-Type: application/json en respuestas.

Códigos: 200 OK, 201 Created (POST), 400 Bad Request (datos inválidos),
404 Not Found (rut inexistente), 409 Conflict (rut duplicado), 405 Method Not Allowed.

Forma de entrega
Suba un .zip con:

Backend (código Node y uso de pg).

Frontend (HTML/CSS/JS) con los cuatro formularios.

Pantallazos de pruebas: crear, listar, modificar nombre y eliminar.
