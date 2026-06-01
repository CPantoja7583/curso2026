# Ejercicio Practico - Node + pg

Servidor Node.js con el paquete `pg` usando dos pools de conexiones a PostgreSQL:

- `GET /finanzas`: usa pool por configuracion (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`) y consulta `finanzas_personales`.
- `GET /clientes`: usa pool por `connectionString` (`DATABASE_URL`) y consulta `clientes`.

El servidor crea y puebla las tablas si estan vacias. El frontend consume ambos endpoints y muestra una tabla de finanzas y una lista de clientes con manejo de errores visible.

## Instalacion

```powershell
npm install
```

## Variables de entorno

```powershell
$env:DB_HOST="localhost"
$env:DB_PORT="5432"
$env:DB_USER="postgres"
$env:DB_PASSWORD="tu_password"
$env:DB_NAME="curso_modulo_5"
$env:DATABASE_URL="postgres://postgres:tu_password@localhost:5432/curso_modulo_5"
```

Si `DATABASE_URL` no se define, el servidor construye una connection string con las mismas variables `DB_*`.

## Ejecutar

```powershell
npm start
```

Abrir:

```text
http://127.0.0.1:3008
```

## SQL

El archivo [sql/init.sql](sql/init.sql) contiene los scripts para crear y poblar `finanzas_personales` y `clientes`.

## Pruebas

```powershell
npm test
```
