import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';

import {
  usePreferences,
  LANGUAGE_OPTIONS,
  CURRENCY_OPTIONS,
  AppLanguage,
  AppCurrency,
} from '@/hooks/use-preferences';
import { Colors, Spacing } from '@/constants/theme';

export default function PreferencesScreen() {
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
    optionList: {
      borderRadius: 14,
      overflow: 'hidden',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.dark.backgroundSelected : Colors.light.backgroundSelected,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.three,
      paddingHorizontal: Spacing.three,
      backgroundColor: isDark ? Colors.dark.backgroundElement : Colors.light.backgroundElement,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? Colors.dark.backgroundSelected : Colors.light.backgroundSelected,
    },
    optionLast: { borderBottomWidth: 0 },
    optionSelected: {
      backgroundColor: 'rgba(0,122,255,0.07)',
    },
    flag: { fontSize: 22, marginRight: Spacing.two },
    optionText: {
      flex: 1,
      fontSize: 15,
      fontWeight: '500',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    optionTextSelected: { color: '#007AFF', fontWeight: '700' },
    check: { fontSize: 16, color: '#007AFF' },
    symbolBadge: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor: isDark ? Colors.dark.backgroundSelected : Colors.light.backgroundSelected,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.two,
    },
    symbolText: {
      fontSize: 14,
      fontWeight: '700',
      color: isDark ? Colors.dark.text : Colors.light.text,
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
          <Text style={styles.headerTitle}>Preferences</Text>
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
        <Text style={styles.headerTitle}>Preferences</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Language */}
        <Text style={styles.sectionLabel}>Language</Text>
        <View style={styles.optionList}>
          {LANGUAGE_OPTIONS.map((opt, idx) => {
            const selected = preferences.language === opt.value;
            const isLast = idx === LANGUAGE_OPTIONS.length - 1;
            return (
              <Pressable
                key={opt.value}
                style={[styles.option, selected && styles.optionSelected, isLast && styles.optionLast]}
                onPress={() => updatePreference('language', opt.value as AppLanguage)}
                android_ripple={{ color: 'rgba(0,122,255,0.1)' }}
              >
                <Text style={styles.flag}>{opt.flag}</Text>
                <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                  {opt.label}
                </Text>
                {selected && <Text style={styles.check}>✓</Text>}
              </Pressable>
            );
          })}
        </View>

        {/* Currency */}
        <Text style={styles.sectionLabel}>Currency</Text>
        <View style={styles.optionList}>
          {CURRENCY_OPTIONS.map((opt, idx) => {
            const selected = preferences.currency === opt.value;
            const isLast = idx === CURRENCY_OPTIONS.length - 1;
            return (
              <Pressable
                key={opt.value}
                style={[styles.option, selected && styles.optionSelected, isLast && styles.optionLast]}
                onPress={() => updatePreference('currency', opt.value as AppCurrency)}
                android_ripple={{ color: 'rgba(0,122,255,0.1)' }}
              >
                <View style={styles.symbolBadge}>
                  <Text style={styles.symbolText}>{opt.symbol}</Text>
                </View>
                <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                  {opt.label}
                  <Text style={{ fontSize: 13, fontWeight: '400', color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary }}>
                    {'  '}{opt.value}
                  </Text>
                </Text>
                {selected && <Text style={styles.check}>✓</Text>}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
