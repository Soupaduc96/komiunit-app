import React from 'react';
import { Modal as RNModal, StyleSheet, Text, View } from 'react-native';
import { Button } from './button';
import { Colors, Spacing } from '@/constants/theme';

export interface ModalProps {
  visible: boolean;
  title: string;
  description?: string;
  children?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  type?: 'alert' | 'confirm' | 'custom';
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  title,
  description,
  children,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'alert',
}) => {
  const isDark = false; // TODO: Get from theme context

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modal: {
      backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
      borderRadius: 12,
      padding: Spacing.three,
      maxWidth: '90%',
      maxHeight: '80%',
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: isDark ? Colors.dark.text : Colors.light.text,
      marginBottom: Spacing.two,
    },
    description: {
      fontSize: 14,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
      marginBottom: Spacing.three,
    },
    content: {
      marginBottom: Spacing.three,
    },
    buttons: {
      flexDirection: 'row',
      gap: Spacing.two,
      justifyContent: 'flex-end',
    },
  });

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.container}>
        <View style={styles.modal}>
          <Text style={styles.title}>{title}</Text>
          {description && <Text style={styles.description}>{description}</Text>}
          {children && <View style={styles.content}>{children}</View>}
          {type !== 'custom' && (
            <View style={styles.buttons}>
              {type === 'confirm' && (
                <Button
                  title={cancelText}
                  onPress={onCancel ?? (() => {})}
                  variant="secondary"
                  size="small"
                />
              )}
              <Button
                title={confirmText}
                onPress={onConfirm ?? (() => {})}
                variant="primary"
                size="small"
              />
            </View>
          )}
        </View>
      </View>
    </RNModal>
  );
};
