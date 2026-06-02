# Wallet Frontend Root Cause — "Could not load balance"

## Confirmed context

- `wallets` table: row exists, `balance = 200.00`, `currency = USD`
- RLS SELECT/INSERT/UPDATE: correct (`auth.uid() = user_id`)
- Supabase returns wallet data successfully
- UI still shows "Could not load balance"

---

## Root cause: `Promise.all` coupling — transaction failure masks wallet balance

**File**: `src/hooks/use-wallet.ts` — lines 22-34 (before fix)

```typescript
// BEFORE — one Promise.all couples both fetches
const [w, txns] = await Promise.all([
  WalletService.getOrCreateWallet(userId),   // succeeds ✓
  TransactionService.getRecentTransactions(userId, RECENT_LIMIT),  // THROWS ✗
]);
```

`Promise.all` fails fast: if **either** promise rejects, the entire call rejects.
`getOrCreateWallet` succeeds and returns the wallet.  
`getRecentTransactions` throws (see cause below).  
The catch block runs → `setError(...)` → `wallet` stays `null`.  
HomeScreen: `walletError` is truthy → shows **"Could not load balance"**.

---

## Why `getRecentTransactions` throws

**File**: `src/services/wallet/transaction-service.ts`

```typescript
const { data, error } = await supabase
  .from('transactions')
  .select('*')
  .eq('user_id', userId)   // ← querying by user_id
  ...
if (error) throw new Error(error.message);
```

The `transactions` table either:

| Scenario | Supabase error | JS throw |
|----------|----------------|----------|
| Table does not exist | `42P01: relation "transactions" does not exist` | `Error("relation...")` |
| Table exists, no `user_id` column | `42703: column transactions.user_id does not exist` | `Error("column...")` |
| Table exists, RLS blocks SELECT | PGRST* or empty result | empty array (no throw) |

Check the browser console for the `[TransactionService.getRecentTransactions] Supabase error:` log — it will show the exact `code`, `message`, and `hint`.

---

## Secondary cause (pre-existing)

`getRecentTransactions` queries by `user_id`. If the `transactions` table schema only links records through `wallet_id` (not a direct `user_id` column), this query will never work regardless of RLS.

Correct query when `user_id` column is absent:
```typescript
supabase
  .from('transactions')
  .select('*')
  .eq('wallet_id', walletId)   // needs wallet.id, not user.id
  .order('created_at', { ascending: false })
  .limit(limit)
```

---

## Fix applied

`useWallet.loadWallet()` now fetches wallet and transactions in **separate sequential try-catch blocks** with different failure semantics:

- **Wallet fetch fails** → `setError(message)` → "Could not load balance" shown
- **Transaction fetch fails** → logged silently → balance shows correctly, transaction list is empty

The balance is now always visible as long as the wallet row is accessible.
