import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/common/card';
import { Formatting } from '@/utils/formatting';
import { Send } from '@/types/komi-send';
import { Colors, Spacing } from '@/constants/theme';

interface SendCardProps {
  send: Send;
  onPress?: () => void;
}

export const SendCard: React.FC<SendCardProps> = ({ send, onPress }) => {
  const isDark = false; // TODO: Get from theme context

  const styles = StyleSheet.create({
    card: {
      marginBottom: Spacing.two,
      cursor: 'pointer',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.one,
    },
    title: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? Colors.dark.text : Colors.light.text,
      flex: 1,
    },
    amount: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#34C759',
    },
    description: {
      fontSize: 12,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
      marginBottom: Spacing.one,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    date: {
      fontSize: 12,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
    },
    status: {
      fontSize: 12,
      fontWeight: '600',
      paddingHorizontal: Spacing.one,
      paddingVertical: Spacing.half,
      borderRadius: 4,
    },
    statusPending: {
      backgroundColor: 'rgba(255, 159, 64, 0.2)',
      color: '#FF9F40',
    },
    statusCompleted: {
      backgroundColor: 'rgba(52, 199, 89, 0.2)',
      color: '#34C759',
    },
    statusFailed: {
      backgroundColor: 'rgba(255, 59, 48, 0.2)',
      color: '#FF3B30',
    },
  });

  const statusColors: Record<string, any> = {
    pending: styles.statusPending,
    completed: styles.statusCompleted,
    failed: styles.statusFailed,
  };

  return (
    <Card style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {send.recipientName ? `To: ${send.recipientName}` : `ID: ${send.recipientId.substring(0, 8)}…`}
        </Text>
        <Text style={styles.amount}>{Formatting.currency(send.amount)}</Text>
      </View>

      {send.description && (
        <Text style={styles.description}>{send.description}</Text>
      )}

      <View style={styles.footer}>
        <Text style={styles.date}>{Formatting.relative(send.createdAt)}</Text>
        <Text style={[styles.status, statusColors[send.status]]}>
          {send.status.charAt(0).toUpperCase() + send.status.slice(1)}
        </Text>
      </View>
    </Card>
  );
};
