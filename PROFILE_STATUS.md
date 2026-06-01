# Profile System — Phase 2A Status

_Last updated: 2026-06-01_

## Screens

| Screen | File | Status |
|--------|------|--------|
| Account (main) | `src/app/(tabs)/profile/index.tsx` | ✅ Complete |
| Edit Profile | `src/app/(tabs)/profile/edit-profile.tsx` | ✅ Complete |
| Notifications | `src/app/(tabs)/profile/notifications.tsx` | ✅ Complete |
| Preferences | `src/app/(tabs)/profile/preferences.tsx` | ✅ Complete |
| Security | `src/app/(tabs)/profile/security.tsx` | ✅ Complete |
| Profile navigator | `src/app/(tabs)/profile/_layout.tsx` | ✅ Complete |

## Components

| Component | File | Status |
|-----------|------|--------|
| Avatar | `src/components/profile/avatar.tsx` | ✅ Complete — initials fallback, upload overlay, edit badge |
| Button | `src/components/common/button.tsx` | ✅ Fixed — title prop now always respected (removed "Loading..." override) |
| Card | `src/components/common/card.tsx` | ✅ Complete — default / elevated / outlined |
| Input | `src/components/common/input.tsx` | ✅ Complete |

## Hooks

| Hook | File | Status |
|------|------|--------|
| useProfile | `src/hooks/use-profile.ts` | ✅ Complete — updateProfile, pickAndUploadAvatar, removeAvatar, changePassword |
| usePreferences | `src/hooks/use-preferences.ts` | ✅ Complete — persisted to AsyncStorage |

## Services

| Service | File | Status |
|---------|------|--------|
| ProfileService | `src/services/supabase/profile-service.ts` | ✅ Complete — read, update, uploadAvatar, removeAvatar, changePassword |
| mapUser | `src/services/supabase/mappers.ts` | ✅ Correct — full_name→fullName, avatar_url→avatarUrl, phone |

## Phase 2A Changes Applied

### `src/components/common/button.tsx`
- Removed `loading ? 'Loading...' : title` — callers control the loading label via the `title` prop
- All callers already pass dynamic titles (`title={saving ? 'Saving…' : 'Save Changes'}`)

### `src/app/(tabs)/profile/index.tsx`
- Added `error`, `success`, `clearMessages` from `useProfile`
- Added dismissable error/success banners for avatar upload feedback
- Previously: upload errors were silent on the Account screen

## TypeScript
```
npx tsc --noEmit → 0 errors
```
