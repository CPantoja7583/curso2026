# MVC Personas — Ejercicio mínimo

App simple para entender MVC con Node + Express + Handlebars + PostgreSQL.

Solo 2 endpoints útiles: **listar personas** y **crear una nueva**. Lo justo para ver la separación M / V / C funcionando.

## Estructura

```
mvc-personas/
├── index.js                      arranca el servidor
├── db.js                         conexión a PostgreSQL
├── package.json
├── .env.example
│
├── routes/
│   └── personas.js               qué URL atiende quién
│
├── controllers/
│   └── personasController.js     recibe req, llama al modelo, renderiza
│
├── models/
│   └── personasModel.js          habla con la BD (queries SQL aquí)
│
├── views/
│   ├── layouts/main.hbs          plantilla base con menú
│   ├── personas.hbs              tabla con la lista
│   └── nuevo.hbs                 formulario
│
├── public/
│   └── css/estilos.css           CSS
│
└── sql/init.sql                  crear la tabla con datos de ejemplo
```

## Cómo correr

```bash
npm install
cp .env.example .env
psql -U postgres -d postgres -f sql/init.sql
node index.js
```

Abre **http://localhost:3000**

## Los endpoints

| Método | URL | Hace |
|---|---|---|
| `GET`  | `/personas`        | Muestra la lista en tabla |
| `GET`  | `/personas/nuevo`  | Muestra el formulario |
| `POST` | `/personas`        | Crea una persona y redirige a la lista |

## El flujo

Cuando alguien entra a `/personas`:

```
1. Navegador → GET /personas
2. routes/personas.js → llama a controller.listar
3. controller.listar → llama a personasModel.obtenerTodas()
4. personasModel.obtenerTodas() → hace SELECT a la BD
5. El controlador recibe el arreglo y llama a res.render("personas", { personas })
6. La vista personas.hbs genera el HTML con la tabla
7. Navegador → ve la página
```

## Regla de oro

- **¿Una query SQL?** Va en `models/`. **Nunca** en el controlador.
- **¿Un `req` o `res`?** Va en el `controller`. **Nunca** en el modelo.
- **¿HTML?** Va en `views/`. **Nunca** dentro de un `res.send()`.
