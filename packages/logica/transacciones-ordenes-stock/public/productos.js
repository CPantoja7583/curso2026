const productsBody = document.querySelector("#productsBody");
const message = document.querySelector("#message");
const jsonBox = document.querySelector("#jsonBox");
const loadProducts = document.querySelector("#loadProducts");

function setMessage(text, type = "info") {
  message.textContent = text;
  message.dataset.type = type;
}

function showJson(data) {
  jsonBox.textContent = JSON.stringify(data, null, 2);
}

function renderProducts(products) {
  productsBody.innerHTML = products
    .map(
      (product) => `
        <tr>
          <td>${product.id_producto}</td>
          <td>${product.nombre}</td>
          <td>$${Number(product.precio).toLocaleString("es-CL")}</td>
          <td>${product.stock}</td>
        </tr>
      `,
    )
    .join("");
}

async function load() {
  setMessage("Cargando productos...");
  const response = await fetch("/?filtro=productos");
  const data = await response.json();
  showJson(data);
  renderProducts(data.data || []);
  setMessage(`Productos cargados: ${(data.data || []).length}.`, "success");
}

loadProducts.addEventListener("click", load);
load().catch((error) => setMessage(error.message, "error"));
