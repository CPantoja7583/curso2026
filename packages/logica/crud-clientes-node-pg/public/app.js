const clientesTable = document.querySelector("#clientesTable");
const statusMessage = document.querySelector("#statusMessage");
const refreshButton = document.querySelector("#refreshButton");
const createForm = document.querySelector("#createForm");
const updateForm = document.querySelector("#updateForm");
const deleteForm = document.querySelector("#deleteForm");

function setStatus(message, type = "info") {
  statusMessage.textContent = message;
  statusMessage.dataset.type = type;
}

function getFormData(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function renderClientes(clientes) {
  if (!clientes.length) {
    clientesTable.innerHTML = '<tr><td colspan="3">No hay clientes registrados.</td></tr>';
    return;
  }

  clientesTable.innerHTML = clientes
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

  if (!response.ok) {
    const detail = data.errores ? `: ${data.errores.join(", ")}` : "";
    throw new Error(`${data.mensaje || "Error en la solicitud"}${detail}`);
  }

  return data;
}

async function loadClientes() {
  setStatus("Cargando clientes...");
  const data = await requestJson("/clientes");
  renderClientes(data.clientes);
  setStatus(`Clientes cargados: ${data.clientes.length}.`, "success");
}

refreshButton.addEventListener("click", async () => {
  try {
    await loadClientes();
  } catch (error) {
    setStatus(error.message, "error");
  }
});

createForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = getFormData(createForm);

  try {
    const data = await requestJson("/clientes", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    createForm.reset();
    setStatus(data.mensaje, "success");
    await loadClientes();
  } catch (error) {
    setStatus(error.message, "error");
  }
});

updateForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = getFormData(updateForm);
  const rut = encodeURIComponent(payload.rut);

  try {
    const data = await requestJson(`/clientes/${rut}`, {
      method: "PUT",
      body: JSON.stringify({ nombre: payload.nombre }),
    });
    updateForm.reset();
    setStatus(data.mensaje, "success");
    await loadClientes();
  } catch (error) {
    setStatus(error.message, "error");
  }
});

deleteForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = getFormData(deleteForm);
  const rut = encodeURIComponent(payload.rut);

  try {
    const data = await requestJson(`/clientes/${rut}`, { method: "DELETE" });
    deleteForm.reset();
    setStatus(data.mensaje, "success");
    await loadClientes();
  } catch (error) {
    setStatus(error.message, "error");
  }
});

loadClientes().catch((error) => {
  setStatus(error.message, "error");
});
