import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthForm } from '@/components/auth/auth-form';
import { useAuth } from '@/hooks/use-auth';
import { Colors, Spacing } from '@/constants/theme';
import { Validation } from '@/utils/validation';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword, error: authError, clearError } = useAuth();
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
    successMessage: {
      fontSize: 14,
      color: '#34C759',
      marginHorizontal: Spacing.three,
      marginVertical: Spacing.two,
      backgroundColor: 'rgba(52, 199, 89, 0.1)',
      padding: Spacing.two,
      borderRadius: 8,
    },
  });

  const handleResetPassword = async (values: Record<string, string>) => {
    try {
      setLocalError(null);
      clearError();

      if (!Validation.isValidEmail(values.email)) {
        throw new Error('Please enter a valid email address');
      }

      await resetPassword(values.email);
      setSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reset password';
      setLocalError(message);
    }
  };

  if (success) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Check Your Email</Text>
          <Text style={styles.subtitle}>
            We've sent a password reset link to your email address. Check your inbox to continue.
          </Text>
        </View>
        <Text style={styles.successMessage}>
          If you don't see the email in your inbox, please check your spam folder.
        </Text>
        <View style={{ paddingHorizontal: Spacing.three }}>
          <Text
            onPress={() => router.push('/(auth)/login')}
            style={[styles.subtitle, { color: '#007AFF', textDecorationLine: 'underline' }]}
          >
            Back to Login
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Enter your email address and we'll send you a link to reset your password.
        </Text>
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
        ]}
        submitButtonText="Send Reset Link"
        isLoading={authError !== null}
        error={localError ?? authError ?? undefined}
        onSubmit={handleResetPassword}
        onSecondaryAction={() => router.push('/(auth)/login')}
        secondaryActionText="Back to Login"
      />
    </View>
  );
}
