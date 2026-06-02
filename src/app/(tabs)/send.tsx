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
import { useSend } from '@/hooks/use-send';
import { useWallet } from '@/hooks/use-wallet';
import { useAuth } from '@/hooks/use-auth';
import { Validation } from '@/utils/validation';
import { Formatting } from '@/utils/formatting';
import { Colors, Spacing } from '@/constants/theme';
import { Recipient } from '@/types/komi-send';

const QUICK_AMOUNTS = [10, 25, 50, 100, 250, 500];

export default function SendScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { user } = useAuth();
  const { wallet, refresh: refreshWallet } = useWallet();
  const { loading, error, findRecipient, sendMoney, clearError } = useSend();

  const [recipientEmail, setRecipientEmail] = useState('');
  const [resolvedRecipient, setResolvedRecipient] = useState<Recipient | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successAmount, setSuccessAmount] = useState<number | null>(null);
  const [newBalance, setNewBalance] = useState<number | null>(null);

  const handleLookup = async () => {
    if (!Validation.isValidEmail(recipientEmail.trim())) return;
    setLookupLoading(true);
    setLookupError(null);
    setResolvedRecipient(null);
    try {
      const found = await findRecipient(recipientEmail.trim());
      if (!found) {
        setLookupError('No KomiUnit account found for this email');
      } else if (found.id === user?.id) {
        setLookupError('You cannot send money to yourself');
      } else {
        setResolvedRecipient(found);
      }
    } catch {
      setLookupError('Could not look up user');
    } finally {
      setLookupLoading(false);
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!recipientEmail.trim()) {
      errs.email = 'Recipient email is required';
    } else if (!Validation.isValidEmail(recipientEmail)) {
      errs.email = 'Enter a valid email address';
    } else if (!resolvedRecipient) {
      errs.email = 'Look up a valid KomiUnit user first';
    }

    const parsed = parseFloat(amount);
    if (!amount.trim()) {
      errs.amount = 'Amount is required';
    } else if (!Number.isFinite(parsed) || parsed <= 0) {
      errs.amount = 'Enter a valid amount greater than $0';
    } else if (wallet && parsed > wallet.balance) {
      errs.amount = `Insufficient balance (${Formatting.currency(wallet.balance)})`;
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSend = async () => {
    clearError();
    if (!validate() || !resolvedRecipient) return;
    const parsed = parseFloat(amount);
    try {
      const result = await sendMoney(
        resolvedRecipient.id,
        parsed,
        description.trim() || undefined,
      );
      setSuccessAmount(parsed);
      setNewBalance(result.senderBalance);
      await refreshWallet();
    } catch {
      // error set by hook
    }
  };

  const handleSendMore = () => {
    setSuccessAmount(null);
    setNewBalance(null);
    setRecipientEmail('');
    setResolvedRecipient(null);
    setLookupError(null);
    setAmount('');
    setDescription('');
    setFieldErrors({});
    clearError();
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
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? Colors.dark.backgroundElement : Colors.light.backgroundElement,
    },
    backBtn: { marginRight: Spacing.two, padding: Spacing.one },
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
    balanceCard: {
      padding: Spacing.three,
      borderRadius: 14,
      marginBottom: Spacing.three,
      alignItems: 'center',
    },
    balanceLabel: {
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
      marginBottom: Spacing.one,
    },
    balanceAmount: {
      fontSize: 28,
      fontWeight: '800',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    section: { marginBottom: Spacing.three },
    sectionLabel: {
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
      marginBottom: Spacing.one,
    },
    resolvedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: Spacing.one,
      padding: Spacing.two,
      borderRadius: 8,
      backgroundColor: 'rgba(52, 199, 89, 0.1)',
    },
    resolvedText: { fontSize: 14, fontWeight: '600', color: '#34C759' },
    lookupErrorText: { fontSize: 12, color: '#FF3B30', marginTop: Spacing.half },
    lookupHintText: { fontSize: 12, color: '#007AFF', marginTop: Spacing.half },
    quickAmounts: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.one,
      marginTop: Spacing.one,
    },
    quickChip: {
      paddingHorizontal: Spacing.two,
      paddingVertical: Spacing.one,
      borderRadius: 8,
      borderWidth: 1.5,
      borderColor: isDark ? Colors.dark.backgroundSelected : Colors.light.backgroundSelected,
    },
    quickChipActive: { borderColor: '#007AFF', backgroundColor: 'rgba(0,122,255,0.08)' },
    quickChipText: {
      fontSize: 13,
      fontWeight: '600',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    quickChipTextActive: { color: '#007AFF' },
    errorBanner: {
      marginBottom: Spacing.three,
      padding: Spacing.two,
      borderRadius: 10,
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
    newBalance: {
      marginTop: Spacing.two,
      fontSize: 13,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
    },
  });

  if (successAmount !== null) {
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
              {Formatting.currency(successAmount)} sent to{'\n'}
              {resolvedRecipient?.name ?? recipientEmail}.
            </Text>
            {newBalance !== null && (
              <Text style={styles.newBalance}>
                New balance: {Formatting.currency(newBalance)}
              </Text>
            )}
          </Card>
          <Button
            title="Send More"
            onPress={handleSendMore}
            fullWidth
            style={{ marginBottom: Spacing.two }}
          />
          <Button
            title="Done"
            onPress={() => router.back()}
            variant="secondary"
            fullWidth
          />
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
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Send Money</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <Card style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>
            {wallet ? Formatting.currency(wallet.balance, wallet.currency) : '—'}
          </Text>
        </Card>

        {error && (
          <View style={styles.errorBanner}>
            <ThemedText style={{ color: '#FF3B30', fontSize: 14 }}>{error}</ThemedText>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Recipient</Text>
          <Input
            label="Email Address"
            placeholder="recipient@email.com"
            value={recipientEmail}
            onChangeText={(v) => {
              setRecipientEmail(v);
              setResolvedRecipient(null);
              setLookupError(null);
              setFieldErrors((prev) => ({ ...prev, email: '' }));
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={fieldErrors.email}
          />
          {lookupLoading && (
            <Text style={styles.lookupHintText}>Looking up user…</Text>
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
              onPress={handleLookup}
              variant="secondary"
              size="small"
              style={{ marginTop: Spacing.one }}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Amount (USD)</Text>
          <Input
            label="Amount"
            placeholder="0.00"
            value={amount}
            onChangeText={(v) => {
              setAmount(v);
              setFieldErrors((prev) => ({ ...prev, amount: '' }));
            }}
            keyboardType="decimal-pad"
            error={fieldErrors.amount}
          />
          <View style={styles.quickAmounts}>
            {QUICK_AMOUNTS.map((qa) => (
              <Pressable
                key={qa}
                style={[styles.quickChip, amount === String(qa) && styles.quickChipActive]}
                onPress={() => {
                  setAmount(String(qa));
                  setFieldErrors((prev) => ({ ...prev, amount: '' }));
                }}
              >
                <Text
                  style={[
                    styles.quickChipText,
                    amount === String(qa) && styles.quickChipTextActive,
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
            label="Description"
            placeholder="What's this for?"
            value={description}
            onChangeText={setDescription}
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
