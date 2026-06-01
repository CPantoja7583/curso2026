const ordersForm = document.querySelector("#ordersForm");
const ordersBody = document.querySelector("#ordersBody");
const message = document.querySelector("#message");
const jsonBox = document.querySelector("#jsonBox");

function setMessage(text, type = "info") {
  message.textContent = text;
  message.dataset.type = type;
}

function showJson(data) {
  jsonBox.textContent = JSON.stringify(data, null, 2);
}

function renderOrders(orders) {
  if (!orders.length) {
    ordersBody.innerHTML = '<tr><td colspan="4">Sin ordenes para este RUT.</td></tr>';
    return;
  }

  ordersBody.innerHTML = orders
    .map(
      (order) => `
        <tr>
          <td>${order.id_orden}</td>
          <td>${order.cliente}</td>
          <td>$${Number(order.total).toLocaleString("es-CL")}</td>
          <td>${order.created_at ? new Date(order.created_at).toLocaleString("es-CL") : ""}</td>
        </tr>
      `,
    )
    .join("");
}

async function loadOrders(rut) {
  setMessage("Consultando ordenes...");
  const response = await fetch(`/?filtro=ordenes&rut=${encodeURIComponent(rut)}`);
  const data = await response.json();
  showJson(data);
  renderOrders(data.data || []);
  setMessage(`Ordenes encontradas: ${(data.data || []).length}.`, "success");
}

ordersForm.addEventListener("submit", (event) => {
  event.preventDefault();
  loadOrders(new FormData(ordersForm).get("rut")).catch((error) => setMessage(error.message, "error"));
});

loadOrders("11.111.111-1").catch((error) => setMessage(error.message, "error"));
