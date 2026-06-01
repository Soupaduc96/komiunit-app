import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';

import { Card } from '@/components/common/card';
import { Button } from '@/components/common/button';
import { Input } from '@/components/common/input';
import { ThemedText } from '@/components/themed-text';
import { useKomiMarche } from '@/hooks/use-komi-marche';
import { Formatting } from '@/utils/formatting';
import { Colors, Spacing } from '@/constants/theme';

export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { cart, createOrder, loading, error } = useKomiMarche();

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!address.trim()) newErrors.address = 'Address is required';
    if (!city.trim()) newErrors.city = 'City is required';
    if (!zip.trim()) newErrors.zip = 'ZIP code is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOrder = async () => {
    if (!validate()) return;
    try {
      await createOrder(`${address}, ${city} ${zip}`);
      setSuccess(true);
    } catch {
      // handled by hook
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
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
      marginBottom: Spacing.one,
      textTransform: 'uppercase',
    },
    row: { flexDirection: 'row', gap: Spacing.two },
    successCard: {
      alignItems: 'center',
      paddingVertical: Spacing.five,
    },
    successIcon: { fontSize: 60, marginBottom: Spacing.two },
    successTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#34C759',
      marginBottom: Spacing.one,
    },
    successSubtitle: {
      fontSize: 16,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
      textAlign: 'center',
    },
    orderSummary: {
      marginBottom: Spacing.three,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: Spacing.one,
    },
    summaryLabel: {
      fontSize: 15,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
    },
    summaryValue: {
      fontSize: 15,
      fontWeight: '600',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: Spacing.two,
      marginTop: Spacing.one,
      borderTopWidth: 1,
      borderTopColor: isDark ? Colors.dark.backgroundSelected : Colors.light.backgroundSelected,
    },
    totalLabel: {
      fontSize: 17,
      fontWeight: 'bold',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    totalValue: {
      fontSize: 17,
      fontWeight: 'bold',
      color: '#34C759',
    },
  });

  if (success) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { flex: 1, textAlign: 'center' }]}>Order Placed!</Text>
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <Card style={styles.successCard}>
            <Text style={styles.successIcon}>📦</Text>
            <Text style={styles.successTitle}>Order Confirmed!</Text>
            <Text style={styles.successSubtitle}>
              Your order is being processed. You will receive an update soon.
            </Text>
          </Card>
          <Button
            title="View My Orders"
            onPress={() => router.push('/(tabs)/komi-marche/orders')}
            fullWidth
            style={{ marginBottom: Spacing.two }}
          />
          <Button
            title="Continue Shopping"
            onPress={() => router.replace('/(tabs)/komi-marche')}
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
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Checkout</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {error && (
          <Card style={{ marginBottom: Spacing.three, backgroundColor: 'rgba(255,59,48,0.1)' }}>
            <ThemedText style={{ color: '#FF3B30' }}>{error}</ThemedText>
          </Card>
        )}

        <Card style={styles.orderSummary}>
          <ThemedText type="subtitle" style={{ fontSize: 16, marginBottom: Spacing.two }}>
            Order Summary
          </ThemedText>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Items ({cart?.items?.length ?? 0})</Text>
            <Text style={styles.summaryValue}>{Formatting.currency(cart?.totalAmount ?? 0)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={styles.summaryValue}>Free</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{Formatting.currency(cart?.totalAmount ?? 0)}</Text>
          </View>
        </Card>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Shipping Address</Text>
          <Input
            placeholder="Street address"
            value={address}
            onChangeText={setAddress}
            label="Address"
            error={errors.address}
          />
        </View>

        <View style={styles.row}>
          <View style={{ flex: 2 }}>
            <Input
              placeholder="City"
              value={city}
              onChangeText={setCity}
              label="City"
              error={errors.city}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Input
              placeholder="ZIP"
              value={zip}
              onChangeText={setZip}
              label="ZIP Code"
              keyboardType="numeric"
              error={errors.zip}
            />
          </View>
        </View>

        <Button
          title={loading ? 'Placing Order...' : `Place Order — ${Formatting.currency(cart?.totalAmount ?? 0)}`}
          onPress={handleOrder}
          loading={loading}
          fullWidth
          size="large"
          style={{ marginTop: Spacing.two }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
