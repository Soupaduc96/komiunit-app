import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/common/card';
import { Button } from '@/components/common/button';
import { Formatting } from '@/utils/formatting';
import { Product } from '@/types/komi-marche';
import { Colors, Spacing } from '@/constants/theme';

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
  onAddToCart?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  onAddToCart,
}) => {
  const isDark = false; // TODO: Get from theme context

  const styles = StyleSheet.create({
    card: {
      width: '48%',
      marginBottom: Spacing.two,
    },
    image: {
      width: '100%',
      height: 150,
      backgroundColor: isDark ? Colors.dark.backgroundElement : Colors.light.backgroundElement,
      borderRadius: 8,
      marginBottom: Spacing.one,
    },
    name: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? Colors.dark.text : Colors.light.text,
      marginBottom: Spacing.half,
    },
    priceContainer: {
      flexDirection: 'row',
      gap: Spacing.one,
      marginBottom: Spacing.one,
    },
    price: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#34C759',
    },
    originalPrice: {
      fontSize: 12,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
      textDecorationLine: 'line-through',
    },
    rating: {
      fontSize: 12,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
      marginBottom: Spacing.one,
    },
    button: {
      marginTop: Spacing.one,
    },
  });

  return (
    <Card style={styles.card} onPress={onPress}>
      <View style={styles.image} />
      <Text style={styles.name} numberOfLines={1}>
        {product.name}
      </Text>

      <View style={styles.priceContainer}>
        <Text style={styles.price}>{Formatting.currency(product.price)}</Text>
        {product.discountPrice && (
          <Text style={styles.originalPrice}>
            {Formatting.currency(product.discountPrice)}
          </Text>
        )}
      </View>

      <Text style={styles.rating}>
        ⭐ {product.rating} ({product.reviews} reviews)
      </Text>

      {product.stock > 0 ? (
        <Button
          title="Add to Cart"
          onPress={onAddToCart ?? (() => {})}
          variant="primary"
          size="small"
          fullWidth
          style={styles.button}
        />
      ) : (
        <Text style={[styles.rating, { color: '#FF3B30' }]}>Out of Stock</Text>
      )}
    </Card>
  );
};
