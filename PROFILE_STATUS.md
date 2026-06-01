# KomiUnit — Profile System Status

_Phase 2 — Last updated: 2026-06-01_

---

## Build

| Check | Result |
|---|---|
| `tsc --noEmit` | ✅ 0 errors |
| Android export | ✅ |
| iOS export | ✅ |
| Web export | ✅ |

---

## New Files

| Path | Role |
|---|---|
| `src/services/supabase/profile-service.ts` | Supabase CRUD for profile + avatar storage upload |
| `src/hooks/use-profile.ts` | State manager: update profile, pick+upload avatar, change password |
| `src/hooks/use-preferences.ts` | AsyncStorage-backed preferences (language, currency, notifications) |
| `src/components/profile/avatar.tsx` | Reusable Avatar component with initials fallback + edit badge |
| `src/app/(tabs)/profile/_layout.tsx` | Stack layout for profile module |
| `src/app/(tabs)/profile/index.tsx` | Profile home screen |
| `src/app/(tabs)/profile/edit-profile.tsx` | Edit name, phone, change avatar |
| `src/app/(tabs)/profile/preferences.tsx` | Language + currency selectors |
| `src/app/(tabs)/profile/notifications.tsx` | Push + email notification toggles |
| `src/app/(tabs)/profile/security.tsx` | Change password + sign out |

## Modified Files

| Path | Change |
|---|---|
| `src/context/auth-context.tsx` | Added `updateProfile(Partial<User>)` — merges updates into in-memory user without DB re-fetch |
| `src/components/navigation/tab-bar-icon.tsx` | Added `profile → 👤` and `index → 🏠` mappings |
| `src/app/(tabs)/_layout.tsx` | Added `profile` tab (7th tab, labelled "Account") |
| `.expo/types/router.d.ts` | Added all 5 profile route paths |
| `app.json` | Added `expo-image-picker` plugin with photo/camera permission strings |
| `package.json` | Added `expo-image-picker ~56.0.15` |

---

## Feature Coverage

### Profile Screen (`/profile`)

| Requirement | Status | Notes |
|---|---|---|
| User avatar display | ✅ | With initials fallback if no photo |
| Full name display | ✅ | |
| Email display | ✅ | |
| Phone display | ✅ | Via edit-profile |
| Member since date | ✅ | Formatted `MMMM yyyy` |
| Navigate to edit | ✅ | |
| Navigate to preferences | ✅ | |
| Navigate to notifications | ✅ | |
| Navigate to security | ✅ | |
| App version | ✅ | Static `v1.0.0` |

### Edit Profile (`/profile/edit-profile`)

| Requirement | Status | Notes |
|---|---|---|
| Update full name | ✅ | Saved to `users.full_name` |
| Update phone | ✅ | Saved to `users.phone`, nullable |
| Field validation | ✅ | Min 2 chars for name; phone regex |
| Error banner | ✅ | Red banner below avatar |
| Success banner | ✅ | Green banner |
| Email read-only | ✅ | Shown as read-only with explanation |
| Loading state (save) | ✅ | Button shows `Saving…` + spinner |

### Avatar Upload (`/profile/edit-profile`)

| Requirement | Status | Notes |
|---|---|---|
| Open photo library | ✅ | `expo-image-picker` — square crop, 0.8 quality |
| Permission request | ✅ | Graceful error if denied |
| Upload to Supabase Storage | ✅ | Bucket: `avatars`, path: `{userId}/avatar.{ext}`, upsert |
| Replace existing avatar | ✅ | `upsert: true` overwrites |
| Update users.avatar_url | ✅ | With cache-busting `?t=timestamp` |
| Loading overlay on avatar | ✅ | `ActivityIndicator` over avatar circle |
| Error state | ✅ | Error banner shown |
| Sync to global user state | ✅ | Calls `AuthContext.updateProfile()` immediately |

### Preferences (`/profile/preferences`)

| Requirement | Status | Notes |
|---|---|---|
| Language selector | ✅ | 5 options: EN, FR, HT (Haitian Creole), ES, PT |
| Currency selector | ✅ | 5 options: USD, HTG, EUR, CAD, GBP |
| Persist to AsyncStorage | ✅ | Via `Storage.setPreferences()` |
| Restore on app load | ✅ | `useEffect` in `usePreferences` |
| Loading state | ✅ | `ActivityIndicator` while reading AsyncStorage |

### Notifications (`/profile/notifications`)

| Requirement | Status | Notes |
|---|---|---|
| Push notifications toggle | ✅ | Persisted to AsyncStorage |
| Email notifications toggle | ✅ | Persisted to AsyncStorage |
| Per-category toggles | ✅ | Transfer, Order, Support, Learning |
| Loading state | ✅ | |

### Security (`/profile/security`)

| Requirement | Status | Notes |
|---|---|---|
| Session info display | ✅ | Email + member since date |
| Change password | ✅ | Calls `supabase.auth.updateUser({ password })` |
| Password validation | ✅ | Min 8 chars, match check |
| Show/hide password toggle | ✅ | |
| Success/error feedback | ✅ | Banners |
| Sign out | ✅ | `Alert.alert` confirmation dialog |
| Sign out loading state | ✅ | Button shows spinner during `authLoading` |

---

## Storage Bucket Setup Required

Before avatar upload works, create the `avatars` bucket in Supabase:

```sql
-- Run in Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- RLS: allow authenticated users to upload their own avatar
CREATE POLICY "avatar_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatar_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatar_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatar_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```
