const resultNode = document.getElementById("result");
const statusNode = document.getElementById("status");
const sortNode = document.getElementById("sort-by");

let currentType = null;
let currentItems = [];

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
  resultNode.innerHTML = `<div class="${className}">${message}</div>`;
}

function sortItems(items, sortBy, type) {
  const sorted = [...items];

  if (sortBy === "anioEstreno") {
    sorted.sort((left, right) => left.anioEstreno - right.anioEstreno);
    return sorted;
  }

  if (sortBy === "director" && type === "peliculas") {
    sorted.sort((left, right) => left.director.localeCompare(right.director));
    return sorted;
  }

  if (sortBy === "numeroTemporadas" && type === "series") {
    sorted.sort((left, right) => left.numeroTemporadas - right.numeroTemporadas);
    return sorted;
  }

  sorted.sort((left, right) => left.nombre.localeCompare(right.nombre));
  return sorted;
}

function renderItems(items, type, banner = "") {
  if (!items.length) {
    renderMessage("empty", "No hay registros disponibles.");
    return;
  }

  const sortedItems = sortItems(items, sortNode.value, type);
  const bannerHtml = banner ? `<div class="success-box">${banner}</div>` : "";

  const cards = sortedItems.map((item) => {
    const details = type === "peliculas"
      ? `
          <p><strong>Director:</strong> ${escapeHtml(item.director)}</p>
          <p><strong>Año:</strong> ${escapeHtml(item.anioEstreno)}</p>
        `
      : `
          <p><strong>Año:</strong> ${escapeHtml(item.anioEstreno)}</p>
          <p><strong>Temporadas:</strong> ${escapeHtml(item.numeroTemporadas)}</p>
        `;

    return `
      <article class="card">
        <span class="pill">${type === "peliculas" ? "Película" : "Serie"}</span>
        <h3>${escapeHtml(item.nombre)}</h3>
        ${details}
      </article>
    `;
  }).join("");

  resultNode.innerHTML = `${bannerHtml}<div class="grid">${cards}</div>`;
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "La operacion fallo.");
  }

  return data;
}

async function loadCatalog(type) {
  try {
    currentType = type;
    setStatus(`Cargando ${type}...`);
    currentItems = await requestJson(`/api/catalogo?tipo=${encodeURIComponent(type)}`);
    renderItems(currentItems, type);
    setStatus(`Listado de ${type} cargado.`);
  } catch (error) {
    renderMessage("error-box", error.message);
    setStatus("No se pudo cargar el catálogo.");
  }
}

document.getElementById("load-movies").addEventListener("click", () => loadCatalog("peliculas"));
document.getElementById("load-series").addEventListener("click", () => loadCatalog("series"));

sortNode.addEventListener("change", () => {
  if (currentType) {
    renderItems(currentItems, currentType);
    setStatus(`Listado ordenado por ${sortNode.value}.`);
  }
});

document.getElementById("movie-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    tipo: "peliculas",
    nombre: document.getElementById("movie-name").value.trim(),
    director: document.getElementById("movie-director").value.trim(),
    anioEstreno: Number(document.getElementById("movie-year").value)
  };

  try {
    setStatus("Agregando película...");
    const created = await requestJson("/api/catalogo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (currentType === "peliculas") {
      currentItems.push(created);
      renderItems(currentItems, "peliculas", `Película agregada: ${escapeHtml(created.nombre)}.`);
    } else {
      renderMessage("success-box", `Película agregada: ${escapeHtml(created.nombre)}.`);
    }

    event.target.reset();
    setStatus("Película creada correctamente.");
  } catch (error) {
    renderMessage("error-box", error.message);
    setStatus("No se pudo agregar la película.");
  }
});

document.getElementById("series-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    tipo: "series",
    nombre: document.getElementById("series-name").value.trim(),
    anioEstreno: Number(document.getElementById("series-year").value),
    numeroTemporadas: Number(document.getElementById("series-seasons").value)
  };

  try {
    setStatus("Agregando serie...");
    const created = await requestJson("/api/catalogo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (currentType === "series") {
      currentItems.push(created);
      renderItems(currentItems, "series", `Serie agregada: ${escapeHtml(created.nombre)}.`);
    } else {
      renderMessage("success-box", `Serie agregada: ${escapeHtml(created.nombre)}.`);
    }

    event.target.reset();
    setStatus("Serie creada correctamente.");
  } catch (error) {
    renderMessage("error-box", error.message);
    setStatus("No se pudo agregar la serie.");
  }
});

document.getElementById("delete-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const type = document.getElementById("delete-type").value;
  const nombre = document.getElementById("delete-name").value.trim();

  try {
    setStatus("Eliminando registro...");
    const response = await requestJson(`/api/catalogo?tipo=${encodeURIComponent(type)}&nombre=${encodeURIComponent(nombre)}`, {
      method: "DELETE"
    });

    if (currentType === type) {
      currentItems = currentItems.filter((item) => item.nombre.toLowerCase() !== nombre.toLowerCase());
      renderItems(currentItems, type, response.mensaje);
    } else {
      renderMessage("success-box", response.mensaje);
    }

    event.target.reset();
    setStatus("Registro eliminado correctamente.");
  } catch (error) {
    renderMessage("error-box", error.message);
    setStatus("No se pudo eliminar el registro.");
  }
});

renderMessage("empty", "Presiona LISTA DE PELÍCULAS o LISTA DE SERIES para cargar el catálogo.");
