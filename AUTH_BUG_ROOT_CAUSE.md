# KomiUnit — Auth Bug Root Cause Report

_Diagnosed: 2026-06-01_

---

## Error Message

```
For security purposes, you can only request this after XX seconds.
```

---

## Root Cause: 4 Concurrent Bugs

The rate-limit error is the **downstream symptom** of multiple bugs that combined to make the user trigger Supabase's anti-abuse protection.

---

### Bug 1 — `isLoading` is backwards in all auth screens (PRIMARY CAUSE)

**Files:** `signup.tsx`, `login.tsx`, `forgot-password.tsx`

**Bad code (all three files):**
```tsx
isLoading={authError !== null}
```

**What this means:**
- `authError` is `null` during the network request → `isLoading = false` → **button is enabled and clickable**
- `authError` is set after an error → `isLoading = true` → **button is disabled** (too late)

The `useAuth()` hook exposes both `loading` (boolean, true during async call) and `error`. Every screen used `error` for the loading indicator and never used `loading` at all.

**Effect:** The submit button is **never disabled** during the actual Supabase call. Users can tap it multiple times. Each tap calls `signUp()` with the same email. After the first `signUp()` succeeds (creating the user), every subsequent call hits Supabase's rate limit.

---

### Bug 2 — No navigation after successful signup (AMPLIFIER)

**File:** `auth-context.tsx` (signUp)

**Bad code:**
```typescript
await AuthService.signUp(email, password, fullName);
// Navigation / user state are handled by the onAuthStateChange listener.
```

**What actually happens:**
When email confirmation is enabled (Supabase default), `signUp()` returns `{ user: {...}, session: null }`. The `onAuthStateChange` listener fires, but only calls `setUser` when `session?.user` is truthy. With `session = null`, the listener does nothing. `user` stays `null`. The root layout keeps rendering `(auth)`. The user is **still on the signup screen** after a successful signup.

**Effect:** User sees a blank form with no feedback. They tap "Create Account" again. Second `signUp()` call → rate-limit error.

---

### Bug 3 — Error messages are never displayed (HIDES THE PROBLEM)

**File:** `auth-form.tsx`

**Bad code (line 87):**
```tsx
{typeof error === 'string' && <View style={styles.errorText}>{error}</View>}
```

**Problem:** `<View>{someString}</View>` — React Native does not allow bare text strings inside `<View>`. The text is either dropped silently (React Native 0.71+) or throws "Text strings must be rendered within a `<Text>` component". Either way, the error message is **never shown to the user**.

**Effect:** Even when Supabase returns the rate-limit message, the user sees nothing. They have no idea why "nothing happened" when they tapped the button. They keep tapping.

---

### Bug 4 — AuthForm has no double-submit guard (AMPLIFIER)

**File:** `auth-form.tsx`

**Bad code:**
```typescript
const handleSubmit = async () => {
  try {
    await onSubmit(formData);   // no guard
  } catch (err) { ... }
};
```

No `isSubmitting` state. Two taps in quick succession (e.g. double-tap on Android) call `onSubmit` twice regardless of any parent loading state.

---

## Full Failure Sequence

```
User opens signup screen
  │
  ├─ Taps "Create Account" (first time)
  │    ↓
  │    signUp() fires — button NOT disabled (Bug 1)
  │    Supabase creates user, returns { user, session: null }
  │    onAuthStateChange: session is null, nothing happens (Bug 2)
  │    App stays on signup screen — no feedback (Bugs 2+3)
  │
  ├─ User sees nothing changed, taps "Create Account" again (or double-taps)
  │    ↓
  │    Second signUp() fires for same email (Bugs 1+4)
  │    Supabase: "For security purposes, you can only request this after X seconds"
  │    authError is set to this message
  │    Error banner renders: <View>{error}</View> — invisible (Bug 3)
  │
  └─ User sees nothing, keeps tapping → rate limit gets longer
```

---

## What "For security purposes..." actually means

This is **not** a code bug on its own. It is Supabase's built-in protection against:
1. Duplicate account creation with the same email
2. Email bombing / spam

Supabase enforces a 60-second cooldown between `signUp()` calls for the same email address. The error fires on the **second** call for an already-registered email within that window.

---

## Supabase Settings to Review

| Setting | Location | Recommendation |
|---|---|---|
| Email confirmation | Dashboard → Auth → Email | Leave enabled for production; disable only for dev testing |
| OTP expiry | Dashboard → Auth → Email | Default 24h is fine |
| Rate limit (signups) | Dashboard → Auth → Rate Limits | Default is fine; no changes needed |

To disable email confirmation during development:
**Supabase Dashboard → Authentication → Providers → Email → Confirm email → OFF**

---

## Files Changed

| File | Change |
|---|---|
| `src/components/auth/auth-form.tsx` | Error display `<View>→<Text>`; `isSubmitting` guard added |
| `src/app/(auth)/signup.tsx` | `isLoading={loading}` (not `authError`); navigates to `verify-email` on success |
| `src/app/(auth)/login.tsx` | `isLoading={loading}` |
| `src/app/(auth)/forgot-password.tsx` | `isLoading={loading}` |
| `src/app/(auth)/verify-email.tsx` | Full rewrite: resend button, countdown timer, email passed as param |
| `src/services/supabase/auth.ts` | Added `resendConfirmation(email)` |
| `.expo/types/router.d.ts` | Added `email` param to `verify-email` route |
