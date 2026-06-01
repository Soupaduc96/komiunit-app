import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';

export interface LoadingProps {
  visible: boolean;
  text?: string;
  size?: 'small' | 'large';
  overlay?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  visible,
  text,
  size = 'large',
  overlay = true,
}) => {
  if (!visible) return null;

  const isDark = false; // TODO: Get from theme context

  const styles = StyleSheet.create({
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 999,
    },
    container: {
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      borderRadius: 12,
      backgroundColor: isDark ? Colors.dark.backgroundElement : Colors.light.backgroundElement,
    },
    text: {
      marginTop: 12,
    },
  });

  const containerStyle = overlay ? styles.overlay : styles.container;

  return (
    <View style={containerStyle}>
      <ActivityIndicator
        size={size}
        color="#007AFF"
      />
      {text && (
        <ThemedText style={styles.text}>{text}</ThemedText>
      )}
    </View>
  );
};
