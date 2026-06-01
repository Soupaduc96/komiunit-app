import React, { useEffect } from 'react';
import { FlatList, StyleSheet, Text, View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';

import { Card } from '@/components/common/card';
import { EmptyState } from '@/components/common/empty-state';
import { Loading } from '@/components/common/loading';
import { ThemedText } from '@/components/themed-text';
import { useKomiVoix } from '@/hooks/use-komi-voix';
import { Formatting } from '@/utils/formatting';
import { Colors, Spacing } from '@/constants/theme';
import { CallLog } from '@/types/komi-voix';

const CALL_ICONS: Record<string, string> = {
  completed: '📞',
  missed: '❌',
  rejected: '🚫',
};

const CALL_COLORS: Record<string, string> = {
  completed: '#34C759',
  missed: '#FF3B30',
  rejected: '#FF9F0A',
};

export default function CallHistoryScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { callLogs, loading, error, getCallLogs } = useKomiVoix();

  useEffect(() => {
    getCallLogs();
  }, [getCallLogs]);

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return '—';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
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
    callCard: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.two,
      gap: Spacing.two,
    },
    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
    },
    callIcon: { fontSize: 20 },
    callInfo: { flex: 1 },
    callId: {
      fontSize: 15,
      fontWeight: '600',
      color: isDark ? Colors.dark.text : Colors.light.text,
      marginBottom: 2,
    },
    callDate: {
      fontSize: 12,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
    },
    callRight: { alignItems: 'flex-end' },
    callDuration: {
      fontSize: 14,
      fontWeight: '600',
    },
    callStatus: {
      fontSize: 11,
      fontWeight: '700',
      marginTop: 2,
    },
  });

  const renderCallLog = ({ item }: { item: CallLog }) => {
    const icon = CALL_ICONS[item.status] ?? '📞';
    const color = CALL_COLORS[item.status] ?? '#34C759';
    return (
      <Card style={styles.callCard}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
          <Text style={styles.callIcon}>{icon}</Text>
        </View>
        <View style={styles.callInfo}>
          <Text style={styles.callId}>Call #{item.id.substring(0, 8).toUpperCase()}</Text>
          <Text style={styles.callDate}>{Formatting.relative(item.startedAt)}</Text>
        </View>
        <View style={styles.callRight}>
          <Text style={[styles.callDuration, { color }]}>{formatDuration(item.duration)}</Text>
          <Text style={[styles.callStatus, { color }]}>{item.status.toUpperCase()}</Text>
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
        <Text style={styles.headerTitle}>Call History</Text>
      </View>

      <FlatList
        contentContainerStyle={styles.content}
        data={loading && callLogs.length === 0 ? [] : callLogs}
        keyExtractor={(item) => item.id}
        renderItem={renderCallLog}
        ListEmptyComponent={
          loading ? (
            <Loading visible={true} overlay={false} text="Loading call history..." />
          ) : (
            <EmptyState
              title="No Call History"
              description="Your calls will appear here"
              actionTitle="Add a Contact"
              onAction={() => router.push('/(tabs)/komi-voix/add-contact')}
            />
          )
        }
      />
    </View>
  );
}
