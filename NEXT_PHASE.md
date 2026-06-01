# KomiUnit — Next Phase Roadmap

_Updated: 2026-06-01 — End of Phase 2A_

## Phase 2A Complete ✅

All Account & Profile objectives are done:
- Account screen, Edit Profile, Notifications, Preferences, Security
- Avatar upload, loading/error/success states, logout with confirmation
- `0 TypeScript errors`

---

## Pending: Auth Hardening (Fix 3)

Before building new features, apply the remaining auth fix documented in `LOGIN_FIX_REPORT.md`:

**`src/context/auth-context.tsx`** — remove `initAuth()`, consolidate into `onAuthStateChange`:
- `INITIAL_SESSION` event sets `initialized = true`
- `setUser(null)` only on `SIGNED_OUT`, not all null-session events
- Eliminates the race between two parallel state setters

**Impact**: Prevents an intermittent bug where `INITIAL_SESSION` (null, stale) fires after `SIGNED_IN` and clears the authenticated user.

Also: **Remove temporary debug logging** added during profile debugging:
- `src/context/auth-context.tsx` — remove `console.log('[AuthContext]...` lines
- `src/app/(tabs)/index.tsx` — remove `console.log('[HomeScreen]...` line

---

## Phase 2B — KomiSend (Money Transfer)

**Objective**: Enable authenticated users to send money to other KomiUnit users.

### Screens needed
- `komi-send/index.tsx` — send history / recent contacts
- `komi-send/send-money.tsx` — amount + recipient form (screen exists, needs logic)
- `komi-send/recipients.tsx` — recipient search/list (screen exists, needs logic)
- `komi-send/[id].tsx` — transaction detail (screen exists, needs logic)

### Services needed
- `src/services/supabase/komi-send-service.ts` — `getSends`, `createSend`, `getRecipients`
- Hook `use-komi-send.ts` exists — wire up to real DB calls

### Schema
- `komi_sends` table ✅ exists
- `users` table ✅ (recipients lookup via email/phone)

### Key logic
- Sender balance check (currently hardcoded $1,250.50 on HomeScreen)
- Recipient lookup by email or phone
- Send status: pending → completed

---

## Phase 2C — KomiMarché (Marketplace)

**Objective**: Browse products, add to cart, checkout.

### Screens needed
- `komi-marche/index.tsx` — product listing with categories
- `komi-marche/[id].tsx` — product detail (screen exists)
- `komi-marche/cart.tsx` — cart view (screen exists)
- `komi-marche/checkout.tsx` — checkout form (screen exists)
- `komi-marche/orders.tsx` — order history (screen exists)

### Services needed
- Wire up `use-komi-marche.ts` hook to real Supabase queries
- Products, cart, orders tables ✅ all exist in schema

---

## Phase 2D — KomiSol (Support Tickets)

### Screens
- `komi-sol/index.tsx` — solution browser
- `komi-sol/tickets.tsx` — user ticket list (screen exists)
- `komi-sol/create-ticket.tsx` — new ticket form (screen exists)
- `komi-sol/[id].tsx` — solution detail (screen exists)

---

## Phase 2E — KomiLearn (Courses)

### Screens
- `komi-learn/index.tsx` — course catalog
- `komi-learn/[id].tsx` — course detail (screen exists)
- `komi-learn/my-courses.tsx` — enrolled courses (screen exists)

---

## Phase 2F — KomiVoix (Voice)

### Screens
- `komi-voix/index.tsx` — contacts + call log
- `komi-voix/[id].tsx` — call detail (screen exists)
- `komi-voix/add-contact.tsx` — add contact form (screen exists)
- `komi-voix/call-history.tsx` — history (screen exists)

---

## Deferred / Not Started

| Item | Priority | Notes |
|------|----------|-------|
| Real-time balance | High | Replace hardcoded $1,250.50 on HomeScreen |
| Push notifications | Medium | Expo push token registration + Supabase Edge Function |
| Dark mode | Low | `isDark = false` TODO in Button, Card — replace with `useColorScheme` |
| Supabase avatars bucket | Required for avatar upload | Create `avatars` bucket in Supabase Storage with public access |
| `users_select_own` RLS | Required for profile fetch | Confirm policy exists in live DB (see PROFILE_ROOT_CAUSE.md) |
