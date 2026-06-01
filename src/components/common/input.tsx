import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';

export interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'number-pad' | 'decimal-pad' | 'numeric' | 'url';
  editable?: boolean;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  style?: any;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  editable = true,
  error,
  required = false,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  autoCapitalize = 'sentences',
  autoCorrect = true,
  style,
}) => {
  const isDark = false; // TODO: Get from theme context

  const styles = StyleSheet.create({
    container: {
      marginBottom: Spacing.two,
      width: '100%',
    },
    labelContainer: {
      flexDirection: 'row',
      marginBottom: Spacing.one,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    required: {
      color: '#FF3B30',
      marginLeft: 2,
    },
    input: {
      borderWidth: 1,
      borderColor: error
        ? '#FF3B30'
        : isDark
          ? Colors.dark.backgroundElement
          : Colors.light.backgroundElement,
      borderRadius: 8,
      paddingHorizontal: Spacing.two,
      paddingVertical: Spacing.two,
      fontSize: 16,
      color: isDark ? Colors.dark.text : Colors.light.text,
      backgroundColor: isDark ? Colors.dark.backgroundElement : Colors.light.backgroundElement,
    },
    errorText: {
      color: '#FF3B30',
      fontSize: 12,
      marginTop: Spacing.one,
    },
  });

  return (
    <View style={[styles.container, style]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          {required && <Text style={styles.required}>*</Text>}
        </View>
      )}
      <TextInput
        style={[
          styles.input,
          disabled && { opacity: 0.5 },
          multiline && { minHeight: numberOfLines ? numberOfLines * 40 : 80 },
        ]}
        placeholder={placeholder}
        placeholderTextColor={isDark ? Colors.dark.textSecondary : Colors.light.textSecondary}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        editable={editable && !disabled}
        multiline={multiline}
        numberOfLines={numberOfLines}
        maxLength={maxLength}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};
