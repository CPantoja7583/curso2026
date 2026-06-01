# Servidor Web en Node (JSON) + Cliente REST Gestion de Productos

## Ejecutar

```bash
npm start
```

El servidor queda en:

```text
http://127.0.0.1:3002
```

## API

- `GET /api/productos`
- `POST /api/productos`

## Comportamiento

- Los productos se leen desde `productos.txt` usando `fs.promises`.
- Cada linea usa el formato `nombre, precio`.
- Solo `GET` y `POST` responden correctamente en la API.
- Otros metodos sobre `/api/productos` responden `405`.
