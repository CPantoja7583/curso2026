// ============================================
// CONTROLADOR: personasController.js
// ============================================
// Recibe req, llama al modelo, renderiza la vista.
// NO tiene queries SQL. NO arma HTML a mano.

const personasModel = require("../models/personasModel");

// GET /personas — mostrar lista
async function listar(req, res) {
  const personas = await personasModel.obtenerTodas();
  res.render("personas", {
    titulo: "Lista de personas",
    personas
  });
}

// GET /personas/nuevo — mostrar formulario
function formularioNuevo(req, res) {
  res.render("nuevo", { titulo: "Nueva persona" });
}

// POST /personas — crear persona
async function crear(req, res) {
  const { nombres, apellidos, edad } = req.body;

  // Validación: si faltan datos, volvemos al form con error
  if (!nombres || !apellidos) {
    return res.status(400).render("nuevo", {
      titulo: "Nueva persona",
      error: "Nombres y apellidos son obligatorios"
    });
  }

  await personasModel.crear({
    nombres,
    apellidos,
    edad: edad ? parseInt(edad) : null
  });

  res.redirect("/personas");
}

// DELETE /personas — mostrar lista
async function eliminarPersonas(req, res) {
  const personas = await personasModel.eliminarPersonas();
  res.redirect("/personas");
}

module.exports = { listar, formularioNuevo, crear, eliminarPersonas };
