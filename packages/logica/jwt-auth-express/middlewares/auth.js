const jwt = require("jsonwebtoken");
const { buildErrorResponse, extractBearerToken } = require("../src/auth-utils");

module.exports = function auth(req, res, next) {
  const token = extractBearerToken(req.headers.authorization || "");

  if (!token) {
    return res.status(401).json(buildErrorResponse("Token requerido"));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json(buildErrorResponse("Token invalido o expirado"));
  }
};
