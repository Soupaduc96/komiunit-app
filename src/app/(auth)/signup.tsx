import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthForm } from '@/components/auth/auth-form';
import { useAuth } from '@/hooks/use-auth';
import { Colors, Spacing } from '@/constants/theme';
import { Validation } from '@/utils/validation';

export default function SignupScreen() {
  const router = useRouter();
  // loading = true while signUp() is in-flight; error = Supabase error message
  const { signUp, loading, error: authError, clearError } = useAuth();
  const [localError, setLocalError] = useState<string | null>(null);

  const isDark = false;

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
  });

  const handleSignup = async (values: Record<string, string>) => {
    setLocalError(null);
    clearError();

    // Client-side validation before hitting Supabase
    if (!Validation.isValidName(values.fullName)) {
      setLocalError('Please enter your full name');
      return;
    }
    if (!Validation.isValidEmail(values.email)) {
      setLocalError('Please enter a valid email address');
      return;
    }
    if (!Validation.isValidPassword(values.password)) {
      setLocalError('Password must be at least 8 characters');
      return;
    }
    if (values.password !== values.confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    try {
      await signUp(values.email, values.password, values.fullName);
      // signUp() succeeded — navigate to verify-email so the user knows to check inbox.
      // If email confirmation is disabled, onAuthStateChange fires with a session
      // and _layout.tsx routes to (tabs) automatically before this runs.
      router.replace({
        pathname: '/(auth)/verify-email',
        params: { email: values.email },
      });
    } catch (err) {
      // authError is already set by AuthContext; localError handles validation/other
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
          { name: 'fullName',        label: 'Full Name',        placeholder: 'John Doe',       type: 'text',     required: true },
          { name: 'email',           label: 'Email Address',    placeholder: 'your@email.com', type: 'email',    required: true },
          { name: 'password',        label: 'Password',         placeholder: '••••••••',        type: 'password', required: true },
          { name: 'confirmPassword', label: 'Confirm Password', placeholder: '••••••••',        type: 'password', required: true },
        ]}
        submitButtonText="Create Account"
        isLoading={loading}
        error={localError ?? authError ?? undefined}
        onSubmit={handleSignup}
        onSecondaryAction={() => router.push('/(auth)/login')}
        secondaryActionText="Already have an account? Sign In"
      />
    </View>
  );
}
