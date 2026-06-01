const resultNode = document.getElementById("result");
const statusNode = document.getElementById("status");

function setStatus(message) {
  statusNode.textContent = message;
}

function value(id) {
  return document.getElementById(id).value.trim();
}

function escapeHtml(input) {
  return String(input ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildQuery(params) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, item]) => {
    if (item !== "") search.set(key, item);
  });
  const query = search.toString();
  return query ? `/clientes?${query}` : "/clientes";
}

function renderMessage(className, message) {
  resultNode.innerHTML = `<div class="${className}">${escapeHtml(message)}</div>`;
}

function renderClientes(payload) {
  const clientes = Array.isArray(payload) ? payload : payload.clientes || payload.eliminados || [];
  const banner = Array.isArray(payload) ? "" : payload.mensaje || "";

  if (!clientes.length) {
    renderMessage("empty", banner || "No hay clientes para mostrar.");
    return;
  }

  const rows = clientes.map((cliente) => `
    <tr>
      <td>${escapeHtml(cliente.rut)}</td>
      <td>${escapeHtml(cliente.nombre)}</td>
      <td>${escapeHtml(cliente.edad)}</td>
    </tr>
  `).join("");

  resultNode.innerHTML = `
    ${banner ? `<div class="success">${escapeHtml(banner)}</div>` : ""}
    <table>
      <thead>
        <tr>
          <th>RUT</th>
          <th>Nombre</th>
          <th>Edad</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.mensaje || "La operacion fallo.");
  }

  return data;
}

async function queryClientes(params = {}) {
  try {
    setStatus("Consultando clientes...");
    const data = await requestJson(buildQuery(params));
    renderClientes(data);
    const total = Array.isArray(data) ? data.length : (data.clientes || []).length;
    setStatus(`Consulta lista. Registros: ${total}.`);
  } catch (error) {
    renderMessage("error", error.message);
    setStatus("No se pudo consultar.");
  }
}

async function deleteClientes(params) {
  try {
    setStatus("Eliminando clientes...");
    const data = await requestJson(buildQuery(params), { method: "DELETE" });
    renderClientes(data);
    setStatus(data.mensaje || "Eliminacion completada.");
  } catch (error) {
    renderMessage("error", error.message);
    setStatus("No se pudo eliminar.");
  }
}

document.getElementById("query-all").addEventListener("click", () => queryClientes());
document.getElementById("query-rut").addEventListener("click", () => queryClientes({ rut: value("filter-rut") }));
document.getElementById("query-edad").addEventListener("click", () => queryClientes({ edad: value("filter-edad") }));
document.getElementById("query-range").addEventListener("click", () => queryClientes({
  edadMin: value("filter-edad-min"),
  edadMax: value("filter-edad-max")
}));
document.getElementById("query-name").addEventListener("click", () => queryClientes({ nombre: value("filter-nombre") }));

document.getElementById("create-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    setStatus("Creando cliente...");
    const data = await requestJson("/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rut: value("create-rut"),
        nombre: value("create-name"),
        edad: value("create-age")
      })
    });
    renderClientes([data]);
    setStatus("Cliente creado correctamente.");
    event.target.reset();
  } catch (error) {
    renderMessage("error", error.message);
    setStatus("No se pudo crear.");
  }
});

document.getElementById("update-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    setStatus("Modificando cliente...");
    const data = await requestJson(`/clientes/${encodeURIComponent(value("update-rut"))}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: value("update-name") })
    });
    renderClientes([data]);
    setStatus("Cliente modificado correctamente.");
    event.target.reset();
  } catch (error) {
    renderMessage("error", error.message);
    setStatus("No se pudo modificar.");
  }
});

document.getElementById("delete-rut-button").addEventListener("click", () => {
  deleteClientes({ rut: value("delete-rut") });
});

document.getElementById("delete-age-button").addEventListener("click", () => {
  deleteClientes({ edad: value("delete-age") });
});

document.getElementById("delete-range-button").addEventListener("click", () => {
  deleteClientes({
    edadMin: value("delete-age-min"),
    edadMax: value("delete-age-max")
  });
});

queryClientes();
