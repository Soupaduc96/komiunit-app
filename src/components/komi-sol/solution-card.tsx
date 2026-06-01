import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/common/card';
import { Button } from '@/components/common/button';
import { Formatting } from '@/utils/formatting';
import { Solution } from '@/types/komi-sol';
import { Colors, Spacing } from '@/constants/theme';

interface SolutionCardProps {
  solution: Solution;
  onPress?: () => void;
}

export const SolutionCard: React.FC<SolutionCardProps> = ({ solution, onPress }) => {
  const isDark = false; // TODO: Get from theme context

  const styles = StyleSheet.create({
    card: {
      marginBottom: Spacing.two,
    },
    category: {
      fontSize: 12,
      color: '#007AFF',
      fontWeight: '600',
      marginBottom: Spacing.half,
    },
    title: {
      fontSize: 16,
      fontWeight: 'bold',
      color: isDark ? Colors.dark.text : Colors.light.text,
      marginBottom: Spacing.one,
    },
    description: {
      fontSize: 14,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
      marginBottom: Spacing.two,
      lineHeight: 20,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    stats: {
      flexDirection: 'row',
      gap: Spacing.two,
    },
    stat: {
      fontSize: 12,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
    },
  });

  return (
    <Card style={styles.card}>
      <Text style={styles.category}>{solution.category}</Text>
      <Text style={styles.title}>{solution.title}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {solution.description}
      </Text>

      <View style={styles.footer}>
        <View style={styles.stats}>
          <Text style={styles.stat}>👁️ {solution.views}</Text>
          <Text style={styles.stat}>❤️ {solution.likes}</Text>
        </View>
        <Button
          title="View"
          onPress={onPress ?? (() => {})}
          variant="primary"
          size="small"
        />
      </View>
    </Card>
  );
};
