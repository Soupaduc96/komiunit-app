# KomiUnit — Auth Test Results

_Date: 2026-06-01_

---

## Build Check

| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✅ 0 errors |

---

## Manual Test Checklist

Use this checklist to verify the full auth flow after applying the fixes.

### Pre-conditions

- [ ] Supabase project connected (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` set in `.env.local`)
- [ ] `supabase-schema.sql` applied (including `handle_new_user` trigger)
- [ ] App running (`npm start`)

---

### Test 1 — Sign Up (email confirmation enabled)

| Step | Expected | Pass/Fail |
|---|---|---|
| Open signup screen | Form visible | |
| Tap "Create Account" with empty fields | Button disabled while `loading=true`; cannot double-tap | |
| Fill all fields; tap "Create Account" | Button shows "Please wait…" immediately | |
| Signup succeeds | App navigates to verify-email screen | |
| Verify-email screen | Shows user's email address | |
| Check Supabase Dashboard → Auth → Users | New user present with `email_confirmed_at = null` | |
| Check Supabase Dashboard → Table Editor → users | Row exists with correct `id`, `email`, `full_name` | |

### Test 2 — Rate-limit protection

| Step | Expected | Pass/Fail |
|---|---|---|
| Go back to signup | Signup screen visible | |
| Try same email again | signUp() fires; Supabase returns rate-limit error | |
| Error banner | "For security purposes, you can only request this after X seconds" **visible in red** | |
| Button state | Enabled (to allow trying a different email), not stuck loading | |

### Test 3 — Resend confirmation

| Step | Expected | Pass/Fail |
|---|---|---|
| On verify-email screen, tap "Resend Confirmation Email" | Button shows "Sending…" | |
| Resend succeeds | Green banner: "✓ Confirmation email resent!" | |
| Button | Shows "Resend available in 60s" countdown | |
| Tap resend during countdown | Button is disabled; nothing fires | |
| Countdown reaches 0 | Button re-enables | |

### Test 4 — Email confirmation + login

| Step | Expected | Pass/Fail |
|---|---|---|
| Click confirmation link in email | App opens (or browser redirects) | |
| After confirmation | App navigates to (tabs)/Home screen | |
| OR: Sign in with email + password | Login screen → correct credentials → Home screen | |
| Login with wrong password | Red error banner shows "Invalid login credentials" | |
| Login with unconfirmed email | Red error banner shows "Email not confirmed" | |

### Test 5 — Forgot password

| Step | Expected | Pass/Fail |
|---|---|---|
| Tap "Forgot Password?" on login | Navigate to forgot-password screen | |
| Enter email; tap "Send Reset Link" | Button shows "Please wait…" while loading | |
| Success | Screen flips to "Check Your Email" confirmation view | |
| Try to send again immediately | Rate-limit error shown in red banner | |

### Test 6 — Login loading state

| Step | Expected | Pass/Fail |
|---|---|---|
| Enter credentials; tap "Sign In" | Button disables + shows "Please wait…" | |
| Tap rapidly multiple times | Only one request fires (double-submit guard) | |
| Correct credentials | Navigates to Home | |
| Wrong credentials | Error banner shows message; button re-enables | |

---

## Known Supabase Dashboard Settings

### To disable email confirmation (development only)

1. Supabase Dashboard → **Authentication** → **Providers** → **Email**
2. Toggle **"Confirm email"** → **OFF**
3. Save

With email confirmation **disabled**:
- `signUp()` returns a full session immediately
- `onAuthStateChange` fires with `event='SIGNED_IN'` and a valid session
- `_layout.tsx` routes to `(tabs)` before `router.replace('/(auth)/verify-email')` executes
- User lands on Home screen directly after signup (no email check required)

With email confirmation **enabled** (default, recommended for production):
- User must click confirmation link before they can sign in
- App routes to `verify-email` screen after signup
- Resend button available with 60s cooldown

---

## Supabase Rate Limits

| Operation | Default limit | Error message |
|---|---|---|
| `signUp()` same email | 1 per 60s | "For security purposes, you can only request this after X seconds" |
| `resend()` confirmation | 1 per 60s | Same message |
| `resetPasswordForEmail()` | 1 per 60s | Same message |
| `signInWithPassword()` | 5 attempts per 5 min | "Too many requests" |

These limits cannot be changed via the Supabase JS client. They are server-side rate limits. The fixes ensure the app never hits them accidentally through UI issues.

---

## Files Changed Summary

| File | What changed |
|---|---|
| `src/components/auth/auth-form.tsx` | Error `<View>→<Text>`, `isSubmitting` guard, `keyboardShouldPersistTaps` |
| `src/app/(auth)/signup.tsx` | `isLoading={loading}`, `router.replace` to verify-email with email param |
| `src/app/(auth)/login.tsx` | `isLoading={loading}` |
| `src/app/(auth)/forgot-password.tsx` | `isLoading={loading}` |
| `src/app/(auth)/verify-email.tsx` | Full rewrite: resend + countdown + clear feedback |
| `src/services/supabase/auth.ts` | `resendConfirmation(email)` added |
| `.expo/types/router.d.ts` | `verify-email` route accepts `{ email?: string }` param |
