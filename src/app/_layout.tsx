import { Stack } from 'expo-router';
import { AuthProvider } from '@/context/auth-context';
import { useAuth } from '@/hooks/use-auth';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { ErrorBoundary } from '@/components/common/error-boundary';

function RootLayoutNav() {
  const { initialized } = useAuth();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ animation: 'none' }} />
        <Stack.Screen name="(auth)" options={{ animation: 'none' }} />
      </Stack>
      {!initialized && <AnimatedSplashOverlay />}
    </>
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
