import "./styles.css";
import { api } from "./api.js";
import { clearSession, getSession, setSession } from "./session.js";
import { renderRoute, renderShell } from "./ui.js";

const appNode = document.getElementById("app");

const state = {
  notice: null,
  profile: null,
  transfers: [],
  adminUsers: []
};

const publicRoutes = new Set(["/", "/beneficios", "/seguridad", "/faq", "/contacto", "/login", "/registro"]);

function getRoute() {
  const hash = window.location.hash.replace(/^#/, "") || "/";
  return hash.startsWith("/") ? hash : "/";
}

function navigate(route) {
  window.location.hash = route;
}

function setNotice(type, message) {
  state.notice = { type, message };
}

function clearNotice() {
  state.notice = null;
}

function formToObject(form) {
  return Object.fromEntries(new FormData(form).entries());
}

async function loadPrivateData(route) {
  const profile = await api.getProfile();
  state.profile = profile;

  if (route === "/dashboard") {
    state.transfers = await api.getTransfers();
  }

  if (route === "/admin") {
    state.adminUsers = await api.getAdminUsers();
    state.transfers = await api.getAdminTransfers();
  }

  return profile;
}

async function guardRoute(route) {
  const session = getSession();

  if (publicRoutes.has(route)) {
    return route;
  }

  if (!session) {
    navigate("/login");
    return "/login";
  }

  try {
    const profile = await loadPrivateData(route);
    if (route === "/admin" && profile.user.role !== "admin") {
      setNotice("error", "No tienes permisos para ver el panel administrativo.");
      navigate("/dashboard");
      return "/dashboard";
    }
  } catch (error) {
    clearSession();
    setNotice("error", error.message);
    navigate("/login");
    return "/login";
  }

  return route;
}

function getViewData(route) {
  if (route === "/dashboard") {
    return {
      profile: state.profile,
      transfers: state.transfers
    };
  }

  if (route === "/admin") {
    return {
      profile: state.profile,
      users: state.adminUsers,
      transfers: state.transfers
    };
  }

  return {};
}

async function renderApp() {
  const requestedRoute = getRoute();
  const safeRoute = await guardRoute(requestedRoute);
  const session = getSession();
  const content = renderRoute(safeRoute, getViewData(safeRoute));

  appNode.innerHTML = renderShell({
    currentRoute: safeRoute,
    session,
    notice: state.notice,
    content
  });

  clearNotice();
  document.getElementById("main-content")?.focus();
}

async function handleLogin(form) {
  const values = formToObject(form);
  const session = await api.login(values);
  setSession(session);
  setNotice("success", "Sesion iniciada correctamente.");
  navigate(session.user.role === "admin" ? "/admin" : "/dashboard");
}

async function handleRegister(form) {
  const values = formToObject(form);
  const session = await api.register(values);
  setSession(session);
  setNotice("success", "Tu cuenta fue creada correctamente.");
  navigate("/dashboard");
}

async function handleTransfer(form) {
  const values = formToObject(form);
  await api.createTransfer({
    destinationAccountNumber: values.destinationAccountNumber,
    amount: Number(values.amount),
    reference: values.reference
  });
  setNotice("success", "Transferencia realizada con exito.");
  form.reset();
  state.profile = await api.getProfile();
  state.transfers = await api.getTransfers();
  await renderApp();
}

async function handleContact(form) {
  form.reset();
  setNotice("success", "Gracias. Tu mensaje fue registrado localmente en esta demo.");
  await renderApp();
}

async function handleLogout() {
  const session = getSession();
  await api.logout(session?.refreshToken);
  state.profile = null;
  state.transfers = [];
  state.adminUsers = [];
  setNotice("success", "Sesion cerrada correctamente.");
  navigate("/");
}

async function handleToggleStatus(button) {
  const userId = button.dataset.userId;
  const nextStatus = button.dataset.nextStatus;
  await api.updateUserStatus(userId, nextStatus);
  state.adminUsers = await api.getAdminUsers();
  state.transfers = await api.getAdminTransfers();
  setNotice("success", `Usuario actualizado a estado ${nextStatus}.`);
  await renderApp();
}

document.addEventListener("submit", async (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) {
    return;
  }

  event.preventDefault();

  try {
    if (form.id === "login-form") {
      await handleLogin(form);
      return;
    }

    if (form.id === "register-form") {
      await handleRegister(form);
      return;
    }

    if (form.id === "transfer-form") {
      await handleTransfer(form);
      return;
    }

    if (form.id === "contact-form") {
      await handleContact(form);
      return;
    }
  } catch (error) {
    setNotice("error", error.message);
  }

  await renderApp();
});

document.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const actionButton = target.closest("[data-action]");
  if (!actionButton) {
    return;
  }

  try {
    if (actionButton.dataset.action === "logout") {
      await handleLogout();
      await renderApp();
      return;
    }

    if (actionButton.dataset.action === "toggle-status") {
      await handleToggleStatus(actionButton);
    }
  } catch (error) {
    setNotice("error", error.message);
    await renderApp();
  }
});

window.addEventListener("hashchange", () => {
  renderApp();
});

renderApp();
