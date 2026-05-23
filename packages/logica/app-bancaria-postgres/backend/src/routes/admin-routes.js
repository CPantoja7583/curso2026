const express = require("express");
const { asyncHandler } = require("../utils/async-handler");
const { authenticate } = require("../middleware/authenticate");
const { requireRole } = require("../middleware/require-role");
const { listUsers, updateUserStatus } = require("../services/user-service");
const { listAllTransfers } = require("../services/transfer-service");

const router = express.Router();

router.use(authenticate, requireRole("admin"));

router.get("/users", asyncHandler(async (_request, response) => {
  const users = await listUsers();
  response.json(users);
}));

router.patch("/users/:id/status", asyncHandler(async (request, response) => {
  const updated = await updateUserStatus(Number(request.params.id), request.body.status);
  response.json(updated);
}));

router.get("/transfers", asyncHandler(async (_request, response) => {
  const transfers = await listAllTransfers();
  response.json(transfers);
}));

module.exports = {
  adminRouter: router
};
