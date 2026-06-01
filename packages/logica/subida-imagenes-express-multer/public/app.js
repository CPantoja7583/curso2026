const form = document.getElementById("formUpload");
const inputFoto = document.getElementById("inputFoto");
const feedback = document.getElementById("feedback");
const estadoCarga = document.getElementById("estadoCarga");
const previewBox = document.getElementById("previewBox");
const previewImage = document.getElementById("previewImage");
const previewMeta = document.getElementById("previewMeta");

function mostrarFeedback(tipo, mensaje) {
  feedback.className = `alert mt-4 alert-${tipo}`;
  feedback.textContent = mensaje;
  feedback.classList.remove("d-none");
}

function limpiarPreview() {
  previewBox.classList.add("d-none");
  previewImage.removeAttribute("src");
  previewMeta.textContent = "";
}

inputFoto.addEventListener("change", () => {
  feedback.classList.add("d-none");
  estadoCarga.textContent = "";
  limpiarPreview();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!inputFoto.files.length) {
    mostrarFeedback("danger", "Debes seleccionar una imagen antes de continuar.");
    return;
  }

  const formData = new FormData(form);
  estadoCarga.textContent = "Subiendo imagen...";
  feedback.classList.add("d-none");
  limpiarPreview();

  try {
    const response = await fetch("/upload", {
      method: "POST",
      body: formData
    });
    const payload = await response.json();

    estadoCarga.textContent = "";

    if (!response.ok || !payload.ok) {
      mostrarFeedback("danger", payload.mensaje || "No fue posible subir la imagen.");
      return;
    }

    mostrarFeedback("success", payload.mensaje);
    previewImage.src = payload.ruta;
    previewMeta.textContent = `Archivo guardado como ${payload.archivo}`;
    previewBox.classList.remove("d-none");
    form.reset();
  } catch (_error) {
    estadoCarga.textContent = "";
    mostrarFeedback("danger", "Error de red al intentar subir la imagen.");
  }
});
