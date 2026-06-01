const limitSelect = document.querySelector("#limitSelect");
const loadButton = document.querySelector("#loadButton");
const nextButton = document.querySelector("#nextButton");
const createForm = document.querySelector("#createForm");
const deleteForm = document.querySelector("#deleteForm");
const tableBody = document.querySelector("#tableBody");
const message = document.querySelector("#message");
const jsonBox = document.querySelector("#jsonBox");

let currentCursorId = null;

function formatInteger(value) {
  return Number(value).toLocaleString("es-CL");
}

function setMessage(text, type = "info") {
  message.textContent = text;
  message.dataset.type = type;
}

function showJson(data, status) {
  jsonBox.textContent = JSON.stringify({ status, ...data }, null, 2);
}

function formObject(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function renderRows(rows) {
  if (!rows.length) {
    tableBody.innerHTML = '<tr><td colspan="5">No hay registros en este bloque.</td></tr>';
    return;
  }

  tableBody.innerHTML = rows.map((row) => `
    <tr>
      <td>${row.nombre}</td>
      <td>${row.continente}</td>
      <td>${formatInteger(row.poblacion)}</td>
      <td>${formatInteger(row.pib_2019)}</td>
      <td>${formatInteger(row.pib_2020)}</td>
    </tr>
  `).join("");
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await response.json();
  showJson(data, response.status);
  if (!response.ok) {
    throw new Error(data.mensaje || "Solicitud rechazada");
  }
  return data;
}

async function loadBlock(resetCursor) {
  if (resetCursor) {
    currentCursorId = null;
  }

  const params = new URLSearchParams({ limit: limitSelect.value });
  if (currentCursorId) {
    params.set("cursorId", currentCursorId);
  }

  setMessage("Cargando bloque...");
  const data = await requestJson(`/api/paises?${params.toString()}`);
  renderRows(data.data || []);
  currentCursorId = data.cursor?.id || null;
  nextButton.disabled = !data.cursor?.hasNext;
  setMessage(data.cursor?.hasNext ? "Bloque cargado. Hay mas registros." : "Bloque cargado. No quedan mas registros.", "success");
}

loadButton.addEventListener("click", () => {
  loadBlock(true).catch((error) => setMessage(error.message, "error"));
});

nextButton.addEventListener("click", () => {
  loadBlock(false).catch((error) => setMessage(error.message, "error"));
});

createForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const data = await requestJson("/api/paises", {
      method: "POST",
      body: JSON.stringify(formObject(createForm)),
    });
    setMessage(data.mensaje, "success");
    createForm.reset();
    currentCursorId = null;
  } catch (error) {
    setMessage(error.message, "error");
  }
});

deleteForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = formObject(deleteForm);
  try {
    const data = await requestJson(`/api/paises/${encodeURIComponent(payload.nombre)}`, {
      method: "DELETE",
    });
    setMessage(data.mensaje, "success");
    deleteForm.reset();
    currentCursorId = null;
  } catch (error) {
    setMessage(error.message, "error");
  }
});

nextButton.disabled = true;
