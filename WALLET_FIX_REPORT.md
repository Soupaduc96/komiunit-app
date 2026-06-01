# Wallet Blank Screen — Fix Report

## Fix 1 — `AnimatedSplashOverlay` on web (PRIMARY)

**File**: `src/components/animated-icon.web.tsx`

**Before**:
```typescript
export function AnimatedSplashOverlay() {
  return null;
}
```

**After**:
```typescript
export function AnimatedSplashOverlay() {
  return <View style={{ flex: 1, backgroundColor: '#208AEF' }} />;
}
```

**Result**: During auth initialization, the web app now shows the same solid blue background (#208AEF) used by the native splash overlay instead of a blank white page. The screen transitions to the app content once `initialized` becomes true.

---

## Fix 2 — `Formatting.currency()` error handling

**File**: `src/utils/formatting.ts`

**Before**:
```typescript
currency: (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
},
```

**After**:
```typescript
currency: (amount: number, currency: string = 'USD'): string => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(isFinite(amount) ? amount : 0);
  } catch {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
      isFinite(amount) ? amount : 0,
    );
  }
},
```

**Changes**:
- `currency || 'USD'` — empty string now falls back to USD before hitting `Intl.NumberFormat`
- `isFinite(amount) ? amount : 0` — NaN/Infinity amounts fall back to 0 instead of rendering "$NaN"
- Outer try-catch — any `RangeError` from an unknown currency code falls back to USD display
- No render crash possible from this function anymore

---

## Fix 3 — `mapWallet()` guards

**File**: `src/services/supabase/mappers.ts`

**Before**:
```typescript
export function mapWallet(row: any): Wallet {
  return {
    ...
    currency: row.currency ?? 'USD',
    ...
  };
}
```

**After**:
```typescript
export function mapWallet(row: any): Wallet {
  if (!row) throw new Error('mapWallet: received null row');
  return {
    ...
    currency: row.currency || 'USD',
    ...
  };
}
```

**Changes**:
- Explicit null guard — throws a descriptive error immediately instead of `TypeError: Cannot read properties of null`
- `|| 'USD'` instead of `?? 'USD'` — empty string `''` now correctly falls back to `'USD'`

---

## Fix 4 — Diagnostic logging in `useWallet`

**File**: `src/hooks/use-wallet.ts`

**Added**:
```typescript
} catch (err) {
  console.error('[useWallet] loadWallet failed:', err);
  setError(err instanceof Error ? err.message : 'Failed to load wallet');
}
```

**Result**: Any wallet or transaction fetch failure is now logged to the console with the full error object, making future debugging straightforward.

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/animated-icon.web.tsx` | `AnimatedSplashOverlay` returns solid blue View instead of null |
| `src/utils/formatting.ts` | `Formatting.currency()` wrapped in try-catch, empty/invalid currency falls back to USD |
| `src/services/supabase/mappers.ts` | `mapWallet` null guard added, `|| 'USD'` replaces `?? 'USD'` |
| `src/hooks/use-wallet.ts` | `console.error` added to `loadWallet` catch block |
