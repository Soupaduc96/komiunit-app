import React, { useEffect, useState } from 'react';
import {
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

import { Avatar } from '@/components/profile/avatar';
import { Input } from '@/components/common/input';
import { Button } from '@/components/common/button';
import { useProfile } from '@/hooks/use-profile';
import { Validation } from '@/utils/validation';
import { Colors, Spacing } from '@/constants/theme';

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user, saving, uploading, error, success, updateProfile, pickAndUploadAvatar, clearMessages } =
    useProfile();

  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Sync if user changes externally
  useEffect(() => {
    setFullName(user?.fullName ?? '');
    setPhone(user?.phone ?? '');
  }, [user?.fullName, user?.phone]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) {
      errs.fullName = 'Full name is required';
    } else if (!Validation.isValidName(fullName)) {
      errs.fullName = 'Name must be at least 2 characters';
    }
    if (phone.trim() && !Validation.isValidPhone(phone)) {
      errs.phone = 'Enter a valid phone number';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    clearMessages();
    if (!validate()) return;
    try {
      await updateProfile({ fullName: fullName.trim(), phone: phone.trim() });
    } catch {
      // error state already set by hook
    }
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
      flex: 1,
    },
    content: {
      padding: Spacing.three,
      paddingBottom: insets.bottom + Spacing.three,
    },
    avatarSection: {
      alignItems: 'center',
      marginBottom: Spacing.four,
    },
    avatarHint: {
      fontSize: 12,
      color: '#007AFF',
      marginTop: Spacing.one,
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
    section: { marginBottom: Spacing.three },
    sectionLabel: {
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
      marginBottom: Spacing.two,
    },
    readOnlyField: {
      padding: Spacing.two,
      borderRadius: 8,
      backgroundColor: isDark ? Colors.dark.backgroundElement : Colors.light.backgroundElement,
      marginBottom: Spacing.two,
    },
    readOnlyLabel: {
      fontSize: 12,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
      marginBottom: Spacing.half,
    },
    readOnlyValue: {
      fontSize: 15,
      fontWeight: '500',
      color: isDark ? Colors.dark.text : Colors.light.text,
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
        <Text style={styles.headerTitle}>Edit Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <Avatar
            uri={user?.avatarUrl}
            name={user?.fullName ?? user?.email}
            size={96}
            editable
            uploading={uploading}
            onPress={pickAndUploadAvatar}
            isDark={isDark}
          />
          <Text style={styles.avatarHint}>Tap to change photo</Text>
        </View>

        {/* Success / error banners */}
        {success && (
          <View style={[styles.banner, { backgroundColor: 'rgba(52,199,89,0.12)' }]}>
            <Text style={[styles.bannerText, { color: '#34C759' }]}>✓ {success}</Text>
          </View>
        )}
        {error && (
          <View style={[styles.banner, { backgroundColor: 'rgba(255,59,48,0.1)' }]}>
            <Text style={[styles.bannerText, { color: '#FF3B30' }]}>{error}</Text>
          </View>
        )}

        {/* Editable fields */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Personal Info</Text>
          <Input
            label="Full Name"
            value={fullName}
            onChangeText={(v) => { setFullName(v); clearMessages(); }}
            placeholder="Your full name"
            autoCapitalize="words"
            error={fieldErrors.fullName}
          />
          <Input
            label="Phone Number"
            value={phone}
            onChangeText={(v) => { setPhone(v); clearMessages(); }}
            placeholder="+1 (555) 000-0000"
            keyboardType="phone-pad"
            error={fieldErrors.phone}
          />
        </View>

        {/* Read-only fields */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Account Info</Text>
          <View style={styles.readOnlyField}>
            <Text style={styles.readOnlyLabel}>Email address</Text>
            <Text style={styles.readOnlyValue}>{user?.email}</Text>
          </View>
          <Text style={{ fontSize: 12, color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary }}>
            Email cannot be changed here. Contact support if you need to update it.
          </Text>
        </View>

        <Button
          title={saving ? 'Saving…' : 'Save Changes'}
          onPress={handleSave}
          loading={saving}
          fullWidth
          size="large"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
