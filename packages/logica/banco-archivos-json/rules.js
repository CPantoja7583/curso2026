function normalizeText(value) {
  return String(value || "").trim();
}

function validateAccount(account) {
  return account &&
    typeof account.numero === "string" &&
    normalizeText(account.numero) &&
    Number.isFinite(Number(account.saldo)) &&
    Number(account.saldo) >= 0;
}

function hasValidRutAccount(payload) {
  return validateAccount(payload.cuentaRut);
}

function hasValidSavingsAccounts(payload) {
  return Array.isArray(payload.cuentasAhorro) &&
    payload.cuentasAhorro.length > 0 &&
    payload.cuentasAhorro.every(validateAccount);
}

function validateNewClientPayload(payload) {
  if (!payload || typeof payload.nombre !== "string" || !normalizeText(payload.nombre)) {
    return { valid: false, error: "Debes enviar un nombre valido." };
  }

  const hasRut = hasValidRutAccount(payload);
  const hasSavings = hasValidSavingsAccounts(payload);

  if (!hasRut && !hasSavings) {
    return { valid: false, error: "El cliente debe tener al menos una cuenta RUT o una cuenta de AHORRO." };
  }

  return { valid: true };
}

function normalizeAccount(account) {
  return {
    numero: normalizeText(account.numero),
    saldo: Number(account.saldo)
  };
}

function normalizeNewClient(payload, idCliente) {
  return {
    idCliente,
    nombre: normalizeText(payload.nombre),
    cuentaRut: hasValidRutAccount(payload) ? normalizeAccount(payload.cuentaRut) : null,
    cuentasAhorro: hasValidSavingsAccounts(payload)
      ? payload.cuentasAhorro.map(normalizeAccount)
      : []
  };
}

function canDeleteRutAccount(client) {
  return Boolean(client?.cuentaRut && client.cuentasAhorro?.length > 0);
}

function canDeleteSavingsAccount(client, accountNumber) {
  if (!client || !Array.isArray(client.cuentasAhorro)) {
    return false;
  }

  const normalizedNumber = normalizeText(accountNumber);
  const remainingSavings = client.cuentasAhorro.filter((account) => normalizeText(account.numero) !== normalizedNumber);

  return Boolean(client.cuentaRut || remainingSavings.length > 0);
}

module.exports = {
  canDeleteRutAccount,
  canDeleteSavingsAccount,
  normalizeAccount,
  normalizeNewClient,
  validateAccount,
  validateNewClientPayload
};
