const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const DEFAULT_UPLOAD_DIR = path.join(__dirname, "uploads");
const DEFAULT_PUBLIC_DIR = path.join(__dirname, "public");

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function createApp(options = {}) {
  const app = express();
  const uploadDir = options.uploadDir || process.env.UPLOAD_DIR || DEFAULT_UPLOAD_DIR;
  const publicDir = options.publicDir || DEFAULT_PUBLIC_DIR;

  ensureDir(uploadDir);

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || "").toLowerCase();
      const safeExt = ext || ".png";
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
    }
  });

  const fileFilter = (_req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif"];
    const ext = path.extname(file.originalname || "").toLowerCase();
    const isValid = allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext);

    if (!isValid) {
      cb(new Error("Tipo de archivo no permitido. Solo jpg, jpeg, png y gif."));
      return;
    }

    cb(null, true);
  };

  const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter
  });

  app.use(express.static(publicDir));
  app.use("/uploads", express.static(uploadDir));

  app.post("/upload", (req, res, next) => {
    upload.single("foto")(req, res, (error) => {
      if (error) {
        next(error);
        return;
      }

      if (!req.file) {
        res.status(400).json({ ok: false, mensaje: "No se recibio una imagen valida." });
        return;
      }

      res.status(201).json({
        ok: true,
        mensaje: "Imagen subida correctamente.",
        archivo: req.file.filename,
        ruta: `/uploads/${req.file.filename}`
      });
    });
  });

  app.use((err, _req, res, _next) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          ok: false,
          mensaje: "La imagen supera el limite permitido de 5 MB."
        });
      }

      return res.status(400).json({ ok: false, mensaje: err.message });
    }

    if (err) {
      return res.status(415).json({ ok: false, mensaje: err.message });
    }

    res.status(500).json({ ok: false, mensaje: "Error interno del servidor." });
  });

  return app;
}

if (require.main === module) {
  const app = createApp();
  const port = Number(process.env.PORT) || 3008;

  app.listen(port, () => {
    console.log(`Servidor de subida disponible en http://127.0.0.1:${port}`);
  });
}

module.exports = { createApp, ensureDir };
