// ============================================
// RUTAS: personas.js
// ============================================
// Mapea URLs a funciones del controlador. Nada más.

const express = require("express");
const router = express.Router();
const controller = require("../controllers/personasController");

router.get("/",       controller.listar);
router.get("/nuevo",  controller.formularioNuevo);
router.post("/",      controller.crear);
router.delete("/personas", controller.eliminarPersonas);

module.exports = router;
