# Actividad: Consultas parametrizadas con Node + pg

Servicio web CRUD de clientes usando Node.js, el modulo `http` y PostgreSQL con `pg`.

## Requisitos

- Node.js 18 o superior.
- PostgreSQL disponible.

## Instalacion

```powershell
npm install
```

## Base de datos

Puedes crear la tabla y datos iniciales con:

```powershell
psql -U postgres -d curso_modulo_6 -f sql/init.sql
```

El servidor tambien crea la tabla y agrega datos iniciales si esta vacia.

## Variables de entorno

```powershell
$env:DB_HOST="localhost"
$env:DB_PORT="5432"
$env:DB_USER="postgres"
$env:DB_PASSWORD="tu_password"
$env:DB_NAME="curso_modulo_6"
$env:PORT="3010"
```

Tambien puedes usar `DATABASE_URL`.

## Ejecutar

```powershell
npm start
```

Abre `http://127.0.0.1:3010`.

## Endpoints

- `GET /clientes`: lista todos los clientes ordenados por nombre y rut.
- `POST /clientes`: crea un cliente con `rut`, `nombre`, `edad`.
- `PUT /clientes/:rut`: modifica solo el `nombre`.
- `DELETE /clientes/:rut`: elimina un cliente por rut.

## Codigos usados

- `200 OK`: consulta, modificacion o eliminacion correcta.
- `201 Created`: cliente creado.
- `400 Bad Request`: datos invalidos.
- `404 Not Found`: rut inexistente.
- `409 Conflict`: rut duplicado.
- `405 Method Not Allowed`: metodo no soportado.

## Pruebas

```powershell
npm test
```
