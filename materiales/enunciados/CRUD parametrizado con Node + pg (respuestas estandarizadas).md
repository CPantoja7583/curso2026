Introducción / Objetivo
Desarrollar un CRUD de la tabla clientes (rut, nombre, edad) en Node.js usando pg con consultas parametrizadas, validaciones básicas y manejo de errores. Se busca practicar inserción, actualización, borrado y consultas, con respuestas JSON coherentes que indiquen resultado y detalles de la operación.

Descripción de la actividad

Todas las operaciones usan consultas parametrizadas (Query Objects { text, values }) y responden en JSON con códigos HTTP adecuados.

PARTE 1 — Backend (Node + pg, Query Objects)
Realice un CRUD sobre clientes (rut, nombre, edad); si no existe, créela y pueble algunos datos. Todas las consultas deben usar Query Objects: { text: '...', values: [...] }.

Endpoints y reglas:

GET /clientes → Lista todos los clientes.

GET /clientes?rut=<rut> → Devuelve 1 o 0 clientes.

GET /clientes?edad=<n> → Lista por edad.

GET /clientes?nombre=<texto> → Lista por nombre (completo o prefijo).

DELETE /clientes?rut=<rut> → Elimina 1 o 0 registro por rut.

DELETE /clientes?nombre=<texto> → Elimina 1 o 0 registro. Prohibido borrar masivamente: si hay más de uno, no borrar y pedir refinar criterio.

DELETE /clientes?edad=<n> → Elimina 1 o 0 registro. Prohibido borrar masivamente: si hay más de uno, no borrar y pedir refinar criterio.

PUT /clientes/:rut → Modifica solo nombre.

POST /clientes → Inserta un nuevo cliente. Si rut ya existe, responder con mensaje adecuado.

Formato de respuesta (estándar):

Éxito (consulta):

{ "ok": true, "data": [...] }
Éxito (PUT/DELETE): incluir cuántos registros cambió el servidor:

{ "ok": true, "rowCount": 1, "mensaje": "Actualizado correctamente" }
Creación (POST): usar 201 y devolver el nuevo registro:

{ "ok": true, "data": { "rut":"...", "nombre":"...", "edad": 30 } }
Sin coincidencias / validación: usar 404 o 400 según corresponda:

{ "ok": false, "mensaje": "Cliente no existe" }
Requisitos de calidad y seguridad:

Parametrización obligatoria (sin concatenar strings).

Validar tipos/rangos de entrada (por ejemplo, edad numérica).

Responder siempre en JSON con Content-Type: application/json.

Códigos sugeridos: 200, 201, 400, 404, 409 (rut duplicado), 500.

Guía mínima (opcional, muy breve):

Query Object en pg:

const q = { text: 'SELECT rut, nombre, edad FROM clientes WHERE rut = $1', values: [rut] };
const { rows, rowCount } = await pool.query(q);
PARTE 2 — Frontend
Cree formularios separados para crear, modificar, consultar y eliminar.

Mostrar resultados en lista/tabla.

Visualizar el mensaje del backend y, en PUT/DELETE, el rowCount.

Para búsquedas por nombre y edad, permitir ingresar prefijo o valor exacto.

Forma de entrega
Suba un .zip con:

Backend (Node/Express/pg) usando Query Objects y el formato de respuesta descrito.

Frontend (HTML/CSS/JS) con los formularios.

Pantallazos que evidencien: creación (201 con el objeto creado), actualización/borrado (con rowCount), búsquedas sin resultados (404 con mensaje).
