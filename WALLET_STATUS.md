# Wallet Engine — Status

_Phase 2B · 2026-06-01_

## Schema (`WALLET_SCHEMA.sql`)

| Object | Type | Status |
|--------|------|--------|
| `transaction_type` | ENUM | ✅ deposit, withdrawal, transfer_out, transfer_in, payment, refund |
| `wallets` | Table | ✅ id, user_id (UNIQUE), balance, currency, is_active, timestamps |
| `transactions` | Table | ✅ id, wallet_id, user_id, type, amount, balance_after, description, reference_id/type, status, metadata, created_at |
| `wallets_updated_at` | Trigger | ✅ auto-updates updated_at |
| `wallets_select/insert/update_own` | RLS | ✅ auth.uid() = user_id |
| `transactions_select_own` | RLS | ✅ auth.uid() = user_id |
| `record_transaction()` | RPC function | ✅ SECURITY DEFINER — atomic balance + ledger append |

### Key design decisions
- `balance` on the wallet row is the **live authoritative balance** — never derived
- `balance_after` on each transaction is a **point-in-time snapshot** for audit/display
- Direct client INSERT on `transactions` is blocked by default; use `record_transaction()` RPC to guarantee atomicity
- The RPC function handles the `FOR UPDATE` lock on the wallet row, preventing race conditions on concurrent transfers

## TypeScript Types (`src/types/wallet.ts`)

```typescript
type TransactionType  = 'deposit' | 'withdrawal' | 'transfer_out' | 'transfer_in' | 'payment' | 'refund'
type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled'
interface Wallet       { id, userId, balance, currency, isActive, createdAt, updatedAt }
interface Transaction  { id, walletId, userId, type, amount, balanceAfter, description?,
                         referenceId?, referenceType?, status, metadata?, createdAt }
```

## Mappers (`src/services/supabase/mappers.ts`)

| Mapper | Maps |
|--------|------|
| `mapWallet(row)` | snake_case DB row → `Wallet` |
| `mapTransaction(row)` | snake_case DB row → `Transaction` |

## Apply order
1. Run `WALLET_SCHEMA.sql` in Supabase SQL Editor
2. Verify `wallets` and `transactions` tables appear in Table Editor
3. Verify `record_transaction` function appears under Database → Functions
4. Test with a manual deposit via SQL to confirm ledger + balance update
