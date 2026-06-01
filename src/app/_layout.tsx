import { Stack } from 'expo-router';
import { AuthProvider } from '@/context/auth-context';
import { useAuth } from '@/hooks/use-auth';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { ErrorBoundary } from '@/components/common/error-boundary';

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

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </ErrorBoundary>
  );
}
