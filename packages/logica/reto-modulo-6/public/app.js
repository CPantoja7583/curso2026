const cartonesNode = document.getElementById("cartones");
const statusNode = document.getElementById("status");

function setStatus(message) {
  if (statusNode) {
    statusNode.textContent = message;
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderCarton(carton) {
  const numbers = carton.numeros
    .map((number) => `<span class="number">${escapeHtml(number)}</span>`)
    .join("");

  return `
    <article class="carton-card">
      <h2>Numero de serie: ${escapeHtml(carton.serie)}</h2>
      <div class="numbers-grid">${numbers}</div>
    </article>
  `;
}

function renderMessage(className, message) {
  cartonesNode.innerHTML = `<div class="${className}">${escapeHtml(message)}</div>`;
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "La solicitud fallo.");
  }

  return data;
}

async function loadCartones() {
  try {
    const cartones = await requestJson("/api/cartones");

    if (!cartones.length) {
      renderMessage("empty-box", "No hay cartones registrados.");
      setStatus("No hay cartones para mostrar.");
      return;
    }

    cartonesNode.innerHTML = cartones.map(renderCarton).join("");
    setStatus(`Se encontraron ${cartones.length} cartones.`);
  } catch (error) {
    renderMessage("error-box", error.message);
    setStatus("No se pudieron cargar los cartones.");
  }
}

function setupCreateCarton() {
  const button = document.getElementById("create-carton");

  button.addEventListener("click", async () => {
    try {
      button.disabled = true;
      setStatus("Creando carton...");

      const carton = await requestJson("/api/cartones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });

      cartonesNode.innerHTML = renderCarton(carton);
      setStatus(`Carton serie ${carton.serie} creado correctamente.`);
    } catch (error) {
      renderMessage("error-box", error.message);
      setStatus("No se pudo crear el carton.");
    } finally {
      button.disabled = false;
    }
  });
}
