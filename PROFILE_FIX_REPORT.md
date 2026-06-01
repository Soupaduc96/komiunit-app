# Profile fullName Fix Report

## Changes Applied

### Fix 1 — `user_metadata` fallback in both catch blocks (Critical)
**File**: `src/context/auth-context.tsx`

**`onAuthStateChange` catch** (was: silent no-op, now):
```tsx
// BEFORE
} catch {
  setUser({ id: session.user.id, email: session.user.email ?? '' });
}

// AFTER
} catch (err) {
  console.error('[AuthContext] getUserProfile FAILED:', err);
  setUser({
    id: session.user.id,
    email: session.user.email ?? '',
    fullName: session.user.user_metadata?.full_name ?? undefined,  // ← from auth metadata
  });
}
```

**`initAuth()` catch** (same pattern applied):
```tsx
// BEFORE
} catch {
  setUser({ id: session.user.id, email: session.user.email ?? '' });
}

// AFTER
} catch (err) {
  console.error('[AuthContext] initAuth getUserProfile FAILED:', err);
  setUser({
    id: session.user.id,
    email: session.user.email ?? '',
    fullName: session.user.user_metadata?.full_name ?? undefined,
  });
}
```

**Why this works**: Supabase stores `options.data` from `signUp` as `user_metadata` on the auth session. `session.user.user_metadata.full_name` = "Paul Ducasse Souffrant" — always present, no DB query needed, not subject to RLS.

---

### Fix 2 — Debug logging added (Temporary)
**Files**: `src/context/auth-context.tsx`, `src/app/(tabs)/index.tsx`

Added `console.log` and `console.error` at every key decision point:

```
[AuthContext] onAuthStateChange event: <event> userId: <id>
[AuthContext] getUserProfile result: <json>       ← success path
[AuthContext] getUserProfile FAILED: <error>      ← catch path (was silent)
[HomeScreen] user at render: <json>               ← confirms what reaches the screen
```

**To remove after verification**: Delete lines with `console.log('[AuthContext]` and `console.log('[HomeScreen]`.

---

## TypeScript Result
```
npx tsc --noEmit → 0 errors
```

---

## Expected Behavior After Fix

| Scenario | Before | After |
|----------|--------|-------|
| `getUserProfile` succeeds | "Welcome, Paul Ducasse Souffrant" ✅ | unchanged ✅ |
| `getUserProfile` fails (any error) | "Welcome, User" ❌ | "Welcome, Paul Ducasse Souffrant" ✅ (from `user_metadata`) |
| Cold start with saved session | depends | "Welcome, Paul Ducasse Souffrant" ✅ |

---

## Underlying DB Fix Required (if logs show PGRST116)

If the logs confirm Case A (`getUserProfile FAILED: PGRST116`), the SELECT RLS policy either:
- Was not applied to the live Supabase database, OR
- Exists but `auth.uid()` is null at query time (timing issue)

**Option A — Confirm the policy exists** (run in Supabase SQL Editor):
```sql
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'users';
```
Expected output should include a row with `policyname = 'users_select_own'` and `cmd = 'SELECT'`.

If missing, apply:
```sql
CREATE POLICY "users_select_own" ON users FOR SELECT USING (auth.uid() = id);
```

**Option B — Force the query to use the correct session** by using `supabase.auth.getUser()` (server-verified) before the DB query. Not needed if the policy is confirmed to exist.

---

## Files Changed

| File | Change |
|------|--------|
| `src/context/auth-context.tsx` | Both catch blocks now read `fullName` from `user_metadata` |
| `src/context/auth-context.tsx` | Added `console.error` + `console.log` for diagnosis |
| `src/app/(tabs)/index.tsx` | Added `console.log('[HomeScreen] user at render:...')` |

## Files NOT Changed (as instructed)
- `src/app/_layout.tsx` (RootLayout)
- `src/services/supabase/database.ts`
- `src/services/supabase/auth.ts`
- `src/app/(auth)/login.tsx`
