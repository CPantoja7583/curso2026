# Actividad - Autenticacion y Autorizacion con JWT en Express

Servicio REST en Node.js + Express con autenticacion mediante JWT, middleware de proteccion y frontend basico para login, perfil y acceso denegado.

## Stack

- Express
- jsonwebtoken
- bcryptjs
- dotenv
- usuarios en `usuarios.json`

## Instalacion

```powershell
npm install
```

## Configuracion

Crear `.env` a partir de `.env.example`:

```powershell
copy .env.example .env
```

Variables:

```env
PORT=3000
JWT_SECRET=super_clave_ultra_secreta
JWT_EXPIRES=15m
```

## Ejecutar

```powershell
npm run dev
```

o

```powershell
npm start
```

Abrir:

```text
http://localhost:3000
```

## Endpoints

- `POST /auth/register`
- `POST /auth/login`
- `GET /api/perfil` protegida por `Authorization: Bearer <token>`

## Usuario demo

```json
{
  "email": "demo@mail.com",
  "password": "123456"
}
```

## Ejemplos cURL

```bash
curl -X POST http://localhost:3000/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"demo@mail.com\",\"password\":\"123456\"}"
```

```bash
curl http://localhost:3000/api/perfil ^
  -H "Authorization: Bearer TU_TOKEN"
```

## Archivos incluidos

- `index.js`
- `middlewares/auth.js`
- `.env.example`
- `usuarios.json`
- `public/`

## Pruebas

```powershell
npm test
```
