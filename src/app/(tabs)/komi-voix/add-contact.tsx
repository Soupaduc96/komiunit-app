import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';

import { Card } from '@/components/common/card';
import { Button } from '@/components/common/button';
import { Input } from '@/components/common/input';
import { ThemedText } from '@/components/themed-text';
import { useKomiVoix } from '@/hooks/use-komi-voix';
import { Validation } from '@/utils/validation';
import { Colors, Spacing } from '@/constants/theme';

export default function AddContactScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { addContact, loading, error } = useKomiVoix();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [userId, setUserId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!phone.trim()) newErrors.phone = 'Phone is required';
    else if (!Validation.isValidPhone(phone)) newErrors.phone = 'Enter a valid phone number';
    if (!userId.trim()) newErrors.userId = 'User ID or email is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = async () => {
    if (!validate()) return;
    try {
      await addContact(userId.trim(), name.trim(), phone.trim());
      setSuccess(true);
    } catch {
      // handled by hook
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
      borderBottomWidth: 1,
      borderBottomColor: isDark ? Colors.dark.backgroundElement : Colors.light.backgroundElement,
    },
    backButton: { marginRight: Spacing.two, padding: Spacing.one },
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
    section: { marginBottom: Spacing.three },
    sectionLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
      marginBottom: Spacing.one,
      textTransform: 'uppercase',
    },
    avatarPreview: {
      alignItems: 'center',
      paddingVertical: Spacing.four,
      marginBottom: Spacing.three,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: '#007AFF',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: Spacing.two,
    },
    avatarText: { fontSize: 32, color: 'white', fontWeight: 'bold' },
    avatarName: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    successCard: {
      alignItems: 'center',
      paddingVertical: Spacing.five,
    },
    successIcon: { fontSize: 60, marginBottom: Spacing.two },
    successTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#34C759',
      marginBottom: Spacing.one,
    },
    successSubtitle: {
      fontSize: 16,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
      textAlign: 'center',
    },
  });

  if (success) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { flex: 1, textAlign: 'center' }]}>Contact Added!</Text>
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <Card style={styles.successCard}>
            <Text style={styles.successIcon}>👤</Text>
            <Text style={styles.successTitle}>Contact Added!</Text>
            <Text style={styles.successSubtitle}>
              {name} has been added to your contacts.
            </Text>
          </Card>
          <Button
            title="View Contacts"
            onPress={() => router.back()}
            fullWidth
            style={{ marginBottom: Spacing.two }}
          />
          <Button
            title="Add Another"
            onPress={() => {
              setSuccess(false);
              setName('');
              setPhone('');
              setUserId('');
            }}
            variant="secondary"
            fullWidth
          />
        </ScrollView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Add Contact</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {error && (
          <Card style={{ marginBottom: Spacing.three, backgroundColor: 'rgba(255,59,48,0.1)' }}>
            <ThemedText style={{ color: '#FF3B30' }}>{error}</ThemedText>
          </Card>
        )}

        <View style={styles.avatarPreview}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{name ? name[0].toUpperCase() : '?'}</Text>
          </View>
          <Text style={styles.avatarName}>{name || 'New Contact'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Contact Name</Text>
          <Input
            placeholder="Full name"
            value={name}
            onChangeText={setName}
            label="Name"
            autoCapitalize="words"
            error={errors.name}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Phone Number</Text>
          <Input
            placeholder="+1 (555) 000-0000"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            label="Phone"
            error={errors.phone}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>User ID or Email</Text>
          <Input
            placeholder="user@example.com or user ID"
            value={userId}
            onChangeText={setUserId}
            autoCapitalize="none"
            keyboardType="email-address"
            label="User ID / Email"
            error={errors.userId}
          />
        </View>

        <Button
          title={loading ? 'Adding...' : 'Add Contact'}
          onPress={handleAdd}
          loading={loading}
          fullWidth
          size="large"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
