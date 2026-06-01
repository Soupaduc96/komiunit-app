# Account Screen — Phase 2A Status

_Last updated: 2026-06-01_

## Phase 2A Objectives

| # | Objective | Status | Notes |
|---|-----------|--------|-------|
| 1 | Build Account screen | ✅ Done | `profile/index.tsx` — hero card + menu sections |
| 2 | Display current user profile | ✅ Done | Avatar, full name, email, member since date |
| 3 | Edit full name | ✅ Done | `profile/edit-profile.tsx` — validation, save, success banner |
| 4 | Edit phone number | ✅ Done | `profile/edit-profile.tsx` — optional, format validated |
| 5 | Avatar upload | ✅ Done | Real upload via Supabase Storage, not a placeholder |
| 6 | Settings section | ✅ Done | Notifications, Preferences, Security sub-screens |
| 7 | Logout button | ✅ Done | `profile/security.tsx` — Alert confirmation before sign-out |
| 8 | Loading states | ✅ Done | `saving`, `uploading`, `authLoading` — all wired to UI |
| 9 | Error states | ✅ Done | Red banner on edit-profile, security, and now account screen |
| 10 | Success feedback | ✅ Done | Green banner on edit-profile, security, and now account screen |

## Account Screen Layout

```
Account
├── Header bar ("Account")
├── Hero Card
│   ├── Avatar (editable, upload overlay during upload)
│   ├── Full name (or "Your Name" if not set)
│   ├── Email
│   └── Member since (formatted date)
├── Upload error/success banners (dismissable) ← added Phase 2A
├── Section: Account
│   ├── Edit Profile → edit-profile.tsx
│   ├── Notifications → notifications.tsx
│   └── Preferences → preferences.tsx
├── Section: Security
│   └── Security → security.tsx
└── Version string (KomiUnit v1.0.0)
```

## Edit Profile Screen Layout

```
Edit Profile
├── Back button
├── Avatar (editable, 96px, "Tap to change photo" hint)
├── Success/error banners
├── Section: Personal Info
│   ├── Full Name input (required, min 2 chars)
│   └── Phone Number input (optional, format validated)
├── Section: Account Info
│   └── Email (read-only, locked field with explanation)
└── Save Changes button (loading state: "Saving…")
```

## Security Screen Layout

```
Security
├── Back button
├── Section: Active Session
│   ├── Account email
│   └── Member since date
├── Section: Change Password
│   ├── Success/error banners
│   ├── Show/hide toggle
│   ├── New Password input
│   ├── Confirm Password input
│   └── Update Password button (loading: "Updating…")
├── Divider
└── Section: Session
    └── Sign Out button (danger, Alert confirmation)
```

## Data Flow

```
Supabase DB (users table)
  ↓ getUserProfile()
AuthContext.user { id, email, fullName, avatarUrl, phone, createdAt }
  ↓ useAuth()
useProfile { user, saving, uploading, error, success }
  ↓
Profile screens (read + mutate)
  ↓ updateProfile() / pickAndUploadAvatar()
ProfileService → Supabase DB
  ↓ on success → syncUser(updated) → AuthContext updates
All screens that consume useAuth() re-render with new data
```
