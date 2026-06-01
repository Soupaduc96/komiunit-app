import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface TabBarIconProps {
  name: string;
  focused: boolean;
  color: string;
  size?: number;
}

export const TabBarIcon: React.FC<TabBarIconProps> = ({
  name,
  focused,
  color,
  size = 24,
}) => {
  const iconMap: Record<string, string> = {
    home: '🏠',
    'komi-send': '📤',
    'komi-sol': '💡',
    'komi-marche': '🛒',
    'komi-learn': '📚',
    'komi-voix': '🎤',
    settings: '⚙️',
  };

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      opacity: focused ? 1 : 0.6,
    },
    icon: {
      fontSize: size,
    },
    label: {
      fontSize: 10,
      color: color,
      marginTop: 2,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{iconMap[name] || '○'}</Text>
    </View>
  );
};
