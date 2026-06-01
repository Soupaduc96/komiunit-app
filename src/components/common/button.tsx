import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: any;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
}) => {
  const isDark = false; // TODO: Get from theme context

  const variantStyles = {
    primary: {
      backgroundColor: '#007AFF',
      borderColor: '#007AFF',
    },
    secondary: {
      backgroundColor: 'transparent',
      borderColor: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
    },
    danger: {
      backgroundColor: '#FF3B30',
      borderColor: '#FF3B30',
    },
  };

  const sizeStyles = {
    small: {
      paddingVertical: Spacing.one,
      paddingHorizontal: Spacing.two,
      fontSize: 14,
    },
    medium: {
      paddingVertical: Spacing.two,
      paddingHorizontal: Spacing.three,
      fontSize: 16,
    },
    large: {
      paddingVertical: Spacing.three,
      paddingHorizontal: Spacing.four,
      fontSize: 18,
    },
  };

  const styles = StyleSheet.create({
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      borderWidth: variant === 'secondary' ? 1 : 0,
      opacity: disabled ? 0.6 : 1,
      ...variantStyles[variant],
      ...sizeStyles[size],
      width: fullWidth ? '100%' : 'auto',
    },
    text: {
      color: variant === 'secondary' ? (isDark ? Colors.dark.text : Colors.light.text) : 'white',
      fontSize: sizeStyles[size].fontSize,
      fontWeight: '600',
    },
  });

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.button, style]}
      android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
};
