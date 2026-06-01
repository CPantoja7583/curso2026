# Evaluacion Final Modulo 6 - Registro Civil de Mascotas

Servicio web en Node para registrar mascotas y el RUT de su dueno en un archivo JSON. Incluye frontend funcional con Axios.

## Instalacion

No requiere dependencias de npm para el backend.

## Ejecucion

```powershell
npm start
```

Por defecto se levanta en:

```text
http://127.0.0.1:3007
```

Puedes cambiar el puerto con `PORT`.

## API

- `GET /api/mascotas`: retorna todas las mascotas.
- `GET /api/mascotas?nombre=Luna`: retorna las mascotas con ese nombre.
- `GET /api/mascotas?rut=11111111-1`: retorna todas las mascotas asociadas a ese RUT.
- `POST /api/mascotas`: inserta una mascota.
- `DELETE /api/mascotas?nombre=Luna`: elimina la mascota con ese nombre.
- `DELETE /api/mascotas?rut=11111111-1`: elimina todas las mascotas asociadas a ese RUT.

Ejemplo de cuerpo para `POST`:

```json
{
  "nombre": "Luna",
  "rut": "11111111-1"
}
```

Los registros se guardan en `mascotas.json`.
