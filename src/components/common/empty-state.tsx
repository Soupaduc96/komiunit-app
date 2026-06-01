import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from './button';
import { Colors, Spacing } from '@/constants/theme';

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionTitle?: string;
  onAction?: () => void;
  style?: any;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionTitle,
  onAction,
  style,
}) => {
  const isDark = false; // TODO: Get from theme context

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: Spacing.three,
      paddingVertical: Spacing.four,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? Colors.dark.text : Colors.light.text,
      marginBottom: Spacing.one,
      textAlign: 'center',
    },
    description: {
      fontSize: 14,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
      marginBottom: Spacing.three,
      textAlign: 'center',
    },
  });

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {actionTitle && onAction && (
        <Button title={actionTitle} onPress={onAction} variant="primary" />
      )}
    </View>
  );
};
