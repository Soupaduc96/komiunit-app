import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/common/button';
import { AuthService } from '@/services/supabase/auth';
import { Colors, Spacing } from '@/constants/theme';

// Supabase rate-limits resend to once per 60 s
const RESEND_COOLDOWN_SECONDS = 60;

export default function VerifyEmailScreen() {
  const router = useRouter();
  // email may be passed as a param from signup
  const { email } = useLocalSearchParams<{ email?: string }>();
  const isDark = false;

  const [resendLoading, setResendLoading] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Count down the resend cooldown
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => {
      setCooldown((s) => {
        if (s <= 1) { clearInterval(id); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const handleResend = async () => {
    if (!email) {
      setResendError('Email address not available. Please go back and sign up again.');
      return;
    }
    if (cooldown > 0) return;

    setResendLoading(true);
    setResendError(null);
    setResendSuccess(false);
    try {
      await AuthService.resendConfirmation(email);
      setResendSuccess(true);
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to resend email';
      setResendError(message);
      // If Supabase returns a rate-limit error, start the cooldown so the
      // user knows they have to wait
      if (message.toLowerCase().includes('security purposes') ||
          message.toLowerCase().includes('rate limit')) {
        setCooldown(RESEND_COOLDOWN_SECONDS);
      }
    } finally {
      setResendLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
      justifyContent: 'center',
      paddingHorizontal: Spacing.three,
    },
    content: { alignItems: 'center' },
    icon: { fontSize: 64, marginBottom: Spacing.three },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDark ? Colors.dark.text : Colors.light.text,
      marginBottom: Spacing.one,
      textAlign: 'center',
    },
    description: {
      fontSize: 16,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
      textAlign: 'center',
      marginBottom: Spacing.two,
      lineHeight: 24,
    },
    emailHighlight: {
      fontWeight: '700',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    hint: {
      fontSize: 13,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
      textAlign: 'center',
      marginBottom: Spacing.four,
      lineHeight: 20,
    },
    successBanner: {
      backgroundColor: 'rgba(52, 199, 89, 0.1)',
      borderRadius: 8,
      padding: Spacing.two,
      marginBottom: Spacing.two,
    },
    successText: {
      color: '#34C759',
      fontSize: 14,
      textAlign: 'center',
    },
    errorBanner: {
      backgroundColor: 'rgba(255, 59, 48, 0.1)',
      borderRadius: 8,
      padding: Spacing.two,
      marginBottom: Spacing.two,
    },
    errorText: {
      color: '#FF3B30',
      fontSize: 14,
      textAlign: 'center',
    },
    cooldownText: {
      fontSize: 13,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
      textAlign: 'center',
      marginTop: Spacing.one,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>✉️</Text>
        <Text style={styles.title}>Check Your Email</Text>
        <Text style={styles.description}>
          We sent a confirmation link to{' '}
          {email ? <Text style={styles.emailHighlight}>{email}</Text> : 'your email address'}.
          {'\n'}Click the link to activate your account.
        </Text>
        <Text style={styles.hint}>
          The link expires in 24 hours. Check your spam folder if you don't see it.
        </Text>

        {resendSuccess && (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>✓ Confirmation email resent!</Text>
          </View>
        )}
        {resendError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{resendError}</Text>
          </View>
        )}

        <Button
          title="Back to Login"
          onPress={() => router.replace('/(auth)/login')}
          variant="primary"
          fullWidth
          style={{ marginBottom: Spacing.two }}
        />

        <Button
          title={
            resendLoading
              ? 'Sending…'
              : cooldown > 0
                ? `Resend available in ${cooldown}s`
                : 'Resend Confirmation Email'
          }
          onPress={handleResend}
          variant="secondary"
          fullWidth
          disabled={resendLoading || cooldown > 0}
          loading={resendLoading}
        />

        {cooldown > 0 && (
          <Text style={styles.cooldownText}>
            Supabase limits resend requests to once per {RESEND_COOLDOWN_SECONDS} seconds.
          </Text>
        )}
      </View>
    </View>
  );
}
