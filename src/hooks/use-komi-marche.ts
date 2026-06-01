import { useCallback, useState } from 'react';
import { KomiMarcheService } from '@/services/komi-marche/product-service';
import { Product, Cart, Order } from '@/types/komi-marche';
import { useAuth } from './use-auth';

export const useKomiMarche = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Cart | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getProducts = useCallback(async (category?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await KomiMarcheService.getProducts(category);
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  const searchProducts = useCallback(async (query: string) => {
    if (!query.trim()) return getProducts();
    setLoading(true);
    setError(null);
    try {
      const data = await KomiMarcheService.searchProducts(query);
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }, [getProducts]);

  const addToCart = useCallback(
    async (productId: string, quantity: number = 1) => {
      if (!user) throw new Error('Not authenticated');
      setLoading(true);
      setError(null);
      try {
        await KomiMarcheService.addToCart(user.id, productId, quantity);
        // Refresh cart after adding
        const updated = await KomiMarcheService.getCart(user.id);
        setCart(updated ?? null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to add to cart';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const removeFromCart = useCallback(
    async (cartItemId: string) => {
      if (!user) throw new Error('Not authenticated');
      setLoading(true);
      setError(null);
      try {
        await KomiMarcheService.removeFromCart(cartItemId);
        const updated = await KomiMarcheService.getCart(user.id);
        setCart(updated ?? null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to remove item';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const getCart = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await KomiMarcheService.getCart(user.id);
      setCart(data ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getOrders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await KomiMarcheService.getUserOrders(user.id);
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createOrder = useCallback(
    async (shippingAddress: string): Promise<Order> => {
      if (!user) throw new Error('Not authenticated');
      setLoading(true);
      setError(null);
      try {
        const order = await KomiMarcheService.createOrder(user.id, shippingAddress);
        setOrders((prev) => [order, ...prev]);
        setCart(null);
        return order;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to place order';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    products,
    cart,
    orders,
    loading,
    error,
    getProducts,
    searchProducts,
    addToCart,
    removeFromCart,
    getCart,
    getOrders,
    createOrder,
    clearError,
  };
};
