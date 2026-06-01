Introducción / Objetivo
Desarrollar una aplicación web con Node.js + Express y Sequelize (ORM) sobre PostgreSQL, modelando la relación muchos a muchos entre Películas y Actores mediante una tabla intermedia. El objetivo es definir modelos y asociaciones, sincronizar la base, y realizar operaciones de creación y consulta, incluyendo una asignación transaccional.

Descripción de la actividad
Modelos y relaciones

Película: id, titulo, año

Actor: id, nombre, fecha_nacimiento

Relación N–N: PeliculasActores (tabla intermedia)

API Backend (Express + Sequelize)

GET /peliculas → lista todas las películas con sus actores.

POST /peliculas → crea una película (opcional: asignar actores por ids).

GET /actores → lista todos los actores con sus películas.

POST /actores → crea un actor.

POST /asignar-actor → asigna un actor a una película usando transacción (la creación del vínculo y cualquier operación relacionada deben confirmarse juntas).

Frontend (HTML + JS)

Página con:

Lista de películas y actores.

Formulario para crear película o actor.

Formulario para asignar actor a película (envía a /asignar-actor).

Comunicación mediante fetch() a la API.

Guías técnicas sugeridas (opcionales)
Asociaciones N–N en Sequelize (nombres de tabla en snake_case):

import { Sequelize, DataTypes } from 'sequelize';
const sequelize = new Sequelize('postgres://user:pass@localhost:5432/m7');

const Pelicula = sequelize.define('Pelicula', {
id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
titulo: { type: DataTypes.STRING(150), allowNull: false },
anio: { type: DataTypes.INTEGER, allowNull: false } // usa 'anio' en nombre de columna
}, { tableName: 'peliculas', timestamps: false });

const Actor = sequelize.define('Actor', {
id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
nombre: { type: DataTypes.STRING(120), allowNull: false },
fecha_nacimiento: { type: DataTypes.DATEONLY, allowNull: false }
}, { tableName: 'actores', timestamps: false });

const PeliculasActores = sequelize.define('PeliculasActores', {}, {
tableName: 'peliculas_actores', timestamps: false
});

Pelicula.belongsToMany(Actor, { through: PeliculasActores, foreignKey: 'pelicula_id', otherKey: 'actor_id' });
Actor.belongsToMany(Pelicula, { through: PeliculasActores, foreignKey: 'actor_id', otherKey: 'pelicula_id' });
Listar con relaciones (incluye asociados):

// GET /peliculas
Pelicula.findAll({ include: { model: Actor, through: { attributes: [] } } });
// GET /actores
Actor.findAll({ include: { model: Pelicula, through: { attributes: [] } } });
Asignar actor a película con transacción:

// POST /asignar-actor { pelicula_id, actor_id }
await sequelize.transaction(async (t) => {
await PeliculasActores.create({ pelicula_id, actor_id }, { transaction: t });
// aquí podrías hacer más operaciones relacionadas dentro de la misma transacción
});
Notas útiles: usar express.json() para JSON; habilitar CORS si el front corre en otro origen; normalizar nombres de tablas/columnas a minúsculas con guion bajo (peliculas, actores, peliculas_actores).

Forma de entrega
Sube un .zip con:

Backend (Express + Sequelize) y Frontend (HTML/JS).

Archivo de instrucciones para ejecutar (npm install, npm start) y credenciales/DB de conexión.

Pantallazos que evidencien:

Listado de películas con actores (GET /peliculas),

Creación de película/actor (POST),

Asignación exitosa de actor a película (POST /asignar-actor).
