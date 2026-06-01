# Subida de imagenes con Express + Multer

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
http://127.0.0.1:3008
```

## Estructura

- `server.js`
- `public/`
- `uploads/`

## Funcionamiento

- `POST /upload`
- campo esperado: `foto`
- tipos permitidos: `jpg`, `jpeg`, `png`, `gif`
- tamano maximo: `5 MB`
- nombre de archivo unico usando fecha y numero aleatorio

## Respuestas

Exito:

```json
{
  "ok": true,
  "mensaje": "Imagen subida correctamente.",
  "archivo": "1710000000000-123456789.png",
  "ruta": "/uploads/1710000000000-123456789.png"
}
```

Error:

```json
{
  "ok": false,
  "mensaje": "detalle"
}
```

## Validaciones

- no se acepta un archivo vacio
- no se aceptan archivos que no sean imagen valida
- no se aceptan archivos sobre 5 MB
- la validacion real se hace en el backend

## Pruebas rapidas

### Desde navegador

Abre:

```text
http://127.0.0.1:3008
```

### Desde curl

```bash
curl -F "foto=@./imagen.png" http://127.0.0.1:3008/upload
```

## Pruebas automatizadas

```bash
npm test
```

Las pruebas validan:

- subida correcta de imagen PNG
- rechazo de archivo de texto
- rechazo de imagen mayor a 5 MB
