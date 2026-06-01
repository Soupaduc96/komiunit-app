import React from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';

import { Card } from '@/components/common/card';
import { Button } from '@/components/common/button';
import { ThemedText } from '@/components/themed-text';
import { Formatting } from '@/utils/formatting';
import { Colors, Spacing } from '@/constants/theme';

export default function ContactDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
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
    },
    content: {
      padding: Spacing.three,
      paddingBottom: insets.bottom + Spacing.three,
    },
    avatarCard: {
      alignItems: 'center',
      paddingVertical: Spacing.four,
      marginBottom: Spacing.three,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: '#007AFF',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: Spacing.two,
    },
    avatarText: { fontSize: 42, color: 'white', fontWeight: 'bold' },
    contactName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDark ? Colors.dark.text : Colors.light.text,
      marginBottom: Spacing.one,
    },
    contactPhone: {
      fontSize: 16,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
    },
    actionRow: {
      flexDirection: 'row',
      gap: Spacing.two,
      marginBottom: Spacing.three,
    },
    infoCard: { marginBottom: Spacing.three },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: Spacing.two,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? Colors.dark.backgroundSelected : Colors.light.backgroundSelected,
    },
    lastRow: { borderBottomWidth: 0 },
    infoLabel: {
      fontSize: 14,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
    },
    infoValue: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    historyCard: { marginBottom: Spacing.three },
    callItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.two,
      gap: Spacing.two,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? Colors.dark.backgroundSelected : Colors.light.backgroundSelected,
    },
    callIcon: { fontSize: 20 },
    callInfo: { flex: 1 },
    callType: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    callDate: {
      fontSize: 12,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
    },
    callDuration: {
      fontSize: 13,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
    },
  });

  const demoHistory = [
    { type: 'Outgoing', icon: '📞', date: '2 hours ago', duration: '5m 23s' },
    { type: 'Incoming', icon: '📲', date: 'Yesterday', duration: '12m 04s' },
    { type: 'Missed', icon: '❌', date: '2 days ago', duration: '—' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Contact</Text>
      </View>

      <Card style={styles.avatarCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>K</Text>
        </View>
        <Text style={styles.contactName}>Komi Contact</Text>
        <Text style={styles.contactPhone}>+1 (555) 000-0000</Text>
      </Card>

      <View style={styles.actionRow}>
        <Button title="📞 Call" onPress={() => {}} fullWidth />
        <Button title="💬 Message" onPress={() => {}} variant="secondary" fullWidth />
      </View>

      <Card style={styles.infoCard}>
        <ThemedText type="subtitle" style={{ fontSize: 16, marginBottom: Spacing.two }}>
          Contact Info
        </ThemedText>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Phone</Text>
          <Text style={styles.infoValue}>+1 (555) 000-0000</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Added</Text>
          <Text style={styles.infoValue}>{Formatting.date(new Date().toISOString())}</Text>
        </View>
        <View style={[styles.infoRow, styles.lastRow]}>
          <Text style={styles.infoLabel}>Contact ID</Text>
          <Text style={styles.infoValue}>#{id?.substring(0, 8)?.toUpperCase() ?? 'N/A'}</Text>
        </View>
      </Card>

      <Card style={styles.historyCard}>
        <ThemedText type="subtitle" style={{ fontSize: 16, marginBottom: Spacing.two }}>
          Recent Calls
        </ThemedText>
        {demoHistory.map((call, index) => (
          <View
            key={index}
            style={[styles.callItem, index === demoHistory.length - 1 && { borderBottomWidth: 0 }]}
          >
            <Text style={styles.callIcon}>{call.icon}</Text>
            <View style={styles.callInfo}>
              <Text style={styles.callType}>{call.type}</Text>
              <Text style={styles.callDate}>{call.date}</Text>
            </View>
            <Text style={styles.callDuration}>{call.duration}</Text>
          </View>
        ))}
      </Card>

      <Button
        title="Remove Contact"
        onPress={() => router.back()}
        variant="danger"
        fullWidth
      />
    </ScrollView>
  );
}
