import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';

export interface CardProps {
  children: React.ReactNode;
  style?: any;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  variant = 'default',
}) => {
  const isDark = false; // TODO: Get from theme context

  const variantStyles = {
    default: {
      backgroundColor: isDark ? Colors.dark.backgroundElement : Colors.light.backgroundElement,
      shadowColor: isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.1)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 3,
    },
    elevated: {
      backgroundColor: isDark ? Colors.dark.backgroundElement : Colors.light.backgroundElement,
      shadowColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.2)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 6,
    },
    outlined: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: isDark ? Colors.dark.backgroundSelected : Colors.light.backgroundSelected,
    },
  };

  const styles = StyleSheet.create({
    card: {
      borderRadius: 12,
      padding: Spacing.two,
      overflow: 'hidden',
      ...variantStyles[variant],
    },
  });

  return (
    <View style={[styles.card, style]} onTouchEnd={onPress}>
      {children}
    </View>
  );
};
