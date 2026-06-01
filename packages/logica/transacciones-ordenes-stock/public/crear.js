const orderForm = document.querySelector("#orderForm");
const rollbackDemo = document.querySelector("#rollbackDemo");
const message = document.querySelector("#message");
const jsonBox = document.querySelector("#jsonBox");

function setMessage(text, type = "info") {
  message.textContent = text;
  message.dataset.type = type;
}

function showJson(data, status) {
  jsonBox.textContent = JSON.stringify({ status, ...data }, null, 2);
}

function buildPayload(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  const productos = [];

  for (const index of [1, 2]) {
    const id = data[`producto_${index}`];
    const quantity = data[`cantidad_${index}`];
    if (id && quantity) {
      productos.push({ id_producto: Number(id), cantidad_producto: Number(quantity) });
    }
  }

  return {
    rut: data.rut,
    id_direccion: Number(data.id_direccion),
    productos,
  };
}

async function submitOrder(payload) {
  setMessage("Enviando orden...");
  const response = await fetch("/orden", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  showJson(data, response.status);

  if (!response.ok) {
    setMessage(data.mensaje || "No se pudo crear la orden.", "error");
    return;
  }

  setMessage(data.mensaje || "Orden creada.", "success");
}

orderForm.addEventListener("submit", (event) => {
  event.preventDefault();
  submitOrder(buildPayload(orderForm)).catch((error) => setMessage(error.message, "error"));
});

rollbackDemo.addEventListener("click", () => {
  const payload = buildPayload(orderForm);
  payload.productos = [{ id_producto: 1, cantidad_producto: 9999 }];
  submitOrder(payload).catch((error) => setMessage(error.message, "error"));
});
