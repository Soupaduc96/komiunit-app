import { supabase } from '@/services/supabase/client';
import {
  mapProduct,
  mapCartItem,
  mapCart,
  mapOrder,
  mapProductCategory,
} from '@/services/supabase/mappers';
import { Product, CartItem, Cart, Order, ProductCategory } from '@/types/komi-marche';

export class KomiMarcheService {
  // ─── Products ──────────────────────────────────────────────────────────────

  static async getProducts(category?: string): Promise<Product[]> {
    let q = supabase
      .from('products')
      .select('*')
      .gt('stock', 0)
      .order('created_at', { ascending: false });

    if (category) q = q.eq('category', category);

    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapProduct);
  }

  static async getProductById(productId: string): Promise<Product | undefined> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? mapProduct(data) : undefined;
  }

  static async searchProducts(query: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .gt('stock', 0)
      .order('rating', { ascending: false })
      .limit(30);

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapProduct);
  }

  static async getCategories(): Promise<ProductCategory[]> {
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapProductCategory);
  }

  // ─── Cart ───────────────────────────────────────────────────────────────────

  static async getCart(userId: string): Promise<Cart | undefined> {
    // Get cart items joined with their product details
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        products(*)
      `)
      .eq('user_id', userId)
      .order('added_at', { ascending: false });

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) return undefined;

    const items = data.map(mapCartItem);
    return mapCart(userId, items);
  }

  static async addToCart(
    userId: string,
    productId: string,
    quantity: number = 1
  ): Promise<CartItem> {
    // Check if item already in cart
    const { data: existing } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle();

    if (existing) {
      // Update quantity
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id)
        .select('*, products(*)')
        .single();
      if (error) throw new Error(error.message);
      return mapCartItem(data);
    }

    // Insert new
    const { data, error } = await supabase
      .from('cart_items')
      .insert({ user_id: userId, product_id: productId, quantity })
      .select('*, products(*)')
      .single();

    if (error) throw new Error(error.message);
    return mapCartItem(data);
  }

  static async updateCartItemQuantity(
    cartItemId: string,
    quantity: number
  ): Promise<CartItem> {
    if (quantity <= 0) {
      await this.removeFromCart(cartItemId);
      throw new Error('Item removed');
    }
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', cartItemId)
      .select('*, products(*)')
      .single();

    if (error) throw new Error(error.message);
    return mapCartItem(data);
  }

  static async removeFromCart(cartItemId: string): Promise<void> {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);

    if (error) throw new Error(error.message);
  }

  static async clearCart(userId: string): Promise<void> {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
  }

  // ─── Orders ─────────────────────────────────────────────────────────────────

  static async createOrder(userId: string, shippingAddress: string): Promise<Order> {
    // 1. Fetch cart items with product prices
    const cart = await this.getCart(userId);
    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    const totalAmount = cart.totalAmount;

    // 2. Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        total_amount: totalAmount,
        status: 'pending',
        shipping_address: shippingAddress,
      })
      .select('*')
      .single();

    if (orderError) throw new Error(orderError.message);

    // 3. Insert order_items
    const orderItems = cart.items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      price: item.product?.price ?? 0,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw new Error(itemsError.message);

    // 4. Clear cart
    await this.clearCart(userId);

    // 5. Return order with items
    return await this.getOrderById(order.id) ?? mapOrder({ ...order, order_items: [] });
  }

  static async getUserOrders(userId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(*, products(*))
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapOrder);
  }

  static async getOrderById(orderId: string): Promise<Order | undefined> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(*, products(*))
      `)
      .eq('id', orderId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? mapOrder(data) : undefined;
  }

  static async updateOrderStatus(
    orderId: string,
    status: Order['status']
  ): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    return mapOrder({ ...data, order_items: [] });
  }
}
