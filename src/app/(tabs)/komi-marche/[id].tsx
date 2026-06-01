import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';

import { Card } from '@/components/common/card';
import { Button } from '@/components/common/button';
import { EmptyState } from '@/components/common/empty-state';
import { ThemedText } from '@/components/themed-text';
import { Formatting } from '@/utils/formatting';
import { KomiMarcheService } from '@/services/komi-marche/product-service';
import { useKomiMarche } from '@/hooks/use-komi-marche';
import { Colors, Spacing } from '@/constants/theme';
import { Product } from '@/types/komi-marche';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { addToCart, loading: cartLoading } = useKomiMarche();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    if (!id) return;
    KomiMarcheService.getProductById(id)
      .then((data) => setProduct(data ?? null))
      .catch((e) => setLoadError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      await addToCart(product.id, quantity);
      setAddedToCart(true);
    } catch {
      // error handled by hook
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: isDark ? Colors.dark.background : Colors.light.background },
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
    headerTitle: { fontSize: 18, fontWeight: '700', color: isDark ? Colors.dark.text : Colors.light.text, flex: 1 },
    content: { padding: Spacing.three, paddingBottom: 100 },
    imagePlaceholder: {
      width: '100%', height: 260,
      backgroundColor: isDark ? Colors.dark.backgroundElement : Colors.light.backgroundElement,
      borderRadius: 16, marginBottom: Spacing.three,
      justifyContent: 'center', alignItems: 'center',
    },
    name: { fontSize: 22, fontWeight: 'bold', color: isDark ? Colors.dark.text : Colors.light.text, marginBottom: Spacing.two },
    priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.two, marginBottom: Spacing.two },
    price: { fontSize: 28, fontWeight: 'bold', color: '#34C759' },
    originalPrice: { fontSize: 18, color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary, textDecorationLine: 'line-through' },
    rating: { fontSize: 14, color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary, marginBottom: Spacing.two },
    stockBadge: { fontSize: 13, fontWeight: '600', marginBottom: Spacing.three },
    descCard: { marginBottom: Spacing.three },
    desc: { fontSize: 15, lineHeight: 24, color: isDark ? Colors.dark.text : Colors.light.text },
    qtyRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, marginBottom: Spacing.three },
    qtyLabel: { fontSize: 16, fontWeight: '600', color: isDark ? Colors.dark.text : Colors.light.text },
    qtyButton: {
      width: 36, height: 36, borderRadius: 18,
      backgroundColor: isDark ? Colors.dark.backgroundElement : Colors.light.backgroundElement,
      justifyContent: 'center', alignItems: 'center',
    },
    qtyText: { fontSize: 16, fontWeight: 'bold', color: isDark ? Colors.dark.text : Colors.light.text, minWidth: 24, textAlign: 'center' },
    bottomBar: {
      position: 'absolute', bottom: 0, left: 0, right: 0,
      padding: Spacing.three, paddingBottom: insets.bottom + Spacing.two,
      backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
      borderTopWidth: 1, borderTopColor: isDark ? Colors.dark.backgroundElement : Colors.light.backgroundElement,
      flexDirection: 'row', gap: Spacing.two,
    },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  });

  const headerRow = (
    <View style={styles.header}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>
      <Text style={styles.headerTitle} numberOfLines={1}>
        {product?.name ?? 'Product Details'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        {headerRow}
        <View style={styles.center}><ActivityIndicator size="large" color="#007AFF" /></View>
      </View>
    );
  }

  if (loadError || !product) {
    return (
      <View style={styles.container}>
        {headerRow}
        <EmptyState
          title="Product Not Found"
          description={loadError ?? 'This product could not be loaded'}
          actionTitle="Go Back"
          onAction={() => router.back()}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {headerRow}
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.imagePlaceholder}>
          <Text style={{ fontSize: 64 }}>🛍️</Text>
        </View>

        <Text style={styles.name}>{product.name}</Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>
            {Formatting.currency(product.discountPrice ?? product.price)}
          </Text>
          {product.discountPrice && (
            <Text style={styles.originalPrice}>{Formatting.currency(product.price)}</Text>
          )}
        </View>

        <Text style={styles.rating}>⭐ {product.rating.toFixed(1)} ({product.reviews} reviews)</Text>
        <Text style={[styles.stockBadge, { color: product.stock > 0 ? '#34C759' : '#FF3B30' }]}>
          {product.stock > 10 ? `✓ In Stock (${product.stock})` : product.stock > 0 ? `⚠ Only ${product.stock} left` : '✗ Out of Stock'}
        </Text>

        <Card style={styles.descCard}>
          <ThemedText type="subtitle" style={{ fontSize: 16, marginBottom: Spacing.two }}>Description</ThemedText>
          <Text style={styles.desc}>{product.description}</Text>
        </Card>

        {product.stock > 0 && (
          <View style={styles.qtyRow}>
            <Text style={styles.qtyLabel}>Quantity</Text>
            <Pressable style={styles.qtyButton} onPress={() => setQuantity(Math.max(1, quantity - 1))}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: isDark ? Colors.dark.text : Colors.light.text }}>−</Text>
            </Pressable>
            <Text style={styles.qtyText}>{quantity}</Text>
            <Pressable style={styles.qtyButton} onPress={() => setQuantity(Math.min(product.stock, quantity + 1))}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: isDark ? Colors.dark.text : Colors.light.text }}>+</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {product.stock > 0 && (
        <View style={styles.bottomBar}>
          <Button
            title={addedToCart ? '✓ Added to Cart' : 'Add to Cart'}
            onPress={handleAddToCart}
            loading={cartLoading}
            disabled={addedToCart}
            fullWidth
          />
          <Button
            title="Buy Now"
            onPress={() => router.push('/(tabs)/komi-marche/checkout')}
            variant="secondary"
            fullWidth
          />
        </View>
      )}
    </View>
  );
}
