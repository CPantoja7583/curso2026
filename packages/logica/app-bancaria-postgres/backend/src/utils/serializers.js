function toNumber(value) {
  return Number(value);
}

function serializeUser(row) {
  return {
    id: Number(row.id),
    fullName: row.full_name,
    email: row.email,
    role: row.role,
    status: row.status,
    createdAt: row.created_at
  };
}

function serializeAccount(row) {
  return {
    id: Number(row.id),
    userId: Number(row.user_id),
    accountNumber: row.account_number,
    balance: toNumber(row.balance),
    currency: row.currency,
    status: row.status,
    createdAt: row.created_at
  };
}

function serializeTransfer(row) {
  return {
    id: Number(row.id),
    amount: toNumber(row.amount),
    reference: row.reference,
    status: row.status,
    senderBalanceAfter: toNumber(row.sender_balance_after),
    receiverBalanceAfter: toNumber(row.receiver_balance_after),
    createdAt: row.created_at,
    sender: {
      accountNumber: row.sender_account_number,
      userName: row.sender_name,
      userEmail: row.sender_email
    },
    receiver: {
      accountNumber: row.receiver_account_number,
      userName: row.receiver_name,
      userEmail: row.receiver_email
    }
  };
}

module.exports = {
  serializeUser,
  serializeAccount,
  serializeTransfer
};
