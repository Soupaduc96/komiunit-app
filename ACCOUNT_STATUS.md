# KomiUnit — Account System Status

_Phase 2 — Last updated: 2026-06-01_

---

## Auth Flow

| Flow | Status | Implementation |
|---|---|---|
| Sign Up | ✅ | `AuthService.signUp` → Supabase Auth → `createUserProfile` in `users` table |
| Sign In | ✅ | `AuthService.signIn` → session persisted via AsyncStorage |
| Sign Out | ✅ | `AuthService.signOut` → clears session + user state; guarded by `Alert.alert` |
| Forgot Password | ✅ | `AuthService.resetPassword` → Supabase sends reset email |
| Email Verification | ✅ | Screen exists; Supabase handles verification link |
| Change Password | ✅ | `AuthService.updatePassword` → `supabase.auth.updateUser({ password })` |
| Session Persistence | ✅ | `AsyncStorage` adapter in Supabase client; `autoRefreshToken: true` |
| Auth State Changes | ✅ | `onAuthStateChange` listener in `AuthProvider` syncs user state |

---

## User Object (in-memory — `AuthContext.user`)

| Field | DB Column | Type | Source |
|---|---|---|---|
| `id` | `users.id` | `string` (UUID) | Supabase Auth |
| `email` | `users.email` | `string` | Supabase Auth |
| `fullName` | `users.full_name` | `string \| undefined` | `users` table |
| `avatarUrl` | `users.avatar_url` | `string \| undefined` | `users` table + Storage |
| `phone` | `users.phone` | `string \| undefined` | `users` table |
| `createdAt` | `users.created_at` | `string \| undefined` | `users` table |
| `updatedAt` | `users.updated_at` | `string \| undefined` | `users` table |

---

## AuthContext API

| Method | Signature | Effect |
|---|---|---|
| `signIn` | `(email, password) → Promise<void>` | Authenticates; user set via `onAuthStateChange` |
| `signUp` | `(email, password, fullName) → Promise<void>` | Creates Supabase auth user + `users` row |
| `signOut` | `() → Promise<void>` | Signs out; resets `user` to `null` |
| `resetPassword` | `(email) → Promise<void>` | Sends reset email via Supabase |
| `updateProfile` | `(Partial<User>) → void` | **Phase 2 addition** — merges partial update into in-memory user; no DB fetch |
| `clearError` | `() → void` | Resets `error` state |

---

## ProfileService API

| Method | Signature | Supabase call |
|---|---|---|
| `getProfile` | `(userId) → Promise<User>` | `users` SELECT |
| `updateProfile` | `(userId, { fullName?, phone? }) → Promise<User>` | `users` UPDATE |
| `uploadAvatar` | `(userId, fileUri, mimeType?) → Promise<string>` | Storage UPLOAD + `users` UPDATE |
| `removeAvatar` | `(userId) → Promise<void>` | Storage REMOVE + `users` UPDATE |
| `changePassword` | `(newPassword) → Promise<void>` | `supabase.auth.updateUser` |

---

## useProfile Hook API

| Field/Method | Type | Description |
|---|---|---|
| `user` | `User \| null` | Current user from AuthContext |
| `saving` | `boolean` | True during `updateProfile` / `changePassword` |
| `uploading` | `boolean` | True during `pickAndUploadAvatar` |
| `error` | `string \| null` | Last operation error |
| `success` | `string \| null` | Last operation success message |
| `updateProfile` | `(ProfileUpdates) → Promise<void>` | Saves to DB; syncs to AuthContext |
| `pickAndUploadAvatar` | `() → Promise<void>` | Opens picker, uploads, syncs |
| `removeAvatar` | `() → Promise<void>` | Removes from storage + DB |
| `changePassword` | `(newPassword) → Promise<void>` | Via Supabase Auth |
| `clearMessages` | `() → void` | Clears error + success |

---

## usePreferences Hook API

| Field/Method | Type | Description |
|---|---|---|
| `preferences.language` | `'en' \| 'fr' \| 'ht' \| 'es' \| 'pt'` | UI language |
| `preferences.currency` | `'USD' \| 'HTG' \| 'EUR' \| 'CAD' \| 'GBP'` | Display currency |
| `preferences.pushNotifications` | `boolean` | Local preference flag |
| `preferences.emailNotifications` | `boolean` | Local preference flag |
| `loading` | `boolean` | True while reading AsyncStorage |
| `updatePreference` | `(key, value) → Promise<void>` | Updates + persists single preference |
| `resetPreferences` | `() → Promise<void>` | Resets all to defaults |

---

## Preferences Storage

| Key (AsyncStorage) | Type | Default |
|---|---|---|
| `@komiunit_preferences.language` | `AppLanguage` | `'en'` |
| `@komiunit_preferences.currency` | `AppCurrency` | `'USD'` |
| `@komiunit_preferences.pushNotifications` | `boolean` | `true` |
| `@komiunit_preferences.emailNotifications` | `boolean` | `true` |

Stored as a single JSON object at `@komiunit_preferences`.

---

## Known Limitations

| Item | Notes |
|---|---|
| Preferences are local only | Language/currency don't affect API calls or number formatting yet (future: i18n library) |
| Notification toggles are UI-only | No push notification backend wired up; requires Phase 3 (Expo Notifications) |
| Password change requires re-auth on some flows | Supabase may require recent session; handled via `supabase.auth.updateUser` |
| Avatar bucket RLS | Must be configured in Supabase Dashboard (see `PROFILE_STATUS.md`) |
| Phone format is free-text | Displayed as-entered; not normalized |
