# KomiUnit — Next Phase Roadmap

_Updated: 2026-06-01 — End of Phase 2_

---

## Completed Phases

| Phase | Description | Status |
|---|---|---|
| 1.0 | Architecture, screens, navigation, services, types, state | ✅ |
| 1.5 | Backend integration — Supabase, mappers, RLS, CRUD | ✅ |
| 2.0 | Profile & Account — avatar upload, edit, preferences, notifications, security | ✅ |

---

## Phase 3 — Realtime & Push Notifications

**Why now:** Core to the KomiSend and KomiVoix value prop. Without it, users miss incoming transfers and calls.

### 3.1 Supabase Realtime

```typescript
// Subscribe once in RootLayout or a dedicated hook
supabase.channel('incoming-sends')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'komi_sends',
    filter: `recipient_id=eq.${userId}`,
  }, (payload) => {
    // show in-app banner + badge
  })
  .subscribe();
```

Channels to build:
- `komi_sends` INSERT where `recipient_id = userId` → "You received $X from Y"
- `user_tickets` UPDATE where `user_id = userId` → ticket status change
- `voice_messages` INSERT where `recipient_id = userId` → badge increment
- `orders` UPDATE where `user_id = userId` → order status change

**New file:** `src/hooks/use-realtime.ts`

### 3.2 Expo Notifications

```bash
npx expo install expo-notifications expo-device
```

Steps:
1. Register push token on sign-in → store in `users.push_token`
2. Schema: `ALTER TABLE users ADD COLUMN push_token TEXT;`
3. Send push from Supabase Edge Function (triggered by DB events)
4. Handle notification tap → deep-link into relevant module

**New files:** `src/hooks/use-notifications.ts`, `supabase/functions/push-notify/index.ts`

---

## Phase 4 — Search & Discovery

**Why now:** KomiMarché and KomiLearn list screens return all records. Without search/filter, large datasets are unusable.

### 4.1 Global Search Bar

- Add `TextInput` to Home screen header
- Search across: products, courses, solutions, contacts
- Debounce 300ms before calling service
- Results grouped by module

**New screen:** `src/app/(tabs)/search.tsx`

### 4.2 Module Search Bars

Each module index screen already calls `.searchProducts()` / `.searchCourses()` — just needs a UI search bar:

```tsx
<TextInput
  value={query}
  onChangeText={(q) => {
    setQuery(q);
    debouncedSearch(q);
  }}
  placeholder="Search products…"
/>
```

### 4.3 Category Filter Chips

KomiMarché and KomiLearn: horizontal scroll row of category chips above the list.

---

## Phase 5 — KomiVoix Real Calling

**Recommended SDK: Agora RTC**

```bash
npm install agora-react-native-rtc
```

Architecture:
```
User A taps "Call" on contact
  → POST /api/initiate-call { callerId, recipientId }
  → Supabase Edge Function generates Agora token pair
  → Both users receive tokens via Realtime channel
  → Both open Agora RTC channel with the token
  → Call begins
```

New files:
- `src/services/komi-voix/agora-service.ts`
- `src/app/(tabs)/komi-voix/active-call.tsx` — in-call UI
- `supabase/functions/initiate-call/index.ts`

Agora console: `console.agora.io` — create project, get App ID.

---

## Phase 6 — KomiSend Wallet System

**Why:** Currently `komi_sends` is a ledger but there's no enforced balance. Users can send without funds.

### New Schema

```sql
CREATE TABLE wallets (
  user_id   UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  balance   DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  currency  VARCHAR(3) NOT NULL DEFAULT 'USD',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Atomic transfer function
CREATE FUNCTION transfer_funds(
  p_sender    UUID,
  p_recipient UUID,
  p_amount    DECIMAL,
  p_currency  VARCHAR DEFAULT 'USD'
) RETURNS komi_sends AS $$
DECLARE
  v_send komi_sends;
BEGIN
  -- Lock both wallet rows to prevent race conditions
  PERFORM id FROM wallets WHERE user_id IN (p_sender, p_recipient)
    ORDER BY user_id FOR UPDATE;

  -- Check sender balance
  IF (SELECT balance FROM wallets WHERE user_id = p_sender) < p_amount THEN
    RAISE EXCEPTION 'Insufficient funds';
  END IF;

  UPDATE wallets SET balance = balance - p_amount WHERE user_id = p_sender;
  UPDATE wallets SET balance = balance + p_amount WHERE user_id = p_recipient;

  INSERT INTO komi_sends (sender_id, recipient_id, amount, status)
  VALUES (p_sender, p_recipient, p_amount, 'completed')
  RETURNING * INTO v_send;

  RETURN v_send;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Home Screen Updates

- Replace hardcoded `$1,250.50` with `SELECT balance FROM wallets WHERE user_id = $1`
- Add wallet top-up flow

---

## Phase 7 — EAS Build & Store Submission

**Prerequisite:** Apple Developer account ($99/yr) + Google Play ($25 one-time)

```bash
npm install -g eas-cli
eas login
eas build:configure
```

`eas.json`:
```json
{
  "build": {
    "preview": {
      "android": { "buildType": "apk" },
      "ios": { "simulator": true }
    },
    "production": {
      "android": { "buildType": "app-bundle" },
      "ios": {}
    }
  }
}
```

`app.json` additions:
```json
"android": { "package": "com.komiunit.app" },
"ios": { "bundleIdentifier": "com.komiunit.app" }
```

Build commands:
```bash
eas build --platform android --profile preview   # test APK
eas build --platform ios --profile preview        # TestFlight
eas submit --platform ios                         # App Store
```

---

## Phase 8 — i18n + Currency Formatting

Language preference is stored (Phase 2) but not applied to UI text yet.

Recommended library: `i18next` + `react-i18next`

```bash
npm install i18next react-i18next
```

Files needed:
- `src/i18n/index.ts` — init with language from `usePreferences`
- `src/i18n/locales/en.json`, `fr.json`, `ht.json`, `es.json`, `pt.json`
- Replace all hard-coded strings with `t('key')` calls

Currency formatting: update `Formatting.currency()` to use `preferences.currency` from context.

---

## Technical Debt to Clear (Priority Order)

| Item | File(s) | Effort |
|---|---|---|
| `isDark = false` hardcodes in 12 component files | `card.tsx`, `button.tsx`, `input.tsx`, `loading.tsx`, `empty-state.tsx`, `modal.tsx`, `header.tsx`, `send-card.tsx`, all module card components | Medium — create `useTheme()` context and replace |
| `Database = any` Supabase types | `client.ts` | Low — `supabase gen types typescript --project-id YOUR_ID > src/types/supabase.ts` |
| No pagination | all list services | Low — add `limit` + `offset` params + infinite scroll |
| Hardcoded balance on Home screen | `(tabs)/index.tsx` | Low — connect to wallet when Phase 6 is done |
| `explore.tsx` is a template file | `src/app/explore.tsx` | Low — remove or replace with global search |
| `animated-icon.web.tsx` stub CSS classes | `animated-icon.web.tsx` | Low — replace with proper CSS module or drop the div |
