Introducción / Objetivo
Implementar operaciones transaccionales en PostgreSQL desde Node.js usando pg, garantizando consistencia al crear una orden de compra con sus productos y despacho. Se espera manejar BEGIN/COMMIT/ROLLBACK, validar stock y entregar respuestas claras ante éxito o error.

Descripción de la actividad
PARTE 1 — Backend (Node + pg)
Considere el diagrama provisto (productos, lista_productos, orden, despachos, clientes, direcciones). Desarrolle un backend que exponga:

GET ?filtro=productos → lista de productos.

GET ?filtro=productos&id=<id_producto> → producto por id.

GET ?filtro=productos&orden=<id_orden> → productos de una orden.

GET ?filtro=ordenes&rut=<rut> → órdenes por rut de cliente.

GET ?filtro=clientes → lista de clientes.

GET ?filtro=clientes&rut=<rut> → cliente por rut.

GET ?filtro=direcciones&rut=<rut> → direcciones por rut.

GET ?filtro=despachos&orden=<id> → despacho por id de orden.

POST /orden → Transacción:

Insertar orden.

Insertar despacho con su dirección asociada.

Insertar lista de productos solicitados.

Por cada producto, actualizar existencias restando cantidad_producto.

Si alguna resta deja el stock < 0, realizar ROLLBACK y responder con mensaje indicando falta de stock.

Si todo resulta correcto, COMMIT y retornar la orden creada.

Enfoque recomendado

Mantener POST /orden como foco transaccional central (BEGIN/COMMIT/ROLLBACK).

Implementar los GET en versión básica (sin filtros adicionales ni paginación).

Validar stock dentro de la transacción y responder con mensajes claros.

Usar consultas parametrizadas y respuestas JSON coherentes.

PARTE 2 — Frontend (funcional)

Menú principal con accesos.

Página para listar productos.

Página para listar órdenes de un cliente (ingresando su rut).

Página para crear una orden: ingresar rut, seleccionar productos y cantidades, elegir dirección; enviar POST /orden y mostrar el resultado.

Guías técnicas sugeridas (opcionales)
Transacción mínima con pg:

const client = await pool.connect();
try {
await client.query('BEGIN');
// ...tus consultas parametrizadas aquí: { text: 'SQL...', values: [...] }...
await client.query('COMMIT');
res.status(201).json({ ok: true, mensaje: 'Orden creada' });
} catch (e) {
await client.query('ROLLBACK');
res.status(409).json({ ok: false, mensaje: e.message });
} finally {
client.release();
}
Query Object (parametrización) ejemplo:

const q = { text: 'SELECT \* FROM productos WHERE id_producto = $1', values: [id] };
const { rows } = await pool.query(q);
Cabeceras y estados sugeridos: Content-Type: application/json; 201 en creación exitosa; 409 si falla por stock; 500 para error inesperado.

Forma de entrega
Sube un .zip con:

Backend (Node/Express/pg) y Frontend.

Script SQL con tablas/datos mínimos de prueba.

Pantallazos de: lista de productos, órdenes por rut, creación de orden exitosa y caso con rollback por stock.
