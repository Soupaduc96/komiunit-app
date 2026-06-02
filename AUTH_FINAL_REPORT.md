# Auth Final Report

Date: 2026-06-01

---

## Issues Resolved This Session

### 1. Wallet FK violation — `wallets_user_id_fkey`

**Symptom**: `getOrCreateWallet()` threw on every call for the affected user.  
**Root cause**: User `7aa29c79-5997-43eb-b92a-e808746caaf5` existed in `auth.users` but had no matching row in `public.users`. The `handle_new_user` trigger did not fire when the account was created (trigger likely absent at that time).  
**Fix**: See `USER_SYNC_FIX.md` — recreate trigger + SQL backfill. No app code change required.  
**Status**: App code is ready; DB fix must be applied manually in Supabase SQL Editor.

---

### 2. Logout button — screen frozen after confirmation

**Symptom**: Confirming "Sign Out" did not navigate away from the Security screen.  
**Root cause**: `src/app/_layout.tsx` conditionally registered either `(tabs)` or `(auth)` in the root Stack. Expo Router does not auto-navigate when the route list changes — it needs an imperative redirect.  
**Fix applied**: Both screens now always registered in the root Stack. Group layout guards (`<Redirect>`) handle navigation on auth state change. See `LOGOUT_ROOT_CAUSE.md`.  
**Status**: Fixed in `src/app/_layout.tsx`.

---

### 3. Debug logs removed from wallet layer

**Files cleaned**:
- `src/services/wallet/wallet-service.ts` — removed 2 `console.log` calls
- `src/services/wallet/transaction-service.ts` — removed 1 `console.log` + 1 `console.error` block + per-row logs
- `src/hooks/use-wallet.ts` — removed 3 `console.log` / `console.error` calls

**Status**: Applied.

---

## Previously Resolved (earlier sessions)

| Issue | Status |
|---|---|
| Signup flow | Fixed |
| Login flow | Fixed |
| Auth redirect on fresh load | Fixed |
| Profile loading after login | Fixed |
| User full name display | Fixed |
| Wallet / transactions schema deployed | Done |
| Wallet RLS policies | Verified |

---

## Remaining Action Required

### Must do before wallet works for all users

Run the SQL in `USER_SYNC_FIX.md` against the production Supabase project:

1. Verify trigger exists (Step 1)
2. Recreate trigger if missing (Step 2)
3. Backfill `public.users` for orphaned `auth.users` rows (Step 3)
4. Verify 0 orphans remain (Step 3, verification query)

### Known technical debt (not blocking)

- `isDark = false` hardcoded in 12 component files — needs theme context
- `Database = any` in `client.ts` — run `supabase gen types typescript`
- Home screen balance is hardcoded — Phase 6 wires `useWallet` to the Home tab
- No pagination on list screens
- `explore.tsx` is an unused template

---

## Auth Architecture Summary

```
supabase.auth.signUp()
  └─► handle_new_user trigger (SECURITY DEFINER)
        └─► INSERT INTO public.users

supabase.auth.signIn()
  └─► onAuthStateChange fires
        └─► AuthContext fetches public.users profile
              └─► setUser(profileFromRow(...))

supabase.auth.signOut()
  └─► AuthContext.signOut()
        ├─► setUser(null)
        └─► onAuthStateChange fires → setUser(null)
              └─► (tabs)/_layout.tsx guard → <Redirect href="/(auth)/login" />
```
