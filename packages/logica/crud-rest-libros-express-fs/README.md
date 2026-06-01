# CRUD REST con Express y File System: Catalogo de Libros

## Ejecutar

```bash
npm install
npm run dev
```

Si prefieres modo normal:

```bash
npm start
```

El servidor queda disponible por defecto en:

```text
http://127.0.0.1:3007
```

## Archivo de datos

El catalogo se persiste en:

```text
catalogo.json
```

## Endpoints

- `GET /libros`
- `POST /libros`
- `PUT /libros/:id`
- `DELETE /libros/:id`

Todas las rutas responden JSON.

## Formato de respuestas

Exito:

```json
{ "ok": true, "data": [] }
```

Error:

```json
{ "ok": false, "mensaje": "detalle" }
```

## Ejemplos de prueba

### Listar libros

```bash
curl http://127.0.0.1:3007/libros
```

### Crear libro

```bash
curl -X POST http://127.0.0.1:3007/libros \
  -H "Content-Type: application/json" \
  -d "{\"titulo\":\"Rayuela\",\"autor\":\"Julio Cortazar\",\"anio\":1963}"
```

### Actualizar libro

```bash
curl -X PUT http://127.0.0.1:3007/libros/1 \
  -H "Content-Type: application/json" \
  -d "{\"titulo\":\"Cien anos de soledad\",\"autor\":\"G. G. Marquez\",\"anio\":1967}"
```

### Eliminar libro

```bash
curl -X DELETE http://127.0.0.1:3007/libros/2
```

## Validaciones incluidas

- `titulo` debe ser texto no vacio.
- `autor` debe ser texto no vacio.
- `anio` debe ser numero entero positivo.
- `id` debe existir para actualizar o eliminar.

## Pruebas automatizadas

```bash
npm test
```

Las pruebas levantan la API sobre un archivo temporal para no modificar el `catalogo.json` de entrega.
