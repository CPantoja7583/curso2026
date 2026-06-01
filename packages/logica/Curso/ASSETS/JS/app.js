const boton = document.getElementById("btn-arriba");

boton.addEventListener("click", function () {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
