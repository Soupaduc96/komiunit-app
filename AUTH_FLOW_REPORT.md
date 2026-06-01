# KomiUnit — Auth Flow Report

_Last updated: 2026-06-01_

---

## Complete Auth Flow (Post-Fix)

### Sign Up

```
User fills form (fullName, email, password, confirmPassword)
         │
         ▼
signup.tsx: handleSignup()
  ├─ client-side validation (email, password length, match, name)
  └─ AuthContext.signUp(email, password, fullName)
              │
              ▼
       AuthService.signUp(email, password, fullName)
              │
              ▼
       supabase.auth.signUp({
         email, password,
         options: { data: { full_name: fullName } }
       })
              │
              ├─── Supabase creates row in auth.users  ────────────────────┐
              │    (id=UUID, email, raw_user_meta_data={full_name})        │
              │                                                             │ triggers
              │                                              ┌─────────────▼──────────────┐
              │                                              │  handle_new_user() trigger  │
              │                                              │  SECURITY DEFINER           │
              │                                              │  INSERT INTO public.users   │
              │                                              │    (id, email, full_name)   │
              │                                              │  ON CONFLICT DO UPDATE      │
              │                                              └─────────────────────────────┘
              │
              ├─ EMAIL CONFIRMATION ENABLED (default):
              │    returns { user: {id, email}, session: null }
              │    → No session established yet
              │    → User lands on verify-email screen (app navigates via onAuthStateChange)
              │
              └─ EMAIL CONFIRMATION DISABLED:
                   returns { user: {id, email}, session: {access_token, ...} }
                   → supabase client becomes authenticated immediately
                   → onAuthStateChange fires with the session
                   → profile loaded from public.users (created by trigger)
```

### Email Confirmation (when enabled)

```
User receives email → clicks link → Supabase verifies token
         │
         ▼
supabase.auth.onAuthStateChange fires with event='SIGNED_IN', session={...}
         │
         ▼
AuthContext listener [auth-context.tsx:87]
  └─ DatabaseService.getUserProfile(session.user.id)
       └─ SELECT * FROM users WHERE id = auth.uid()
          (public.users row already exists from trigger)
          └─ setUser(profileFromRow(...))
             → app navigates to (tabs) automatically
```

### Sign In

```
User enters email + password
         │
         ▼
AuthContext.signIn(email, password)
  └─ AuthService.signIn(email, password)
       └─ supabase.auth.signInWithPassword({email, password})
            ← returns { user, session }  ← session is always set on signIn
            │
            ▼
       onAuthStateChange fires with event='SIGNED_IN'
            │
            ▼
       DatabaseService.getUserProfile(userId)
            └─ SELECT * FROM users WHERE id = auth.uid()
               ← runs as authenticated role, RLS passes
               └─ setUser(profileFromRow(...))
```

### Sign Out

```
Security screen → Alert.alert confirmation
         │
         ▼
AuthContext.signOut()
  └─ AuthService.signOut()
       └─ supabase.auth.signOut()
            ← clears JWT from AsyncStorage
            │
            ▼
       onAuthStateChange fires with event='SIGNED_OUT', session=null
            └─ setUser(null)
               → app navigates to (auth) stack automatically
```

### Password Reset

```
Forgot password screen → user enters email
         │
         ▼
AuthContext.resetPassword(email)
  └─ AuthService.resetPassword(email)
       └─ supabase.auth.resetPasswordForEmail(email)
            ← Supabase sends reset link to email
            ← No session change
```

### Change Password (from Security screen)

```
Security screen → user enters new + confirm password
         │
         ▼
useProfile.changePassword(newPassword)
  └─ ProfileService.changePassword(newPassword)
       └─ AuthService.updatePassword(newPassword)
            └─ supabase.auth.updateUser({ password: newPassword })
               ← requires active authenticated session
               ← Supabase rotates the session
```

---

## Session Role Mapping

| Scenario | JWT attached | Supabase role | auth.uid() |
|---|---|---|---|
| Not signed in | None | `anon` | `NULL` |
| signUp() returned, email confirm enabled | None | `anon` | `NULL` |
| signUp() returned, email confirm disabled | Access token | `authenticated` | User UUID |
| signIn() completed | Access token | `authenticated` | User UUID |
| After email confirmation link clicked | Access token | `authenticated` | User UUID |
| Token expired + refresh | New access token | `authenticated` | User UUID |
| signOut() called | None | `anon` | `NULL` |

---

## RLS Policy Coverage (public.users)

| Operation | Policy | Role Required | Passes when |
|---|---|---|---|
| SELECT | `users_select_own` | authenticated | `auth.uid() = id` |
| INSERT | `users_insert_own` | authenticated | `auth.uid() = id` |
| UPDATE | `users_update_own` | authenticated | `auth.uid() = id` |
| DELETE | — | — | Always denied |

**Note:** The `handle_new_user` trigger bypasses RLS because it runs as `SECURITY DEFINER`. It is the only path that inserts into `public.users` as a non-authenticated caller (during signUp before session exists).

---

## Auth State vs. Database State

```
  auth.users (Supabase Auth — internal)
       id  │  email  │  raw_user_meta_data
  ─────────┼─────────┼────────────────────────
   UUID-1  │ a@b.com │ {"full_name": "Alice"}
                │
                │  handle_new_user trigger (SECURITY DEFINER)
                ▼
  public.users (your app's profile table)
       id  │  email  │  full_name  │  avatar_url  │ phone
  ─────────┼─────────┼─────────────┼──────────────┼───────
   UUID-1  │ a@b.com │   Alice     │    NULL      │  NULL
                │
                │  onAuthStateChange listener
                ▼
  AuthContext.user (in-memory, React state)
  { id: UUID-1, email: 'a@b.com', fullName: 'Alice', ... }
```

---

## Files Involved in Auth

| File | Role |
|---|---|
| `src/services/supabase/client.ts` | Supabase JS client init with AsyncStorage |
| `src/services/supabase/auth.ts` | Thin wrappers: signIn, signUp, signOut, resetPassword, updatePassword |
| `src/services/supabase/database.ts` | `getUserProfile`, `createUserProfile` (upsert-safe) |
| `src/context/auth-context.tsx` | Global user state; signIn/signUp/signOut; onAuthStateChange listener |
| `src/hooks/use-auth.ts` | `useContext(AuthContext)` accessor |
| `src/app/(auth)/login.tsx` | Sign-in form |
| `src/app/(auth)/signup.tsx` | Sign-up form |
| `src/app/(auth)/forgot-password.tsx` | Password reset form |
| `src/app/(auth)/verify-email.tsx` | Post-signup confirmation screen |
| `src/app/_layout.tsx` | Routes to `(auth)` or `(tabs)` based on `user` state |
| `supabase-schema.sql` | `handle_new_user` trigger + all RLS policies |

---

## Common Auth Issues and Solutions

| Error | Cause | Fix |
|---|---|---|
| `new row violates row-level security policy for table "users"` | Inserting into `public.users` before session is established | Use `handle_new_user` trigger — **already fixed** |
| `JWT expired` | Access token expired, refresh not working | Ensure `autoRefreshToken: true` in client (it is) |
| `Email not confirmed` | User hasn't clicked confirmation link | Show `verify-email` screen; user cannot sign in until confirmed |
| `Invalid login credentials` | Wrong email/password | Show error from `AuthService.signIn` |
| `User already registered` | Duplicate email in `signUp` | Catch error, show "account already exists" message |
| Profile loads as `undefined` after signUp | `public.users` row doesn't exist yet | Trigger creates it synchronously; `onAuthStateChange` loads it |
