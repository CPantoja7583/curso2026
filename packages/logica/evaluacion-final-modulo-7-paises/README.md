# Evaluacion final modulo 7: paises con pg y pg-cursor

Aplicacion full stack en Node.js con Express, `pg` y `pg-cursor` para administrar paises, PIB y acciones web.

## Requisitos

- Node.js 18 o superior.
- PostgreSQL.
- Base de datos creada, por ejemplo `curso_modulo_7`.

## Preparar base de datos

Ejecuta:

```powershell
psql -U postgres -d curso_modulo_7 -f sql/init.sql
```

El archivo `sql/init.sql` replica el complemento entregado en el enunciado.

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
$env:DB_NAME="curso_modulo_7"
$env:PORT="3016"
```

Tambien se acepta `DB_PASSWORD` o `DATABASE_URL`.

## Ejecutar

```powershell
npm start
```

Abrir:

```text
http://127.0.0.1:3016
```

## Endpoints

- `GET /api/paises?limit=5|10|20&cursorId=<id>`: lista por bloques usando `pg-cursor`.
- `POST /api/paises`: agrega registros en `paises` y `paises_pib`, luego registra accion `1` en `paises_data_web`.
- `DELETE /api/paises/:nombre`: elimina de `paises_pib` y `paises`, luego registra accion `0` en `paises_data_web`.

Las operaciones `POST` y `DELETE` usan transacciones con `BEGIN`, `COMMIT` y `ROLLBACK`.

## Frontend

Incluye:

- selector de bloque `5`, `10` o `20`;
- boton `Siguiente` para avanzar en el cursor;
- formulario para agregar pais;
- formulario para eliminar pais;
- visualizacion ordenada de errores del backend.

## Pruebas

```powershell
npm test
```
