# Login Fix Report

## Fix 1 — Add `<Redirect>` to `(auth)/_layout.tsx` (Critical)

This is the primary fix. After login, `user` is set in AuthContext but nothing navigates away from `/(auth)/login`. Adding a `<Redirect>` here handles it explicitly and reliably.

**File**: `src/app/(auth)/_layout.tsx`

```tsx
// BEFORE
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, gestureEnabled: true }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="verify-email" />
    </Stack>
  );
}
```

```tsx
// AFTER
import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/hooks/use-auth';

export default function AuthLayout() {
  const { user, initialized } = useAuth();

  if (initialized && user) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, gestureEnabled: true }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="verify-email" />
    </Stack>
  );
}
```

**Why**: When `user` becomes non-null after login, Expo Router renders this layout. The `<Redirect href="/(tabs)" />` fires immediately, navigating the user into the app. The `initialized` guard prevents a flash redirect on cold start before auth state resolves.

---

## Fix 2 — Add `<Redirect>` to `(tabs)/_layout.tsx` (Critical)

Protects the tabs group. Without this, unauthenticated users could navigate directly to `/(tabs)` routes.

**File**: `src/app/(tabs)/_layout.tsx`

Add at the top of `TabsLayout`, before the `return <Tabs ...>`:

```tsx
import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks/use-auth';

export default function TabsLayout() {
  const { user, initialized } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (initialized && !user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs ...>
      ...
    </Tabs>
  );
}
```

**Why**: Makes auth protection explicit and bidirectional. If a session expires or sign-out occurs while the user is inside the tabs, this immediately redirects to login.

---

## Fix 3 — Consolidate auth state into `onAuthStateChange` only (Medium)

Remove `initAuth()` and handle ALL session state — including initialization — inside `onAuthStateChange`. This eliminates the race between two parallel state setters, and narrows `setUser(null)` to only the `SIGNED_OUT` event.

**File**: `src/context/auth-context.tsx`

```tsx
// BEFORE
useEffect(() => {
  const initAuth = async () => {
    try {
      const session = await AuthService.getSession();
      if (session?.user) {
        try {
          const profile = await DatabaseService.getUserProfile(session.user.id);
          setUser(profileFromRow(session.user.id, session.user.email ?? '', profile));
        } catch {
          setUser({ id: session.user.id, email: session.user.email ?? '' });
        }
      }
    } catch (err) {
      console.error('Auth initialization error:', err);
    } finally {
      setInitialized(true);
    }
  };

  initAuth();

  const { data } = AuthService.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      try {
        const profile = await DatabaseService.getUserProfile(session.user.id);
        setUser(profileFromRow(session.user.id, session.user.email ?? '', profile));
      } catch {
        setUser({ id: session.user.id, email: session.user.email ?? '' });
      }
    } else {
      setUser(null);
    }
  });

  return () => { data?.subscription?.unsubscribe(); };
}, []);
```

```tsx
// AFTER
useEffect(() => {
  const { data } = AuthService.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      try {
        const profile = await DatabaseService.getUserProfile(session.user.id);
        setUser(profileFromRow(session.user.id, session.user.email ?? '', profile));
      } catch {
        setUser({ id: session.user.id, email: session.user.email ?? '' });
      }
    } else if (event === 'SIGNED_OUT') {
      setUser(null);
    }

    if (event === 'INITIAL_SESSION') {
      setInitialized(true);
    }
  });

  return () => { data?.subscription?.unsubscribe(); };
}, []);
```

**Why**:
- Supabase v2 fires `INITIAL_SESSION` on subscription (after reading AsyncStorage). This is the canonical "is there an existing session?" signal. Using it for `setInitialized(true)` removes the separate `initAuth()` read.
- `setUser(null)` is now only called on `SIGNED_OUT`, not for every null-session event. This prevents a delayed `INITIAL_SESSION` (null) from clearing a user who just signed in.
- Single code path — no race between `initAuth()` and `onAuthStateChange`.

---

## Fix 4 — Simplify `_layout.tsx` (Optional cleanup)

With Fixes 1 and 2 in place, `_layout.tsx` can register both groups unconditionally. The redirect logic now lives where it belongs — in each group's layout.

**File**: `src/app/_layout.tsx`

```tsx
// BEFORE
function RootLayoutNav() {
  const { user, initialized } = useAuth();

  if (!initialized) {
    return <AnimatedSplashOverlay />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="(tabs)" options={{ animation: 'none' }} />
      ) : (
        <Stack.Screen name="(auth)" options={{ animation: 'none' }} />
      )}
    </Stack>
  );
}
```

```tsx
// AFTER
function RootLayoutNav() {
  const { initialized } = useAuth();

  if (!initialized) {
    return <AnimatedSplashOverlay />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ animation: 'none' }} />
      <Stack.Screen name="(auth)" options={{ animation: 'none' }} />
    </Stack>
  );
}
```

**Why**: Both groups are always registered. Each group self-protects with `<Redirect>`. This is the correct pattern for Expo Router v4 (SDK 52+). The splash overlay still shows until `initialized` is true (Fix 3 sets this on `INITIAL_SESSION`).

---

## Implementation Order

Apply in this order to avoid breaking intermediate states:

1. Fix 3 — `auth-context.tsx` (changes how `initialized` is set)
2. Fix 1 — `(auth)/_layout.tsx` (needs `initialized` to work correctly)
3. Fix 2 — `(tabs)/_layout.tsx`
4. Fix 4 — `_layout.tsx` (optional, cleanup)

---

## Expected Behavior After Fix

| Action | Before Fix | After Fix |
|--------|-----------|-----------|
| Submit login with valid credentials | Stays on Sign In | Navigates to `/(tabs)` |
| Submit login with wrong password | Stays on Sign In (no error shown) | Stays on Sign In (error banner shows) |
| Direct URL to `/(tabs)` while logged out | Renders tabs (unprotected) | Redirects to `/(auth)/login` |
| App cold start with saved session | Splash → login | Splash → `/(tabs)` |
| Sign out from tabs | (not affected) | Redirects to `/(auth)/login` |
