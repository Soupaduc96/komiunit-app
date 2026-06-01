-- ============================================================================
-- KomiUnit — Wallet Engine Schema
-- Phase 2B  |  Apply via: Supabase Dashboard → SQL Editor → Run
-- ============================================================================

-- ─── Transaction type enum ───────────────────────────────────────────────────
-- Safe to re-run: exception is swallowed when type already exists.

DO $$ BEGIN
  CREATE TYPE transaction_type AS ENUM (
    'deposit',
    'withdrawal',
    'transfer_out',
    'transfer_in',
    'payment',
    'refund'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── Wallets ─────────────────────────────────────────────────────────────────
-- One wallet per user.  balance is the current authoritative balance.
-- balance_after on each transaction row is a point-in-time snapshot.

CREATE TABLE IF NOT EXISTS wallets (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  balance    DECIMAL(15, 2) NOT NULL DEFAULT 0.00 CHECK (balance >= 0),
  currency   VARCHAR(3)  NOT NULL DEFAULT 'USD',
  is_active  BOOLEAN     NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT wallets_user_id_unique UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);

CREATE OR REPLACE TRIGGER wallets_updated_at
  BEFORE UPDATE ON wallets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── Transactions ─────────────────────────────────────────────────────────────
-- Append-only ledger.  Never UPDATE or DELETE rows.
-- balance_after records the wallet balance immediately after this entry.
-- reference_id / reference_type link to komi_sends, orders, etc.

CREATE TABLE IF NOT EXISTS transactions (
  id             UUID             PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id      UUID             NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  user_id        UUID             NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
  type           transaction_type NOT NULL,
  amount         DECIMAL(15, 2)   NOT NULL CHECK (amount > 0),
  balance_after  DECIMAL(15, 2)   NOT NULL,
  description    TEXT,
  reference_id   UUID,
  reference_type VARCHAR(50),
  status         VARCHAR(20)      NOT NULL DEFAULT 'completed'
                 CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  metadata       JSONB,
  created_at     TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id    ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id  ON transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type       ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_reference
  ON transactions(reference_id)
  WHERE reference_id IS NOT NULL;

-- ─── Row Level Security ───────────────────────────────────────────────────────

ALTER TABLE wallets      ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Wallets: users see and mutate only their own row.
-- The app creates wallets via getOrCreateWallet() which runs as the authed user.

CREATE POLICY "wallets_select_own"
  ON wallets FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "wallets_insert_own"
  ON wallets FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wallets_update_own"
  ON wallets FOR UPDATE USING (auth.uid() = user_id);

-- Transactions: users see only their own rows.
-- Inserts are performed via SECURITY DEFINER functions (see below) so that
-- the balance update and transaction insert are always atomic.

CREATE POLICY "transactions_select_own"
  ON transactions FOR SELECT USING (auth.uid() = user_id);

-- Direct INSERT is intentionally blocked for normal client code.
-- Use the record_transaction() RPC instead (SECURITY DEFINER, bypasses RLS).
-- Uncomment the policy below if you prefer client-side inserts for now:
-- CREATE POLICY "transactions_insert_own"
--   ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ─── Atomic balance + ledger function ────────────────────────────────────────
-- record_transaction(p_user_id, p_type, p_amount, p_description, p_reference_id, p_reference_type)
-- Deducts / credits the wallet and appends a transaction row in one transaction.
-- Returns the new transaction row as JSON.
-- Called from the app via supabase.rpc('record_transaction', {...}).

CREATE OR REPLACE FUNCTION record_transaction(
  p_user_id      UUID,
  p_type         transaction_type,
  p_amount       DECIMAL,
  p_description  TEXT       DEFAULT NULL,
  p_reference_id UUID       DEFAULT NULL,
  p_reference_type VARCHAR  DEFAULT NULL,
  p_metadata     JSONB      DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wallet       wallets%ROWTYPE;
  v_new_balance  DECIMAL(15, 2);
  v_txn          transactions%ROWTYPE;
BEGIN
  -- Lock the wallet row for this user (creates it if missing)
  SELECT * INTO v_wallet
    FROM wallets
   WHERE user_id = p_user_id
     FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO wallets (user_id, balance, currency)
    VALUES (p_user_id, 0.00, 'USD')
    RETURNING * INTO v_wallet;
  END IF;

  -- Calculate new balance
  IF p_type IN ('deposit', 'transfer_in', 'refund') THEN
    v_new_balance := v_wallet.balance + p_amount;
  ELSIF p_type IN ('withdrawal', 'transfer_out', 'payment') THEN
    IF v_wallet.balance < p_amount THEN
      RAISE EXCEPTION 'Insufficient balance: available %, requested %',
        v_wallet.balance, p_amount;
    END IF;
    v_new_balance := v_wallet.balance - p_amount;
  ELSE
    RAISE EXCEPTION 'Unknown transaction type: %', p_type;
  END IF;

  -- Update wallet balance
  UPDATE wallets
     SET balance = v_new_balance, updated_at = NOW()
   WHERE id = v_wallet.id;

  -- Append ledger entry
  INSERT INTO transactions (
    wallet_id, user_id, type, amount, balance_after,
    description, reference_id, reference_type, status, metadata
  ) VALUES (
    v_wallet.id, p_user_id, p_type, p_amount, v_new_balance,
    p_description, p_reference_id, p_reference_type, 'completed', p_metadata
  )
  RETURNING * INTO v_txn;

  RETURN row_to_json(v_txn)::JSONB;
END;
$$;
