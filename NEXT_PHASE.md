# KomiUnit — Next Phase Recommendations

_Last updated: 2026-06-01_

---

## Current State (End of Phase 1.5)

| Area | Status |
|---|---|
| TypeScript | ✅ 0 errors |
| Web build | ✅ Compiles (2.7 MB) |
| Android build | ✅ Compiles (4.8 MB Hermes) |
| iOS build | ✅ Compiles (4.6 MB Hermes) |
| Supabase schema | ✅ Complete (22 tables, full RLS) |
| Data mappers | ✅ Complete (18 mappers) |
| All 5 module services | ✅ Direct Supabase queries |
| All 5 hooks | ✅ loading / error / empty states |
| All 5 repositories | ✅ |
| Detail screens | ✅ Loads live data |
| Send money flow | ✅ Email lookup → real recipient ID |
| Cart + checkout | ✅ Full flow with order_items |
| Course enrollment + progress | ✅ Idempotent, certificate at 100% |

---

## Phase 2: User Profile & Settings

**Priority: High** — needed before any user testing.

- [ ] Profile screen (`src/app/(tabs)/profile/index.tsx`)
  - Display avatar, name, email, phone
  - Edit full_name and phone
  - Change password (via `AuthService.updatePassword`)
  - Avatar upload to Supabase Storage (`avatars/` bucket)
- [ ] Settings screen
  - Dark / light / system theme toggle (replace `isDark = false` hardcode across all components)
  - Notification preferences
  - Language (future)
- [ ] Sign out confirmation modal
- [ ] Account deletion flow

**Files to create:** `src/app/(tabs)/profile/`, `src/contexts/theme-context.tsx`

---

## Phase 3: Realtime & Notifications

**Priority: High** — core to KomiSend and KomiVoix UX.

- [ ] Supabase Realtime subscriptions
  - KomiSend: subscribe to `komi_sends` where `recipient_id = userId` → show incoming transfer alert
  - KomiVoix: subscribe to `voice_messages` where `recipient_id = userId` → badge count
  - KomiSol tickets: subscribe to `user_tickets` → status change notification
- [ ] Expo Notifications
  - Push token registration (`expo-notifications`)
  - Server-side push on new send / order update / ticket reply
  - Background notification handler in `_layout.tsx`

**Files to create:** `src/hooks/use-realtime.ts`, `src/services/supabase/realtime.ts`

---

## Phase 4: Search & Discovery

**Priority: Medium**

- [ ] Global search screen (accessible from Home tab header)
- [ ] KomiMarché: search bar in the products list with debounced `.searchProducts()`
- [ ] KomiLearn: search bar in the courses list with debounced `.searchCourses()`
- [ ] KomiSol: search bar in solutions list
- [ ] Category filter chips in KomiMarché and KomiLearn

**Files to modify:** All 3 module `index.tsx` screens

---

## Phase 5: KomiVoix Real Calling

**Priority: Medium** — placeholder logging exists; real calling needs a 3rd-party SDK.

Options:
| SDK | Cost | Complexity |
|---|---|---|
| Agora | Free tier (10K min/mo) | Medium — native modules required |
| Twilio Voice | Pay-per-minute | Medium |
| LiveKit | Self-hosted / cloud | Medium |
| Daily.co | Free tier | Low — web-first but has RN SDK |

Recommended: **Agora** (best React Native support, free tier)

Steps:
1. `npx expo install agora-react-native-rtc`
2. Add Agora App ID to `.env.local`
3. Create `src/services/komi-voix/agora-service.ts`
4. Wire up call initiation in `komi-voix/[id].tsx`
5. Handle call lifecycle (answer, reject, end)

---

## Phase 6: KomiSend — Balance & Wallet

**Priority: Medium**

The current `komi_sends` table tracks transfers but there is no wallet/balance system. Options:

A) **Simple balance view** — compute balance from `SUM(received) - SUM(sent)` in a DB view
B) **Wallet table** — add `wallets(user_id, balance, currency)` table with transaction-safe updates

Recommended: Option B for correctness.

New tables needed:
```sql
CREATE TABLE wallets (
  user_id  UUID PRIMARY KEY REFERENCES users(id),
  balance  DECIMAL(12,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

New DB function:
```sql
CREATE FUNCTION transfer_funds(
  p_sender UUID, p_recipient UUID, p_amount DECIMAL
) RETURNS VOID AS $$ ... $$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Phase 7: EAS Build & App Store Prep

**Priority: High before any external testing.**

- [ ] Install EAS CLI: `npm install -g eas-cli`
- [ ] Login: `eas login`
- [ ] Configure: `eas build:configure` → creates `eas.json`
- [ ] Build Android APK (preview): `eas build --platform android --profile preview`
- [ ] Build iOS (requires Apple Developer account): `eas build --platform ios --profile preview`
- [ ] Configure `app.json`:
  - `android.package`: `com.komiunit.app`
  - `ios.bundleIdentifier`: `com.komiunit.app`
  - Set correct `version` and `buildNumber`

---

## Phase 8: Admin Panel

**Priority: Low** (needed for content management)

- Solutions, products, courses are currently populated only via `npm run seed`
- Options: Supabase's built-in Table Editor (immediate), or a separate admin web app (Phase 8+)
- Short term: add `service_role` key to seed script for admin writes bypassing RLS
- Long term: dedicated admin portal (Next.js + Supabase)

---

## Technical Debt to Clear

| Item | File | Severity |
|---|---|---|
| `isDark = false` hardcoded | 12 component files | Medium — theme context needed |
| `// TODO: Get from theme context` comments | Same 12 files | Medium |
| `const classes: Record<string, string> = {}` stub | `animated-icon.web.tsx` | Low |
| Supabase `Database = any` type | `client.ts` | Low — generate proper types via `supabase gen types` |
| No pagination on products/courses/solutions lists | service files | Low |
| No optimistic updates on cart operations | `use-komi-marche.ts` | Low |

---

## Recommended Execution Order

```
Phase 2 (Profile/Settings)  →  Phase 3 (Realtime)  →  Phase 7 (EAS Build)
         ↓
   Ship first TestFlight/Play Store internal build
         ↓
Phase 4 (Search)  →  Phase 5 (Real Voice)  →  Phase 6 (Wallet)
         ↓
   Phase 8 (Admin Panel)  →  Public Launch
```
