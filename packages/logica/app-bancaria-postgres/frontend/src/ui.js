function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatCurrency(value) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function isActiveRoute(route, currentRoute) {
  return route === currentRoute ? "is-active" : "";
}

function publicNav(currentRoute) {
  return `
    <a class="${isActiveRoute("/", currentRoute)}" href="#/">Inicio</a>
    <a class="${isActiveRoute("/beneficios", currentRoute)}" href="#/beneficios">Beneficios</a>
    <a class="${isActiveRoute("/seguridad", currentRoute)}" href="#/seguridad">Seguridad</a>
    <a class="${isActiveRoute("/faq", currentRoute)}" href="#/faq">FAQ</a>
    <a class="${isActiveRoute("/contacto", currentRoute)}" href="#/contacto">Contacto</a>
  `;
}

function privateActions(session) {
  if (!session) {
    return `
      <a class="button ghost" href="#/login">Ingresar</a>
      <a class="button" href="#/registro">Crear cuenta</a>
    `;
  }

  const dashboardLink = session.user.role === "admin" ? "#/admin" : "#/dashboard";
  const dashboardLabel = session.user.role === "admin" ? "Panel admin" : "Mi cuenta";

  return `
    <a class="button ghost" href="${dashboardLink}">${dashboardLabel}</a>
    <button class="button" type="button" data-action="logout">Cerrar sesion</button>
  `;
}

function renderHome() {
  return `
    <section class="hero-panel">
      <div class="hero-copy">
        <p class="eyebrow">Banco digital educativo</p>
        <h1>Una experiencia bancaria clara, segura y lista para demostrar PostgreSQL de verdad.</h1>
        <p class="lead">
          Aurora Bank combina sitio publico, paneles privados, transferencias reales y documentacion OpenAPI en una sola experiencia cuidada.
        </p>
        <div class="hero-actions">
          <a class="button" href="#/registro">Crear cuenta</a>
          <a class="button ghost" href="#/login">Ingresar ahora</a>
        </div>
      </div>
      <div class="hero-metrics">
        <article>
          <span>Arquitectura</span>
          <strong>Frontend + API</strong>
        </article>
        <article>
          <span>Base de datos</span>
          <strong>PostgreSQL</strong>
        </article>
        <article>
          <span>Seguridad</span>
          <strong>JWT + refresh</strong>
        </article>
      </div>
    </section>

    <section class="feature-grid">
      <article class="feature-card">
        <p class="eyebrow">Usuarios</p>
        <h2>Panel privado para operar con tu cuenta principal</h2>
        <p>Consulta saldo, revisa movimientos y realiza transferencias entre clientes registrados.</p>
      </article>
      <article class="feature-card">
        <p class="eyebrow">Admin</p>
        <h2>Gobierno operacional simple y defendible</h2>
        <p>El administrador puede revisar usuarios, ver transferencias y bloquear o activar cuentas.</p>
      </article>
      <article class="feature-card">
        <p class="eyebrow">OpenAPI</p>
        <h2>Documentacion lista para demo tecnica</h2>
        <p>La API expone Swagger para que puedas mostrar contratos, payloads y respuestas sin humo.</p>
      </article>
    </section>
  `;
}

function renderBenefits() {
  return `
    <section class="content-panel">
      <p class="eyebrow">Beneficios</p>
      <h1>Lo mejor de una app bancaria v1 bien pensada</h1>
      <div class="stack-list">
        <article>
          <h2>Flujos entendibles</h2>
          <p>Registro, login, panel privado y transferencias con una curva de uso simple para usuario y docente.</p>
        </article>
        <article>
          <h2>Dominio relacional limpio</h2>
          <p>Usuarios, cuentas, tokens y transferencias resuelven un caso real sin inflar innecesariamente el modelo.</p>
        </article>
        <article>
          <h2>Presentacion fuerte</h2>
          <p>Sitio publico elegante, documentacion de API y dashboards privados en una experiencia consistente.</p>
        </article>
      </div>
    </section>
  `;
}

function renderSecurity() {
  return `
    <section class="content-panel">
      <p class="eyebrow">Seguridad</p>
      <h1>Base segura para una demo seria</h1>
      <div class="timeline">
        <article>
          <strong>1. Password cifrada</strong>
          <p>Las credenciales se almacenan con hash, no en texto plano.</p>
        </article>
        <article>
          <strong>2. Access token corto</strong>
          <p>La sesion operativa usa JWT de vida corta para reducir riesgo.</p>
        </article>
        <article>
          <strong>3. Refresh token persistido</strong>
          <p>La renovacion de sesion se valida contra PostgreSQL.</p>
        </article>
        <article>
          <strong>4. Roles y bloqueo</strong>
          <p>Los recursos privados y administrativos verifican rol y estado de cuenta.</p>
        </article>
      </div>
    </section>
  `;
}

function renderFaq() {
  return `
    <section class="content-panel">
      <p class="eyebrow">FAQ</p>
      <h1>Preguntas frecuentes</h1>
      <div class="faq-list">
        <details>
          <summary>¿Puedo transferir a cualquier persona?</summary>
          <p>Solo a cuentas existentes y activas dentro de Aurora Bank.</p>
        </details>
        <details>
          <summary>¿Que pasa si me quedo sin saldo?</summary>
          <p>La API rechaza la transferencia y mantiene la consistencia en PostgreSQL.</p>
        </details>
        <details>
          <summary>¿Como ingreso si soy admin?</summary>
          <p>Usa las credenciales semilla documentadas en el README del proyecto.</p>
        </details>
      </div>
    </section>
  `;
}

function renderContact() {
  return `
    <section class="content-panel">
      <p class="eyebrow">Contacto</p>
      <h1>Conversemos sobre tu operacion digital</h1>
      <form class="form-panel" id="contact-form">
        <div class="field">
          <label for="contact-name">Nombre</label>
          <input id="contact-name" name="name" type="text" required />
        </div>
        <div class="field">
          <label for="contact-email">Correo</label>
          <input id="contact-email" name="email" type="email" required />
        </div>
        <div class="field">
          <label for="contact-message">Mensaje</label>
          <textarea id="contact-message" name="message" rows="5" required></textarea>
        </div>
        <button class="button" type="submit">Enviar mensaje</button>
      </form>
    </section>
  `;
}

function renderLogin() {
  return `
    <section class="auth-shell">
      <div class="auth-copy">
        <p class="eyebrow">Ingreso seguro</p>
        <h1>Entra a tu panel y opera en segundos.</h1>
        <p>Usa tus credenciales para revisar tu cuenta o administrar la plataforma.</p>
      </div>
      <form class="form-panel auth-form" id="login-form">
        <h2>Iniciar sesion</h2>
        <div class="field">
          <label for="login-email">Correo</label>
          <input id="login-email" name="email" type="email" autocomplete="email" required />
        </div>
        <div class="field">
          <label for="login-password">Password</label>
          <input id="login-password" name="password" type="password" autocomplete="current-password" required />
        </div>
        <button class="button" type="submit">Ingresar</button>
      </form>
    </section>
  `;
}

function renderRegister() {
  return `
    <section class="auth-shell">
      <div class="auth-copy">
        <p class="eyebrow">Alta digital</p>
        <h1>Crea una cuenta principal y empieza a transferir.</h1>
        <p>La cuenta se crea con saldo inicial de demostracion para probar el flujo completo.</p>
      </div>
      <form class="form-panel auth-form" id="register-form">
        <h2>Crear cuenta</h2>
        <div class="field">
          <label for="register-name">Nombre completo</label>
          <input id="register-name" name="fullName" type="text" autocomplete="name" required />
        </div>
        <div class="field">
          <label for="register-email">Correo</label>
          <input id="register-email" name="email" type="email" autocomplete="email" required />
        </div>
        <div class="field">
          <label for="register-password">Password</label>
          <input id="register-password" name="password" type="password" minlength="8" autocomplete="new-password" required />
          <small>Debe tener al menos 8 caracteres.</small>
        </div>
        <button class="button" type="submit">Abrir cuenta</button>
      </form>
    </section>
  `;
}

function renderTransferRows(profile, transfers) {
  if (!transfers.length) {
    return `
      <tr>
        <td colspan="5">Aun no tienes transferencias registradas.</td>
      </tr>
    `;
  }

  return transfers.map((transfer) => {
    const isSender = transfer.sender.userEmail === profile.user.email;
    return `
      <tr>
        <td>${isSender ? "Enviada" : "Recibida"}</td>
        <td>${escapeHtml(isSender ? transfer.receiver.userName : transfer.sender.userName)}</td>
        <td>${escapeHtml(isSender ? transfer.receiver.accountNumber : transfer.sender.accountNumber)}</td>
        <td>${formatCurrency(transfer.amount)}</td>
        <td>${escapeHtml(transfer.reference || "Sin referencia")}</td>
      </tr>
    `;
  }).join("");
}

function renderUserDashboard(profile, transfers) {
  return `
    <section class="dashboard-shell">
      <div class="dashboard-main">
        <section class="dashboard-grid">
          <article class="metric-card">
            <p class="eyebrow">Saldo disponible</p>
            <h1>${formatCurrency(profile.account.balance)}</h1>
            <p>Cuenta ${escapeHtml(profile.account.accountNumber)}</p>
          </article>
          <article class="metric-card">
            <p class="eyebrow">Estado</p>
            <h2>${escapeHtml(profile.account.status)}</h2>
            <p>Moneda principal: ${escapeHtml(profile.account.currency)}</p>
          </article>
          <article class="metric-card">
            <p class="eyebrow">Titular</p>
            <h2>${escapeHtml(profile.user.fullName)}</h2>
            <p>${escapeHtml(profile.user.email)}</p>
          </article>
        </section>

        <div class="dashboard-columns">
          <form class="form-panel" id="transfer-form">
            <h2>Realizar transferencia</h2>
            <div class="field">
              <label for="destinationAccountNumber">Cuenta destino</label>
              <input id="destinationAccountNumber" name="destinationAccountNumber" type="text" required aria-describedby="destination-help" />
              <small id="destination-help">Ingresa el numero de cuenta exacto del destinatario.</small>
            </div>
            <div class="field">
              <label for="amount">Monto</label>
              <input id="amount" name="amount" type="number" min="1" step="1" required />
            </div>
            <div class="field">
              <label for="reference">Referencia</label>
              <input id="reference" name="reference" type="text" maxlength="180" />
            </div>
            <button class="button" type="submit">Transferir ahora</button>
          </form>

          <aside class="profile-card">
            <p class="eyebrow">Perfil</p>
            <h2>Tu cuenta privada</h2>
            <ul class="profile-list">
              <li><strong>Rol:</strong> ${escapeHtml(profile.user.role)}</li>
              <li><strong>Estado:</strong> ${escapeHtml(profile.user.status)}</li>
              <li><strong>Creada:</strong> ${new Date(profile.user.createdAt).toLocaleDateString("es-CL")}</li>
            </ul>
          </aside>
        </div>

        <section class="table-panel">
          <div class="section-head">
            <div>
              <p class="eyebrow">Historial</p>
              <h2>Transferencias recientes</h2>
            </div>
          </div>
          <div class="table-wrap">
            <table>
              <caption class="sr-only">Historial de transferencias del usuario</caption>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Persona</th>
                  <th>Cuenta</th>
                  <th>Monto</th>
                  <th>Referencia</th>
                </tr>
              </thead>
              <tbody>
                ${renderTransferRows(profile, transfers)}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </section>
  `;
}

function renderAdminUsers(users) {
  return users.map((user) => {
    const nextStatus = user.status === "active" ? "blocked" : "active";
    const label = user.status === "active" ? "Bloquear" : "Activar";

    return `
      <tr>
        <td>${escapeHtml(user.fullName)}</td>
        <td>${escapeHtml(user.email)}</td>
        <td>${escapeHtml(user.role)}</td>
        <td>${escapeHtml(user.status)}</td>
        <td>${escapeHtml(user.account.accountNumber)}</td>
        <td>${formatCurrency(user.account.balance)}</td>
        <td>
          <button
            class="button ghost compact"
            type="button"
            data-action="toggle-status"
            data-user-id="${user.id}"
            data-next-status="${nextStatus}"
          >
            ${label}
          </button>
        </td>
      </tr>
    `;
  }).join("");
}

function renderAdminTransfers(transfers) {
  if (!transfers.length) {
    return `
      <tr>
        <td colspan="5">No hay transferencias registradas.</td>
      </tr>
    `;
  }

  return transfers.map((transfer) => `
    <tr>
      <td>${escapeHtml(transfer.sender.userName)}</td>
      <td>${escapeHtml(transfer.receiver.userName)}</td>
      <td>${formatCurrency(transfer.amount)}</td>
      <td>${escapeHtml(transfer.reference || "Sin referencia")}</td>
      <td>${new Date(transfer.createdAt).toLocaleString("es-CL")}</td>
    </tr>
  `).join("");
}

function renderAdminDashboard(profile, users, transfers) {
  const blocked = users.filter((user) => user.status === "blocked").length;

  return `
    <section class="dashboard-shell">
      <div class="dashboard-main">
        <section class="dashboard-grid">
          <article class="metric-card">
            <p class="eyebrow">Administrador</p>
            <h1>${escapeHtml(profile.user.fullName)}</h1>
            <p>${escapeHtml(profile.user.email)}</p>
          </article>
          <article class="metric-card">
            <p class="eyebrow">Usuarios</p>
            <h2>${users.length}</h2>
            <p>${blocked} bloqueados actualmente</p>
          </article>
          <article class="metric-card">
            <p class="eyebrow">Transferencias</p>
            <h2>${transfers.length}</h2>
            <p>Auditoria global de operaciones</p>
          </article>
        </section>

        <section class="table-panel">
          <div class="section-head">
            <div>
              <p class="eyebrow">Control de cuentas</p>
              <h2>Usuarios y estados</h2>
            </div>
          </div>
          <div class="table-wrap">
            <table>
              <caption class="sr-only">Listado administrativo de usuarios</caption>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Cuenta</th>
                  <th>Saldo</th>
                  <th>Accion</th>
                </tr>
              </thead>
              <tbody>
                ${renderAdminUsers(users)}
              </tbody>
            </table>
          </div>
        </section>

        <section class="table-panel">
          <div class="section-head">
            <div>
              <p class="eyebrow">Auditoria</p>
              <h2>Transferencias registradas</h2>
            </div>
          </div>
          <div class="table-wrap">
            <table>
              <caption class="sr-only">Listado global de transferencias</caption>
              <thead>
                <tr>
                  <th>Origen</th>
                  <th>Destino</th>
                  <th>Monto</th>
                  <th>Referencia</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                ${renderAdminTransfers(transfers)}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </section>
  `;
}

export function renderShell({ currentRoute, session, notice, content }) {
  return `
    <a class="skip-link" href="#main-content">Saltar al contenido principal</a>
    <div class="site-shell">
      <header class="site-header">
        <a class="brand" href="#/">
          <span class="brand-mark">A</span>
          <span>
            <strong>Aurora Bank</strong>
            <small>PostgreSQL Banking Lab</small>
          </span>
        </a>
        <nav class="site-nav" aria-label="Navegacion principal">
          ${publicNav(currentRoute)}
        </nav>
        <div class="site-actions">
          ${privateActions(session)}
        </div>
      </header>

      <main id="main-content" tabindex="-1" class="site-main">
        ${notice ? `<div class="notice ${notice.type}" role="status">${escapeHtml(notice.message)}</div>` : ""}
        ${content}
      </main>

      <footer class="site-footer">
        <p>Aurora Bank v1. Proyecto academico con OpenAPI, JWT y accesibilidad practica.</p>
        <a href="http://127.0.0.1:4000/docs" target="_blank" rel="noreferrer">Ver Swagger</a>
      </footer>
      <div class="sr-only" aria-live="polite">${notice ? escapeHtml(notice.message) : ""}</div>
    </div>
  `;
}

export function renderRoute(route, data) {
  switch (route) {
    case "/":
      return renderHome();
    case "/beneficios":
      return renderBenefits();
    case "/seguridad":
      return renderSecurity();
    case "/faq":
      return renderFaq();
    case "/contacto":
      return renderContact();
    case "/login":
      return renderLogin();
    case "/registro":
      return renderRegister();
    case "/dashboard":
      return renderUserDashboard(data.profile, data.transfers);
    case "/admin":
      return renderAdminDashboard(data.profile, data.users, data.transfers);
    default:
      return `
        <section class="content-panel">
          <p class="eyebrow">404</p>
          <h1>La ruta solicitada no existe.</h1>
          <a class="button" href="#/">Volver al inicio</a>
        </section>
      `;
  }
}
