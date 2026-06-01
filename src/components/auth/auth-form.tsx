import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button } from '@/components/common/button';
import { Input } from '@/components/common/input';
import { Spacing } from '@/constants/theme';

export interface AuthFormFields {
  [key: string]: string;
}

export interface AuthFormProps {
  fields: {
    name: string;
    label: string;
    placeholder: string;
    type?: 'email' | 'password' | 'text' | 'phone';
    required?: boolean;
  }[];
  submitButtonText: string;
  isLoading?: boolean;
  error?: string;
  onSubmit: (values: AuthFormFields) => Promise<void>;
  onSecondaryAction?: () => void;
  secondaryActionText?: string;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  fields,
  submitButtonText,
  isLoading = false,
  error,
  onSubmit,
  onSecondaryAction,
  secondaryActionText,
}) => {
  const [formData, setFormData] = useState<AuthFormFields>(
    fields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {})
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    // Clear field error when user starts typing
    if (fieldErrors[fieldName]) {
      setFieldErrors((prev) => ({ ...prev, [fieldName]: '' }));
    }
  };

  const handleSubmit = async () => {
    try {
      await onSubmit(formData);
    } catch (err) {
      console.error('Form submission error:', err);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
    },
    content: {
      paddingHorizontal: Spacing.three,
      paddingVertical: Spacing.four,
    },
    errorText: {
      color: '#FF3B30',
      fontSize: 14,
      marginBottom: Spacing.two,
      textAlign: 'center',
    },
    button: {
      marginBottom: Spacing.two,
    },
    secondaryButton: {
      marginTop: Spacing.two,
    },
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content}>
        {error && <View style={{ marginBottom: Spacing.two }}>
          {typeof error === 'string' && <View style={styles.errorText}>{error}</View>}
        </View>}

        {fields.map((field) => (
          <Input
            key={field.name}
            label={field.label}
            placeholder={field.placeholder}
            value={formData[field.name]}
            onChangeText={(value) => handleFieldChange(field.name, value)}
            secureTextEntry={field.type === 'password'}
            keyboardType={
              field.type === 'email'
                ? 'email-address'
                : field.type === 'phone'
                  ? 'phone-pad'
                  : 'default'
            }
            error={fieldErrors[field.name]}
            required={field.required}
          />
        ))}

        <Button
          title={submitButtonText}
          onPress={handleSubmit}
          disabled={isLoading}
          loading={isLoading}
          fullWidth
          style={styles.button}
        />

        {onSecondaryAction && secondaryActionText && (
          <Button
            title={secondaryActionText}
            onPress={onSecondaryAction}
            variant="secondary"
            fullWidth
            style={styles.secondaryButton}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
