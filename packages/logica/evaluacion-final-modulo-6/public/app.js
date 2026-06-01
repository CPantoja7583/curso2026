const resultNode = document.getElementById("result");
const statusNode = document.getElementById("status");
const createForm = document.getElementById("create-form");

function setStatus(message) {
  statusNode.textContent = message;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderMessage(className, message) {
  resultNode.innerHTML = `<div class="${className}">${escapeHtml(message)}</div>`;
}

function renderMascotas(mascotas) {
  if (!mascotas.length) {
    renderMessage("empty-box", "No se encontraron mascotas.");
    return;
  }

  resultNode.innerHTML = mascotas.map((mascota) => `
    <article class="pet-card">
      <span class="pet-mark">${escapeHtml(mascota.nombre.charAt(0).toUpperCase())}</span>
      <div>
        <h3>${escapeHtml(mascota.nombre)}</h3>
        <p>RUT dueno: ${escapeHtml(mascota.rut)}</p>
      </div>
    </article>
  `).join("");
}

function getErrorMessage(error) {
  return error.response?.data?.error || error.message || "La operacion fallo.";
}

async function loadMascotas(params = {}) {
  try {
    setStatus("Consultando registros...");
    const response = await axios.get("/api/mascotas", { params });
    renderMascotas(response.data);
    setStatus(`Registros encontrados: ${response.data.length}.`);
  } catch (error) {
    renderMessage("error-box", getErrorMessage(error));
    setStatus("No se pudo completar la consulta.");
  }
}

async function deleteMascotas(params) {
  try {
    setStatus("Eliminando registros...");
    const response = await axios.delete("/api/mascotas", { params });
    renderMessage("success-box", response.data.mensaje);
    setStatus("Eliminacion realizada.");
    await loadMascotas();
  } catch (error) {
    renderMessage("error-box", getErrorMessage(error));
    setStatus("No se pudo eliminar.");
  }
}

createForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const rut = document.getElementById("rut").value.trim();

  try {
    setStatus("Guardando mascota...");
    const response = await axios.post("/api/mascotas", { nombre, rut });
    renderMascotas([response.data]);
    setStatus(`Mascota registrada: ${response.data.nombre}.`);
    createForm.reset();
  } catch (error) {
    renderMessage("error-box", getErrorMessage(error));
    setStatus("No se pudo registrar la mascota.");
  }
});

document.getElementById("load-all").addEventListener("click", () => loadMascotas());

document.getElementById("search-name-button").addEventListener("click", () => {
  loadMascotas({ nombre: document.getElementById("search-name").value.trim() });
});

document.getElementById("search-rut-button").addEventListener("click", () => {
  loadMascotas({ rut: document.getElementById("search-rut").value.trim() });
});

document.getElementById("delete-name-button").addEventListener("click", () => {
  deleteMascotas({ nombre: document.getElementById("delete-name").value.trim() });
});

document.getElementById("delete-rut-button").addEventListener("click", () => {
  deleteMascotas({ rut: document.getElementById("delete-rut").value.trim() });
});

loadMascotas();
