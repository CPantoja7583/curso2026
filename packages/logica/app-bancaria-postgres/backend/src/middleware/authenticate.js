const { verifyAccessToken } = require("../utils/tokens");
const { findUserContextById } = require("../services/user-service");

async function authenticate(request, response, next) {
  const authorization = request.headers.authorization || "";

  if (!authorization.startsWith("Bearer ")) {
    response.status(401).json({ error: "Debes enviar un access token valido." });
    return;
  }

  try {
    const token = authorization.slice(7);
    const payload = verifyAccessToken(token);
    const context = await findUserContextById(Number(payload.sub));

    if (!context) {
      response.status(401).json({ error: "El usuario asociado al token ya no existe." });
      return;
    }

    if (context.user.status === "blocked" || context.account.status === "blocked") {
      response.status(403).json({ error: "La cuenta esta bloqueada para operar." });
      return;
    }

    request.auth = {
      user: context.user,
      account: context.account
    };
    next();
  } catch {
    response.status(401).json({ error: "Access token invalido o expirado." });
  }
}

module.exports = {
  authenticate
};
