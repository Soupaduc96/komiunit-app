import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing } from '@/constants/theme';

export interface HeaderProps {
  title: string;
  subtitle?: string;
  rightComponent?: React.ReactNode;
  leftComponent?: React.ReactNode;
  style?: any;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  rightComponent,
  leftComponent,
  style,
}) => {
  const insets = useSafeAreaInsets();
  const isDark = false; // TODO: Get from theme context

  const styles = StyleSheet.create({
    container: {
      paddingTop: insets.top + Spacing.two,
      paddingBottom: Spacing.two,
      paddingHorizontal: Spacing.three,
      backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? Colors.dark.backgroundElement : Colors.light.backgroundElement,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    left: {
      flex: 1,
      justifyContent: 'flex-start',
    },
    center: {
      flex: 1,
      alignItems: 'center',
    },
    right: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    subtitle: {
      fontSize: 12,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
      marginTop: Spacing.half,
    },
  });

  return (
    <View style={[styles.container, style]}>
      <View style={styles.content}>
        {leftComponent && <View style={styles.left}>{leftComponent}</View>}
        <View style={styles.center}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {rightComponent && <View style={styles.right}>{rightComponent}</View>}
      </View>
    </View>
  );
};
