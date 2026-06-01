# Transacciones con Node + pg: ordenes de compra y stock

Entrega para practicar transacciones PostgreSQL desde Node.js con `pg`.

## Que incluye

- Backend Node con modulo `http`.
- PostgreSQL con `pg`.
- Transaccion central en `POST /orden` con `BEGIN`, `COMMIT` y `ROLLBACK`.
- Script SQL con tablas y datos minimos.
- Frontend funcional con menu, productos, ordenes por RUT y creacion de orden.
- Pantallazos de evidencia en `screenshots/`.

## Instalacion

```powershell
npm install
```

## Base de datos

El servidor ejecuta `sql/init.sql` al iniciar. Tambien puedes correrlo manualmente:

```powershell
psql -U postgres -d curso_modulo_6 -f sql/init.sql
```

## Variables de entorno

```powershell
$env:DB_HOST="localhost"
$env:DB_PORT="5432"
$env:DB_USER="postgres"
$env:DB_PASSWORD="tu_password"
$env:DB_NAME="curso_modulo_6"
$env:PORT="3012"
```

Tambien se acepta `DATABASE_URL`.

## Ejecutar

```powershell
npm start
```

Abrir:

```text
http://127.0.0.1:3012
```

## Endpoints GET

- `GET /?filtro=productos`
- `GET /?filtro=productos&id=<id_producto>`
- `GET /?filtro=productos&orden=<id_orden>`
- `GET /?filtro=ordenes&rut=<rut>`
- `GET /?filtro=clientes`
- `GET /?filtro=clientes&rut=<rut>`
- `GET /?filtro=direcciones&rut=<rut>`
- `GET /?filtro=despachos&orden=<id>`

## Crear orden

`POST /orden`

```json
{
  "rut": "11.111.111-1",
  "id_direccion": 1,
  "productos": [
    { "id_producto": 1, "cantidad_producto": 1 },
    { "id_producto": 2, "cantidad_producto": 2 }
  ]
}
```

Respuesta exitosa:

```json
{ "ok": true, "mensaje": "Orden creada", "data": { "id_orden": 1 } }
```

Si falta stock:

```json
{ "ok": false, "mensaje": "Falta de stock para Teclado mecanico. Disponible: 1" }
```

## Pruebas

```powershell
npm test
```
