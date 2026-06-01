# Wallet Blank Screen — Root Cause Analysis

## Primary Cause: `AnimatedSplashOverlay` returns `null` on web

**File**: `src/components/animated-icon.web.tsx` — line 9  
**Before fix**:
```typescript
export function AnimatedSplashOverlay() {
  return null;  // ← blank white page until auth resolves
}
```

**Execution path**:
```
App loads on web
  → RootLayoutNav renders
  → !initialized === true (AuthProvider not yet resolved)
  → return <AnimatedSplashOverlay />
  → AnimatedSplashOverlay returns null  ← BLANK WHITE SCREEN
  → Page body is empty until AuthService.getSession() + getUserProfile() complete
```

**Why "sometimes"**:
- When the Supabase session is warm in `localStorage`, `getSession()` resolves in < 50 ms → blank flash too brief to notice
- On cold load, first visit, or slow network, the phase takes 200 ms – 2 s → fully visible blank screen
- After adding the wallet engine, the developer refreshed the page more frequently during testing, exposing the blank window

---

## Secondary Cause: `Formatting.currency()` throws during render

**File**: `src/utils/formatting.ts` — lines 7-12  
**Before fix**:
```typescript
currency: (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,          // ← throws RangeError if currency is '' or unknown
  }).format(amount);
},
```

**Trigger condition**: `wallet.currency` is an empty string `''`.  
The `??` operator in `mapWallet` only guards `null`/`undefined`, not `''`:
```typescript
currency: row.currency ?? 'USD'  // '' passes through
```

**Execution path**:
```
mapWallet(row)
  → currency: '' (row.currency is empty string, ?? doesn't catch it)

HomeScreen render
  → walletLoading=false, walletError=null, wallet.currency=''
  → Formatting.currency(0, '')
  → new Intl.NumberFormat('en-US', { style: 'currency', currency: '' })
  → RangeError: Invalid currency code in NumberFormat():  ← THROWN DURING RENDER
  → ErrorBoundary catches → renders "Something went wrong" UI
```

This does not produce a blank screen by itself (ErrorBoundary shows its error UI),
but it IS a real render crash that surfaces when the DB wallet has a bad `currency` value.

---

## Summary of All Issues Found

| # | File | Line | Issue | Effect |
|---|------|------|-------|--------|
| 1 | `animated-icon.web.tsx` | 9 | `AnimatedSplashOverlay` returns `null` | Blank white screen during init |
| 2 | `formatting.ts` | 7 | `Formatting.currency()` no try-catch | Render crash on invalid currency |
| 3 | `mappers.ts` | 275 | `?? 'USD'` doesn't catch `''` | Empty currency reaches formatter |
| 4 | `mappers.ts` | 270 | `mapWallet()` no null guard | TypeError if row is null |
