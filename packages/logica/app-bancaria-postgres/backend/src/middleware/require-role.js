function requireRole(role) {
  return (request, response, next) => {
    if (!request.auth || request.auth.user.role !== role) {
      response.status(403).json({ error: "No tienes permisos para acceder a este recurso." });
      return;
    }

    next();
  };
}

module.exports = {
  requireRole
};
