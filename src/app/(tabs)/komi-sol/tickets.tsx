import React, { useEffect } from 'react';
import { FlatList, StyleSheet, Text, View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';

import { Card } from '@/components/common/card';
import { Button } from '@/components/common/button';
import { EmptyState } from '@/components/common/empty-state';
import { Loading } from '@/components/common/loading';
import { ThemedText } from '@/components/themed-text';
import { useKomiSol } from '@/hooks/use-komi-sol';
import { Formatting } from '@/utils/formatting';
import { Colors, Spacing } from '@/constants/theme';
import { UserTicket } from '@/types/komi-sol';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  open: { bg: 'rgba(0, 122, 255, 0.1)', text: '#007AFF' },
  'in-progress': { bg: 'rgba(255, 159, 10, 0.1)', text: '#FF9F0A' },
  resolved: { bg: 'rgba(52, 199, 89, 0.1)', text: '#34C759' },
  closed: { bg: 'rgba(142, 142, 147, 0.1)', text: '#8E8E93' },
};

const PRIORITY_COLORS: Record<string, string> = {
  low: '#34C759',
  medium: '#FF9F0A',
  high: '#FF3B30',
};

export default function TicketsScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { tickets, loading, error, getUserTickets } = useKomiSol();

  useEffect(() => {
    getUserTickets();
  }, [getUserTickets]);

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
      flex: 1,
    },
    content: {
      padding: Spacing.three,
      paddingBottom: insets.bottom + Spacing.three,
    },
    ticketCard: { marginBottom: Spacing.two },
    ticketHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: Spacing.one,
    },
    ticketTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? Colors.dark.text : Colors.light.text,
      flex: 1,
      marginRight: Spacing.two,
    },
    statusBadge: {
      paddingHorizontal: Spacing.two,
      paddingVertical: 2,
      borderRadius: 10,
    },
    statusText: { fontSize: 11, fontWeight: '700' },
    ticketDesc: {
      fontSize: 13,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
      marginBottom: Spacing.two,
      lineHeight: 18,
    },
    ticketFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    ticketDate: {
      fontSize: 12,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
    },
    priorityDot: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.half,
    },
    dot: { width: 8, height: 8, borderRadius: 4 },
    priorityText: {
      fontSize: 12,
      fontWeight: '600',
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
    },
  });

  const renderTicket = ({ item }: { item: UserTicket }) => {
    const statusColor = STATUS_COLORS[item.status] ?? STATUS_COLORS.open;
    return (
      <Card style={styles.ticketCard}>
        <View style={styles.ticketHeader}>
          <Text style={styles.ticketTitle}>{item.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
            <Text style={[styles.statusText, { color: statusColor.text }]}>
              {item.status.replace('-', ' ').toUpperCase()}
            </Text>
          </View>
        </View>
        <Text style={styles.ticketDesc} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.ticketFooter}>
          <Text style={styles.ticketDate}>{Formatting.relative(item.createdAt)}</Text>
          <View style={styles.priorityDot}>
            <View style={[styles.dot, { backgroundColor: PRIORITY_COLORS[item.priority] }]} />
            <Text style={styles.priorityText}>{item.priority.toUpperCase()}</Text>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>My Tickets</Text>
        <Button
          title="New"
          onPress={() => router.push('/(tabs)/komi-sol/create-ticket')}
          size="small"
        />
      </View>

      <FlatList
        contentContainerStyle={styles.content}
        data={loading && tickets.length === 0 ? [] : tickets}
        keyExtractor={(item) => item.id}
        renderItem={renderTicket}
        ListEmptyComponent={
          loading ? (
            <Loading visible={true} overlay={false} text="Loading tickets..." />
          ) : (
            <EmptyState
              title="No Tickets Yet"
              description="Create a support ticket when you need help"
              actionTitle="Create Ticket"
              onAction={() => router.push('/(tabs)/komi-sol/create-ticket')}
            />
          )
        }
      />
    </View>
  );
}
