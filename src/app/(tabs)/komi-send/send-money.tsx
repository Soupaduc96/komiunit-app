import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';

import { Card } from '@/components/common/card';
import { Button } from '@/components/common/button';
import { Input } from '@/components/common/input';
import { ThemedText } from '@/components/themed-text';
import { useKomiSend } from '@/hooks/use-komi-send';
import { Validation } from '@/utils/validation';
import { Formatting } from '@/utils/formatting';
import { Colors, Spacing } from '@/constants/theme';
import { Recipient } from '@/types/komi-send';

const QUICK_AMOUNTS = [10, 25, 50, 100, 250, 500];

export default function SendMoneyScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { createSend, findUserByEmail, loading, error } = useKomiSend();

  const [recipientEmail, setRecipientEmail] = useState('');
  const [resolvedRecipient, setResolvedRecipient] = useState<Recipient | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const handleEmailBlur = async () => {
    if (!recipientEmail.trim() || !Validation.isValidEmail(recipientEmail)) return;
    setLookupLoading(true);
    setLookupError(null);
    setResolvedRecipient(null);
    try {
      const user = await findUserByEmail(recipientEmail.trim().toLowerCase());
      if (user) {
        setResolvedRecipient(user);
      } else {
        setLookupError('No KomiUnit account found for this email');
      }
    } catch {
      setLookupError('Could not look up user');
    } finally {
      setLookupLoading(false);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!recipientEmail.trim()) newErrors.email = 'Recipient email is required';
    else if (!Validation.isValidEmail(recipientEmail)) newErrors.email = 'Enter a valid email';
    else if (!resolvedRecipient) newErrors.email = 'Please look up a valid KomiUnit user';
    if (!amount) newErrors.amount = 'Amount is required';
    else if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0)
      newErrors.amount = 'Enter a valid amount greater than 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSend = async () => {
    if (!validate()) return;
    try {
      await createSend(
        resolvedRecipient!.id,
        parseFloat(amount),
        description.trim() || undefined
      );
      setSuccess(true);
    } catch {
      // error handled by hook
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: insets.top + Spacing.two,
      paddingBottom: Spacing.two,
      paddingHorizontal: Spacing.three,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? Colors.dark.backgroundElement : Colors.light.backgroundElement,
    },
    backButton: { marginRight: Spacing.two, padding: Spacing.one },
    backText: { fontSize: 16, color: '#007AFF' },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    content: {
      padding: Spacing.three,
      paddingBottom: insets.bottom + Spacing.three,
    },
    section: { marginBottom: Spacing.three },
    sectionLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: Spacing.one,
    },
    resolvedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.one,
      marginTop: Spacing.one,
      padding: Spacing.two,
      borderRadius: 8,
      backgroundColor: 'rgba(52, 199, 89, 0.1)',
    },
    resolvedText: { fontSize: 14, fontWeight: '600', color: '#34C759' },
    lookupErrorText: { fontSize: 12, color: '#FF3B30', marginTop: Spacing.half },
    quickAmounts: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.one, marginTop: Spacing.one },
    quickAmount: {
      paddingHorizontal: Spacing.two,
      paddingVertical: Spacing.one,
      borderRadius: 8,
      borderWidth: 1.5,
      borderColor: isDark ? Colors.dark.backgroundSelected : Colors.light.backgroundSelected,
    },
    quickAmountActive: { borderColor: '#007AFF', backgroundColor: 'rgba(0,122,255,0.08)' },
    quickAmountText: { fontSize: 13, fontWeight: '600', color: isDark ? Colors.dark.text : Colors.light.text },
    quickAmountTextActive: { color: '#007AFF' },
    errorBanner: {
      marginBottom: Spacing.three,
      padding: Spacing.two,
      borderRadius: 8,
      backgroundColor: 'rgba(255,59,48,0.08)',
    },
    successCard: { alignItems: 'center', paddingVertical: Spacing.five },
    successIcon: { fontSize: 56, marginBottom: Spacing.two },
    successTitle: { fontSize: 22, fontWeight: 'bold', color: '#34C759', marginBottom: Spacing.one },
    successSub: {
      fontSize: 15,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
  });

  if (success) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { flex: 1, textAlign: 'center' }]}>Sent!</Text>
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <Card style={styles.successCard}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={styles.successTitle}>Money Sent!</Text>
            <Text style={styles.successSub}>
              {Formatting.currency(parseFloat(amount))} sent to{' '}
              {resolvedRecipient?.name ?? recipientEmail}.
            </Text>
          </Card>
          <Button
            title="Send More"
            onPress={() => {
              setSuccess(false);
              setRecipientEmail('');
              setResolvedRecipient(null);
              setAmount('');
              setDescription('');
            }}
            fullWidth
            style={{ marginBottom: Spacing.two }}
          />
          <Button title="Back to KomiSend" onPress={() => router.back()} variant="secondary" fullWidth />
        </ScrollView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Send Money</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {error && (
          <View style={styles.errorBanner}>
            <ThemedText style={{ color: '#FF3B30', fontSize: 14 }}>{error}</ThemedText>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Recipient</Text>
          <Input
            placeholder="recipient@email.com"
            value={recipientEmail}
            onChangeText={(v) => {
              setRecipientEmail(v);
              setResolvedRecipient(null);
              setLookupError(null);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            label="Email Address"
            error={errors.email}
          />
          {lookupLoading && (
            <ThemedText style={{ fontSize: 12, color: '#007AFF', marginTop: Spacing.half }}>
              Looking up user…
            </ThemedText>
          )}
          {resolvedRecipient && (
            <View style={styles.resolvedBadge}>
              <Text style={styles.resolvedText}>✓ {resolvedRecipient.name}</Text>
            </View>
          )}
          {lookupError && !resolvedRecipient && (
            <Text style={styles.lookupErrorText}>{lookupError}</Text>
          )}
          {!resolvedRecipient && Validation.isValidEmail(recipientEmail) && !lookupLoading && (
            <Button
              title="Look Up User"
              onPress={handleEmailBlur}
              variant="secondary"
              size="small"
              style={{ marginTop: Spacing.one }}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Amount (USD)</Text>
          <Input
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            label="Amount"
            error={errors.amount}
          />
          <View style={styles.quickAmounts}>
            {QUICK_AMOUNTS.map((qa) => (
              <Pressable
                key={qa}
                style={[styles.quickAmount, amount === String(qa) && styles.quickAmountActive]}
                onPress={() => setAmount(String(qa))}
              >
                <Text
                  style={[
                    styles.quickAmountText,
                    amount === String(qa) && styles.quickAmountTextActive,
                  ]}
                >
                  ${qa}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Note (Optional)</Text>
          <Input
            placeholder="What's this for?"
            value={description}
            onChangeText={setDescription}
            label="Description"
            multiline
          />
        </View>

        <Button
          title={loading ? 'Sending…' : 'Send Money'}
          onPress={handleSend}
          loading={loading}
          fullWidth
          size="large"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
