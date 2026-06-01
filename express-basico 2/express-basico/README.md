# Express.js Básico - Ejercicio Paso a Paso

## ¿Qué vamos a construir?

Una **API REST de Tareas (To-Do)** con las operaciones CRUD completas:
- **C**reate → POST /tareas
- **R**ead → GET /tareas y GET /tareas/:id
- **U**pdate → PUT /tareas/:id
- **D**elete → DELETE /tareas/:id

---

## Requisitos Previos

- **Node.js** versión 18 o superior → [https://nodejs.org](https://nodejs.org)
- Un editor de código (VS Code recomendado)
- Postman, Thunder Client, o simplemente el navegador para probar

Para verificar que tienes Node instalado:
```bash
node -v
npm -v
```

---

## Paso 1: Instalar dependencias

```bash
npm install
```

Esto descarga Express y lo coloca en la carpeta `node_modules/`.

---

## Paso 2: Ejecutar el servidor

```bash
npm start
```

O en **modo desarrollo** (se reinicia solo cuando guardas cambios):
```bash
npm run dev
```

Deberías ver:
```
======================================
  Servidor corriendo en:
  http://localhost:3000
======================================
```

---

## Paso 3: Probar los endpoints

### Desde el navegador:
- Abre http://localhost:3000 → Verás el mensaje de bienvenida
- Abre http://localhost:3000/tareas → Verás la lista de tareas

### Desde Postman o Thunder Client:

**Obtener todas las tareas:**
```
GET http://localhost:3000/tareas
```

**Obtener una tarea específica:**
```
GET http://localhost:3000/tareas/1
```

**Crear una tarea nueva:**
```
POST http://localhost:3000/tareas
Content-Type: application/json

{
  "titulo": "Mi nueva tarea"
}
```

**Actualizar una tarea:**
```
PUT http://localhost:3000/tareas/1
Content-Type: application/json

{
  "titulo": "Tarea actualizada",
  "completada": true
}
```

**Eliminar una tarea:**
```
DELETE http://localhost:3000/tareas/3
```

---

## Estructura del proyecto

```
express-basico/
├── index.js        ← Código del servidor (todo comentado paso a paso)
├── package.json    ← Dependencias y scripts
└── README.md       ← Este archivo
```

---

## Conceptos clave que aprenderás

| Concepto | Descripción |
|----------|-------------|
| `express()` | Crea la aplicación |
| `app.get()` | Define rutas GET |
| `app.post()` | Define rutas POST |
| `app.put()` | Define rutas PUT |
| `app.delete()` | Define rutas DELETE |
| `req.params` | Parámetros de la URL (`:id`) |
| `req.body` | Datos enviados en el body |
| `res.json()` | Responde con JSON |
| `res.status()` | Define el código HTTP |
| `app.use()` | Registra middleware |
| `app.listen()` | Inicia el servidor |

---

## Ejercicios extra para practicar

1. Agrega un campo `prioridad` (alta, media, baja) a las tareas
2. Crea un endpoint `GET /tareas/completadas` que filtre solo las completadas
3. Agrega validación para que no se repitan títulos
4. Sirve un archivo HTML estático con `express.static`
