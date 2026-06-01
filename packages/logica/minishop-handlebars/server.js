const path = require("node:path");
const express = require("express");
const { engine } = require("express-handlebars");

const app = express();
const PORT = Number(process.env.PORT) || 3003;

const tienda = "MiniShop";
const mensajeBienvenida = "Descubre productos seleccionados con una vitrina simple, dinamica y hecha con Handlebars.";
const productos = [
  {
    nombre: "Camiseta Basica",
    precio: 15,
    disponible: true,
    imagen: "https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=600"
  },
  {
    nombre: "Pantalon Jeans",
    precio: 30,
    disponible: false,
    imagen: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600"
  },
  {
    nombre: "Zapatos Deportivos",
    precio: 50,
    disponible: true,
    imagen: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"
  },
  {
    nombre: "Chaqueta de Cuero",
    precio: 80,
    disponible: true,
    imagen: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600"
  },
  {
    nombre: "Gorra Clasica",
    precio: 12,
    disponible: true,
    imagen: "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600"
  },
  {
    nombre: "Bolso de Mano",
    precio: 45,
    disponible: false,
    imagen: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600"
  },
  {
    nombre: "Reloj Digital",
    precio: 60,
    disponible: true,
    imagen: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"
  },
  {
    nombre: "Bufanda de Lana",
    precio: 18,
    disponible: true,
    imagen: "https://images.unsplash.com/photo-1601924638867-3ec3c0a3d5f5?w=600"
  },
  {
    nombre: "Sudadera Hoodie",
    precio: 35,
    disponible: false,
    imagen: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600"
  },
  {
    nombre: "Gafas de Sol",
    precio: 25,
    disponible: true,
    imagen: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600"
  }
];

app.engine("handlebars", engine({
  defaultLayout: "main",
  helpers: {
    mayusculas: (value) => String(value).toUpperCase()
  }
}));

app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (_request, response) => {
  response.render("home", {
    titulo: "Inicio",
    tienda,
    mensajeBienvenida,
    productos
  });
});

app.get("/about", (_request, response) => {
  response.render("about", {
    titulo: "About",
    tienda
  });
});

app.get("/contact", (_request, response) => {
  response.render("contact", {
    titulo: "Contacto",
    tienda
  });
});

app.post("/contact", (request, response) => {
  const nombre = request.body.nombre?.trim();
  const email = request.body.email?.trim();
  const mensaje = request.body.mensaje?.trim();

  if (!nombre || !email || !mensaje) {
    response.status(400).render("contact", {
      titulo: "Contacto",
      tienda,
      error: "Debes completar nombre, email y mensaje.",
      valores: { nombre, email, mensaje }
    });
    return;
  }

  response.status(200).render("success", {
    titulo: "Mensaje enviado",
    tienda,
    nombre
  });
});

["/", "/about", "/contact"].forEach((route) => {
  app.all(route, (request, response, next) => {
    const allowed = route === "/contact" ? ["GET", "POST"] : ["GET"];
    if (allowed.includes(request.method)) {
      next();
      return;
    }

    response.status(405).send("Método no permitido");
  });
});

app.use((_request, response) => {
  response.status(404).send("Ruta no encontrada");
});

app.listen(PORT, () => {
  console.log(`MiniShop disponible en http://127.0.0.1:${PORT}`);
});
