import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '@/components/common/button';
import { Input } from '@/components/common/input';
import { Card } from '@/components/common/card';
import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';

interface SendMoneyFormProps {
  onSubmit: (recipientId: string, amount: number, description?: string) => Promise<void>;
  loading?: boolean;
  isDark?: boolean;
}

export const SendMoneyForm: React.FC<SendMoneyFormProps> = ({ onSubmit, loading = false, isDark = false }) => {
  const [recipientId, setRecipientId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const styles = StyleSheet.create({
    container: { gap: Spacing.two },
    fieldGroup: { gap: Spacing.one },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    error: { fontSize: 12, color: '#FF3B30', marginTop: Spacing.half },
    helperText: {
      fontSize: 12,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
      marginTop: Spacing.half,
    },
    buttonContainer: { gap: Spacing.one, marginTop: Spacing.two },
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!recipientId.trim()) newErrors.recipientId = 'Recipient is required';
    const parsed = parseFloat(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) newErrors.amount = 'Enter a valid amount';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      await onSubmit(recipientId, parseFloat(amount), description || undefined);
      setRecipientId('');
      setAmount('');
      setDescription('');
      setErrors({});
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to send money' });
    }
  };

  return (
    <Card style={styles.container}>
      <ThemedText type="subtitle">Send Money</ThemedText>

      <View style={styles.fieldGroup}>
        <ThemedText style={styles.label}>Recipient ID or Phone</ThemedText>
        <Input
          placeholder="Enter recipient phone or ID"
          value={recipientId}
          onChangeText={setRecipientId}
          editable={!loading}
          error={errors.recipientId}
        />
      </View>

      <View style={styles.fieldGroup}>
        <ThemedText style={styles.label}>Amount</ThemedText>
        <Input
          placeholder="0.00"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          editable={!loading}
          error={errors.amount}
        />
        <ThemedText style={styles.helperText}>Enter amount in your local currency</ThemedText>
      </View>

      <View style={styles.fieldGroup}>
        <ThemedText style={styles.label}>Description (Optional)</ThemedText>
        <Input
          placeholder="What is this payment for?"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          editable={!loading}
        />
      </View>

      {errors.submit && <ThemedText style={styles.error}>{errors.submit}</ThemedText>}

      <View style={styles.buttonContainer}>
        <Button
          title={loading ? 'Sending...' : 'Send Money'}
          onPress={handleSubmit}
          disabled={loading}
          fullWidth
        />
      </View>
    </Card>
  );
};
