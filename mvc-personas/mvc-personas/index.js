// ============================================
// index.js — arranque del servidor
// ============================================
// Su único trabajo: configurar Express y montar las rutas.

const express = require("express");
const { engine } = require("express-handlebars");
const personasRouter = require("./routes/personas");
const mascotasRouter = require("./routes/mascotas");

const app = express();

// Configurar Handlebars
app.engine("hbs", engine({ extname: ".hbs", defaultLayout: "main" }));
app.set("view engine", "hbs");
app.set("views", "./views");

// Middlewares
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// Ruta raíz: redirige a /personas
//app.get("/", (req, res) => res.redirect("/personas"));

// Montar el router de personas con prefijo /personas
app.use("/personas", personasRouter);
app.use("/mascotas", mascotasRouter);

app.listen(3000, () => {
  console.log("Servidor en http://localhost:3000");
});
