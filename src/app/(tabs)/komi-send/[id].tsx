import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';

import { Card } from '@/components/common/card';
import { Button } from '@/components/common/button';
import { EmptyState } from '@/components/common/empty-state';
import { ThemedText } from '@/components/themed-text';
import { Formatting } from '@/utils/formatting';
import { KomiSendService } from '@/services/komi-send/send-service';
import { Colors, Spacing } from '@/constants/theme';
import { Send } from '@/types/komi-send';

const STATUS_CONFIG = {
  pending:   { bg: 'rgba(255,159,10,0.15)',  text: '#FF9F0A',  label: 'Pending' },
  completed: { bg: 'rgba(52,199,89,0.15)',   text: '#34C759',  label: 'Completed' },
  failed:    { bg: 'rgba(255,59,48,0.15)',    text: '#FF3B30',  label: 'Failed' },
} as const;

export default function SendDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [send, setSend] = useState<Send | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    KomiSendService.getSendById(id)
      .then((data) => setSend(data ?? null))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: isDark ? Colors.dark.background : Colors.light.background },
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
    headerTitle: { fontSize: 18, fontWeight: '700', color: isDark ? Colors.dark.text : Colors.light.text },
    content: { padding: Spacing.three, paddingBottom: insets.bottom + Spacing.three },
    amountCard: { alignItems: 'center', paddingVertical: Spacing.five, marginBottom: Spacing.three },
    amountLabel: { fontSize: 13, color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary, marginBottom: Spacing.one },
    amount: { fontSize: 48, fontWeight: 'bold', color: '#34C759', marginBottom: Spacing.two },
    statusBadge: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.one, borderRadius: 20 },
    detailCard: { marginBottom: Spacing.three },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: Spacing.two,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? Colors.dark.backgroundSelected : Colors.light.backgroundSelected,
    },
    lastRow: { borderBottomWidth: 0 },
    detailLabel: { fontSize: 14, color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary },
    detailValue: { fontSize: 14, fontWeight: '600', color: isDark ? Colors.dark.text : Colors.light.text, maxWidth: '60%', textAlign: 'right' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  });

  const headerRow = (
    <View style={styles.header}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>
      <Text style={styles.headerTitle}>Transfer Details</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        {headerRow}
        <View style={styles.center}><ActivityIndicator size="large" color="#007AFF" /></View>
      </View>
    );
  }

  if (error || !send) {
    return (
      <View style={styles.container}>
        {headerRow}
        <EmptyState
          title="Transfer Not Found"
          description={error ?? 'This transfer could not be loaded'}
          actionTitle="Go Back"
          onAction={() => router.back()}
        />
      </View>
    );
  }

  const statusCfg = STATUS_CONFIG[send.status] ?? STATUS_CONFIG.pending;

  return (
    <View style={styles.container}>
      {headerRow}
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.amountCard}>
          <Text style={styles.amountLabel}>Amount Sent</Text>
          <Text style={styles.amount}>{Formatting.currency(send.amount)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
            <Text style={{ color: statusCfg.text, fontWeight: '700', fontSize: 13 }}>
              {statusCfg.label}
            </Text>
          </View>
        </Card>

        <Card style={styles.detailCard}>
          <ThemedText type="subtitle" style={{ fontSize: 16, marginBottom: Spacing.two }}>
            Transaction Details
          </ThemedText>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Transaction ID</Text>
            <Text style={styles.detailValue}>#{send.id.substring(0, 8).toUpperCase()}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Recipient</Text>
            <Text style={styles.detailValue}>{send.recipientName ?? send.recipientId.substring(0, 12) + '…'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{Formatting.dateTime(send.createdAt)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Fee</Text>
            <Text style={styles.detailValue}>{Formatting.currency(0)}</Text>
          </View>
          <View style={[styles.detailRow, styles.lastRow]}>
            <Text style={styles.detailLabel}>Description</Text>
            <Text style={styles.detailValue}>{send.description ?? '—'}</Text>
          </View>
        </Card>

        <Button title="Send Again" onPress={() => router.push('/(tabs)/komi-send/send-money')} fullWidth />
      </ScrollView>
    </View>
  );
}
