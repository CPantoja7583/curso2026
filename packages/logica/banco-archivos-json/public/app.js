const resultNode = document.getElementById("result");
const statusNode = document.getElementById("status");
const bodyNode = document.body;
const sidebarNode = document.getElementById("sidebar");
const overlayNode = document.getElementById("sidebar-overlay");
const menuToggleNode = document.getElementById("menu-toggle");
const navLinks = Array.from(document.querySelectorAll(".nav-link"));
const panels = Array.from(document.querySelectorAll("[data-section-panel]"));
const jumpButtons = Array.from(document.querySelectorAll("[data-jump]"));
const summaryButtons = Array.from(document.querySelectorAll("[data-summary-view]"));

const totalClientsNode = document.getElementById("total-clients");
const totalAccountsNode = document.getElementById("total-accounts");
const onlyRutClientsNode = document.getElementById("only-rut-clients");
const onlySavingsClientsNode = document.getElementById("only-savings-clients");
const rutAndSavingsClientsNode = document.getElementById("rut-and-savings-clients");
const refreshSummaryButton = document.getElementById("refresh-summary");
const consultBannerNode = document.getElementById("consult-banner");

let clientsCache = [];

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

function renderClients(clients, banner = "") {
  if (!clients.length) {
    renderMessage("empty", "No hay clientes disponibles.");
    return;
  }

  const bannerHtml = banner ? `<div class="success-box">${banner}</div>` : "";
  const cards = clients.map((client) => `
    <article class="card">
      <span class="pill">Cliente #${escapeHtml(client.idCliente)}</span>
      <h3>${escapeHtml(client.nombre)}</h3>
      <p><strong>Cuenta RUT:</strong> ${client.cuentaRut ? `${escapeHtml(client.cuentaRut.numero)} ($${escapeHtml(client.cuentaRut.saldo)})` : "No tiene"}</p>
      <div>
        <strong>Cuentas ahorro:</strong>
        ${client.cuentasAhorro.length
          ? `<ul>${client.cuentasAhorro.map((account) => `<li>${escapeHtml(account.numero)} ($${escapeHtml(account.saldo)})</li>`).join("")}</ul>`
          : "<p>No tiene cuentas de ahorro.</p>"}
      </div>
    </article>
  `).join("");

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

function getClientGroups(clients) {
  return {
    totalClientes: clients,
    soloRut: clients.filter((client) => client.cuentaRut && client.cuentasAhorro.length === 0),
    soloAhorro: clients.filter((client) => !client.cuentaRut && client.cuentasAhorro.length > 0),
    rutYAhorro: clients.filter((client) => client.cuentaRut && client.cuentasAhorro.length > 0)
  };
}

function getTotalAccounts(clients) {
  return clients.reduce((total, client) => total + (client.cuentaRut ? 1 : 0) + client.cuentasAhorro.length, 0);
}

function setConsultBanner(message) {
  consultBannerNode.textContent = message;
}

function closeSidebar() {
  bodyNode.classList.remove("sidebar-open");
}

function openSidebar() {
  bodyNode.classList.add("sidebar-open");
}

function showSection(sectionName) {
  panels.forEach((panel) => {
    panel.classList.toggle("hidden", panel.dataset.sectionPanel !== sectionName);
  });

  navLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.section === sectionName);
  });

  if (window.innerWidth <= 920) {
    closeSidebar();
  }
}

async function loadSummary() {
  try {
    setStatus("Actualizando resumen general...");
    const clients = await requestJson("/api/clientes");
    clientsCache = clients;
    const groups = getClientGroups(clients);

    totalClientsNode.textContent = clients.length;
    totalAccountsNode.textContent = getTotalAccounts(clients);
    onlyRutClientsNode.textContent = groups.soloRut.length;
    onlySavingsClientsNode.textContent = groups.soloAhorro.length;
    rutAndSavingsClientsNode.textContent = groups.rutYAhorro.length;
    setStatus("Resumen actualizado correctamente.");
  } catch (error) {
    totalClientsNode.textContent = "--";
    totalAccountsNode.textContent = "--";
    onlyRutClientsNode.textContent = "--";
    onlySavingsClientsNode.textContent = "--";
    rutAndSavingsClientsNode.textContent = "--";
    renderMessage("error-box", error.message);
    setStatus("No se pudo actualizar el resumen.");
  }
}

async function loadAllClients() {
  try {
    showSection("consultar");
    setStatus("Cargando clientes...");
    const clients = await requestJson("/api/clientes");
    clientsCache = clients;
    setConsultBanner("Detalle completo de todos los clientes y sus cuentas.");
    renderClients(clients);
    setStatus("Clientes cargados correctamente.");
  } catch (error) {
    renderMessage("error-box", error.message);
    setStatus("No se pudieron cargar los clientes.");
  }
}

async function loadRutClients() {
  try {
    showSection("consultar");
    setStatus("Cargando clientes con cuenta RUT...");
    const clients = await requestJson("/api/clientes/rut");
    setConsultBanner("Detalle de clientes que tienen cuenta RUT registrada.");
    renderClients(clients);
    setStatus("Clientes con cuenta RUT cargados.");
  } catch (error) {
    renderMessage("error-box", error.message);
    setStatus("No se pudieron cargar los clientes.");
  }
}

async function showSummaryDetail(viewName) {
  try {
    showSection("consultar");
    setStatus("Preparando detalle del dashboard...");

    if (!clientsCache.length) {
      clientsCache = await requestJson("/api/clientes");
    }

    const groups = getClientGroups(clientsCache);

    if (viewName === "total-cuentas") {
      setConsultBanner(`Detalle completo. Cuentas totales activas: ${getTotalAccounts(clientsCache)}.`);
      renderClients(clientsCache, `Cuentas totales activas: ${getTotalAccounts(clientsCache)}.`);
      setStatus("Detalle de cuentas totales cargado.");
      return;
    }

    if (viewName === "solo-rut") {
      setConsultBanner("Detalle de clientes con cuenta unica RUT.");
      renderClients(groups.soloRut, "Clientes con cuenta unica RUT.");
      setStatus("Detalle de cuenta unica RUT cargado.");
      return;
    }

    if (viewName === "solo-ahorro") {
      setConsultBanner("Detalle de clientes con cuenta unica ahorro.");
      renderClients(groups.soloAhorro, "Clientes con cuenta unica ahorro.");
      setStatus("Detalle de cuenta unica ahorro cargado.");
      return;
    }

    if (viewName === "rut-ahorro") {
      setConsultBanner("Detalle de clientes con cuenta RUT y cuenta ahorro.");
      renderClients(groups.rutYAhorro, "Clientes con cuenta RUT y cuenta ahorro.");
      setStatus("Detalle de clientes con ambos productos cargado.");
      return;
    }

    setConsultBanner("Detalle completo de todos los clientes registrados.");
    renderClients(groups.totalClientes, "Total de clientes registrados.");
    setStatus("Detalle de total clientes cargado.");
  } catch (error) {
    renderMessage("error-box", error.message);
    setStatus("No se pudo cargar el detalle del dashboard.");
  }
}

async function handleSuccess(message, fallbackSection) {
  renderMessage("success-box", message);
  await loadSummary();
  if (fallbackSection) {
    showSection(fallbackSection);
  }
}

menuToggleNode.addEventListener("click", () => {
  if (bodyNode.classList.contains("sidebar-open")) {
    closeSidebar();
    return;
  }

  openSidebar();
});

overlayNode.addEventListener("click", closeSidebar);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeSidebar();
  }
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    showSection(link.dataset.section);
  });
});

jumpButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showSection(button.dataset.jump);
  });
});

summaryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showSummaryDetail(button.dataset.summaryView);
  });
});

refreshSummaryButton.addEventListener("click", loadSummary);
document.getElementById("load-all").addEventListener("click", loadAllClients);
document.getElementById("load-rut").addEventListener("click", loadRutClients);

document.getElementById("new-client-rut-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    nombre: document.getElementById("rut-client-name").value.trim(),
    cuentaRut: {
      numero: document.getElementById("rut-account-number").value.trim(),
      saldo: Number(document.getElementById("rut-account-balance").value)
    },
    cuentasAhorro: []
  };

  try {
    setStatus("Agregando cliente con cuenta RUT...");
    const created = await requestJson("/api/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    event.target.reset();
    await handleSuccess(`Cliente creado: ${escapeHtml(created.nombre)}.`, "crear");
  } catch (error) {
    renderMessage("error-box", error.message);
    setStatus("No se pudo crear el cliente.");
  }
});

document.getElementById("new-client-savings-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    nombre: document.getElementById("savings-client-name").value.trim(),
    cuentaRut: null,
    cuentasAhorro: [
      {
        numero: document.getElementById("savings-account-number").value.trim(),
        saldo: Number(document.getElementById("savings-account-balance").value)
      }
    ]
  };

  try {
    setStatus("Agregando cliente con cuenta de ahorro...");
    const created = await requestJson("/api/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    event.target.reset();
    await handleSuccess(`Cliente creado: ${escapeHtml(created.nombre)}.`, "crear");
  } catch (error) {
    renderMessage("error-box", error.message);
    setStatus("No se pudo crear el cliente.");
  }
});

document.getElementById("add-rut-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const clientId = document.getElementById("existing-rut-client-id").value;
  const payload = {
    tipo: "rut",
    cuenta: {
      numero: document.getElementById("existing-rut-number").value.trim(),
      saldo: Number(document.getElementById("existing-rut-balance").value)
    }
  };

  try {
    setStatus("Agregando cuenta RUT...");
    await requestJson(`/api/clientes/${encodeURIComponent(clientId)}/cuentas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    event.target.reset();
    await handleSuccess("Cuenta RUT agregada correctamente.", "cuentas");
  } catch (error) {
    renderMessage("error-box", error.message);
    setStatus("No se pudo agregar la cuenta RUT.");
  }
});

document.getElementById("add-savings-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const clientId = document.getElementById("existing-savings-client-id").value;
  const payload = {
    tipo: "ahorro",
    cuenta: {
      numero: document.getElementById("existing-savings-number").value.trim(),
      saldo: Number(document.getElementById("existing-savings-balance").value)
    }
  };

  try {
    setStatus("Agregando cuenta de ahorro...");
    await requestJson(`/api/clientes/${encodeURIComponent(clientId)}/cuentas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    event.target.reset();
    await handleSuccess("Cuenta de ahorro agregada correctamente.", "cuentas");
  } catch (error) {
    renderMessage("error-box", error.message);
    setStatus("No se pudo agregar la cuenta de ahorro.");
  }
});

document.getElementById("delete-client-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const clientId = document.getElementById("delete-client-id").value;

  try {
    setStatus("Eliminando cliente...");
    const response = await requestJson(`/api/clientes/${encodeURIComponent(clientId)}`, {
      method: "DELETE"
    });
    event.target.reset();
    await handleSuccess(response.mensaje, "eliminar");
  } catch (error) {
    renderMessage("error-box", error.message);
    setStatus("No se pudo eliminar el cliente.");
  }
});

document.getElementById("delete-rut-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const clientId = document.getElementById("delete-rut-client-id").value;

  try {
    setStatus("Eliminando cuenta RUT...");
    const response = await requestJson(`/api/clientes/${encodeURIComponent(clientId)}/cuenta-rut`, {
      method: "DELETE"
    });
    event.target.reset();
    await handleSuccess(response.mensaje, "eliminar");
  } catch (error) {
    renderMessage("error-box", error.message);
    setStatus("No se pudo eliminar la cuenta RUT.");
  }
});

document.getElementById("delete-savings-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const clientId = document.getElementById("delete-savings-client-id").value;
  const number = document.getElementById("delete-savings-number").value.trim();

  try {
    setStatus("Eliminando cuenta de ahorro...");
    const response = await requestJson(`/api/clientes/${encodeURIComponent(clientId)}/cuentas-ahorro?numero=${encodeURIComponent(number)}`, {
      method: "DELETE"
    });
    event.target.reset();
    await handleSuccess(response.mensaje, "eliminar");
  } catch (error) {
    renderMessage("error-box", error.message);
    setStatus("No se pudo eliminar la cuenta de ahorro.");
  }
});

showSection("inicio");
renderMessage("empty", "Usa el panel para listar o modificar clientes y cuentas.");
loadSummary();
