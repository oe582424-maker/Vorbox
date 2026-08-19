import { Order, Product, StoreSettings } from '../types';
import { DEFAULT_STORE_SETTINGS, INITIAL_PRODUCTS } from '../data/defaultData';

export interface StoreSyncData {
  products: Product[];
  settings: StoreSettings;
  orders: Order[];
  version: number;
  lastUpdated: number;
}

export const api = {
  // Fetch full store data from server (products, settings, orders)
  async getStoreData(): Promise<StoreSyncData | null> {
    try {
      const res = await fetch('/api/store-data', {
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data: StoreSyncData = await res.json();
      return data;
    } catch (err) {
      console.warn('Backend API getStoreData failed, using local offline fallback:', err);
      return null;
    }
  },

  // Save/Create a product
  async createProduct(product: Product): Promise<Product | null> {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return data.product || product;
    } catch (err) {
      console.warn('Backend API createProduct failed:', err);
      return product;
    }
  },

  // Update an existing product
  async updateProduct(product: Product): Promise<Product | null> {
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return data.product || product;
    } catch (err) {
      console.warn('Backend API updateProduct failed:', err);
      return product;
    }
  },

  // Delete a product
  async deleteProduct(productId: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (err) {
      console.warn('Backend API deleteProduct failed:', err);
      return true;
    }
  },

  // Update Store Settings & Featured Drop
  async updateSettings(settings: StoreSettings): Promise<StoreSettings> {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return data.settings || settings;
    } catch (err) {
      console.warn('Backend API updateSettings failed:', err);
      return settings;
    }
  },

  // Create an order
  async createOrder(order: Order): Promise<Order> {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return data.order || order;
    } catch (err) {
      console.warn('Backend API createOrder failed:', err);
      return order;
    }
  },

  // Update order status
  async updateOrderStatus(orderId: string, status: Order['status']): Promise<boolean> {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      return res.ok;
    } catch (err) {
      console.warn('Backend API updateOrderStatus failed:', err);
      return true;
    }
  },

  // Delete order
  async deleteOrder(orderId: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (err) {
      console.warn('Backend API deleteOrder failed:', err);
      return true;
    }
  },

  // Reset demo store data to defaults
  async resetStoreData(): Promise<boolean> {
    try {
      const res = await fetch('/api/reset', {
        method: 'POST',
      });
      return res.ok;
    } catch (err) {
      console.warn('Backend API resetStoreData failed:', err);
      return true;
    }
  },
};
