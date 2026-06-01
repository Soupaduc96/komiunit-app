import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';

import { usePreferences } from '@/hooks/use-preferences';
import { Colors, Spacing } from '@/constants/theme';

interface ToggleRowProps {
  icon: string;
  label: string;
  subtitle: string;
  value: boolean;
  onToggle: (val: boolean) => void;
  isDark: boolean;
  isLast?: boolean;
}

function ToggleRow({ icon, label, subtitle, value, onToggle, isDark, isLast }: ToggleRowProps) {
  const styles = StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.three,
      paddingHorizontal: Spacing.three,
      backgroundColor: isDark ? Colors.dark.backgroundElement : Colors.light.backgroundElement,
      borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? Colors.dark.backgroundSelected : Colors.light.backgroundSelected,
    },
    iconBox: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: isDark ? Colors.dark.backgroundSelected : Colors.light.backgroundSelected,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.three,
    },
    iconText: { fontSize: 18 },
    textBlock: { flex: 1 },
    label: {
      fontSize: 15,
      fontWeight: '500',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    sub: {
      fontSize: 12,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
      marginTop: 2,
    },
  });

  return (
    <View style={styles.row}>
      <View style={styles.iconBox}>
        <Text style={styles.iconText}>{icon}</Text>
      </View>
      <View style={styles.textBlock}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.sub}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#ccc', true: '#007AFF' }}
        thumbColor="white"
      />
    </View>
  );
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { preferences, loading, updatePreference } = usePreferences();

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
    sectionLabel: {
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
      marginBottom: Spacing.two,
      marginTop: Spacing.three,
    },
    group: {
      borderRadius: 14,
      overflow: 'hidden',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.dark.backgroundSelected : Colors.light.backgroundSelected,
    },
    note: {
      fontSize: 12,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
      marginTop: Spacing.two,
      lineHeight: 18,
    },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: Spacing.five },
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>
        <View style={styles.center}><ActivityIndicator size="large" color="#007AFF" /></View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionLabel}>Push Notifications</Text>
        <View style={styles.group}>
          <ToggleRow
            icon="📱"
            label="Push Notifications"
            subtitle="Alerts on your device"
            value={preferences.pushNotifications}
            onToggle={(v) => updatePreference('pushNotifications', v)}
            isDark={isDark}
            isLast
          />
        </View>
        <Text style={styles.note}>
          Receive alerts for new transfers, order updates, ticket replies, and more.
        </Text>

        <Text style={styles.sectionLabel}>Email Notifications</Text>
        <View style={styles.group}>
          <ToggleRow
            icon="📧"
            label="Email Notifications"
            subtitle="Updates to your inbox"
            value={preferences.emailNotifications}
            onToggle={(v) => updatePreference('emailNotifications', v)}
            isDark={isDark}
            isLast
          />
        </View>
        <Text style={styles.note}>
          Receive email summaries and important account updates at {' '}
          <Text style={{ fontWeight: '600', color: isDark ? Colors.dark.text : Colors.light.text }}>
            your registered email
          </Text>.
        </Text>

        <Text style={[styles.sectionLabel, { marginTop: Spacing.four }]}>Notification Details</Text>
        <View style={styles.group}>
          <ToggleRow
            icon="📤"
            label="Transfer Alerts"
            subtitle="When you send or receive money"
            value={preferences.pushNotifications}
            onToggle={(v) => updatePreference('pushNotifications', v)}
            isDark={isDark}
          />
          <ToggleRow
            icon="📦"
            label="Order Updates"
            subtitle="Shipping and delivery status"
            value={preferences.pushNotifications}
            onToggle={(v) => updatePreference('pushNotifications', v)}
            isDark={isDark}
          />
          <ToggleRow
            icon="🎫"
            label="Support Replies"
            subtitle="Responses to your tickets"
            value={preferences.pushNotifications}
            onToggle={(v) => updatePreference('pushNotifications', v)}
            isDark={isDark}
          />
          <ToggleRow
            icon="📚"
            label="Learning Reminders"
            subtitle="Course progress and new content"
            value={preferences.pushNotifications}
            onToggle={(v) => updatePreference('pushNotifications', v)}
            isDark={isDark}
            isLast
          />
        </View>
      </ScrollView>
    </View>
  );
}
