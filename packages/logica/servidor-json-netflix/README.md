# Servidor web en Node - Catalogo Netflix JSON

## Ejecutar

```bash
npm start
```

Servidor:

```text
http://127.0.0.1:3004
```

## API

- `GET /api/catalogo?tipo=peliculas`
- `GET /api/catalogo?tipo=series`
- `POST /api/catalogo`
- `DELETE /api/catalogo?tipo=<peliculas|series>&nombre=<nombre>`

## Notas

- Las peliculas se leen desde `peliculas.txt`.
- Las series se leen desde `series.txt`.
- Solo se aceptan `GET`, `POST` y `DELETE` en la API.
