# Logout Root Cause

## Symptom

Pressing "Sign Out" in the Security screen showed the confirmation Alert, but after confirming, the screen did not navigate to login — it appeared frozen.

## Root Cause

`src/app/_layout.tsx` used conditional `Stack.Screen` declarations:

```tsx
// BEFORE — broken
<Stack screenOptions={{ headerShown: false }}>
  {user ? (
    <Stack.Screen name="(tabs)" options={{ animation: 'none' }} />
  ) : (
    <Stack.Screen name="(auth)" options={{ animation: 'none' }} />
  )}
</Stack>
```

Expo Router v5 registers routes from `Stack.Screen` declarations at render time.  
When `signOut()` fired and `user` became `null`:

1. React re-rendered `RootLayoutNav`.
2. The `(tabs)` screen was **removed** from the Stack definition.
3. The `(auth)` screen was **added** to the Stack definition.
4. Expo Router did **not** automatically navigate to the newly available `(auth)` route — it has no imperative command to do so from a route definition change alone.
5. The navigator's current history still pointed to `(tabs)/profile/security`, which was no longer a registered route, causing the frozen UI.

## Fix Applied

Both screens are now always registered. Navigation is controlled by the `<Redirect>` guards already present in each group's `_layout.tsx`:

```tsx
// AFTER — fixed (src/app/_layout.tsx)
<Stack screenOptions={{ headerShown: false }}>
  <Stack.Screen name="(tabs)" options={{ animation: 'none' }} />
  <Stack.Screen name="(auth)" options={{ animation: 'none' }} />
</Stack>
```

With both screens registered:
- `(tabs)/_layout.tsx` redirects to `/(auth)/login` when `!user`
- `(auth)/_layout.tsx` redirects to `/(tabs)` when `user` is set

This is the canonical Expo Router pattern. Navigation on signout now works correctly because `(tabs)/_layout.tsx`'s guard fires immediately when `user` becomes `null`.

## No signOut() code change needed

`AuthContext.signOut()` correctly calls `supabase.auth.signOut()` and sets `user = null`.  
The `onAuthStateChange` listener also sets `user = null` as a secondary path.  
Both paths now trigger the `(tabs)` guard redirect properly.
