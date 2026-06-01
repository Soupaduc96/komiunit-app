import React, { useEffect } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';

import { Header } from '@/components/navigation/header';
import { Card } from '@/components/common/card';
import { Button } from '@/components/common/button';
import { Loading } from '@/components/common/loading';
import { EmptyState } from '@/components/common/empty-state';
import { SolutionCard } from '@/components/komi-sol/solution-card';
import { ThemedText } from '@/components/themed-text';
import { useKomiSol } from '@/hooks/use-komi-sol';
import { Colors, Spacing } from '@/constants/theme';
import { Solution } from '@/types/komi-sol';

export default function KomiSolScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { solutions, loading, error, getSolutions } = useKomiSol();

  useEffect(() => {
    getSolutions();
  }, [getSolutions]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
    },
    content: {
      paddingHorizontal: Spacing.three,
      paddingVertical: Spacing.two,
      paddingBottom: insets.bottom + Spacing.three,
    },
    section: {
      marginVertical: Spacing.three,
    },
    buttonContainer: {
      gap: Spacing.two,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: isDark ? Colors.dark.text : Colors.light.text,
      marginBottom: Spacing.two,
    },
    errorText: {
      color: '#FF3B30',
      fontSize: 14,
      padding: Spacing.two,
    },
  });

  const renderSolution = ({ item }: { item: Solution }) => (
    <SolutionCard
      key={item.id}
      solution={item}
      onPress={() => router.push({ pathname: '/(tabs)/komi-sol/[id]', params: { id: item.id } })}
    />
  );

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      ListHeaderComponent={
        <>
          <Header title="KomiSol" subtitle="Find solutions and get support" />

          <View style={styles.section}>
            <Card style={{ marginBottom: Spacing.two, padding: Spacing.three }}>
              <ThemedText type="subtitle" style={{ fontSize: 18, marginBottom: Spacing.one }}>
                Support Center
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Browse solutions or create a support ticket
              </ThemedText>
            </Card>

            <View style={styles.buttonContainer}>
              <Button
                title="Browse Solutions"
                onPress={() => getSolutions()}
                fullWidth
              />
              <Button
                title="Submit a Ticket"
                onPress={() => router.push('/(tabs)/komi-sol/create-ticket')}
                variant="secondary"
                fullWidth
              />
              <Button
                title="My Tickets"
                onPress={() => router.push('/(tabs)/komi-sol/tickets')}
                variant="secondary"
                fullWidth
              />
            </View>
          </View>

          <View style={[styles.section, { marginBottom: Spacing.two }]}>
            <ThemedText style={styles.sectionTitle}>Featured Solutions</ThemedText>
            {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}
          </View>
        </>
      }
      data={loading && solutions.length === 0 ? [] : solutions}
      keyExtractor={(item) => item.id}
      renderItem={renderSolution}
      ListEmptyComponent={
        loading ? (
          <Loading visible={true} overlay={false} text="Loading solutions..." />
        ) : (
          <EmptyState
            title="No Solutions Available"
            description="Check back later or create a support ticket"
            actionTitle="Submit a Ticket"
            onAction={() => router.push('/(tabs)/komi-sol/create-ticket')}
          />
        )
      }
    />
  );
}
