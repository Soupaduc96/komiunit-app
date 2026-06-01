import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/hooks/use-auth';

export default function AuthLayout() {
  const { user, initialized } = useAuth();

  if (!initialized) return null;

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}