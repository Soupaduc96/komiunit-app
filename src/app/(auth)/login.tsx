import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthForm } from '@/components/auth/auth-form';
import { useAuth } from '@/hooks/use-auth';
import { Colors, Spacing } from '@/constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, loading, error: authError, clearError } = useAuth();
  const [localError, setLocalError] = useState<string | null>(null);

  const isDark = false; // TODO: Get from theme context

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
    },
    header: {
      paddingHorizontal: Spacing.three,
      paddingTop: Spacing.four,
      paddingBottom: Spacing.two,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: isDark ? Colors.dark.text : Colors.light.text,
      marginBottom: Spacing.one,
    },
    subtitle: {
      fontSize: 16,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
    },
    link: {
      color: '#007AFF',
      textDecorationLine: 'underline',
    },
  });

  const handleLogin = async (values: Record<string, string>) => {
    try {
      setLocalError(null);
      clearError();
      await signIn(values.email, values.password);
      // Navigation will be handled by auth context change
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setLocalError(message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>KomiUnit</Text>
        <Text style={styles.subtitle}>Welcome back to your digital wallet</Text>
      </View>

      <AuthForm
        fields={[
          {
            name: 'email',
            label: 'Email Address',
            placeholder: 'your@email.com',
            type: 'email',
            required: true,
          },
          {
            name: 'password',
            label: 'Password',
            placeholder: '••••••••',
            type: 'password',
            required: true,
          },
        ]}
        submitButtonText="Sign In"
        isLoading={loading}
        error={localError ?? authError ?? undefined}
        onSubmit={handleLogin}
        onSecondaryAction={() => router.push('/(auth)/signup')}
        secondaryActionText="Don't have an account? Sign Up"
      />

      <View style={{ paddingHorizontal: Spacing.three, marginTop: Spacing.two }}>
        <Text
          onPress={() => router.push('/(auth)/forgot-password')}
          style={[styles.subtitle, styles.link]}
        >
          Forgot Password?
        </Text>
      </View>
    </View>
  );
}
