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
import { ContactCard } from '@/components/komi-voix/contact-card';
import { ThemedText } from '@/components/themed-text';
import { useKomiVoix } from '@/hooks/use-komi-voix';
import { Colors, Spacing } from '@/constants/theme';
import { Contact } from '@/types/komi-voix';

export default function KomiVoixScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { contacts, loading, error, getContacts } = useKomiVoix();

  useEffect(() => {
    getContacts();
  }, [getContacts]);

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

  const renderContact = ({ item }: { item: Contact }) => (
    <ContactCard
      key={item.id}
      contact={item}
      onPress={() =>
        router.push({ pathname: '/(tabs)/komi-voix/[id]', params: { id: item.id } })
      }
    />
  );

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      ListHeaderComponent={
        <>
          <Header title="KomiVoix" subtitle="Connect with voice" />

          <View style={styles.section}>
            <Card style={{ marginBottom: Spacing.two, padding: Spacing.three }}>
              <ThemedText type="subtitle" style={{ fontSize: 18, marginBottom: Spacing.one }}>
                Voice & Calls
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Connect with your contacts via voice
              </ThemedText>
            </Card>

            <View style={styles.buttonContainer}>
              <Button
                title="Add Contact"
                onPress={() => router.push('/(tabs)/komi-voix/add-contact')}
                fullWidth
              />
              <Button
                title="Call History"
                onPress={() => router.push('/(tabs)/komi-voix/call-history')}
                variant="secondary"
                fullWidth
              />
            </View>
          </View>

          <View style={[styles.section, { marginBottom: Spacing.two }]}>
            <ThemedText style={styles.sectionTitle}>Contacts</ThemedText>
            {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}
          </View>
        </>
      }
      data={loading && contacts.length === 0 ? [] : contacts}
      keyExtractor={(item) => item.id}
      renderItem={renderContact}
      ListEmptyComponent={
        loading ? (
          <Loading visible={true} overlay={false} text="Loading contacts..." />
        ) : (
          <EmptyState
            title="No Contacts Yet"
            description="Add contacts to start calling"
            actionTitle="Add Contact"
            onAction={() => router.push('/(tabs)/komi-voix/add-contact')}
          />
        )
      }
    />
  );
}
