# Actividad Practica: Backend con Sequelize + API REST y Frontend basico

Aplicacion full stack con Node.js, Express, Sequelize y PostgreSQL para manejar clientes.

## Requisitos

- Node.js 18 o superior.
- PostgreSQL.
- Base de datos `clientes_db` creada.

## Crear base de datos

Desde `psql`:

```sql
CREATE DATABASE clientes_db;
```

Tambien se incluye `sql/init.sql` como referencia para crear la base y la tabla.

## Instalacion

```powershell
npm install
```

## Variables de entorno

```powershell
$env:DB_HOST="localhost"
$env:DB_PORT="5432"
$env:DB_USER="postgres"
$env:DB_PASS="tu_password"
$env:DB_NAME="clientes_db"
```

Tambien se acepta `DB_PASSWORD` o `DATABASE_URL`.

## Ejecutar

```powershell
npm start
```

Servidor:

```text
http://localhost:3000
```

## Endpoints

- `GET /clientes`: devuelve todos los clientes.
- `POST /clientes`: crea un cliente con `nombre` y `email`.

Ejemplo:

```json
{
  "nombre": "Ana Perez",
  "email": "ana@example.com"
}
```

## Frontend

El frontend esta en `public/` y se sirve desde el mismo Express. Incluye:

- Boton para listar clientes.
- Formulario para agregar cliente.
- Consumo con `fetch()`.

## Pruebas

```powershell
npm test
```
