##Introducción / Objetivo
Implementar un servicio REST en Node.js que consulte una tabla clientes en PostgreSQL usando consultas parametrizadas con pg, incorporando filtros por distintos criterios y operaciones asociadas. Además, adaptar el frontend para cubrir las nuevas prestaciones de consulta, alta, modificación y eliminación.

##Descripción de la actividad
PARTE 1 — Backend (Node + pg)
Use una tabla clientes con campos rut, nombre, edad (si no existe, créela y pueble datos). Exponga las siguientes funcionalidades (se sugiere usar query params):

GET /clientes → retorna todos los registros.

GET /clientes?rut=<rut> → retorna el cliente correspondiente o mensaje “cliente no existe”.

GET /clientes?edad=<n> → lista de clientes con la edad indicada o “no hay clientes que cumplan con el criterio”.

GET /clientes?edadMin=<n>&edadMax=<m> → lista de clientes dentro del rango o mensaje de no coincidencias.

GET /clientes?nombre=<texto> → texto puede ser nombre completo o prefijo; retorna coincidencias o mensaje de no coincidencias.

POST /clientes → crea un registro; requiere rut, nombre, edad. Validar llave duplicada y que edad sea numérica.

DELETE /clientes/:rut → elimina por rut.

DELETE /clientes?edad=<n> → elimina todos con esa edad; responder con los nombres eliminados o mensaje de no coincidencias.

DELETE /clientes?edadMin=<n>&edadMax=<m> → elimina en rango; responder con los nombres eliminados o mensaje de no coincidencias.

PUT /clientes/:rut → permite modificar solo nombre.

##PARTE 2 — Frontend
Crear un cliente web que consuma los endpoints anteriores. Incluir formularios separados para: crear, modificar, consultar y eliminar. Agregar los campos necesarios para los nuevos filtros (por rut, edad, edadMin/edadMax, nombre) y mostrar resultados ordenados.

Guías técnicas (opcionales y breves)
Parametrización con pg (evita concatenar strings):

// ejemplo de filtro por rango de edad
const sql = 'SELECT rut, nombre, edad FROM clientes WHERE edad BETWEEN $1 AND $2';
const { rows } = await pool.query(sql, [edadMin, edadMax]);
Búsqueda por nombre (prefijo o completo):

// prefijo, insensible a mayúsculas usando ILIKE (PostgreSQL)
const { rows } = await pool.query(
'SELECT rut, nombre, edad FROM clientes WHERE nombre ILIKE $1',
[nombre + '%']
);
Respuestas y estados sugeridos: 200 OK, 201 Created, 400 Bad Request, 404 Not Found, 409 Conflict, 500 Internal Server Error.
Incluir Content-Type: application/json.

##Forma de entrega
Suba un .zip con:

##Backend (código Node + pg).

##Frontend (HTML/CSS/JS) actualizado con los filtros y acciones nuevas.

##Pantallazos evidenciando: consultas por cada criterio, alta, modificación y eliminaciones (incluyendo mensajes cuando no hay coincidencias).
