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
import { Colors, Spacing } from '@/constants/theme';

interface DemoRecipient {
  id: string;
  name: string;
  email: string;
  initials: string;
  lastSent: string;
  amount: number;
}

const demoRecipients: DemoRecipient[] = [
  { id: '1', name: 'Alice Martin', email: 'alice@example.com', initials: 'AM', lastSent: '2 days ago', amount: 150 },
  { id: '2', name: 'Bob Johnson', email: 'bob@example.com', initials: 'BJ', lastSent: '1 week ago', amount: 75 },
  { id: '3', name: 'Carol Williams', email: 'carol@example.com', initials: 'CW', lastSent: '2 weeks ago', amount: 500 },
];

export default function RecipientsScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

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
    recipientCard: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.two,
      gap: Spacing.two,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: '#007AFF',
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    info: { flex: 1 },
    name: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    email: {
      fontSize: 13,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
    },
    meta: {
      alignItems: 'flex-end',
    },
    lastSent: {
      fontSize: 12,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
    },
    amount: {
      fontSize: 14,
      fontWeight: '600',
      color: '#34C759',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Recent Recipients</Text>
        <Button title="+ New" onPress={() => router.push('/(tabs)/komi-send/send-money')} size="small" />
      </View>

      <FlatList
        contentContainerStyle={styles.content}
        data={demoRecipients}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.recipientCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.initials}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.email}>{item.email}</Text>
            </View>
            <View style={styles.meta}>
              <Text style={styles.lastSent}>{item.lastSent}</Text>
              <Text style={styles.amount}>${item.amount}</Text>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <EmptyState
            title="No Recipients Yet"
            description="People you've sent money to will appear here"
            actionTitle="Send Money"
            onAction={() => router.push('/(tabs)/komi-send/send-money')}
          />
        }
      />
    </View>
  );
}
