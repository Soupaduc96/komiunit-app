import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';

import { Input } from '@/components/common/input';
import { Button } from '@/components/common/button';
import { useProfile } from '@/hooks/use-profile';
import { useAuth } from '@/hooks/use-auth';
import { Validation } from '@/utils/validation';
import { Formatting } from '@/utils/formatting';
import { Colors, Spacing } from '@/constants/theme';

export default function SecurityScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user, signOut, loading: authLoading } = useAuth();
  const { saving, error: profileError, success, changePassword, clearMessages } = useProfile();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validatePassword = () => {
    const errs: Record<string, string> = {};
    if (!newPassword) {
      errs.newPassword = 'New password is required';
    } else if (!Validation.isValidPassword(newPassword)) {
      errs.newPassword = 'Password must be at least 8 characters';
    }
    if (!confirmPassword) {
      errs.confirmPassword = 'Please confirm your password';
    } else if (!Validation.passwordsMatch(newPassword, confirmPassword)) {
      errs.confirmPassword = 'Passwords do not match';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChangePassword = async () => {
    clearMessages();
    if (!validatePassword()) return;
    try {
      await changePassword(newPassword);
      setNewPassword('');
      setConfirmPassword('');
      setFieldErrors({});
    } catch {
      // error set by hook
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of KomiUnit?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch {
              // auth error state handles this
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: insets.top + Spacing.two,
      paddingBottom: Spacing.two,
      paddingHorizontal: Spacing.three,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? Colors.dark.backgroundElement : Colors.light.backgroundElement,
    },
    backBtn: { marginRight: Spacing.two, padding: Spacing.one },
    backText: { fontSize: 16, color: '#007AFF' },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    content: {
      padding: Spacing.three,
      paddingBottom: insets.bottom + Spacing.three,
    },
    sectionLabel: {
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
      marginBottom: Spacing.two,
      marginTop: Spacing.three,
    },
    infoCard: {
      padding: Spacing.three,
      borderRadius: 14,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark ? Colors.dark.backgroundSelected : Colors.light.backgroundSelected,
      backgroundColor: isDark ? Colors.dark.backgroundElement : Colors.light.backgroundElement,
      marginBottom: Spacing.two,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: Spacing.one,
    },
    infoLabel: {
      fontSize: 13,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
    },
    infoValue: {
      fontSize: 13,
      fontWeight: '600',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    banner: {
      padding: Spacing.two,
      borderRadius: 10,
      marginBottom: Spacing.three,
    },
    bannerText: {
      fontSize: 14,
      textAlign: 'center',
    },
    toggleRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginBottom: Spacing.two,
    },
    toggleBtn: { fontSize: 13, color: '#007AFF' },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: isDark ? Colors.dark.backgroundSelected : Colors.light.backgroundSelected,
      marginVertical: Spacing.three,
    },
    signOutBtn: {
      marginTop: Spacing.three,
      borderColor: '#FF3B30',
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Security</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Session info */}
        <Text style={styles.sectionLabel}>Active Session</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Account</Text>
            <Text style={styles.infoValue} numberOfLines={1}>{user?.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Member since</Text>
            <Text style={styles.infoValue}>
              {user?.createdAt ? Formatting.date(user.createdAt, 'MMM d, yyyy') : '—'}
            </Text>
          </View>
        </View>

        {/* Change password */}
        <Text style={styles.sectionLabel}>Change Password</Text>

        {success && (
          <View style={[styles.banner, { backgroundColor: 'rgba(52,199,89,0.12)' }]}>
            <Text style={[styles.bannerText, { color: '#34C759' }]}>✓ {success}</Text>
          </View>
        )}
        {profileError && (
          <View style={[styles.banner, { backgroundColor: 'rgba(255,59,48,0.1)' }]}>
            <Text style={[styles.bannerText, { color: '#FF3B30' }]}>{profileError}</Text>
          </View>
        )}

        <View style={styles.toggleRow}>
          <Pressable onPress={() => setShowPasswords((p) => !p)}>
            <Text style={styles.toggleBtn}>{showPasswords ? 'Hide' : 'Show'} passwords</Text>
          </Pressable>
        </View>

        <Input
          label="New Password"
          value={newPassword}
          onChangeText={(v) => { setNewPassword(v); clearMessages(); }}
          secureTextEntry={!showPasswords}
          placeholder="Minimum 8 characters"
          error={fieldErrors.newPassword}
        />
        <Input
          label="Confirm New Password"
          value={confirmPassword}
          onChangeText={(v) => { setConfirmPassword(v); clearMessages(); }}
          secureTextEntry={!showPasswords}
          placeholder="Re-enter password"
          error={fieldErrors.confirmPassword}
        />

        <Button
          title={saving ? 'Updating…' : 'Update Password'}
          onPress={handleChangePassword}
          loading={saving}
          fullWidth
        />

        <View style={styles.divider} />

        {/* Sign out */}
        <Text style={styles.sectionLabel}>Session</Text>
        <Button
          title="Sign Out"
          onPress={handleSignOut}
          variant="danger"
          loading={authLoading}
          fullWidth
          style={styles.signOutBtn}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
