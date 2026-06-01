const statusNode = document.getElementById("status");
const finanzasNode = document.getElementById("finanzas-result");
const clientesNode = document.getElementById("clientes-result");

function setStatus(message) {
  statusNode.textContent = message;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function money(value) {
  return Number(value).toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0
  });
}

function renderMessage(node, className, message) {
  node.innerHTML = `<div class="${className}">${escapeHtml(message)}</div>`;
}

function renderFinanzas(rows) {
  if (!rows.length) {
    renderMessage(finanzasNode, "empty", "No hay registros en finanzas_personales.");
    return;
  }

  const body = rows.map((item) => `
    <tr>
      <td>${escapeHtml(item.descripcion)}</td>
      <td>${escapeHtml(item.categoria)}</td>
      <td>${money(item.monto)}</td>
      <td>${escapeHtml(item.fecha)}</td>
    </tr>
  `).join("");

  finanzasNode.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Descripcion</th>
          <th>Categoria</th>
          <th>Monto</th>
          <th>Fecha</th>
        </tr>
      </thead>
      <tbody>${body}</tbody>
    </table>
  `;
}

function renderClientes(rows) {
  if (!rows.length) {
    renderMessage(clientesNode, "empty", "No hay registros en clientes.");
    return;
  }

  clientesNode.innerHTML = `
    <ul class="client-list">
      ${rows.map((cliente) => `
        <li>
          <strong>${escapeHtml(cliente.nombre)}</strong>
          <span>${escapeHtml(cliente.email)}</span>
          <small>${escapeHtml(cliente.telefono)}</small>
        </li>
      `).join("")}
    </ul>
  `;
}

async function requestJson(url) {
  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "La consulta fallo.");
  }

  return data;
}

async function loadFinanzas() {
  try {
    setStatus("Consultando /finanzas...");
    const rows = await requestJson("/finanzas");
    renderFinanzas(rows);
    setStatus(`Finanzas cargadas: ${rows.length} registros.`);
  } catch (error) {
    renderMessage(finanzasNode, "error", error.message);
    setStatus("No se pudieron cargar las finanzas.");
  }
}

async function loadClientes() {
  try {
    setStatus("Consultando /clientes...");
    const rows = await requestJson("/clientes");
    renderClientes(rows);
    setStatus(`Clientes cargados: ${rows.length} registros.`);
  } catch (error) {
    renderMessage(clientesNode, "error", error.message);
    setStatus("No se pudieron cargar los clientes.");
  }
}

document.getElementById("load-finanzas").addEventListener("click", loadFinanzas);
document.getElementById("load-clientes").addEventListener("click", loadClientes);

loadFinanzas();
loadClientes();
