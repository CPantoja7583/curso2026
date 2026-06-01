# Relaciones N-N con Sequelize: Peliculas, Actores y asignacion con transaccion

Aplicacion full stack con Node.js, Express, Sequelize y PostgreSQL para modelar una relacion muchos a muchos entre peliculas y actores.

## Requisitos

- Node.js 18 o superior.
- PostgreSQL.
- Base de datos creada, por ejemplo `m7`.

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
$env:DB_NAME="m7"
$env:PORT="3015"
```

Tambien se acepta `DB_PASSWORD` o `DATABASE_URL`.

## Ejecutar

```powershell
npm start
```

Abrir:

```text
http://127.0.0.1:3015
```

## Endpoints

- `GET /peliculas`: lista peliculas con actores.
- `POST /peliculas`: crea pelicula con `titulo` y `anio`. Opcional: `actores_ids`.
- `GET /actores`: lista actores con peliculas.
- `POST /actores`: crea actor con `nombre` y `fecha_nacimiento`.
- `POST /asignar-actor`: asigna actor a pelicula con transaccion.

Ejemplo de asignacion:

```json
{
  "pelicula_id": 1,
  "actor_id": 1
}
```

## Modelo

- `peliculas`: `id`, `titulo`, `anio`
- `actores`: `id`, `nombre`, `fecha_nacimiento`
- `peliculas_actores`: `pelicula_id`, `actor_id`

La asociacion se define con `belongsToMany` en ambos sentidos.

## Pruebas

```powershell
npm test
```
