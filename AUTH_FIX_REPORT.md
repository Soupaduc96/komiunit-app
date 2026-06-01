# KomiUnit — Auth Fix Report

_Applied: 2026-06-01_

---

## Fix 1 — `auth-form.tsx`: Error display + double-submit guard

### Error display: `<View>` → `<Text>`

**Before:**
```tsx
{error && <View style={{ marginBottom: Spacing.two }}>
  {typeof error === 'string' && <View style={styles.errorText}>{error}</View>}
</View>}
```

**After:**
```tsx
{!!error && (
  <View style={styles.errorBanner}>
    <Text style={styles.errorText}>{error}</Text>
  </View>
)}
```

All auth error messages (including the rate-limit message) are now visible to the user.

### Double-submit guard

**Added:**
```typescript
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async () => {
  if (isSubmitting || isLoading) return;   // ← guard
  setIsSubmitting(true);
  try {
    await onSubmit(formData);
  } finally {
    setIsSubmitting(false);
  }
};

const busy = isLoading || isSubmitting;
// Button: disabled={busy} loading={busy}
```

Rapid taps, double-taps, or slow network conditions can no longer submit the form twice.

---

## Fix 2 — `signup.tsx`: Correct loading indicator + navigation to verify-email

### Loading indicator

**Before:**
```tsx
const { signUp, error: authError, clearError } = useAuth();
// ...
isLoading={authError !== null}   // wrong: shows loading when error, not during call
```

**After:**
```tsx
const { signUp, loading, error: authError, clearError } = useAuth();
// ...
isLoading={loading}   // correct: disabled during the actual network call
```

### Navigation after signup

**Before:**
```typescript
await AuthService.signUp(email, password, fullName);
// comment: "Navigation will be handled by the onAuthStateChange listener."
// But listener requires session != null, which is never true with email confirmation enabled
```

**After:**
```typescript
try {
  await signUp(values.email, values.password, values.fullName);
  // Explicitly navigate to verify-email; pass email so resend works
  router.replace({ pathname: '/(auth)/verify-email', params: { email: values.email } });
} catch (err) {
  setLocalError(err instanceof Error ? err.message : 'Signup failed');
}
```

The app now always shows the verification screen after a successful `signUp()`. Users see clear feedback and know to check their email. This eliminates the "silent success" that caused users to tap repeatedly.

---

## Fix 3 — `login.tsx` and `forgot-password.tsx`

Same `isLoading` fix applied:

```tsx
// Before
const { signIn, error: authError, clearError } = useAuth();
isLoading={authError !== null}

// After
const { signIn, loading, error: authError, clearError } = useAuth();
isLoading={loading}
```

---

## Fix 4 — `auth.ts`: `resendConfirmation()`

**Added:**
```typescript
static async resendConfirmation(email: string) {
  const { error } = await supabase.auth.resend({ type: 'signup', email });
  if (error) throw this.handleError(error);
}
```

Uses Supabase's built-in `resend` API (v2.x). Only works for accounts that have not yet confirmed.

---

## Fix 5 — `verify-email.tsx`: Full rewrite

**Before:** Static screen with a non-functional resend button (`// TODO`).

**After:**
- Shows the email address (passed as route param from signup)
- "Resend Confirmation Email" button calls `AuthService.resendConfirmation(email)`
- 60-second countdown timer after each resend (matches Supabase rate limit)
- Resend button disabled and shows countdown: `"Resend available in 42s"`
- If Supabase returns the rate-limit error, the cooldown starts automatically
- Clear success/error banners for resend result
- "Back to Login" uses `router.replace` (not `push`) to clear history

---

## New Auth Flow (Post-Fix)

```
Sign Up Screen
  User fills form
    ↓
  Taps "Create Account"
    ↓
  Button → disabled immediately (loading=true)    ← BUG 1 FIXED
    ↓
  Client validation (name, email, password match)
    ↓
  AuthContext.signUp(email, password, fullName)
    ↓
  supabase.auth.signUp() → success
  (handle_new_user trigger creates public.users row)
    ↓
  router.replace('/(auth)/verify-email', {email})  ← BUG 2 FIXED
    ↓
  Button → enabled again (loading=false)

Verify Email Screen
  Shows: "Check your email at user@example.com"    ← BUG 3 FIXED
  Shows email address from route param
  Button: "Back to Login"
  Button: "Resend Confirmation Email"
    ↓ (if tapped)
    AuthService.resendConfirmation(email)
    → 60s countdown starts
    → Rate-limit error also shown clearly if hit

User clicks email link
  → Browser opens Supabase confirmation URL
  → Supabase sets session in app via deep link
  → onAuthStateChange fires: event='SIGNED_IN', session={...}
  → AuthContext loads profile from public.users
  → _layout.tsx renders (tabs) stack
  → User lands on Home screen ✓

Login Screen
  User enters email + password
  Button → disabled during signIn() call           ← BUG 1 FIXED
  On success: onAuthStateChange routes to (tabs)
  On error: error message shown in red banner      ← BUG 3 FIXED
```

---

## TypeScript

`tsc --noEmit` → **0 errors** after all changes.
