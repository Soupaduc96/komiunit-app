import React, { useEffect } from 'react';
import { FlatList, StyleSheet, Text, View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';

import { Card } from '@/components/common/card';
import { EmptyState } from '@/components/common/empty-state';
import { Loading } from '@/components/common/loading';
import { ThemedText } from '@/components/themed-text';
import { useKomiMarche } from '@/hooks/use-komi-marche';
import { Formatting } from '@/utils/formatting';
import { Colors, Spacing } from '@/constants/theme';
import { Order } from '@/types/komi-marche';

const STATUS_CONFIG: Record<string, { bg: string; text: string; icon: string }> = {
  pending: { bg: 'rgba(255, 159, 10, 0.1)', text: '#FF9F0A', icon: '⏳' },
  confirmed: { bg: 'rgba(0, 122, 255, 0.1)', text: '#007AFF', icon: '✅' },
  shipped: { bg: 'rgba(94, 92, 230, 0.1)', text: '#5E5CE6', icon: '🚚' },
  delivered: { bg: 'rgba(52, 199, 89, 0.1)', text: '#34C759', icon: '📦' },
  cancelled: { bg: 'rgba(255, 59, 48, 0.1)', text: '#FF3B30', icon: '❌' },
};

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { orders, loading, error, getOrders } = useKomiMarche();

  useEffect(() => {
    getOrders();
  }, [getOrders]);

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
    orderCard: { marginBottom: Spacing.two },
    orderHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.two,
    },
    orderId: {
      fontSize: 13,
      fontWeight: '700',
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.half,
      paddingHorizontal: Spacing.two,
      paddingVertical: 2,
      borderRadius: 10,
    },
    statusIcon: { fontSize: 12 },
    statusText: { fontSize: 11, fontWeight: '700' },
    orderItems: {
      fontSize: 14,
      color: isDark ? Colors.dark.text : Colors.light.text,
      marginBottom: Spacing.one,
    },
    orderAddress: {
      fontSize: 12,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
      marginBottom: Spacing.two,
    },
    orderFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    orderDate: {
      fontSize: 12,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
    },
    orderTotal: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#34C759',
    },
  });

  const renderOrder = ({ item }: { item: Order }) => {
    const statusConfig = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.pending;
    return (
      <Card style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>Order #{item.id.substring(0, 8).toUpperCase()}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
            <Text style={styles.statusIcon}>{statusConfig.icon}</Text>
            <Text style={[styles.statusText, { color: statusConfig.text }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>
        <Text style={styles.orderItems}>
          {item.items?.length ?? 0} item{(item.items?.length ?? 0) !== 1 ? 's' : ''}
        </Text>
        {item.shippingAddress && (
          <Text style={styles.orderAddress}>📍 {item.shippingAddress}</Text>
        )}
        <View style={styles.orderFooter}>
          <Text style={styles.orderDate}>{Formatting.relative(item.createdAt)}</Text>
          <Text style={styles.orderTotal}>{Formatting.currency(item.totalAmount)}</Text>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>My Orders</Text>
      </View>

      <FlatList
        contentContainerStyle={styles.content}
        data={loading && orders.length === 0 ? [] : orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        ListEmptyComponent={
          loading ? (
            <Loading visible={true} overlay={false} text="Loading orders..." />
          ) : (
            <EmptyState
              title="No Orders Yet"
              description="Browse the marketplace to place your first order"
              actionTitle="Browse Products"
              onAction={() => router.back()}
            />
          )
        }
      />
    </View>
  );
}
