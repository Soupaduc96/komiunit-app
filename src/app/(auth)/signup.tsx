import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthForm } from '@/components/auth/auth-form';
import { useAuth } from '@/hooks/use-auth';
import { Colors, Spacing } from '@/constants/theme';
import { Validation } from '@/utils/validation';

export default function SignupScreen() {
  const router = useRouter();
  const { signUp, error: authError, clearError } = useAuth();
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

  const handleSignup = async (values: Record<string, string>) => {
    try {
      setLocalError(null);
      clearError();

      // Validation
      if (!Validation.isValidEmail(values.email)) {
        throw new Error('Please enter a valid email address');
      }

      if (!Validation.isValidPassword(values.password)) {
        throw new Error('Password must be at least 8 characters');
      }

      if (values.password !== values.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (!Validation.isValidName(values.fullName)) {
        throw new Error('Please enter your full name');
      }

      await signUp(values.email, values.password, values.fullName);
      // Navigation will be handled by auth context change
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      setLocalError(message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Join KomiUnit</Text>
        <Text style={styles.subtitle}>Create your account to get started</Text>
      </View>

      <AuthForm
        fields={[
          {
            name: 'fullName',
            label: 'Full Name',
            placeholder: 'John Doe',
            type: 'text',
            required: true,
          },
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
          {
            name: 'confirmPassword',
            label: 'Confirm Password',
            placeholder: '••••••••',
            type: 'password',
            required: true,
          },
        ]}
        submitButtonText="Create Account"
        isLoading={authError !== null}
        error={localError ?? authError ?? undefined}
        onSubmit={handleSignup}
        onSecondaryAction={() => router.push('/(auth)/login')}
        secondaryActionText="Already have an account? Sign In"
      />
    </View>
  );
}
