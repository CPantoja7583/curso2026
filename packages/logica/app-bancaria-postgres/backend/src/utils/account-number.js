function buildAccountNumber() {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000).toString();
  return `AU-${timestamp}${random}`;
}

async function generateUniqueAccountNumber(client) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const candidate = buildAccountNumber();
    const exists = await client.query(
      "SELECT 1 FROM accounts WHERE account_number = $1",
      [candidate]
    );

    if (!exists.rowCount) {
      return candidate;
    }
  }

  throw new Error("No fue posible generar un numero de cuenta unico.");
}

module.exports = {
  generateUniqueAccountNumber
};
