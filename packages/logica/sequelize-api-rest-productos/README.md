# Actividad Practica: Backend con Sequelize + API REST y Frontend basico

Entrega con una API REST de productos usando Express, Sequelize y PostgreSQL.

El archivo original del enunciado esta vacio en `materiales/enunciados`, asi que se implemento una actividad estandar de CRUD con Sequelize.

## Stack

- Node.js
- Express
- Sequelize
- PostgreSQL con `pg`
- Frontend HTML/CSS/JS con `fetch`

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
$env:DB_NAME="curso_modulo_6"
$env:PORT="3013"
```

Tambien se puede usar `DATABASE_URL`.

## Ejecutar

```powershell
npm start
```

Abrir:

```text
http://127.0.0.1:3013
```

## Endpoints

- `GET /api/productos`
- `GET /api/productos/:id`
- `POST /api/productos`
- `PUT /api/productos/:id`
- `DELETE /api/productos/:id`

Ejemplo POST:

```json
{
  "nombre": "Audifonos USB",
  "precio": 19990,
  "stock": 10
}
```

## SQL opcional

Sequelize crea la tabla con `sequelize.sync()`. Tambien se incluye `sql/init.sql` como referencia.

## Pruebas

```powershell
npm test
```
