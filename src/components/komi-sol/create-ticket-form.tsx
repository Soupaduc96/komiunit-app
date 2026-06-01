import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '@/components/common/button';
import { Input } from '@/components/common/input';
import { Card } from '@/components/common/card';
import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';

interface CreateTicketFormProps {
  onSubmit: (title: string, description: string, priority: string) => Promise<void>;
  loading?: boolean;
  isDark?: boolean;
}

export const CreateTicketForm: React.FC<CreateTicketFormProps> = ({
  onSubmit,
  loading = false,
  isDark = false,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const styles = StyleSheet.create({
    container: { gap: Spacing.two },
    fieldGroup: { gap: Spacing.one },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    error: { fontSize: 12, color: '#FF3B30', marginTop: Spacing.half },
    priorityContainer: { flexDirection: 'row', gap: Spacing.one },
    priorityButton: { flex: 1 },
    buttonContainer: { gap: Spacing.one, marginTop: Spacing.two },
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim() || title.length < 5) newErrors.title = 'Title must be at least 5 characters';
    if (!description.trim() || description.length < 10)
      newErrors.description = 'Description must be at least 10 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      await onSubmit(title, description, priority);
      setTitle('');
      setDescription('');
      setPriority('medium');
      setErrors({});
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to create ticket' });
    }
  };

  return (
    <Card style={styles.container}>
      <ThemedText type="subtitle">Create Support Ticket</ThemedText>

      <View style={styles.fieldGroup}>
        <ThemedText style={styles.label}>Title</ThemedText>
        <Input
          placeholder="Brief description of issue"
          value={title}
          onChangeText={setTitle}
          editable={!loading}
          error={errors.title}
        />
      </View>

      <View style={styles.fieldGroup}>
        <ThemedText style={styles.label}>Description</ThemedText>
        <Input
          placeholder="Detailed description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          editable={!loading}
          error={errors.description}
        />
      </View>

      <View style={styles.fieldGroup}>
        <ThemedText style={styles.label}>Priority</ThemedText>
        <View style={styles.priorityContainer}>
          {(['low', 'medium', 'high'] as const).map((p) => (
            <Button
              key={p}
              title={p.toUpperCase()}
              onPress={() => setPriority(p)}
              variant={priority === p ? 'primary' : 'secondary'}
              size="small"
              style={styles.priorityButton}
            />
          ))}
        </View>
      </View>

      {errors.submit && <ThemedText style={styles.error}>{errors.submit}</ThemedText>}

      <View style={styles.buttonContainer}>
        <Button
          title={loading ? 'Creating...' : 'Create Ticket'}
          onPress={handleSubmit}
          disabled={loading}
          fullWidth
        />
      </View>
    </Card>
  );
};
