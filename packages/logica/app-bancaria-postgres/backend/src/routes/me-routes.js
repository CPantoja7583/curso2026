const express = require("express");
const { asyncHandler } = require("../utils/async-handler");
const { authenticate } = require("../middleware/authenticate");
const { getMyProfile } = require("../services/user-service");
const { listMyTransfers } = require("../services/transfer-service");

const router = express.Router();

router.use(authenticate);

router.get("/", asyncHandler(async (request, response) => {
  const profile = await getMyProfile(request.auth.user.id);
  response.json(profile);
}));

router.get("/account", asyncHandler(async (request, response) => {
  const profile = await getMyProfile(request.auth.user.id);
  response.json(profile.account);
}));

router.get("/transfers", asyncHandler(async (request, response) => {
  const transfers = await listMyTransfers(request.auth.user.id);
  response.json(transfers);
}));

module.exports = {
  meRouter: router
};
