# Consultas parametrizadas II con Node + pg

Servicio REST en Node.js que consulta PostgreSQL con `pg` y consultas parametrizadas.

## Endpoints

- `GET /clientes`: retorna todos los clientes.
- `GET /clientes?rut=<rut>`: busca por RUT.
- `GET /clientes?edad=<n>`: busca por edad exacta.
- `GET /clientes?edadMin=<n>&edadMax=<m>`: busca por rango de edad.
- `GET /clientes?nombre=<texto>`: busca por prefijo de nombre con `ILIKE`.
- `POST /clientes`: crea cliente con `rut`, `nombre`, `edad`.
- `PUT /clientes/:rut`: modifica solo `nombre`.
- `DELETE /clientes/:rut`: elimina por RUT.
- `DELETE /clientes?edad=<n>`: elimina por edad.
- `DELETE /clientes?edadMin=<n>&edadMax=<m>`: elimina por rango.

## Instalacion

```powershell
npm install
```

## Variables de entorno

Puedes usar `DATABASE_URL`:

```powershell
$env:DATABASE_URL="postgres://postgres:tu_password@localhost:5432/curso_modulo_6"
```

O configuracion por campos:

```powershell
$env:DB_HOST="localhost"
$env:DB_PORT="5432"
$env:DB_USER="postgres"
$env:DB_PASSWORD="tu_password"
$env:DB_NAME="curso_modulo_6"
```

## Ejecutar

```powershell
npm start
```

Abrir:

```text
http://127.0.0.1:3009
```

## SQL

El archivo [sql/init.sql](sql/init.sql) contiene el script de creacion y poblado de `clientes`.
