Introducción / Objetivo
Construir una aplicación full stack con Node.js + Express y Sequelize (ORM) conectada a PostgreSQL, exponiendo una API REST sencilla y un frontend que la consuma. El objetivo es definir un modelo, sincronizar la base de datos, implementar GET/POST y operar desde un HTML con fetch().

Descripción de la actividad
PARTE 1 — Backend (Node.js, Express y Sequelize)

Configurar un servidor en Node.js usando Express.

Conectar a PostgreSQL utilizando Sequelize.

Crear una BD (p. ej., clientes_db).

Configurar Sequelize para conectarse a esa BD.

Definir un modelo (p. ej., Cliente con campos nombre, email).

Implementar rutas:

GET /clientes: devuelve todos los registros.

POST /clientes: inserta un cliente (recibe nombre y email en el body).

Sincronizar la base con Sequelize para crear la tabla si no existe.

El servidor debe correr en el puerto 3000.

PARTE 2 — Frontend (HTML + JavaScript)

Crear una interfaz simple que se comunique con el backend.

Debe incluir:

Botón para obtener y mostrar la lista (consume GET /clientes).

Formulario con nombre y email + botón para agregar (hace POST /clientes).

Usar fetch() para realizar las peticiones.

Guías técnicas sugeridas (opcionales)
Inicialización mínima de Sequelize y modelo:

import express from 'express';
import cors from 'cors';
import { Sequelize, DataTypes } from 'sequelize';

const sequelize = new Sequelize('clientes_db', 'usuario', 'password', {
host: 'localhost',
dialect: 'postgres',
});

const Cliente = sequelize.define('Cliente', {
id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
nombre: { type: DataTypes.STRING(100), allowNull: false },
email: { type: DataTypes.STRING(120), allowNull: false, unique: true },
}, { tableName: 'clientes', timestamps: false });

const app = express();
app.use(cors());
app.use(express.json());

app.get('/clientes', async (\_req, res) => {
const rows = await Cliente.findAll();
res.json(rows);
});

app.post('/clientes', async (req, res) => {
try {
const { nombre, email } = req.body;
const creado = await Cliente.create({ nombre, email });
res.status(201).json(creado);
} catch (e) {
res.status(400).json({ ok: false, mensaje: e.message });
}
});

(async () => {
await sequelize.authenticate();
await sequelize.sync(); // crea la tabla si no existe
app.listen(3000, () => console.log('API en http://localhost:3000'));
})();
Frontend (esqueleto básico de fetch GET/POST):

<button id="listar">Listar clientes</button>

<ul id="lista"></ul>

<form id="form">
  <input name="nombre" placeholder="Nombre" required />
  <input name="email" placeholder="Email" type="email" required />
  <button>Agregar</button>
</form>

<script>
const API = 'http://localhost:3000/clientes';
const ul = document.getElementById('lista');

document.getElementById('listar').onclick = async () => {
  const r = await fetch(API); const data = await r.json();
  ul.innerHTML = data.map(c => `<li>${c.nombre} — ${c.email}</li>`).join('');
};

document.getElementById('form').onsubmit = async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const body = { nombre: fd.get('nombre'), email: fd.get('email') };
  const r = await fetch(API, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
  if (r.ok) { e.target.reset(); alert('Cliente creado'); }
  else { const err = await r.json(); alert(err.mensaje || 'Error'); }
};
</script>

Configuración recomendada: usar variables de entorno (DB_USER, DB_PASS, DB_HOST, DB_NAME) y express.json() para JSON. Habilitar CORS si el frontend corre en otro origen.

Forma de entrega
Sube un .zip con:

Código fuente del backend (Express + Sequelize).

HTML/JS del frontend.

Instrucciones para ejecutar: npm install, npm start y pasos para configurar la BD (credenciales y nombre de BD).
