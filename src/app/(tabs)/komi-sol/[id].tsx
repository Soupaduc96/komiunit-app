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

export default function SolutionDetailScreen() {
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
    categoryBadge: {
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(0, 122, 255, 0.1)',
      paddingHorizontal: Spacing.two,
      paddingVertical: Spacing.half,
      borderRadius: 12,
      marginBottom: Spacing.two,
    },
    categoryText: { fontSize: 12, color: '#007AFF', fontWeight: '600' },
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      color: isDark ? Colors.dark.text : Colors.light.text,
      marginBottom: Spacing.two,
    },
    meta: {
      flexDirection: 'row',
      gap: Spacing.three,
      marginBottom: Spacing.three,
    },
    metaText: {
      fontSize: 13,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
    },
    bodyCard: { marginBottom: Spacing.three },
    body: {
      fontSize: 16,
      lineHeight: 26,
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    divider: {
      height: 1,
      backgroundColor: isDark ? Colors.dark.backgroundElement : Colors.light.backgroundElement,
      marginVertical: Spacing.three,
    },
    helpText: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? Colors.dark.text : Colors.light.text,
      marginBottom: Spacing.two,
      textAlign: 'center',
    },
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Solution</Text>
      </View>

      <View style={{ paddingTop: Spacing.three }}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>Technical Support</Text>
        </View>

        <Text style={styles.title}>How to resolve common connection issues</Text>

        <View style={styles.meta}>
          <Text style={styles.metaText}>👁️ 1,234 views</Text>
          <Text style={styles.metaText}>❤️ 89 likes</Text>
          <Text style={styles.metaText}>📅 {Formatting.date(new Date().toISOString())}</Text>
        </View>

        <Card style={styles.bodyCard}>
          <ThemedText type="subtitle" style={{ fontSize: 16, marginBottom: Spacing.two }}>
            Overview
          </ThemedText>
          <Text style={styles.body}>
            This solution covers common issues that users face when connecting to the KomiUnit
            platform. Follow the steps below to resolve your connection problems quickly and
            effectively.{'\n\n'}
            1. Check your internet connection{'\n'}
            2. Verify your credentials{'\n'}
            3. Clear the app cache{'\n'}
            4. Restart the application{'\n'}
            5. Contact support if issues persist
          </Text>
        </Card>

        <View style={styles.divider} />

        <Text style={styles.helpText}>Was this solution helpful?</Text>
        <View style={{ flexDirection: 'row', gap: Spacing.two, marginBottom: Spacing.three }}>
          <Button title="👍 Yes" onPress={() => {}} variant="secondary" fullWidth />
          <Button title="👎 No" onPress={() => {}} variant="secondary" fullWidth />
        </View>

        <Button
          title="Submit a Ticket"
          onPress={() => router.push('/(tabs)/komi-sol/create-ticket')}
          variant="secondary"
          fullWidth
        />
      </View>
    </ScrollView>
  );
}
