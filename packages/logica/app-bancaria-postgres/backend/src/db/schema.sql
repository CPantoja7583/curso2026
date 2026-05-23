CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'user')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'blocked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS accounts (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  account_number VARCHAR(24) NOT NULL UNIQUE,
  balance NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  currency VARCHAR(10) NOT NULL DEFAULT 'CLP',
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'blocked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_id VARCHAR(80) NOT NULL UNIQUE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transfers (
  id BIGSERIAL PRIMARY KEY,
  sender_account_id BIGINT NOT NULL REFERENCES accounts(id),
  receiver_account_id BIGINT NOT NULL REFERENCES accounts(id),
  amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
  reference VARCHAR(180),
  status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'rejected')),
  sender_balance_after NUMERIC(14, 2) NOT NULL,
  receiver_balance_after NUMERIC(14, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_accounts_account_number ON accounts(account_number);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_transfers_sender_account ON transfers(sender_account_id);
CREATE INDEX IF NOT EXISTS idx_transfers_receiver_account ON transfers(receiver_account_id);
