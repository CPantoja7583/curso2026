const loginForm = document.querySelector("#loginForm");
const registerForm = document.querySelector("#registerForm");
const profileButton = document.querySelector("#profileButton");
const deniedButton = document.querySelector("#deniedButton");
const logoutButton = document.querySelector("#logoutButton");
const statusLabel = document.querySelector("#status");
const profileEmail = document.querySelector("#profileEmail");
const profileRole = document.querySelector("#profileRole");
const jsonBox = document.querySelector("#jsonBox");

let authToken = null;

function setStatus(text, type = "info") {
  statusLabel.textContent = text;
  statusLabel.dataset.type = type;
}

function showJson(data, status) {
  jsonBox.textContent = JSON.stringify({ status, ...data }, null, 2);
}

function formObject(form) {
  return Object.fromEntries(new FormData(form).entries());
}

async function requestJson(url, options = {}, token = authToken) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });
  const data = await response.json();
  showJson(data, response.status);

  if (!response.ok) {
    throw new Error(data.mensaje || "Solicitud rechazada");
  }

  return data;
}

function clearProfile() {
  profileEmail.textContent = "-";
  profileRole.textContent = "-";
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const data = await requestJson("/auth/login", {
      method: "POST",
      body: JSON.stringify(formObject(loginForm)),
    }, null);
    authToken = data.token;
    setStatus("Sesion iniciada. Token cargado en memoria.", "success");
  } catch (error) {
    authToken = null;
    clearProfile();
    setStatus(error.message, "error");
  }
});

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const data = await requestJson("/auth/register", {
      method: "POST",
      body: JSON.stringify(formObject(registerForm)),
    }, null);
    setStatus(data.mensaje || "Usuario registrado.", "success");
    registerForm.reset();
  } catch (error) {
    setStatus(error.message, "error");
  }
});

profileButton.addEventListener("click", async () => {
  try {
    const data = await requestJson("/api/perfil");
    profileEmail.textContent = data.data.email;
    profileRole.textContent = data.data.role;
    setStatus("Perfil cargado con token valido.", "success");
  } catch (error) {
    clearProfile();
    setStatus(error.message, "error");
  }
});

deniedButton.addEventListener("click", async () => {
  try {
    await requestJson("/api/perfil", {}, null);
  } catch (error) {
    clearProfile();
    setStatus(error.message, "error");
  }
});

logoutButton.addEventListener("click", () => {
  authToken = null;
  clearProfile();
  setStatus("Sesion cerrada. Debes volver a login.", "info");
  showJson({ ok: true, mensaje: "Token eliminado de memoria" }, 200);
});
