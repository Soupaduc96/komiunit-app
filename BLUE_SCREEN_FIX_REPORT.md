# Blue Screen Fix Report

## Files changed

### 1. `src/components/animated-icon.web.tsx`

Changed `AnimatedSplashOverlay` from a block-flow `flex:1` View to an absolute overlay (`absoluteFill + zIndex: 1000`), matching the intent of the native version.

```diff
 export function AnimatedSplashOverlay() {
-  return <View style={{ flex: 1, backgroundColor: '#208AEF' }} />;
+  return (
+    <View
+      style={{
+        ...StyleSheet.absoluteFillObject,
+        backgroundColor: '#208AEF',
+        zIndex: 1000,
+      }}
+    />
+  );
 }
```

**Why:** The splash must be an overlay on top of the Stack, not a replacement for it. The native version already used this pattern. The web version was wrong.

---

### 2. `src/app/_layout.tsx`

Restructured `RootLayoutNav` so the Stack always renders. The splash is mounted as a conditional sibling overlay.

```diff
 function RootLayoutNav() {
   const { initialized } = useAuth();

-  if (!initialized) {
-    return <AnimatedSplashOverlay />;
-  }
-
-  return (
-    <Stack screenOptions={{ headerShown: false }}>
-      <Stack.Screen name="(tabs)" options={{ animation: 'none' }} />
-      <Stack.Screen name="(auth)" options={{ animation: 'none' }} />
-    </Stack>
-  );
+  return (
+    <>
+      <Stack screenOptions={{ headerShown: false }}>
+        <Stack.Screen name="(tabs)" options={{ animation: 'none' }} />
+        <Stack.Screen name="(auth)" options={{ animation: 'none' }} />
+      </Stack>
+      {!initialized && <AnimatedSplashOverlay />}
+    </>
+  );
 }
```

**Why:** Expo Router requires the root layout to always return a navigator. Returning a plain View during the splash phase left the router without a navigator — navigation could not process.

---

### 3. `src/app/(auth)/_layout.tsx`

Removed the `!initialized → return null` early exit. Added `initialized &&` to the redirect guard so the redirect only fires once auth state is known.

```diff
 export default function AuthLayout() {
   const { user, initialized } = useAuth();

-  if (!initialized) return null;
-
-  if (user) {
+  if (initialized && user) {
     return <Redirect href="/(tabs)" />;
   }

   return <Stack screenOptions={{ headerShown: false }} />;
 }
```

**Why:** Returning `null` from a layout component means "no navigator for this group." Expo Router could not render `login.tsx` when the auth layout had no Stack. Now the auth Stack always renders — it is visually hidden behind the splash overlay until `initialized` is true, at which point the overlay is removed and the correct screen is shown.

---

## Expected behavior after fix

| State | What renders |
|---|---|
| `!initialized` | Stack (hidden) + splash overlay |
| `initialized, user=null` | Login screen (splash gone) |
| `initialized, user!=null` | Home tab (splash gone) |

---

## Auth guard summary (unchanged)

- `(tabs)/_layout.tsx`: `if (initialized && !user) → <Redirect href="/(auth)/login" />`
- `(auth)/_layout.tsx`: `if (initialized && user) → <Redirect href="/(tabs)" />`
- `src/app/index.tsx`: unconditional `<Redirect href="/(auth)/login" />` as entry point
