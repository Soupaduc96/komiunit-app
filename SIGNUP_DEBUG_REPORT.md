# KomiUnit — Signup Debug Report

_Diagnosed and fixed: 2026-06-01_

---

## Error

```
new row violates row-level security policy for table "users"
```

---

## Complete Execution Trace

```
signup.tsx
└─ handleSignup()                                           [line 42]
   └─ AuthContext.signUp(email, password, fullName)         [auth-context.tsx:119]
      ├─ AuthService.signUp(email, password, fullName)      [auth.ts:33]
      │  └─ supabase.auth.signUp({
      │       email, password,
      │       options: { data: { full_name: fullName } }
      │     })
      │     ← Supabase Auth creates row in auth.users
      │     ← Returns: { user: { id: UUID, email }, session: NULL }
      │                                            ↑
      │                          session is NULL when email confirmation
      │                          is enabled (Supabase default)
      │
      └─ if (result.user) {                                 [line 124]
            DatabaseService.createUserProfile(             [line 125]
              result.user.id,
              { email, full_name: fullName }
            )
            └─ supabase                                     [database.ts:43]
                 .from('users')
                 .insert([{ id, email, full_name }])
                 ↑
                 CLIENT ROLE = anon       ← no session → no JWT attached
                 auth.uid() = NULL        ← anon role has no uid

                 RLS policy evaluation:
                   users_insert_own: auth.uid() = id
                                     → NULL = 'some-uuid'
                                     → FALSE
                                     → DENIED ❌
         }
```

---

## Root Cause

`supabase.auth.signUp()` returns the newly-created `user` object **but no session** when Supabase email confirmation is enabled (the default setting).

Without a session, the Supabase JS client still holds the **anon** JWT (or no JWT at all). Every subsequent database call runs as the `anon` role, where `auth.uid()` evaluates to `NULL`.

The code then immediately called `createUserProfile()`, which inserted into `public.users`. The RLS policy `users_insert_own` checks `auth.uid() = id`, which becomes `NULL = 'uuid'` — always false — so the insert is blocked.

### Why relaxing the policy did not fix it

The user changed the policy to:
```sql
CREATE POLICY users_insert_own ON users
  FOR INSERT TO authenticated
  WITH CHECK (true);
```

This only grants INSERT to the **`authenticated`** role. The anon role still has no INSERT policy. When no policy matches, Supabase defaults to **DENY**. The error is identical.

---

## What Was Changed

### 1. `supabase-schema.sql` — Added `handle_new_user` trigger

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO UPDATE
    SET
      email      = EXCLUDED.email,
      full_name  = COALESCE(EXCLUDED.full_name, public.users.full_name),
      updated_at = NOW()
    WHERE public.users.full_name IS NULL OR public.users.full_name = '';
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

**Why this works:**
- Fires immediately after Supabase Auth creates the `auth.users` row
- Runs as `SECURITY DEFINER` (the function owner, typically `postgres`), which **bypasses RLS entirely**
- Reads `full_name` from `raw_user_meta_data` — populated by `options.data.full_name` in `signUp()`
- `ON CONFLICT (id) DO UPDATE` makes it idempotent if the app code also runs

### 2. `src/context/auth-context.tsx` — Removed `createUserProfile()` from `signUp()`

**Before:**
```typescript
const result = await AuthService.signUp(email, password, fullName);
if (result.user) {
  await DatabaseService.createUserProfile(result.user.id, {
    email: result.user.email,
    full_name: fullName,
  });
}
```

**After:**
```typescript
await AuthService.signUp(email, password, fullName);
// Profile created automatically by the handle_new_user trigger.
```

The `createUserProfile()` call in `signUp()` was the direct cause. It has been removed. The trigger now owns profile creation.

### 3. `src/services/supabase/database.ts` — `createUserProfile()` changed to upsert

`createUserProfile()` is kept (used by `ProfileService`) but now uses `upsert` with `onConflict: 'id'` instead of `insert`. This prevents any future double-insert errors if both the trigger and app code run (e.g. when email confirmation is disabled).

---

## RLS Policies — No Changes Required

The existing RLS policies are **correct**. The `users_insert_own` policy is fine for UPDATE and for any INSERT that happens *after* authentication (e.g. profile updates). Do not modify them.

The `TO authenticated WITH CHECK (true)` policy the user added can be **reverted** to the original, or kept — it makes no difference since the trigger owns INSERT now.

Recommended: revert to the original for clarity:
```sql
DROP POLICY IF EXISTS "users_insert_own" ON users;
CREATE POLICY "users_insert_own" ON users FOR INSERT WITH CHECK (auth.uid() = id);
```

---

## How to Apply the Fix

Run the following in **Supabase Dashboard → SQL Editor**:

```sql
-- 1. Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO UPDATE
    SET
      email      = EXCLUDED.email,
      full_name  = COALESCE(EXCLUDED.full_name, public.users.full_name),
      updated_at = NOW()
    WHERE public.users.full_name IS NULL OR public.users.full_name = '';
  RETURN NEW;
END;
$$;

-- 2. Attach the trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

The code changes (`auth-context.tsx`, `database.ts`) are already applied to the repository.

---

## Verification

After applying the trigger SQL:

1. Attempt signup with a new email in the app
2. No RLS error should occur
3. Check `public.users` table in Supabase — a row should exist with the correct `id`, `email`, and `full_name`
4. The `auth.users` table row and `public.users` row will have the same `id`
