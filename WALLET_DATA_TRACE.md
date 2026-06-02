# Wallet Data Trace — Frontend to Supabase

Full data flow with all logging checkpoints added.

---

## Phase 1: `useWallet.loadWallet()` entry

```
user.id = "abc123"
setLoading(true), setError(null)
```

---

## Phase 2: Wallet fetch (critical path)

```
WalletService.getOrCreateWallet("abc123")
  └─ WalletService.getWallet("abc123")
       └─ supabase
            .from('wallets')
            .select('*')
            .eq('user_id', 'abc123')
            .maybeSingle()

  ──── LOGGING CHECKPOINT A ────────────────────────────────────────
  console.log('[WalletService.getWallet] raw row:', data, 'error:', error)

  Expected raw row:
  {
    id: "uuid-...",
    user_id: "abc123",
    balance: "200.00",     ← Supabase returns NUMERIC as string
    currency: "USD",
    is_active: true,
    created_at: "2024-...",
    updated_at: "2024-..."
  }
  ──────────────────────────────────────────────────────────────────

  mapWallet(rawRow):
    if (!row)             → row truthy, no throw
    id:       row.id      → "uuid-..."
    userId:   row.user_id → "abc123"
    balance:  parseFloat("200.00" ?? 0)   → 200        [Number conversion]
    currency: "USD" || 'USD'              → "USD"
    isActive: true ?? true                → true
    createdAt: "2024-..." ?? ''           → "2024-..."  [Date string, no conversion]
    updatedAt: "2024-..." ?? ''           → "2024-..."

  ──── LOGGING CHECKPOINT B ────────────────────────────────────────
  console.log('[WalletService.getWallet] mapped wallet:', mappedWallet)

  Expected mapped wallet:
  { id: "uuid-...", userId: "abc123", balance: 200, currency: "USD",
    isActive: true, createdAt: "2024-...", updatedAt: "2024-..." }
  ──────────────────────────────────────────────────────────────────

  ──── LOGGING CHECKPOINT C ────────────────────────────────────────
  console.log('[useWallet] wallet loaded:', { id, balance, currency })
  ──────────────────────────────────────────────────────────────────

setWallet(wallet)    ← balance shows on screen if we reach here
```

---

## Phase 3: Transaction fetch (non-critical path)

```
TransactionService.getRecentTransactions("abc123", 10)
  └─ supabase
       .from('transactions')
       .select('*')
       .eq('user_id', 'abc123')    ← KEY: requires user_id column in transactions table
       .order('created_at', { ascending: false })
       .limit(10)

  ──── LOGGING CHECKPOINT D ────────────────────────────────────────
  console.log('[TransactionService.getRecentTransactions] raw data count:', count, 'error:', error)

  If error is set:
  console.error('[TransactionService.getRecentTransactions] Supabase error:', {
    code:    error.code,       ← e.g. "42P01", "42703", "PGRST200"
    message: error.message,    ← e.g. 'relation "transactions" does not exist'
    hint:    error.hint,
    details: error.details,
  })
  ──────────────────────────────────────────────────────────────────

  If no error (data is an array):
    For each row:
    ──── LOGGING CHECKPOINT E ────────────────────────────────────────
    console.log('row[i] raw:', rawRow)
    ─────────────────────────────────────────────────────────────────

    mapTransaction(row):
      type:         row.type as TransactionType    [enum cast, no throw]
      amount:       parseFloat(row.amount ?? 0)    [Number conversion]
      balanceAfter: parseFloat(row.balance_after ?? 0)
      status:       row.status as TransactionStatus
      createdAt:    row.created_at ?? ''           ['' if null — safe]

    ──── LOGGING CHECKPOINT F ────────────────────────────────────────
    console.log('row[i] mapped: type=... amount=... status=... createdAt=...')
    ─────────────────────────────────────────────────────────────────

  ──── LOGGING CHECKPOINT G ────────────────────────────────────────
  console.log('[useWallet] transactions loaded:', txns.length)
  ──────────────────────────────────────────────────────────────────
```

---

## Failure scenarios and console output

### Scenario A: `transactions` table does not exist

```
[TransactionService.getRecentTransactions] Supabase error: {
  code: "42P01",
  message: 'relation "public.transactions" does not exist',
  hint: null,
  details: null
}
[useWallet] transaction fetch failed (non-fatal): Error: relation "public.transactions" does not exist
```
**Result after fix**: Balance shows (200.00), transaction list empty.  
**Action needed**: Run the `CREATE TABLE transactions ...` migration.

### Scenario B: `user_id` column missing from `transactions` table

```
[TransactionService.getRecentTransactions] Supabase error: {
  code: "PGRST200" or "42703",
  message: 'column transactions.user_id does not exist',
  hint: null,
  details: null
}
[useWallet] transaction fetch failed (non-fatal): Error: column transactions.user_id does not exist
```
**Result after fix**: Balance shows (200.00), transaction list empty.  
**Action needed**: Either add `user_id` column to `transactions` or change the query to use `wallet_id`.

### Scenario C: Everything works

```
[WalletService.getWallet] raw row: {"id":"uuid","balance":"200.00","currency":"USD",...} | error: null
[WalletService.getWallet] mapped wallet: {"id":"uuid","balance":200,"currency":"USD",...}
[useWallet] wallet loaded: {"id":"uuid","balance":200,"currency":"USD"}
[TransactionService.getRecentTransactions] raw data count: 0 | error: null
[useWallet] transactions loaded: 0
```
**Result**: Balance shows (200.00), transaction list shows "No recent activity yet".

---

## Files with logging added

| File | Checkpoints |
|------|-------------|
| `src/services/wallet/wallet-service.ts` | A (raw row), B (mapped wallet) |
| `src/services/wallet/transaction-service.ts` | D (Supabase error details), E (raw rows), F (mapped transactions), G (count) |
| `src/hooks/use-wallet.ts` | C (wallet loaded), G (transactions loaded) |

Open the browser DevTools console and refresh. The first log line that shows an error reveals the exact failure point.
