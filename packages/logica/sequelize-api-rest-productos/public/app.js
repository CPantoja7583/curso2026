const refreshButton = document.querySelector("#refreshButton");
const createForm = document.querySelector("#createForm");
const updateForm = document.querySelector("#updateForm");
const deleteForm = document.querySelector("#deleteForm");
const productTable = document.querySelector("#productTable");
const message = document.querySelector("#message");
const jsonBox = document.querySelector("#jsonBox");

function setMessage(text, type = "info") {
  message.textContent = text;
  message.dataset.type = type;
}

function showJson(data, status) {
  jsonBox.textContent = JSON.stringify({ status, ...data }, null, 2);
}

function formObject(form) {
  const entries = Object.fromEntries(new FormData(form).entries());
  return Object.fromEntries(Object.entries(entries).filter(([, value]) => value !== ""));
}

function renderProducts(products) {
  if (!products.length) {
    productTable.innerHTML = '<tr><td colspan="4">No hay productos registrados.</td></tr>';
    return;
  }

  productTable.innerHTML = products
    .map(
      (product) => `
        <tr>
          <td>${product.id}</td>
          <td>${product.nombre}</td>
          <td>$${Number(product.precio).toLocaleString("es-CL")}</td>
          <td>${product.stock}</td>
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
  showJson(data, response.status);

  if (!response.ok) {
    throw new Error(data.mensaje || "Solicitud rechazada");
  }

  return data;
}

async function loadProducts() {
  setMessage("Cargando productos...");
  const data = await requestJson("/api/productos");
  renderProducts(data.data || []);
  setMessage(`Productos cargados: ${(data.data || []).length}.`, "success");
}

refreshButton.addEventListener("click", () => {
  loadProducts().catch((error) => setMessage(error.message, "error"));
});

createForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const data = await requestJson("/api/productos", {
      method: "POST",
      body: JSON.stringify(formObject(createForm)),
    });
    setMessage(data.mensaje, "success");
    createForm.reset();
    await loadProducts();
  } catch (error) {
    setMessage(error.message, "error");
  }
});

updateForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = formObject(updateForm);
  const id = payload.id;
  delete payload.id;

  try {
    const data = await requestJson(`/api/productos/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    setMessage(data.mensaje, "success");
    updateForm.reset();
    await loadProducts();
  } catch (error) {
    setMessage(error.message, "error");
  }
});

deleteForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const { id } = formObject(deleteForm);

  try {
    const data = await requestJson(`/api/productos/${encodeURIComponent(id)}`, { method: "DELETE" });
    setMessage(data.mensaje, "success");
    deleteForm.reset();
    await loadProducts();
  } catch (error) {
    setMessage(error.message, "error");
  }
});

loadProducts().catch((error) => setMessage(error.message, "error"));
