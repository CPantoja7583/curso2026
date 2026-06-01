const resultNode = document.getElementById("result");
const statusNode = document.getElementById("status");

function setStatus(message) {
  statusNode.textContent = message;
}

function renderEmpty(message) {
  resultNode.innerHTML = `<div class="empty">${message}</div>`;
}

function renderError(message) {
  resultNode.innerHTML = `<div class="error-box">${message}</div>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderTable(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    renderEmpty("No se encontraron resultados.");
    return;
  }

  const columns = Object.keys(rows[0]);
  const headers = columns.map((column) => `<th>${escapeHtml(column)}</th>`).join("");
  const body = rows.map((row) => {
    const cells = columns.map((column) => `<td>${escapeHtml(row[column] ?? "")}</td>`).join("");
    return `<tr>${cells}</tr>`;
  }).join("");

  resultNode.innerHTML = `
    <table>
      <thead><tr>${headers}</tr></thead>
      <tbody>${body}</tbody>
    </table>
  `;
}

function renderCards(items) {
  if (!Array.isArray(items) || items.length === 0) {
    renderEmpty("No se encontraron resultados.");
    return;
  }

  const cards = items.map((item) => {
    const content = Object.entries(item)
      .map(([key, value]) => `<p><strong>${escapeHtml(key)}:</strong> ${escapeHtml(value ?? "")}</p>`)
      .join("");

    return `<article class="card"><h3>Registro</h3>${content}</article>`;
  }).join("");

  resultNode.innerHTML = `<div class="cards">${cards}</div>`;
}

function renderSolitos(data) {
  resultNode.innerHTML = `
    <div class="cards">
      <article class="card">
        <h3>Conductores sin automóvil</h3>
        ${data.conductoresSinAutomovil.length
          ? data.conductoresSinAutomovil.map((item) => `<p><strong>${escapeHtml(item.nombre)}</strong> - ${escapeHtml(item.edad)} años</p>`).join("")
          : "<p>No hay conductores sin automóvil.</p>"}
      </article>
      <article class="card">
        <h3>Automóviles sin conductor</h3>
        ${data.automovilesSinConductor.length
          ? data.automovilesSinConductor.map((item) => `<p><strong>${escapeHtml(item.patente)}</strong> - ${escapeHtml(item.marca)} (${escapeHtml(item.nombre_conductor)})</p>`).join("")
          : "<p>No hay automóviles sin conductor.</p>"}
      </article>
    </div>
  `;
}

async function requestJson(url) {
  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Error al consultar la API.");
  }

  return data;
}

async function loadAction(action) {
  try {
    setStatus(`Consultando ${action}...`);

    if (action === "conductores") {
      renderTable(await requestJson("/conductores"));
      setStatus("Respuesta de GET /conductores");
      return;
    }

    if (action === "automoviles") {
      renderTable(await requestJson("/automoviles"));
      setStatus("Respuesta de GET /automoviles");
      return;
    }

    if (action === "solitos") {
      renderSolitos(await requestJson("/solitos"));
      setStatus("Respuesta de GET /solitos");
    }
  } catch (error) {
    renderError(error.message);
    setStatus("La consulta fallo.");
  }
}

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", () => loadAction(button.dataset.action));
});

document.getElementById("form-edad").addEventListener("submit", async (event) => {
  event.preventDefault();
  const edad = document.getElementById("edad").value.trim();

  try {
    setStatus(`Consultando conductores sin auto menores de ${edad}...`);
    renderTable(await requestJson(`/conductoressinauto?edad=${encodeURIComponent(edad)}`));
    setStatus("Respuesta de GET /conductoressinauto");
  } catch (error) {
    renderError(error.message);
    setStatus("La consulta fallo.");
  }
});

document.getElementById("form-patente").addEventListener("submit", async (event) => {
  event.preventDefault();
  const patente = document.getElementById("patente").value.trim();

  try {
    setStatus(`Consultando auto con patente ${patente}...`);
    renderCards([await requestJson(`/auto?patente=${encodeURIComponent(patente)}`)]);
    setStatus("Respuesta de GET /auto?patente=");
  } catch (error) {
    renderError(error.message);
    setStatus("La consulta fallo.");
  }
});

document.getElementById("form-inicio").addEventListener("submit", async (event) => {
  event.preventDefault();
  const inicio = document.getElementById("inicio").value.trim();

  try {
    setStatus(`Consultando autos cuya patente inicia con ${inicio}...`);
    renderCards(await requestJson(`/auto?iniciopatente=${encodeURIComponent(inicio)}`));
    setStatus("Respuesta de GET /auto?iniciopatente=");
  } catch (error) {
    renderError(error.message);
    setStatus("La consulta fallo.");
  }
});

renderEmpty("Selecciona una consulta para ver la respuesta del servidor.");
