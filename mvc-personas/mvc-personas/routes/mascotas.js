// ============================================
// RUTAS: personas.js
// ============================================
// Mapea URLs a funciones del controlador. Nada más.

const express = require("express");
const router = express.Router();
const controller = require("../controllers/mascotasController");

router.get("/mascotas",controller.listar);

module.exports = router;
