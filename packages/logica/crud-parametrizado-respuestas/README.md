# CRUD parametrizado con Node + pg

Entrega para la actividad de CRUD de `clientes` con consultas parametrizadas y respuestas JSON estandarizadas.

## Stack

- Node.js con modulo `http`.
- PostgreSQL con paquete `pg`.
- Frontend HTML/CSS/JS usando `fetch`.

## Instalacion

```powershell
npm install
```

## Base de datos

El servidor crea la tabla y agrega datos iniciales si la tabla esta vacia. Tambien puedes ejecutar:

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
$env:PORT="3011"
```

Tambien se acepta `DATABASE_URL`.

## Ejecutar

```powershell
npm start
```

Abrir:

```text
http://127.0.0.1:3011
```

## Endpoints

- `GET /clientes`
- `GET /clientes?rut=<rut>`
- `GET /clientes?edad=<n>`
- `GET /clientes?nombre=<texto>`
- `POST /clientes`
- `PUT /clientes/:rut`
- `DELETE /clientes?rut=<rut>`
- `DELETE /clientes?nombre=<texto>`
- `DELETE /clientes?edad=<n>`

## Respuestas

Consulta correcta:

```json
{ "ok": true, "data": [] }
```

Creacion correcta:

```json
{ "ok": true, "data": { "rut": "55.555.555-5", "nombre": "Elena Castro", "edad": 30 } }
```

Actualizacion o eliminacion:

```json
{ "ok": true, "rowCount": 1, "mensaje": "Actualizado correctamente" }
```

Error:

```json
{ "ok": false, "mensaje": "Cliente no existe" }
```

## Reglas de seguridad

- Todas las consultas se construyen como Query Objects `{ text, values }`.
- No se concatena SQL con datos del usuario.
- `DELETE` por `nombre` o `edad` primero busca candidatos; si hay mas de uno, no borra y responde que se debe refinar el criterio.
- `PUT /clientes/:rut` solo modifica `nombre`.

## Pruebas

```powershell
npm test
```
