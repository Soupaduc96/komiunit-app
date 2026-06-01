# Login Root Cause Analysis

## Symptom
Login shows "Please wait…" then returns to Sign In with no error message.

## Execution Trace

### Step 1 — User submits form
`AuthForm.handleSubmit()` → `onSubmit(formData)` → `login.tsx:handleLogin()`

```
login.tsx:45   await signIn(values.email, values.password)
```

### Step 2 — `signIn()` calls Supabase
`auth-context.tsx:109`  `await AuthService.signIn(email, password)`
→ `auth.ts:18`  `supabase.auth.signInWithPassword({ email, password })`

**If credentials are wrong or email is unconfirmed**: Supabase returns `AuthApiError`. It throws, propagates up to `handleLogin`, sets `localError`, and the AuthForm error banner appears. But the user reports **no error message** — meaning this path is NOT taken. **Login is succeeding.**

### Step 3 — `signInWithPassword` succeeds
Supabase internally:
1. Stores session in AsyncStorage
2. Calls `_notifyAllSubscribers('SIGNED_IN', session)` — this IS awaited by Supabase v2

Supabase v2 awaits async callbacks in `onAuthStateChange`, so the callback in `auth-context.tsx:87` runs to completion before `signInWithPassword` resolves.

### Step 4 — `onAuthStateChange` callback fires
`auth-context.tsx:87-98`

```typescript
async (event, session) => {
  if (session?.user) {             // ← TRUE, session is valid
    try {
      const profile = await DatabaseService.getUserProfile(session.user.id);
      setUser(profileFromRow(...)); // ← user set to non-null
    } catch {
      setUser({ id, email });       // ← fallback still non-null
    }
  } else {
    setUser(null);
  }
}
```

`setUser()` is called with a non-null value in every branch. **user IS set.**

### Step 5 — `_layout.tsx` re-renders
`_layout.tsx:8`  `const { user, initialized } = useAuth()`

`user` is now non-null. The Stack conditional flips:

```tsx
// Before login: (auth) registered
<Stack.Screen name="(auth)" options={{ animation: 'none' }} />

// After login: (tabs) registered
<Stack.Screen name="(tabs)" options={{ animation: 'none' }} />
```

### Step 6 — BUG: No navigation occurs

The current URL is `/(auth)/login`. The `(auth)` group has been deregistered from the Stack, and `(tabs)` has been registered. **But nothing triggers an actual navigation.**

In Expo Router SDK 56 (Expo Router v4), changing which `<Stack.Screen>` children are rendered does **not** automatically redirect the user. The pattern is listed in documentation but does not reliably fire a navigation event when user transitions from unauthenticated to authenticated.

The user stays on `/(auth)/login`. The button's loading state clears. They see "Sign In" again. This matches the reported behavior: "Loading… → Returns to Sign In."

---

## Root Causes (3 bugs)

### Bug 1 — CRITICAL: No navigation trigger after login
**File**: `src/app/(auth)/_layout.tsx`
**Line**: entire file

`(auth)/_layout.tsx` renders a plain `<Stack>` with no auth check. When `user` becomes non-null, nothing redirects the user out of the `/(auth)` group. The `_layout.tsx` conditional screen swap is not a reliable navigation trigger in Expo Router SDK 56.

### Bug 2 — CRITICAL: `_layout.tsx` conditional doesn't redirect in Expo Router v4
**File**: `src/app/_layout.tsx`
**Lines**: 14–22

Expo Router v4 changed the protected routes pattern. Conditionally adding/removing `<Stack.Screen>` no longer auto-navigates the user when the conditional changes. Explicit `<Redirect>` components or `router.replace()` are required.

### Bug 3 — MEDIUM: `initAuth()` and `onAuthStateChange` race for user state
**File**: `src/context/auth-context.tsx`
**Lines**: 65–103

Two independent code paths both update `user` state:
- `initAuth()` calls `getSession()` directly from AsyncStorage
- `onAuthStateChange` also runs for the `INITIAL_SESSION` event with the same data

The `initialized` flag is only set by `initAuth()`. If `INITIAL_SESSION` fires (from `onAuthStateChange`) with a null session **after** a `SIGNED_IN` event (possible in React Native if AsyncStorage is slow), it calls `setUser(null)` and clears the authenticated user.

Additionally: `setUser(null)` is called for ANY event with a null session — not just `SIGNED_OUT`. This is overly broad.

---

## Why There Is No Error Message

The `AuthForm` renders a red error banner when `!!error` is truthy (`auth-form.tsx:97`). The `error` prop is:
```tsx
error={localError ?? authError ?? undefined}
```
Both `localError` (login.tsx) and `authError` (auth-context) are only set when the `signIn()` promise rejects. Since login is succeeding (no throw), neither is set. AuthForm is working correctly — there simply is no error to show.

---

## Summary

| # | Severity | File | Issue |
|---|----------|------|-------|
| 1 | Critical | `(auth)/_layout.tsx` | No `<Redirect>` when user is authenticated |
| 2 | Critical | `_layout.tsx` | Conditional Stack.Screen doesn't navigate in Expo Router v4 |
| 3 | Medium | `auth-context.tsx` | Dual session readers race; `setUser(null)` too broad |
