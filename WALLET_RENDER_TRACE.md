# Wallet Render Trace

Full execution path from app load to wallet data on screen.

---

## Phase 1 — App initialization (web)

```
Browser loads app bundle
  → RootLayout renders
      → ErrorBoundary wraps tree
      → AuthProvider mounts
          → useEffect fires initAuth()  [async]
              → AuthService.getSession()  [Supabase REST / AsyncStorage]
      → RootLayoutNav renders
          → useAuth() → { initialized: false, user: null }
          → !initialized === true
          → return <AnimatedSplashOverlay />
              ✅ FIXED: returns <View backgroundColor="#208AEF" />
              ❌ BEFORE FIX: returned null → BLANK WHITE SCREEN
```

---

## Phase 2 — Auth resolves

```
initAuth() completes
  → setUser({ id, email, fullName, ... })
  → setInitialized(true)   [finally block — always called]
  → [React batches both state updates into one render]

RootLayoutNav re-renders
  → initialized = true, user = { id: '...' }
  → renders <Stack>
      → <Stack.Screen name="(tabs)" />

TabsLayout renders
  → useAuth() → { initialized: true, user: {...} }
  → initialized && !user === false → no redirect
  → renders <Tabs>

HomeScreen mounts
```

---

## Phase 3 — HomeScreen initial render

```
HomeScreen()
  → useSafeAreaInsets()
  → useAuth() → { user: { id, fullName, ... } }
  → useWallet()
      → useAuth() → same user
      → useState: wallet=null, transactions=[], loading=false, error=null
      → useCallback: loadWallet (dep: user.id)
      → useCallback: loadMoreTransactions (dep: user.id)
      → useCallback: refresh
      → useCallback: clearError
      → useEffect: schedules loadWallet() [async, fires after render]
      → returns { wallet: null, transactions: [], loading: false, error: null, ... }

  Render output:
    walletLoading=false, walletError=null, wallet=null
    → Balance card: Formatting.currency(0, 'USD') → "$0.00"
    → Transactions: transactions.length===0 → "No recent activity yet"
```

---

## Phase 4 — Wallet fetch (async, after render)

```
useEffect fires → loadWallet()
  → user.id is set → proceeds
  → setLoading(true), setError(null)
  → Promise.all([
      WalletService.getOrCreateWallet(userId),
      TransactionService.getRecentTransactions(userId, 10)
    ])
```

### WalletService.getOrCreateWallet(userId)

```
supabase.from('wallets').select('*').eq('user_id', userId).maybeSingle()
  → If row exists: mapWallet(row)
      ✅ FIXED: null guard added — throws descriptive error if row is null
      ✅ FIXED: currency: row.currency || 'USD'  ('' now falls back to 'USD')
      → returns Wallet { id, userId, balance: number, currency: 'USD', ... }

  → If no row: INSERT { user_id, balance: 0.00, currency: 'USD' }
      → On 23505 (race/duplicate): re-fetches with .single()
      → mapWallet(data) → Wallet
```

### TransactionService.getRecentTransactions(userId, 10)

```
supabase.from('transactions').select('*').eq('user_id', userId)
  .order('created_at', { ascending: false }).limit(10)
  → (data ?? []).map(mapTransaction)
      mapTransaction(row):
        id: row.id
        walletId: row.wallet_id
        userId: row.user_id
        type: row.type as TransactionType
        amount: parseFloat(row.amount ?? 0)    → always number
        balanceAfter: parseFloat(row.balance_after ?? 0)  → always number
        status: row.status as TransactionStatus
        createdAt: row.created_at ?? ''         → '' if null (safe)
```

---

## Phase 5 — Wallet data render

```
setWallet(w), setTransactions(txns), setLoading(false)  [batched]

HomeScreen re-renders:
  walletLoading=false, walletError=null, wallet={ balance: 0, currency: 'USD', ... }

  Balance card:
    Formatting.currency(wallet.balance, wallet.currency)
      → Formatting.currency(0, 'USD')
      ✅ FIXED: try-catch wraps call, currency || 'USD' prevents empty string crash
      → "$0.00"

  Transactions (if any):
    transactions.map((txn, idx) => <TransactionRow ... />)

      TransactionRow({ transaction, isDark, isLast }):
        StyleSheet.create({...})   ← called per-render (performance issue, not crash)
        TX_ICONS[transaction.type] ← undefined if unknown type (renders nothing, safe)
        TX_LABELS[transaction.type] ← same
        Formatting.date(transaction.createdAt, 'MMM d')
          → parseISO(createdAt)    ← Invalid Date if createdAt=''
          → format(invalidDate)    ← throws RangeError
          → caught by try-catch in Formatting.date() → returns ''  ✅ SAFE
        Formatting.currency(transaction.amount, 'USD')
          ✅ FIXED: try-catch + isFinite check prevents any throw
          → "$X.XX"
```

---

## Error / Exception Map

| Location | Exception | Caught by | Screen result |
|----------|-----------|-----------|---------------|
| `AnimatedSplashOverlay` returns `null` | No exception — renders nothing | — | BLANK SCREEN ← **primary bug** |
| `Formatting.currency(bal, '')` | `RangeError` during render | `ErrorBoundary` | "Something went wrong" UI |
| `mapWallet(null)` | `TypeError` in async | `useWallet` catch | "Could not load balance" |
| `Formatting.date('')` | `RangeError` in format() | `Formatting.date` try-catch | renders `''` safely |
| Supabase query error | Error in async | `useWallet` catch | "Could not load balance" |

---

## Post-fix behavior

| Scenario | Before fix | After fix |
|----------|-----------|-----------|
| App load (cold / slow auth) | Blank white screen | Solid blue overlay |
| App load (cached session) | Flash of blank (< 50ms) | Solid blue (imperceptible) |
| Wallet with `currency: ''` | RangeError → ErrorBoundary | Falls back to USD, renders correctly |
| Wallet with `currency: null` | Was already safe (`?? 'USD'`) | Still safe (`|| 'USD'`) |
| Transaction with `created_at: null` | Renders `''` (safe) | Renders `''` (safe, unchanged) |
| Wallet service throws | Console silent | `[useWallet] loadWallet failed:` logged |
