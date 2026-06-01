import React, { useEffect } from 'react';
import { FlatList, StyleSheet, Text, View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';

import { Card } from '@/components/common/card';
import { Button } from '@/components/common/button';
import { EmptyState } from '@/components/common/empty-state';
import { Loading } from '@/components/common/loading';
import { ThemedText } from '@/components/themed-text';
import { useKomiMarche } from '@/hooks/use-komi-marche';
import { Formatting } from '@/utils/formatting';
import { Colors, Spacing } from '@/constants/theme';
import { CartItem } from '@/types/komi-marche';

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { cart, loading, error, getCart } = useKomiMarche();

  useEffect(() => {
    getCart();
  }, [getCart]);

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
      flex: 1,
    },
    content: {
      padding: Spacing.three,
      paddingBottom: insets.bottom + 80,
    },
    cartItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.two,
      gap: Spacing.two,
    },
    imagePlaceholder: {
      width: 64,
      height: 64,
      borderRadius: 8,
      backgroundColor: isDark ? Colors.dark.backgroundElement : Colors.light.backgroundElement,
      justifyContent: 'center',
      alignItems: 'center',
    },
    imagePlaceholderText: { fontSize: 28 },
    itemInfo: { flex: 1 },
    itemName: {
      fontSize: 15,
      fontWeight: '600',
      color: isDark ? Colors.dark.text : Colors.light.text,
      marginBottom: Spacing.half,
    },
    itemPrice: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#34C759',
    },
    qtyControl: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.one,
    },
    qtyButton: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: isDark ? Colors.dark.backgroundElement : Colors.light.backgroundElement,
      justifyContent: 'center',
      alignItems: 'center',
    },
    qtyText: {
      fontSize: 14,
      fontWeight: '700',
      color: isDark ? Colors.dark.text : Colors.light.text,
      minWidth: 20,
      textAlign: 'center',
    },
    summaryCard: {
      marginTop: Spacing.two,
      marginBottom: Spacing.three,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: Spacing.one,
    },
    summaryLabel: {
      fontSize: 15,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
    },
    summaryValue: {
      fontSize: 15,
      fontWeight: '600',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: Spacing.two,
      marginTop: Spacing.one,
      borderTopWidth: 1,
      borderTopColor: isDark ? Colors.dark.backgroundSelected : Colors.light.backgroundSelected,
    },
    totalLabel: {
      fontSize: 17,
      fontWeight: 'bold',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    totalValue: {
      fontSize: 17,
      fontWeight: 'bold',
      color: '#34C759',
    },
    bottomBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: Spacing.three,
      paddingBottom: insets.bottom + Spacing.two,
      backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
      borderTopWidth: 1,
      borderTopColor: isDark ? Colors.dark.backgroundElement : Colors.light.backgroundElement,
    },
  });

  const items = cart?.items ?? [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>My Cart ({items.length})</Text>
      </View>

      <FlatList
        contentContainerStyle={styles.content}
        data={loading && items.length === 0 ? [] : items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }: { item: CartItem }) => (
          <Card style={styles.cartItem}>
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>🛍️</Text>
            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={1}>{item.product?.name ?? 'Product'}</Text>
              <Text style={styles.itemPrice}>{Formatting.currency(item.product?.price ?? 0)}</Text>
            </View>
            <View style={styles.qtyControl}>
              <Pressable style={styles.qtyButton}>
                <Text style={{ fontWeight: 'bold', color: isDark ? Colors.dark.text : Colors.light.text }}>−</Text>
              </Pressable>
              <Text style={styles.qtyText}>{item.quantity}</Text>
              <Pressable style={styles.qtyButton}>
                <Text style={{ fontWeight: 'bold', color: isDark ? Colors.dark.text : Colors.light.text }}>+</Text>
              </Pressable>
            </View>
          </Card>
        )}
        ListFooterComponent={
          items.length > 0 ? (
            <Card style={styles.summaryCard}>
              <ThemedText type="subtitle" style={{ fontSize: 16, marginBottom: Spacing.two }}>
                Order Summary
              </ThemedText>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>{Formatting.currency(cart?.totalAmount ?? 0)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shipping</Text>
                <Text style={styles.summaryValue}>{Formatting.currency(0)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{Formatting.currency(cart?.totalAmount ?? 0)}</Text>
              </View>
            </Card>
          ) : null
        }
        ListEmptyComponent={
          loading ? (
            <Loading visible={true} overlay={false} text="Loading cart..." />
          ) : (
            <EmptyState
              title="Your Cart is Empty"
              description="Browse the marketplace to find products"
              actionTitle="Browse Products"
              onAction={() => router.back()}
            />
          )
        }
      />

      {items.length > 0 && (
        <View style={styles.bottomBar}>
          <Button
            title={`Checkout — ${Formatting.currency(cart?.totalAmount ?? 0)}`}
            onPress={() => router.push('/(tabs)/komi-marche/checkout')}
            fullWidth
          />
        </View>
      )}
    </View>
  );
}
