# Transaction Engine — Status

_Phase 2B · 2026-06-01_

## Services

### `WalletService` (`src/services/wallet/wallet-service.ts`)

| Method | Signature | Notes |
|--------|-----------|-------|
| `getWallet` | `(userId) → Wallet \| null` | SELECT by user_id, returns null if not found |
| `getOrCreateWallet` | `(userId) → Wallet` | SELECT then INSERT; handles 23505 unique-violation race |
| `getBalance` | `(userId) → number` | Convenience — returns 0 if wallet missing |

### `TransactionService` (`src/services/wallet/transaction-service.ts`)

| Method | Signature | Notes |
|--------|-----------|-------|
| `getTransactions` | `(userId, limit=20, offset=0) → Transaction[]` | Paginated, newest-first |
| `getRecentTransactions` | `(userId, limit=10) → Transaction[]` | Dashboard quick-load |
| `getTransactionById` | `(transactionId) → Transaction \| undefined` | Detail view |

## Hook (`src/hooks/use-wallet.ts`)

```typescript
const {
  wallet,            // Wallet | null — current wallet (null while loading or on error)
  transactions,      // Transaction[] — recent 10, newest-first
  loading,           // boolean — true during initial load or refresh
  error,             // string | null
  refresh,           // () => void — re-fetches wallet + recent transactions
  loadMoreTransactions, // (offset: number) => Promise<Transaction[]> — pagination
  clearError,        // () => void
} = useWallet();
```

**Auto-loads** on mount and whenever `user.id` changes.  
Uses `Promise.all` for wallet + transactions so both load in parallel.  
`loadMoreTransactions` deduplicates by transaction id before appending to state.

## Dashboard integration (`src/app/(tabs)/index.tsx`)

| Before | After |
|--------|-------|
| `$1,250.50` hardcoded | `Formatting.currency(wallet?.balance ?? 0, wallet?.currency ?? 'USD')` |
| No loading state | `<ActivityIndicator>` while `walletLoading` |
| "No recent activity yet" (always) | Real transaction list when `transactions.length > 0` |
| `console.log('[HomeScreen]...')` | Removed |

### `TransactionRow` component (inline in HomeScreen)
- Icon badge keyed to `TransactionType`
- Description line: custom description or fallback to type label
- Sub-line: type label · formatted date
- Amount: **+green** for credits (deposit, transfer_in, refund) / **−red** for debits
- `isLast` prop removes the bottom border on the final row

## How to create transactions (Phase 2C+)

All balance mutations go through the `record_transaction` RPC:

```typescript
const { data, error } = await supabase.rpc('record_transaction', {
  p_user_id:       userId,
  p_type:          'transfer_out',
  p_amount:        50.00,
  p_description:   'Sent to Paul',
  p_reference_id:  komiSendId,        // optional
  p_reference_type: 'komi_send',      // optional
});
```

The function:
1. Locks the wallet row with `FOR UPDATE`
2. Checks sufficient balance for debits
3. Updates `wallets.balance`
4. Inserts a `transactions` row with the `balance_after` snapshot
5. Returns the new transaction as JSON

For a KomiSend transfer (two users), call `record_transaction` twice in sequence — once for the sender's `transfer_out`, once for the recipient's `transfer_in`. A Supabase Edge Function is the right place for cross-user atomicity.
