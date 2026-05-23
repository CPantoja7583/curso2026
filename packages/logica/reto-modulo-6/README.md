# Reto Modulo 6 - Cartones KINO

Servicio web en Node con PostgreSQL para administrar cartones de numeros aleatorios estilo KINO.

## Requisitos

- Node.js
- PostgreSQL
- Base de datos llamada `reto_modulo_6` o el nombre configurado en `DB_NAME`

## Instalacion

```powershell
npm install
```

## Configuracion de PostgreSQL

Puedes crear la base de datos desde pgAdmin o `psql`:

```sql
CREATE DATABASE reto_modulo_6;
```

La tabla se crea automaticamente al iniciar el servidor. Si quieres crearla manualmente, ejecuta:

```sql
\i sql/init.sql
```

## Ejecucion

```powershell
$env:DB_HOST="localhost"
$env:DB_PORT="5432"
$env:DB_USER="postgres"
$env:DB_PASSWORD="tu_password"
$env:DB_NAME="reto_modulo_6"
npm start
```

El servidor queda disponible en:

```text
http://127.0.0.1:3006
```

## Endpoints

- `GET /api/cartones`: lista todos los cartones.
- `POST /api/cartones`: crea un nuevo carton con 15 numeros unicos entre 1 y 30.

Al iniciar, si la tabla esta vacia, el servidor crea automaticamente 5 cartones.
