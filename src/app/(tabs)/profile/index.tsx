import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';

import { Avatar } from '@/components/profile/avatar';
import { Card } from '@/components/common/card';
import { useProfile } from '@/hooks/use-profile';
import { Formatting } from '@/utils/formatting';
import { Colors, Spacing } from '@/constants/theme';

interface MenuRowProps {
  icon: string;
  label: string;
  subtitle?: string;
  onPress: () => void;
  isDark: boolean;
  danger?: boolean;
}

function MenuRow({ icon, label, subtitle, onPress, isDark, danger }: MenuRowProps) {
  const styles = StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.three,
      paddingHorizontal: Spacing.three,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? Colors.dark.backgroundSelected : Colors.light.backgroundSelected,
    },
    iconBox: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: danger
        ? 'rgba(255,59,48,0.12)'
        : isDark ? Colors.dark.backgroundElement : Colors.light.backgroundElement,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.three,
    },
    iconText: { fontSize: 18 },
    textBlock: { flex: 1 },
    label: {
      fontSize: 15,
      fontWeight: '500',
      color: danger ? '#FF3B30' : isDark ? Colors.dark.text : Colors.light.text,
    },
    subtitle: {
      fontSize: 12,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
      marginTop: 2,
    },
    chevron: {
      fontSize: 16,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
    },
  });

  return (
    <Pressable
      style={styles.row}
      onPress={onPress}
      android_ripple={{ color: 'rgba(0,0,0,0.06)' }}
    >
      <View style={styles.iconBox}>
        <Text style={styles.iconText}>{icon}</Text>
      </View>
      <View style={styles.textBlock}>
        <Text style={styles.label}>{label}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {!danger && <Text style={styles.chevron}>›</Text>}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user, uploading, pickAndUploadAvatar } = useProfile();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
    },
    headerBar: {
      paddingTop: insets.top + Spacing.two,
      paddingBottom: Spacing.two,
      paddingHorizontal: Spacing.three,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? Colors.dark.backgroundElement : Colors.light.backgroundElement,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    content: {
      paddingBottom: insets.bottom + Spacing.three,
    },
    heroCard: {
      alignItems: 'center',
      paddingVertical: Spacing.five,
      marginHorizontal: Spacing.three,
      marginTop: Spacing.three,
      marginBottom: Spacing.two,
      borderRadius: 16,
    },
    name: {
      fontSize: 22,
      fontWeight: '700',
      color: isDark ? Colors.dark.text : Colors.light.text,
      marginTop: Spacing.two,
    },
    email: {
      fontSize: 14,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
      marginTop: Spacing.half,
    },
    memberSince: {
      fontSize: 12,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
      marginTop: Spacing.half,
    },
    sectionLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginTop: Spacing.three,
      marginBottom: Spacing.one,
      paddingHorizontal: Spacing.three,
    },
    menuCard: {
      marginHorizontal: Spacing.three,
      borderRadius: 14,
      overflow: 'hidden',
      padding: 0,
    },
    lastRow: { borderBottomWidth: 0 },
    version: {
      textAlign: 'center',
      fontSize: 12,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
      paddingVertical: Spacing.three,
    },
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Account</Text>
      </View>

      {/* Hero */}
      <Card style={styles.heroCard}>
        <Avatar
          uri={user?.avatarUrl}
          name={user?.fullName ?? user?.email}
          size={88}
          editable
          uploading={uploading}
          onPress={pickAndUploadAvatar}
          isDark={isDark}
        />
        <Text style={styles.name}>{user?.fullName ?? 'Your Name'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        {user?.createdAt && (
          <Text style={styles.memberSince}>
            Member since {Formatting.date(user.createdAt, 'MMMM yyyy')}
          </Text>
        )}
      </Card>

      {/* Account section */}
      <Text style={styles.sectionLabel}>Account</Text>
      <Card style={styles.menuCard} variant="outlined">
        <MenuRow
          icon="✏️"
          label="Edit Profile"
          subtitle="Name and phone number"
          onPress={() => router.push('/(tabs)/profile/edit-profile')}
          isDark={isDark}
        />
        <MenuRow
          icon="🔔"
          label="Notifications"
          subtitle="Push and email settings"
          onPress={() => router.push('/(tabs)/profile/notifications')}
          isDark={isDark}
        />
        <View style={styles.lastRow}>
          <MenuRow
            icon="🌐"
            label="Preferences"
            subtitle="Language and currency"
            onPress={() => router.push('/(tabs)/profile/preferences')}
            isDark={isDark}
          />
        </View>
      </Card>

      {/* Security section */}
      <Text style={styles.sectionLabel}>Security</Text>
      <Card style={styles.menuCard} variant="outlined">
        <View style={styles.lastRow}>
          <MenuRow
            icon="🔒"
            label="Security"
            subtitle="Password and sign out"
            onPress={() => router.push('/(tabs)/profile/security')}
            isDark={isDark}
          />
        </View>
      </Card>

      <Text style={styles.version}>KomiUnit v1.0.0</Text>
    </ScrollView>
  );
}
