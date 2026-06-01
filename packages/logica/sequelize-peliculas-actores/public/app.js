const refreshButton = document.querySelector("#refreshButton");
const movieForm = document.querySelector("#movieForm");
const actorForm = document.querySelector("#actorForm");
const assignForm = document.querySelector("#assignForm");
const moviesList = document.querySelector("#moviesList");
const actorsList = document.querySelector("#actorsList");
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
  return Object.fromEntries(new FormData(form).entries());
}

function renderMovies(movies) {
  if (!movies.length) {
    moviesList.innerHTML = '<article class="item">Sin peliculas.</article>';
    return;
  }

  moviesList.innerHTML = movies
    .map((movie) => {
      const actors = movie.Actors || movie.Actores || [];
      const names = actors.map((actor) => actor.nombre).join(", ") || "Sin actores";
      return `<article class="item"><strong>#${movie.id} ${movie.titulo}</strong><span>${movie.anio}</span><small>${names}</small></article>`;
    })
    .join("");
}

function renderActors(actors) {
  if (!actors.length) {
    actorsList.innerHTML = '<article class="item">Sin actores.</article>';
    return;
  }

  actorsList.innerHTML = actors
    .map((actor) => {
      const movies = actor.Peliculas || [];
      const titles = movies.map((movie) => movie.titulo).join(", ") || "Sin peliculas";
      return `<article class="item"><strong>#${actor.id} ${actor.nombre}</strong><span>${actor.fecha_nacimiento}</span><small>${titles}</small></article>`;
    })
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

async function loadAll() {
  setMessage("Cargando listas...");
  const [movies, actors] = await Promise.all([requestJson("/peliculas"), requestJson("/actores")]);
  renderMovies(movies.data || []);
  renderActors(actors.data || []);
  setMessage("Listas actualizadas.", "success");
}

refreshButton.addEventListener("click", () => {
  loadAll().catch((error) => setMessage(error.message, "error"));
});

movieForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const data = await requestJson("/peliculas", {
      method: "POST",
      body: JSON.stringify(formObject(movieForm)),
    });
    setMessage(data.mensaje, "success");
    movieForm.reset();
    await loadAll();
  } catch (error) {
    setMessage(error.message, "error");
  }
});

actorForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const data = await requestJson("/actores", {
      method: "POST",
      body: JSON.stringify(formObject(actorForm)),
    });
    setMessage(data.mensaje, "success");
    actorForm.reset();
    await loadAll();
  } catch (error) {
    setMessage(error.message, "error");
  }
});

assignForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const data = await requestJson("/asignar-actor", {
      method: "POST",
      body: JSON.stringify(formObject(assignForm)),
    });
    setMessage(data.mensaje, "success");
    assignForm.reset();
    await loadAll();
  } catch (error) {
    setMessage(error.message, "error");
  }
});

loadAll().catch((error) => setMessage(error.message, "error"));
