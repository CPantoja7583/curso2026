const listAllButton = document.querySelector("#listAllButton");
const createForm = document.querySelector("#createForm");
const searchForm = document.querySelector("#searchForm");
const updateForm = document.querySelector("#updateForm");
const deleteForm = document.querySelector("#deleteForm");
const tableBody = document.querySelector("#tableBody");
const message = document.querySelector("#message");
const rowCount = document.querySelector("#rowCount");
const jsonBox = document.querySelector("#jsonBox");

function formData(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function setMessage(text, type = "info") {
  message.textContent = text;
  message.dataset.type = type;
}

function showResponse(data, status) {
  jsonBox.textContent = JSON.stringify({ status, ...data }, null, 2);
  rowCount.textContent = data.rowCount !== undefined ? `rowCount: ${data.rowCount}` : "";
}

function renderRows(rows) {
  const clientes = Array.isArray(rows) ? rows : rows ? [rows] : [];

  if (clientes.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="3">Sin resultados.</td></tr>';
    return;
  }

  tableBody.innerHTML = clientes
    .map(
      (cliente) => `
      <tr>
        <td>${cliente.rut}</td>
        <td>${cliente.nombre}</td>
        <td>${cliente.edad}</td>
      </tr>
    `,
    )
    .join("");
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await response.json();
  showResponse(data, response.status);

  if (!response.ok) {
    throw new Error(data.mensaje || "Solicitud rechazada");
  }

  return data;
}

function buildQueryFromCriterion(criterio, valor) {
  if (!criterio) {
    return "";
  }

  return `?${criterio}=${encodeURIComponent(valor)}`;
}

async function loadAll() {
  const data = await requestJson("/clientes");
  renderRows(data.data);
  setMessage("Consulta realizada correctamente.", "success");
}

listAllButton.addEventListener("click", async () => {
  try {
    await loadAll();
  } catch (error) {
    renderRows([]);
    setMessage(error.message, "error");
  }
});

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = formData(searchForm);

  try {
    const result = await requestJson(`/clientes${buildQueryFromCriterion(data.criterio, data.valor)}`);
    renderRows(result.data);
    setMessage("Busqueda realizada correctamente.", "success");
  } catch (error) {
    renderRows([]);
    setMessage(error.message, "error");
  }
});

createForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = formData(createForm);

  try {
    const result = await requestJson("/clientes", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    renderRows(result.data);
    setMessage("Cliente creado con codigo 201.", "success");
    createForm.reset();
  } catch (error) {
    setMessage(error.message, "error");
  }
});

updateForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = formData(updateForm);

  try {
    const result = await requestJson(`/clientes/${encodeURIComponent(payload.rut)}`, {
      method: "PUT",
      body: JSON.stringify({ nombre: payload.nombre }),
    });
    renderRows(result.data);
    setMessage(result.mensaje, "success");
    updateForm.reset();
  } catch (error) {
    setMessage(error.message, "error");
  }
});

deleteForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = formData(deleteForm);

  try {
    const result = await requestJson(`/clientes${buildQueryFromCriterion(data.criterio, data.valor)}`, {
      method: "DELETE",
    });
    renderRows(result.data);
    setMessage(result.mensaje, "success");
    deleteForm.reset();
  } catch (error) {
    renderRows([]);
    setMessage(error.message, "error");
  }
});

loadAll().catch((error) => {
  setMessage(error.message, "error");
});
