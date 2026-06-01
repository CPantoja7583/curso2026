const API = "/clientes";
const listar = document.querySelector("#listar");
const lista = document.querySelector("#lista");
const form = document.querySelector("#form");
const mensaje = document.querySelector("#mensaje");
const jsonBox = document.querySelector("#jsonBox");

function setMensaje(text, type = "info") {
  mensaje.textContent = text;
  mensaje.dataset.type = type;
}

function mostrarJson(data, status) {
  jsonBox.textContent = JSON.stringify({ status, ...data }, null, 2);
}

function renderClientes(clientes) {
  if (!clientes.length) {
    lista.innerHTML = "<li>No hay clientes registrados.</li>";
    return;
  }

  lista.innerHTML = clientes.map((cliente) => `<li>${cliente.nombre} - ${cliente.email}</li>`).join("");
}

async function cargarClientes() {
  setMensaje("Cargando clientes...");
  const response = await fetch(API);
  const data = await response.json();
  mostrarJson(data, response.status);
  renderClientes(data.data || data);
  setMensaje("Clientes cargados.", "success");
}

listar.addEventListener("click", () => {
  cargarClientes().catch((error) => setMensaje(error.message, "error"));
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const fd = new FormData(form);
  const body = {
    nombre: fd.get("nombre"),
    email: fd.get("email"),
  };

  try {
    const response = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    mostrarJson(data, response.status);

    if (!response.ok) {
      setMensaje(data.mensaje || "Error al crear cliente.", "error");
      return;
    }

    form.reset();
    setMensaje(data.mensaje || "Cliente creado.", "success");
    await cargarClientes();
  } catch (error) {
    setMensaje(error.message, "error");
  }
});
