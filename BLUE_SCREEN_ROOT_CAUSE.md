# Blue Screen Root Cause

## Symptom

Browser loads `localhost:8081`. Screen stays solid `#208AEF` permanently. No JS errors in console.

---

## Root cause — three compounding issues

### Issue 1 (primary): `RootLayoutNav` returned a View instead of a Stack

**File:** `src/app/_layout.tsx`

```tsx
// BEFORE — broken
function RootLayoutNav() {
  const { initialized } = useAuth();

  if (!initialized) {
    return <AnimatedSplashOverlay />;  // ← plain View, NOT a navigator
  }

  return (
    <Stack>...</Stack>
  );
}
```

Expo Router v5 requires the root layout to **always** return a navigator (`Stack`, `Tabs`, `Drawer`, or `Slot`). When it returns a plain `View` instead, the router's internal navigation state machine cannot initialize. It has no navigator to route through.

When `initialized` finally became `true` and the `Stack` mounted, Expo Router did not re-process the initial navigation that had already failed during the splash phase. The root remained blank/blue.

---

### Issue 2 (compounding): `(auth)/_layout.tsx` returned `null` when `!initialized`

**File:** `src/app/(auth)/_layout.tsx`

```tsx
// BEFORE — broken
if (!initialized) return null;  // ← null from a layout = no navigator
```

Even if the root Stack had mounted, when Expo Router navigated to `/(auth)/login` (from the `index.tsx` redirect), the auth layout returned `null` — meaning no Stack for the auth routes. Without a navigator in the auth group, `login.tsx` could not render.

---

### Issue 3 (compounding): Web `AnimatedSplashOverlay` used `flex:1` instead of `absoluteFill`

**File:** `src/components/animated-icon.web.tsx`

```tsx
// BEFORE — wrong
return <View style={{ flex: 1, backgroundColor: '#208AEF' }} />;
```

The native version (`animated-icon.tsx`) uses `absoluteFill + zIndex: 1000` — an overlay on top of the already-rendered Stack. The web version used `flex: 1` which **replaces** the Stack in the normal flow. This is the wrong pattern for a splash screen.

---

## Navigation trace (broken path)

```
Browser: localhost:8081/
  └─► RootLayoutNav: initialized=false → return <AnimatedSplashOverlay />
        [NO Stack rendered — router has no navigator]
        [index.tsx redirect to /(auth)/login fires... but no Stack to navigate through]
        [initialized becomes true]
        [Stack mounts — but router did not re-process the initial navigation]
        [Blue screen persists]
```

---

## Navigation trace (fixed path)

```
Browser: localhost:8081/
  └─► RootLayoutNav: renders Stack + splash overlay
        Stack navigates: / → index.tsx → redirect /(auth)/login
        (auth)/_layout.tsx: initialized=false, user=null → renders auth Stack
        login.tsx renders (hidden under splash)
        [initialized becomes true]
        Splash overlay removed → login screen visible
```
