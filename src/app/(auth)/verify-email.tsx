import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/common/button';
import { Colors, Spacing } from '@/constants/theme';

export default function VerifyEmailScreen() {
  const router = useRouter();

  const isDark = false; // TODO: Get from theme context

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
      justifyContent: 'center',
      paddingHorizontal: Spacing.three,
    },
    content: {
      alignItems: 'center',
    },
    icon: {
      fontSize: 64,
      marginBottom: Spacing.three,
    },
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
      marginBottom: Spacing.four,
      lineHeight: 24,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>✉️</Text>
        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.description}>
          We've sent a verification email to your address. Please check your inbox and click the
          link to verify your account.
        </Text>

        <Button
          title="Back to Login"
          onPress={() => router.push('/(auth)/login')}
          variant="primary"
          fullWidth
        />

        <Button
          title="Didn't receive email? Resend"
          onPress={() => {
            // TODO: Implement resend email
          }}
          variant="secondary"
          fullWidth
          style={{ marginTop: Spacing.two }}
        />
      </View>
    </View>
  );
}
