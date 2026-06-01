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
import { SendCard } from '@/components/komi-send/send-card';
import { ThemedText } from '@/components/themed-text';
import { useKomiSend } from '@/hooks/use-komi-send';
import { Colors, Spacing } from '@/constants/theme';
import { Send } from '@/types/komi-send';

export default function KomiSendScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { sends, loading, error, getSends } = useKomiSend();

  useEffect(() => {
    getSends();
  }, [getSends]);

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

  const renderSend = ({ item }: { item: Send }) => (
    <SendCard
      key={item.id}
      send={item}
      onPress={() => router.push({ pathname: '/(tabs)/komi-send/[id]', params: { id: item.id } })}
    />
  );

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      ListHeaderComponent={
        <>
          <Header title="KomiSend" subtitle="Send money to anyone instantly" />

          <View style={styles.section}>
            <Card style={{ marginBottom: Spacing.two, padding: Spacing.three }}>
              <ThemedText type="subtitle" style={{ fontSize: 18, marginBottom: Spacing.one }}>
                Quick Actions
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Transfer money instantly to anyone
              </ThemedText>
            </Card>

            <View style={styles.buttonContainer}>
              <Button
                title="Send Money"
                onPress={() => router.push('/(tabs)/komi-send/send-money')}
                fullWidth
              />
              <Button
                title="Manage Recipients"
                onPress={() => router.push('/(tabs)/komi-send/recipients')}
                variant="secondary"
                fullWidth
              />
            </View>
          </View>

          <View style={[styles.section, { marginBottom: Spacing.two }]}>
            <ThemedText style={styles.sectionTitle}>Transfer History</ThemedText>
            {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}
          </View>
        </>
      }
      data={loading && sends.length === 0 ? [] : sends}
      keyExtractor={(item) => item.id}
      renderItem={renderSend}
      ListEmptyComponent={
        loading ? (
          <Loading visible={true} overlay={false} text="Loading transfers..." />
        ) : (
          <EmptyState
            title="No Transfers Yet"
            description="Send money to get started with KomiSend"
            actionTitle="Send Money"
            onAction={() => router.push('/(tabs)/komi-send/send-money')}
          />
        )
      }
    />
  );
}
