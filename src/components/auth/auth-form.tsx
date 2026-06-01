import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
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
  // Prevent double-submits independently of the parent's loading flag
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    if (fieldErrors[fieldName]) {
      setFieldErrors((prev) => ({ ...prev, [fieldName]: '' }));
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting || isLoading) return;
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (err) {
      // errors are surfaced via the `error` prop by the parent
    } finally {
      setIsSubmitting(false);
    }
  };

  const busy = isLoading || isSubmitting;

  const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center' },
    content: {
      paddingHorizontal: Spacing.three,
      paddingVertical: Spacing.four,
    },
    errorBanner: {
      backgroundColor: 'rgba(255, 59, 48, 0.1)',
      borderRadius: 8,
      paddingHorizontal: Spacing.two,
      paddingVertical: Spacing.two,
      marginBottom: Spacing.two,
    },
    errorText: {
      color: '#FF3B30',
      fontSize: 14,
      textAlign: 'center',
      lineHeight: 20,
    },
    button: { marginBottom: Spacing.two },
    secondaryButton: { marginTop: Spacing.two },
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Error banner — uses Text so React Native renders it correctly */}
        {!!error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

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
            autoCapitalize={field.type === 'email' ? 'none' : 'sentences'}
            autoCorrect={field.type !== 'email' && field.type !== 'password'}
            error={fieldErrors[field.name]}
            required={field.required}
          />
        ))}

        <Button
          title={busy ? 'Please wait…' : submitButtonText}
          onPress={handleSubmit}
          disabled={busy}
          loading={busy}
          fullWidth
          style={styles.button}
        />

        {onSecondaryAction && secondaryActionText && (
          <Button
            title={secondaryActionText}
            onPress={onSecondaryAction}
            variant="secondary"
            fullWidth
            disabled={busy}
            style={styles.secondaryButton}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
