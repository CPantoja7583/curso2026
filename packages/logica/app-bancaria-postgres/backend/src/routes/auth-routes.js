const express = require("express");
const { asyncHandler } = require("../utils/async-handler");
const authService = require("../services/auth-service");

const router = express.Router();

router.post("/register", asyncHandler(async (request, response) => {
  const session = await authService.register(request.body);
  response.status(201).json(session);
}));

router.post("/login", asyncHandler(async (request, response) => {
  const session = await authService.login(request.body);
  response.json(session);
}));

router.post("/refresh", asyncHandler(async (request, response) => {
  const session = await authService.refresh(request.body.refreshToken);
  response.json(session);
}));

router.post("/logout", asyncHandler(async (request, response) => {
  const result = await authService.logout(request.body.refreshToken);
  response.json(result);
}));

module.exports = {
  authRouter: router
};
