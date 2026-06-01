const mascotasModel = require("../models/mascotaModel");

// GET /mascotas — mostrar lista mascotas
async function listar(req, res) {
    const mascotas = await mascotasModel.obtenerTodas();
    res.render("mascotas", {
      titulo: "Lista de mascotas",
      mascotas
    });
  }

  module.exports = { listar};
