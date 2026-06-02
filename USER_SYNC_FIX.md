# User Sync Fix

## Problem

`wallets.user_id` has a FK constraint to `public.users.id`.  
User `7aa29c79-5997-43eb-b92a-e808746caaf5` existed in `auth.users` but not in `public.users`, causing every wallet insert attempt to throw:

```
insert or update on table "wallets" violates foreign key constraint "wallets_user_id_fkey"
```

Root cause: the `handle_new_user` trigger was either absent or failed silently when that account was created.

---

## Step 1 — Verify the trigger exists

Run in Supabase SQL Editor:

```sql
SELECT trigger_name, event_manipulation, action_timing, action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users'
  AND trigger_name = 'on_auth_user_created';
```

If the query returns 0 rows, the trigger is missing — go to Step 2.

---

## Step 2 — Recreate the trigger (if missing)

```sql
-- Function that mirrors every new auth user into public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger fires AFTER INSERT on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

The `ON CONFLICT (id) DO NOTHING` makes this idempotent — safe to run even if some rows already exist.

---

## Step 3 — Backfill missing public.users rows

This inserts a row for every `auth.users` entry that has no matching `public.users` row.

```sql
INSERT INTO public.users (id, email, full_name, created_at, updated_at)
SELECT
  au.id,
  au.email,
  au.raw_user_meta_data->>'full_name',
  COALESCE(au.created_at, NOW()),
  NOW()
FROM auth.users au
LEFT JOIN public.users pu ON pu.id = au.id
WHERE pu.id IS NULL;
```

Verify the result:

```sql
-- Should return 0 rows after backfill
SELECT au.id, au.email
FROM auth.users au
LEFT JOIN public.users pu ON pu.id = au.id
WHERE pu.id IS NULL;
```

---

## Step 4 — Confirm wallet creation now works

After the backfill, the next time the affected user opens the app, `WalletService.getOrCreateWallet()` will insert successfully because the FK target now exists in `public.users`.

No app code change is required for this fix — it is entirely a database-side repair.
