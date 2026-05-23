const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const env = require("./config/env");
const { HttpError } = require("./utils/http-error");
const { authRouter } = require("./routes/auth-routes");
const { meRouter } = require("./routes/me-routes");
const { transferRouter } = require("./routes/transfer-routes");
const { adminRouter } = require("./routes/admin-routes");
const { spec } = require("./openapi");

const app = express();

app.use(cors({
  origin: env.frontendOrigin
}));
app.use(express.json());

app.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.get("/openapi.json", (_request, response) => {
  response.json(spec);
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(spec, {
  explorer: true
}));

app.use("/auth", authRouter);
app.use("/me", meRouter);
app.use("/transfers", transferRouter);
app.use("/admin", adminRouter);

app.use((_request, response) => {
  response.status(404).json({ error: "Ruta no encontrada." });
});

app.use((error, _request, response, _next) => {
  if (error instanceof HttpError) {
    response.status(error.status).json({ error: error.message });
    return;
  }

  if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
    response.status(401).json({ error: "Token invalido o expirado." });
    return;
  }

  console.error(error);
  response.status(500).json({ error: "Error interno del servidor." });
});

module.exports = {
  app
};
