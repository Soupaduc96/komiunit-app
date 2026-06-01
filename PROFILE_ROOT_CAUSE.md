# Profile fullName Root Cause Analysis

## Symptom
Dashboard shows "Welcome, User" instead of "Welcome, Paul Ducasse Souffrant".
The `public.users` table has `full_name = "Paul Ducasse Souffrant"`. The user is authenticated. Navigation works. Only `fullName` is missing.

---

## Data Flow Trace

```
supabase.auth.signInWithPassword()
  │
  ▼ onAuthStateChange(SIGNED_IN, session)
  │
  ▼ DatabaseService.getUserProfile(session.user.id)        ← auth-context.tsx:96
  │    SELECT * FROM users WHERE id = $1                   ← database.ts:18
  │
  ├─ SUCCESS ──────────────────────────────────────────────
  │    profile = { id, email, full_name: "Paul Ducasse Souffrant", ... }
  │    profileFromRow(id, email, profile)                  ← auth-context.tsx:47
  │        fullName: row?.full_name ?? undefined           ← returns "Paul Ducasse Souffrant" ✅
  │    setUser({ fullName: "Paul Ducasse Souffrant" })
  │    HomeScreen: user?.fullName = "Paul Ducasse Souffrant" → "Welcome, Paul Ducasse Souffrant" ✅
  │
  └─ FAILURE ──────────────────────────────────────────────
       catch { }                                           ← auth-context.tsx:92 (WAS SILENT)
       setUser({ id, email })                             ← fullName NOT SET ❌
       HomeScreen: user?.fullName = undefined → "Welcome, User" ❌
```

---

## Root Cause — Silent Catch + Missing `user_metadata` Fallback

### Bug 1 (Critical): Silent catch discards `fullName`
**File**: `src/context/auth-context.tsx`  
**Lines**: 92–94 (original), 74–76 (initAuth path)

Both catch blocks were:
```tsx
} catch {
  setUser({ id: session.user.id, email: session.user.email ?? '' });
}
```

No `console.error` → the error is invisible.  
No `fullName` in the fallback → user reaches the dashboard with `user.fullName = undefined`.

`user` is still **non-null** (has `id` + `email`), so the Redirect in `(auth)/_layout.tsx` fires and navigates to `/(tabs)`. The dashboard loads. But the name is missing.

### Bug 2 (Root): `getUserProfile` is failing silently

The silent catch in Bug 1 was masking a real error from `getUserProfile`. The debug logs added will reveal the exact error. The most likely cause based on the code and schema:

**Most likely — RLS timing: `auth.uid()` evaluated before JWT is fully set**

When `signInWithPassword` fires `SIGNED_IN` and our async callback immediately calls `getUserProfile`, the PostgREST server evaluates `auth.uid() = id`. If the JWT hasn't been fully propagated to the DB request context (a known timing issue in some Supabase + React Native configurations), `auth.uid()` returns null, RLS filters out the row, and `.single()` returns `PGRST116: no rows`.

**Alternative — RLS policy not applied in live DB**

The schema file has `CREATE POLICY "users_select_own"` but if a previous version of the schema was applied without it, and RLS is enabled, SELECT would be blocked. The Supabase dashboard bypasses RLS (uses service_role), which is why the direct SQL query showed the data.

---

## Why `user_metadata` Is the Correct Fallback

Supabase stores `options.data` from `signUp` as `raw_user_meta_data` on `auth.users`. This flows into `session.user.user_metadata`. It is:
- Available immediately, with no DB query
- Not affected by RLS
- Populated by `AuthService.signUp()` which passes `{ data: { full_name: fullName } }`

When `signUp` was called:
```typescript
options: { data: { full_name: fullName } }
```

After login, `session.user.user_metadata.full_name = "Paul Ducasse Souffrant"`.

This is always available in the catch fallback, regardless of whether the `public.users` profile fetch succeeds.

---

## What the Debug Logs Will Tell You

After the fix, run the app and check the Metro/Expo terminal logs. You will see one of:

**Case A — query was failing (most likely)**:
```
[AuthContext] onAuthStateChange event: SIGNED_IN userId: <uuid>
[AuthContext] getUserProfile FAILED: { code: 'PGRST116', message: 'The result contains 0 rows' }
[HomeScreen] user at render: {"id":"...","email":"...","fullName":"Paul Ducasse Souffrant"}
```
→ The `user_metadata` fallback is now kicking in. Dashboard shows correct name.  
→ Underlying fix still needed: apply the SELECT RLS policy in live Supabase (see Fix Report).

**Case B — query was succeeding but fullName was null in DB**:
```
[AuthContext] getUserProfile result: {"id":"...","email":"...","full_name":null,...}
[HomeScreen] user at render: {"id":"...","email":"...","fullName":null}
```
Wait — but the DB shows the value... this would mean the `handle_new_user` trigger stored an empty string which `user_metadata` fallback would still fix.

**Case C — everything works after fix**:
```
[AuthContext] onAuthStateChange event: SIGNED_IN userId: <uuid>
[AuthContext] getUserProfile result: {"id":"...","email":"...","full_name":"Paul Ducasse Souffrant",...}
[HomeScreen] user at render: {"id":"...","email":"...","fullName":"Paul Ducasse Souffrant"}
```
→ Query succeeded. Bug was the silent catch hiding a different (intermittent) error.

---

## Summary

| Layer | Issue |
|-------|-------|
| `auth-context.tsx:92` | Silent catch — error swallowed, no logging |
| `auth-context.tsx:93` | Fallback `setUser({ id, email })` — no `fullName` from any source |
| `DatabaseService.getUserProfile` | Throws (silently) — likely RLS/timing issue |
| `HomeScreen:87` | `user?.fullName \|\| 'User'` — falls through to 'User' because `fullName` is undefined |
