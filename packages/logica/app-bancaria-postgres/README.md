# App Bancaria PostgreSQL

Proyecto de curso con arquitectura separada:

- `backend`: API REST con Express, PostgreSQL, JWT, refresh token y Swagger.
- `frontend`: SPA en Vite con sitio publico, area usuario, area admin y base WCAG 2.1 AA practica.

## Requisitos

- Node.js 22+
- Docker Desktop

## Arranque rapido

```bash
npm install
npm run db:up
npm run db:init
npm run dev
```

## URLs

- Frontend: `http://127.0.0.1:5174`
- Backend: `http://127.0.0.1:4000`
- Swagger: `http://127.0.0.1:4000/docs`

## Credenciales semilla

- Admin
  - Email: `admin@aurora-bank.cl`
  - Password: `Admin1234!`
- Usuario demo 1
  - Email: `lucia@aurora-bank.cl`
  - Password: `User1234!`
- Usuario demo 2
  - Email: `martin@aurora-bank.cl`
  - Password: `User1234!`

## Scripts utiles

```bash
npm run dev
npm run test
npm run build
npm run db:logs
npm run db:down
```

## Notas

- El backend crea esquema y datos semilla de forma idempotente.
- Las transferencias usan transacciones reales en PostgreSQL.
- El frontend usa `JWT + refresh token` y reintento automatico cuando expira el access token.
