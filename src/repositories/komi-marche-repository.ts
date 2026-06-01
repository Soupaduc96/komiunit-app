import { KomiMarcheService } from '@/services/komi-marche/product-service';
import { Product, Cart, Order, ProductCategory } from '@/types/komi-marche';

export class KomiMarcheRepository {
  constructor(private userId: string) {}

  getProducts(category?: string): Promise<Product[]> {
    return KomiMarcheService.getProducts(category);
  }

  getProductById(id: string): Promise<Product | undefined> {
    return KomiMarcheService.getProductById(id);
  }

  searchProducts(query: string): Promise<Product[]> {
    return KomiMarcheService.searchProducts(query);
  }

  getCategories(): Promise<ProductCategory[]> {
    return KomiMarcheService.getCategories();
  }

  getCart(): Promise<Cart | undefined> {
    return KomiMarcheService.getCart(this.userId);
  }

  addToCart(productId: string, quantity: number = 1) {
    return KomiMarcheService.addToCart(this.userId, productId, quantity);
  }

  removeFromCart(cartItemId: string): Promise<void> {
    return KomiMarcheService.removeFromCart(cartItemId);
  }

  createOrder(shippingAddress: string): Promise<Order> {
    return KomiMarcheService.createOrder(this.userId, shippingAddress);
  }

  getOrders(): Promise<Order[]> {
    return KomiMarcheService.getUserOrders(this.userId);
  }

  getOrderById(id: string): Promise<Order | undefined> {
    return KomiMarcheService.getOrderById(id);
  }

  updateOrderStatus(id: string, status: Order['status']): Promise<Order> {
    return KomiMarcheService.updateOrderStatus(id, status);
  }
}
