import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '@/components/navigation/header';
import { Card } from '@/components/common/card';
import { useAuth } from '@/hooks/use-auth';
import { Colors, Spacing } from '@/constants/theme';
import { Formatting } from '@/utils/formatting';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const isDark = false; // TODO: Get from theme context

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
    },
    content: {
      paddingHorizontal: Spacing.three,
      paddingBottom: insets.bottom + Spacing.three,
    },
    section: {
      marginTop: Spacing.four,
      marginBottom: Spacing.three,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: isDark ? Colors.dark.text : Colors.light.text,
      marginBottom: Spacing.two,
    },
    moduleGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    moduleCard: {
      width: '48%',
      marginBottom: Spacing.two,
      paddingVertical: Spacing.three,
      alignItems: 'center',
    },
    moduleIcon: {
      fontSize: 40,
      marginBottom: Spacing.one,
    },
    moduleName: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? Colors.dark.text : Colors.light.text,
      textAlign: 'center',
    },
    welcomeText: {
      fontSize: 16,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
      marginBottom: Spacing.two,
    },
    balanceCard: {
      marginBottom: Spacing.three,
      paddingVertical: Spacing.four,
      alignItems: 'center',
    },
    balanceLabel: {
      fontSize: 14,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
      marginBottom: Spacing.one,
    },
    balanceAmount: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#34C759',
    },
  });

  const modules = [
    { id: 'send', name: 'KomiSend', icon: '📤' },
    { id: 'sol', name: 'KomiSol', icon: '💡' },
    { id: 'marche', name: 'KomiMarché', icon: '🛒' },
    { id: 'learn', name: 'KomiLearn', icon: '📚' },
    { id: 'voix', name: 'KomiVoix', icon: '🎤' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Header title="KomiUnit" subtitle={`Welcome, ${user?.fullName || 'User'}`} />

      <View style={styles.section}>
        <Card style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>$1,250.50</Text>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Services</Text>
        <View style={styles.moduleGrid}>
          {modules.map((module) => (
            <Card key={module.id} style={styles.moduleCard}>
              <Text style={styles.moduleIcon}>{module.icon}</Text>
              <Text style={styles.moduleName}>{module.name}</Text>
            </Card>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <Card>
          <Text style={styles.welcomeText}>No recent activity yet</Text>
        </Card>
      </View>
    </ScrollView>
  );
}
