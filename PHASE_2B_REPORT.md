# Phase 2B — Wallet Engine Report

_Completed: 2026-06-01_

## Objectives vs Delivery

| # | Objective | Status |
|---|-----------|--------|
| 1 | Create wallets table | ✅ `WALLET_SCHEMA.sql` |
| 2 | Create transactions table | ✅ `WALLET_SCHEMA.sql` |
| 3 | Create transaction types enum | ✅ `transaction_type` ENUM + `TransactionType` TS type |
| 4 | Add RLS policies | ✅ select/insert/update on wallets; select on transactions |
| 5 | Create wallet service | ✅ `src/services/wallet/wallet-service.ts` |
| 6 | Create transaction service | ✅ `src/services/wallet/transaction-service.ts` |
| 7 | Load real wallet balance on dashboard | ✅ `useWallet` + HomeScreen updated |
| 8 | Replace hardcoded $1,250.50 | ✅ `Formatting.currency(wallet?.balance ?? 0, ...)` |
| 9 | Create wallet hooks | ✅ `src/hooks/use-wallet.ts` |
| 10 | Create transaction history query | ✅ `getTransactions` (paginated) + `getRecentTransactions` |

## Files Created

| File | Purpose |
|------|---------|
| `WALLET_SCHEMA.sql` | SQL migration — tables, enum, RLS, `record_transaction()` RPC |
| `src/types/wallet.ts` | `Wallet`, `Transaction`, `TransactionType`, `TransactionStatus` |
| `src/services/wallet/wallet-service.ts` | `WalletService` — getWallet, getOrCreateWallet, getBalance |
| `src/services/wallet/transaction-service.ts` | `TransactionService` — paginated query, recent, by ID |
| `src/hooks/use-wallet.ts` | `useWallet` — auto-load, refresh, pagination, error state |

## Files Modified

| File | Change |
|------|--------|
| `src/services/supabase/mappers.ts` | Added `mapWallet`, `mapTransaction` + wallet type import |
| `src/app/(tabs)/index.tsx` | Real balance, loading/error states, transaction list, removed debug log |
| `src/context/auth-context.tsx` | Removed `[AuthContext]` debug console.logs; kept one `console.error` per catch |

## TypeScript
```
npx tsc --noEmit → 0 errors
```

## Architecture Notes

### `record_transaction()` RPC — why it matters
Client-side code that does `UPDATE wallets SET balance = balance - X` followed by `INSERT INTO transactions` is not atomic. A crash, network drop, or concurrent request can leave the balance and ledger out of sync. The `SECURITY DEFINER` RPC runs both operations inside a single PostgreSQL transaction with a `FOR UPDATE` lock on the wallet row. This is the only correct way to mutate balances.

### `getOrCreateWallet` — why not upsert
Supabase's `.upsert({...}, { ignoreDuplicates: true })` silently succeeds but returns no data on conflict. Using SELECT → INSERT with a `23505` error fallback is more explicit and always returns the canonical wallet row.

### `user?.id` in hook dependency arrays
`useWallet` depends on `user?.id` (not the whole `user` object) so the wallet does not reload when `fullName` or `phone` is updated via `updateProfile`. The wallet only reloads when a different user logs in.

## Next Steps (Phase 2C)

1. **Apply `WALLET_SCHEMA.sql`** to the live Supabase project
2. **Wire KomiSend** to call `supabase.rpc('record_transaction', {...})` after a successful transfer — debit sender, credit recipient
3. **Transaction detail screen** — tap a row in the recent activity list to open a full detail view
4. **Pagination** — use `loadMoreTransactions(offset)` from `useWallet` on a "Load more" button
5. **Real-time updates** — subscribe to `supabase.channel('wallet:userId')` for live balance changes
