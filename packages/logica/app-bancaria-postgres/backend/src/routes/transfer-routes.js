const express = require("express");
const { asyncHandler } = require("../utils/async-handler");
const { authenticate } = require("../middleware/authenticate");
const { createTransfer } = require("../services/transfer-service");

const router = express.Router();

router.use(authenticate);

router.post("/", asyncHandler(async (request, response) => {
  const transfer = await createTransfer({
    userId: request.auth.user.id,
    destinationAccountNumber: request.body.destinationAccountNumber,
    amount: request.body.amount,
    reference: request.body.reference
  });

  response.status(201).json(transfer);
}));

module.exports = {
  transferRouter: router
};
