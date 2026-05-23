const { query, withTransaction } = require("../config/db");
const { HttpError } = require("../utils/http-error");
const { serializeTransfer } = require("../utils/serializers");

async function listMyTransfers(userId) {
  const result = await query(
    `SELECT
       t.id,
       t.amount,
       t.reference,
       t.status,
       t.sender_balance_after,
       t.receiver_balance_after,
       t.created_at,
       sa.account_number AS sender_account_number,
       su.full_name AS sender_name,
       su.email AS sender_email,
       ra.account_number AS receiver_account_number,
       ru.full_name AS receiver_name,
       ru.email AS receiver_email
     FROM transfers t
     JOIN accounts sa ON sa.id = t.sender_account_id
     JOIN users su ON su.id = sa.user_id
     JOIN accounts ra ON ra.id = t.receiver_account_id
     JOIN users ru ON ru.id = ra.user_id
     WHERE su.id = $1 OR ru.id = $1
     ORDER BY t.created_at DESC`,
    [userId]
  );

  return result.rows.map(serializeTransfer);
}

async function listAllTransfers() {
  const result = await query(
    `SELECT
       t.id,
       t.amount,
       t.reference,
       t.status,
       t.sender_balance_after,
       t.receiver_balance_after,
       t.created_at,
       sa.account_number AS sender_account_number,
       su.full_name AS sender_name,
       su.email AS sender_email,
       ra.account_number AS receiver_account_number,
       ru.full_name AS receiver_name,
       ru.email AS receiver_email
     FROM transfers t
     JOIN accounts sa ON sa.id = t.sender_account_id
     JOIN users su ON su.id = sa.user_id
     JOIN accounts ra ON ra.id = t.receiver_account_id
     JOIN users ru ON ru.id = ra.user_id
     ORDER BY t.created_at DESC`
  );

  return result.rows.map(serializeTransfer);
}

async function createTransfer({ userId, destinationAccountNumber, amount, reference }) {
  const numericAmount = Number(amount);

  if (!destinationAccountNumber) {
    throw new HttpError(400, "Debes indicar la cuenta de destino.");
  }

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new HttpError(400, "El monto debe ser mayor a cero.");
  }

  return withTransaction(async (client) => {
    const senderResult = await client.query(
      `SELECT
         a.id,
         a.user_id,
         a.account_number,
         a.balance,
         a.status,
         u.full_name,
         u.email,
         u.status AS user_status
       FROM accounts a
       JOIN users u ON u.id = a.user_id
       WHERE a.user_id = $1`,
      [userId]
    );

    if (!senderResult.rowCount) {
      throw new HttpError(404, "Cuenta emisora no encontrada.");
    }

    const sender = senderResult.rows[0];

    if (sender.status === "blocked" || sender.user_status === "blocked") {
      throw new HttpError(403, "Tu cuenta esta bloqueada y no puede transferir.");
    }

    const receiverResult = await client.query(
      `SELECT
         a.id,
         a.user_id,
         a.account_number,
         a.balance,
         a.status,
         u.full_name,
         u.email,
         u.status AS user_status
       FROM accounts a
       JOIN users u ON u.id = a.user_id
       WHERE a.account_number = $1`,
      [destinationAccountNumber.trim()]
    );

    if (!receiverResult.rowCount) {
      throw new HttpError(404, "La cuenta de destino no existe.");
    }

    const receiver = receiverResult.rows[0];

    if (sender.id === receiver.id) {
      throw new HttpError(400, "No puedes transferir a tu propia cuenta.");
    }

    if (receiver.status === "blocked" || receiver.user_status === "blocked") {
      throw new HttpError(403, "La cuenta de destino esta bloqueada.");
    }

    const ids = [sender.id, receiver.id].sort((left, right) => left - right);
    const locked = await client.query(
      `SELECT id, balance
       FROM accounts
       WHERE id = ANY($1::bigint[])
       ORDER BY id
       FOR UPDATE`,
      [ids]
    );

    const lockedMap = new Map(locked.rows.map((row) => [Number(row.id), Number(row.balance)]));
    const senderBalance = lockedMap.get(Number(sender.id));
    const receiverBalance = lockedMap.get(Number(receiver.id));

    if (senderBalance < numericAmount) {
      throw new HttpError(400, "Saldo insuficiente para completar la transferencia.");
    }

    const senderBalanceAfter = senderBalance - numericAmount;
    const receiverBalanceAfter = receiverBalance + numericAmount;

    await client.query(
      "UPDATE accounts SET balance = $2 WHERE id = $1",
      [sender.id, senderBalanceAfter]
    );

    await client.query(
      "UPDATE accounts SET balance = $2 WHERE id = $1",
      [receiver.id, receiverBalanceAfter]
    );

    const transferResult = await client.query(
      `INSERT INTO transfers (
         sender_account_id,
         receiver_account_id,
         amount,
         reference,
         status,
         sender_balance_after,
         receiver_balance_after
       )
       VALUES ($1, $2, $3, $4, 'completed', $5, $6)
       RETURNING id, amount, reference, status, sender_balance_after, receiver_balance_after, created_at`,
      [
        sender.id,
        receiver.id,
        numericAmount,
        reference ? reference.trim() : "Transferencia web",
        senderBalanceAfter,
        receiverBalanceAfter
      ]
    );

    const transfer = transferResult.rows[0];
    return {
      id: Number(transfer.id),
      amount: Number(transfer.amount),
      reference: transfer.reference,
      status: transfer.status,
      senderBalanceAfter: Number(transfer.sender_balance_after),
      receiverBalanceAfter: Number(transfer.receiver_balance_after),
      createdAt: transfer.created_at,
      sender: {
        accountNumber: sender.account_number,
        userName: sender.full_name,
        userEmail: sender.email
      },
      receiver: {
        accountNumber: receiver.account_number,
        userName: receiver.full_name,
        userEmail: receiver.email
      }
    };
  });
}

module.exports = {
  listMyTransfers,
  listAllTransfers,
  createTransfer
};
