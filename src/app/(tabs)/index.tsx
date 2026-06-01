import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Header } from '@/components/navigation/header';
import { Card } from '@/components/common/card';
import { useAuth } from '@/hooks/use-auth';
import { useWallet } from '@/hooks/use-wallet';
import { Colors, Spacing } from '@/constants/theme';
import { Formatting } from '@/utils/formatting';
import { Transaction, TransactionType } from '@/types/wallet';

// ─── Transaction row ─────────────────────────────────────────────────────────

const TX_ICONS: Record<TransactionType, string> = {
  deposit: '💵',
  withdrawal: '💸',
  transfer_out: '📤',
  transfer_in: '📥',
  payment: '💳',
  refund: '↩️',
};

const TX_LABELS: Record<TransactionType, string> = {
  deposit: 'Deposit',
  withdrawal: 'Withdrawal',
  transfer_out: 'Money Sent',
  transfer_in: 'Money Received',
  payment: 'Payment',
  refund: 'Refund',
};

function isCredit(type: TransactionType): boolean {
  return type === 'deposit' || type === 'transfer_in' || type === 'refund';
}

interface TransactionRowProps {
  transaction: Transaction;
  isDark: boolean;
  isLast: boolean;
}

function TransactionRow({ transaction, isDark, isLast }: TransactionRowProps) {
  const credit = isCredit(transaction.type);
  const styles = StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.two,
      paddingHorizontal: Spacing.three,
      borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
      borderBottomColor: isDark
        ? Colors.dark.backgroundSelected
        : Colors.light.backgroundSelected,
    },
    iconBox: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: isDark
        ? Colors.dark.backgroundElement
        : Colors.light.backgroundElement,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.two,
    },
    iconText: { fontSize: 18 },
    textBlock: { flex: 1 },
    label: {
      fontSize: 14,
      fontWeight: '500',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    sub: {
      fontSize: 12,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
      marginTop: 1,
    },
    amount: {
      fontSize: 14,
      fontWeight: '700',
      color: credit ? '#34C759' : '#FF3B30',
    },
  });

  return (
    <View style={styles.row}>
      <View style={styles.iconBox}>
        <Text style={styles.iconText}>{TX_ICONS[transaction.type]}</Text>
      </View>
      <View style={styles.textBlock}>
        <Text style={styles.label} numberOfLines={1}>
          {transaction.description ?? TX_LABELS[transaction.type]}
        </Text>
        <Text style={styles.sub}>
          {TX_LABELS[transaction.type]}
          {' · '}
          {Formatting.date(transaction.createdAt, 'MMM d')}
        </Text>
      </View>
      <Text style={styles.amount}>
        {credit ? '+' : '-'}
        {Formatting.currency(transaction.amount, 'USD')}
      </Text>
    </View>
  );
}

// ─── Home screen ─────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { wallet, transactions, loading: walletLoading, error: walletError } = useWallet();
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
    emptyText: {
      fontSize: 14,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
      textAlign: 'center',
      paddingVertical: Spacing.three,
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
    balanceError: {
      fontSize: 13,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
    },
    txCard: {
      padding: 0,
      overflow: 'hidden',
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

      {/* Balance */}
      <View style={styles.section}>
        <Card style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          {walletLoading ? (
            <ActivityIndicator color="#34C759" size="small" style={{ marginTop: Spacing.one }} />
          ) : walletError ? (
            <Text style={styles.balanceError}>Could not load balance</Text>
          ) : (
            <Text style={styles.balanceAmount}>
              {Formatting.currency(wallet?.balance ?? 0, wallet?.currency ?? 'USD')}
            </Text>
          )}
        </Card>
      </View>

      {/* Services */}
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

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {walletLoading ? (
          <Card>
            <ActivityIndicator color="#007AFF" size="small" style={{ paddingVertical: Spacing.three }} />
          </Card>
        ) : transactions.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>No recent activity yet</Text>
          </Card>
        ) : (
          <Card style={styles.txCard}>
            {transactions.map((txn, idx) => (
              <TransactionRow
                key={txn.id}
                transaction={txn}
                isDark={isDark}
                isLast={idx === transactions.length - 1}
              />
            ))}
          </Card>
        )}
      </View>
    </ScrollView>
  );
}
