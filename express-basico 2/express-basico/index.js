const express = require("express");
const app = express();
const PUERTO = 3001;

// --- PASO 4: Middleware para leer JSON del body ---
app.use(express.json());

// ============================================
// PASO 6: Datos en memoria (simulan una BD)
// ============================================
let tareas = [
  { id: 1, titulo: "Aprender Express", completada: false },
  { id: 2, titulo: "Crear mi primera API", completada: false },
  { id: 3, titulo: "Practicar con Postman", completada: true },
];
let siguienteId = 4;

// ============================================
// PASO 7: Definir las rutas (endpoints)
// ============================================

// --- GET / --- Ruta raíz (página de bienvenida) ---
app.get("/", (req, res) => {
  res.json({
    mensaje: "¡Bienvenido a mi API de Tareas con Express!",
    rutas_disponibles: {
      "GET /tareas": "Obtener todas las tareas",
      "GET /tareas/:id": "Obtener una tarea por ID",
      "POST /tareas": "Crear una nueva tarea",
      "PUT /tareas/:id": "Actualizar una tarea",
      "DELETE /tareas/:id": "Eliminar una tarea",
    },
  });
});

// --- GET /tareas --- Obtener todas las tareas ---
app.get("/tareas", (req, res) => {
  res.json({
    total: tareas.length,
    tareas: tareas,
  });

});

// --- GET /tareas/:id --- Obtener una tarea por su ID ---
app.get("/tareas/:id", (req, res) => {
  // req.params.id viene como string, lo convertimos a número
  const id = parseInt(req.params.id);
  const tarea = tareas.find((t) => t.id === id);

  if (!tarea) {
    return res.status(404).json({ error: "Tarea no encontrada" });
  }

  res.json(tarea);
});

// --- POST /tareas --- Crear una nueva tarea ---
app.post("/tareas", (req, res) => {
  const { titulo } = req.body;

  // Validación básica
  if (!titulo || titulo.trim() === "") {
    return res.status(400).json({ error: "El campo 'titulo' es obligatorio" });
  }

  const nuevaTarea = {
    id: siguienteId++,
    titulo: titulo.trim(),
    completada: false,
  };

  tareas.push(nuevaTarea);

  // 201 = Created
  res.status(201).json({
    mensaje: "Tarea creada exitosamente",
    tarea: nuevaTarea,
  });
});

// --- PUT /tareas/:id --- Actualizar una tarea ---
app.put("/tareas/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const tarea = tareas.find((t) => t.id === id);

  if (!tarea) {
    return res.status(404).json({ error: "Tarea no encontrada" });
  }

  // Actualizar solo los campos que vengan en el body
  if (req.body.titulo !== undefined) {
    tarea.titulo = req.body.titulo.trim();
  }
  if (req.body.completada !== undefined) {
    tarea.completada = req.body.completada;
  }

  res.json({
    mensaje: "Tarea actualizada",
    tarea: tarea,
  });
});

// --- DELETE /tareas/:id --- Eliminar una tarea ---
app.delete("/tareas/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const indice = tareas.findIndex((t) => t.id === id);

  if (indice === -1) {
    return res.status(404).json({ error: "Tarea no encontrada" });
  }

  const eliminada = tareas.splice(indice, 1)[0];

  res.json({
    mensaje: "Tarea eliminada",
    tarea: eliminada,
  });
});

// ============================================
// PASO 8: Levantar el servidor
// ============================================
app.listen(PUERTO, () => {
  console.log(`\n======================================`);
  console.log(`  Servidor corriendo en:`);
  console.log(`  http://localhost:${PUERTO}`);
  console.log(`======================================\n`);
  console.log(`Prueba estas rutas en tu navegador o Postman:`);
  console.log(`  GET  http://localhost:${PUERTO}/`);
  console.log(`  GET  http://localhost:${PUERTO}/tareas`);
  console.log(`  GET  http://localhost:${PUERTO}/tareas/1`);
  console.log(`  POST http://localhost:${PUERTO}/tareas`);
  console.log(`  PUT  http://localhost:${PUERTO}/tareas/1`);
  console.log(`  DELETE http://localhost:${PUERTO}/tareas/1\n`);
});
