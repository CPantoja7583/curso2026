const resultNode = document.getElementById("result");
const statusNode = document.getElementById("status");
const sortSelect = document.getElementById("sort-by");
const formNode = document.getElementById("product-form");

let currentProducts = [];

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

function sortProducts(products, sortBy) {
  const sorted = [...products];

  if (sortBy === "precio") {
    sorted.sort((left, right) => left.precio - right.precio);
    return sorted;
  }

  sorted.sort((left, right) => left.nombre.localeCompare(right.nombre));
  return sorted;
}

function renderProducts(products, banner = "") {
  if (!products.length) {
    renderMessage("empty", "No hay productos registrados.");
    return;
  }

  const sortedProducts = sortProducts(products, sortSelect.value);
  const bannerHtml = banner ? `<div class="success-box">${banner}</div>` : "";
  const cards = sortedProducts.map((product) => `
    <article class="card">
      <h3>${escapeHtml(product.nombre)}</h3>
      <p class="price">$${Number(product.precio).toLocaleString("es-CL")}</p>
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

async function loadProducts() {
  try {
    setStatus("Cargando productos...");
    currentProducts = await requestJson("/api/productos");
    renderProducts(currentProducts);
    setStatus("Lista de articulos cargada.");
  } catch (error) {
    renderMessage("error-box", error.message);
    setStatus("No se pudieron cargar los productos.");
  }
}

document.getElementById("load-products").addEventListener("click", loadProducts);

sortSelect.addEventListener("change", () => {
  if (currentProducts.length) {
    renderProducts(currentProducts);
    setStatus(`Lista ordenada por ${sortSelect.value}.`);
  }
});

formNode.addEventListener("submit", async (event) => {
  event.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const precio = Number(document.getElementById("precio").value);

  try {
    setStatus("Agregando producto...");
    const newProduct = await requestJson("/api/productos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ nombre, precio })
    });

    currentProducts.push(newProduct);
    renderProducts(currentProducts, `Producto agregado: ${escapeHtml(newProduct.nombre)}.`);
    setStatus("Producto creado correctamente.");
    formNode.reset();
  } catch (error) {
    renderMessage("error-box", error.message);
    setStatus("No se pudo agregar el producto.");
  }
});

renderMessage("empty", "Presiona LISTA DE ARTICULOS para cargar los productos.");
