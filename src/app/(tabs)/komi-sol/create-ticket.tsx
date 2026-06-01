import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';

import { Card } from '@/components/common/card';
import { Button } from '@/components/common/button';
import { Input } from '@/components/common/input';
import { ThemedText } from '@/components/themed-text';
import { useKomiSol } from '@/hooks/use-komi-sol';
import { Colors, Spacing } from '@/constants/theme';

type Priority = 'low' | 'medium' | 'high';

export default function CreateTicketScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { createTicket, loading, error } = useKomiSol();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const priorities: { value: Priority; label: string; color: string }[] = [
    { value: 'low', label: 'Low', color: '#34C759' },
    { value: 'medium', label: 'Medium', color: '#FF9F0A' },
    { value: 'high', label: 'High', color: '#FF3B30' },
  ];

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    else if (title.length < 5) newErrors.title = 'Title must be at least 5 characters';
    if (!description.trim()) newErrors.description = 'Description is required';
    else if (description.length < 20)
      newErrors.description = 'Please provide more detail (at least 20 characters)';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      await createTicket(title.trim(), description.trim(), priority);
      setSuccess(true);
    } catch {
      // handled by hook
    }
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
    section: { marginBottom: Spacing.three },
    sectionLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
      marginBottom: Spacing.one,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    priorityRow: { flexDirection: 'row', gap: Spacing.two },
    priorityButton: {
      flex: 1,
      paddingVertical: Spacing.two,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: isDark ? Colors.dark.backgroundSelected : Colors.light.backgroundSelected,
      alignItems: 'center',
    },
    priorityButtonActive: { borderColor: '#007AFF', backgroundColor: 'rgba(0,122,255,0.08)' },
    priorityButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
    },
    priorityButtonTextActive: { color: '#007AFF' },
    successCard: {
      alignItems: 'center',
      paddingVertical: Spacing.five,
    },
    successIcon: { fontSize: 60, marginBottom: Spacing.two },
    successTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#34C759',
      marginBottom: Spacing.one,
    },
    successSubtitle: {
      fontSize: 16,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
      textAlign: 'center',
    },
  });

  if (success) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { flex: 1, textAlign: 'center' }]}>Ticket Submitted!</Text>
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <Card style={styles.successCard}>
            <Text style={styles.successIcon}>🎫</Text>
            <Text style={styles.successTitle}>Ticket Created!</Text>
            <Text style={styles.successSubtitle}>
              We will review your ticket and respond within 24 hours.
            </Text>
          </Card>
          <Button
            title="View My Tickets"
            onPress={() => router.push('/(tabs)/komi-sol/tickets')}
            fullWidth
            style={{ marginBottom: Spacing.two }}
          />
          <Button
            title="Back to KomiSol"
            onPress={() => router.back()}
            variant="secondary"
            fullWidth
          />
        </ScrollView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Create Support Ticket</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {error && (
          <Card style={{ marginBottom: Spacing.three, backgroundColor: 'rgba(255,59,48,0.1)' }}>
            <ThemedText style={{ color: '#FF3B30' }}>{error}</ThemedText>
          </Card>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Title</Text>
          <Input
            placeholder="Brief description of your issue"
            value={title}
            onChangeText={setTitle}
            label="Issue Title"
            error={errors.title}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Priority</Text>
          <View style={styles.priorityRow}>
            {priorities.map((p) => (
              <Pressable
                key={p.value}
                style={[styles.priorityButton, priority === p.value && styles.priorityButtonActive]}
                onPress={() => setPriority(p.value)}
              >
                <Text
                  style={[
                    styles.priorityButtonText,
                    priority === p.value && styles.priorityButtonTextActive,
                  ]}
                >
                  {p.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Description</Text>
          <Input
            placeholder="Describe your issue in detail..."
            value={description}
            onChangeText={setDescription}
            label="Detailed Description"
            multiline
            error={errors.description}
          />
        </View>

        <Button
          title={loading ? 'Submitting...' : 'Submit Ticket'}
          onPress={handleSubmit}
          loading={loading}
          fullWidth
          size="large"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
