import { Order, Product, StoreSettings } from '../types';
import { DEFAULT_STORE_SETTINGS, INITIAL_PRODUCTS } from '../data/defaultData';
import {
  isSupabaseConfigured,
  fetchProductsFromSupabase,
  insertProductToSupabase,
  updateProductInSupabase,
  updateProductImagesInSupabase,
  deleteProductFromSupabase,
  fetchSettingsFromSupabase,
  saveSettingsToSupabase,
} from '../lib/supabase';

export interface StoreSyncData {
  products: Product[];
  settings: StoreSettings;
  orders: Order[];
  version: number;
  lastUpdated: number;
}

// ==========================================
// CENTRAL PERSISTENT API SERVICE
// ==========================================

export const api = {
  // Subscribe to real-time store updates via SSE
  subscribeToStoreUpdates(onUpdate: (data: StoreSyncData) => void): () => void {
    if (typeof window === 'undefined' || !window.EventSource) {
      return () => {};
    }

    let eventSource: EventSource | null = null;
    let reconnectTimeout: any = null;

    const connect = () => {
      try {
        eventSource = new EventSource('/api/events');

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data && (data.type === 'store_update' || data.type === 'store_init')) {
              onUpdate({
                products: data.products,
                settings: data.settings,
                orders: data.orders || [],
                version: data.version || 1,
                lastUpdated: data.lastUpdated || Date.now(),
              });
            }
          } catch (e) {
            console.error('Error parsing SSE event data:', e);
          }
        };

        eventSource.onerror = () => {
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          // Reconnect with backoff
          reconnectTimeout = setTimeout(connect, 3000);
        };
      } catch (err) {
        console.warn('Failed to start EventSource:', err);
      }
    };

    connect();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (eventSource) {
        eventSource.close();
      }
    };
  },

  // 1. GETs master product catalog from remote cloud endpoint (Supabase primary or Express persistent server)
  async fetchProducts(): Promise<Product[]> {
    if (isSupabaseConfigured) {
      try {
        const sbProducts = await fetchProductsFromSupabase();
        if (sbProducts && Array.isArray(sbProducts) && sbProducts.length > 0) {
          return sbProducts;
        }
      } catch (err) {
        console.warn('Supabase fetchProducts failed, falling back to backend server:', err);
      }
    }

    try {
      const res = await fetch(`/api/products?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return Array.isArray(data) ? data : INITIAL_PRODUCTS;
    } catch (err) {
      console.warn('REST API fetchProducts failed:', err);
      return INITIAL_PRODUCTS;
    }
  },

  // Alias for fetchProducts
  async getProducts(): Promise<Product[]> {
    return this.fetchProducts();
  },

  // Fetch full store data from server (products, settings, orders)
  async getStoreData(): Promise<StoreSyncData | null> {
    try {
      const res = await fetch(`/api/store-data?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data: StoreSyncData = await res.json();

      // If Supabase has products, combine them
      if (isSupabaseConfigured) {
        const sbProducts = await fetchProductsFromSupabase();
        if (sbProducts && sbProducts.length > 0) {
          data.products = sbProducts;
        }
      }

      return data;
    } catch (err) {
      console.warn('Backend API getStoreData failed:', err);
      if (isSupabaseConfigured) {
        const sbProducts = await fetchProductsFromSupabase();
        if (sbProducts && sbProducts.length > 0) {
          return {
            products: sbProducts,
            settings: DEFAULT_STORE_SETTINGS,
            orders: [],
            version: 1,
            lastUpdated: Date.now(),
          };
        }
      }
      return null;
    }
  },

  // 2. POSTs/PUTs product updates to remote cloud database (Supabase + Express)
  async saveProduct(product: Product): Promise<Product> {
    // If Supabase is configured, mutate remote database first
    if (isSupabaseConfigured) {
      try {
        const savedSb = await insertProductToSupabase(product);
        if (savedSb) {
          // Also sync to server in background for redundancy
          fetch(`/api/products/${encodeURIComponent(product.id)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product),
          }).catch(() => {});
          return savedSb;
        }
      } catch (err) {
        console.warn('Supabase saveProduct error, falling back to server:', err);
      }
    }

    // Default to Express persistent cloud backend
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(product.id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
        body: JSON.stringify(product),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return data.product || product;
    } catch (err) {
      console.error('Backend API saveProduct failed:', err);
      return product;
    }
  },

  // Alias for creating a new product
  async createProduct(product: Product): Promise<Product> {
    return this.saveProduct(product);
  },

  // Alias for updating an existing product
  async updateProduct(product: Product): Promise<Product> {
    return this.saveProduct(product);
  },

  // 3. Sends a hard DELETE HTTP request to remote database
  async deleteProduct(productId: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        await deleteProductFromSupabase(productId);
      } catch (err) {
        console.warn('Supabase deleteProduct error:', err);
      }
    }

    try {
      const res = await fetch(`/api/products/${encodeURIComponent(productId)}`, {
        method: 'DELETE',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return true;
    } catch (err) {
      console.error('Backend API deleteProduct failed:', err);
      return false;
    }
  },

  // 4. Sends a PATCH/PUT request with the updated image array so deleted photos stay permanently deleted across all devices
  async deleteProductImage(productId: string, imageIndex: number): Promise<boolean> {
    try {
      // First get current product catalog
      const products = await this.fetchProducts();
      const product = products.find((p) => p.id === productId);
      if (!product || !Array.isArray(product.images)) return false;

      const filteredImages = product.images.filter((_, idx) => idx !== imageIndex);
      return await this.updateProductImages(productId, filteredImages);
    } catch (err) {
      console.error('Backend API deleteProductImage failed:', err);
      return false;
    }
  },

  // Dedicated atomic update for product images array in database
  async updateProductImages(productId: string, images: string[]): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        await updateProductImagesInSupabase(productId, images);
      } catch (err) {
        console.warn('Supabase updateProductImages error:', err);
      }
    }

    try {
      const res = await fetch(`/api/products/${encodeURIComponent(productId)}/images`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
        body: JSON.stringify({ images }),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return true;
    } catch (err) {
      console.error('Backend API updateProductImages failed:', err);
      return false;
    }
  },

  // Update Store Settings & Featured Drop
  async updateSettings(settings: StoreSettings): Promise<StoreSettings> {
    if (isSupabaseConfigured) {
      try {
        await saveSettingsToSupabase(settings);
      } catch (err) {
        console.warn('Supabase updateSettings error:', err);
      }
    }

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return data.settings || settings;
    } catch (err) {
      console.error('Backend API updateSettings failed:', err);
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

// Export standalone named functions for seamless direct imports
export const fetchProducts = () => api.fetchProducts();
export const getProducts = () => api.getProducts();
export const saveProduct = (product: Product) => api.saveProduct(product);
export const deleteProduct = (id: string) => api.deleteProduct(id);
export const deleteProductImage = (productId: string, imageIndex: number) =>
  api.deleteProductImage(productId, imageIndex);
export const updateProductImages = (productId: string, images: string[]) =>
  api.updateProductImages(productId, images);
export const getStoreData = () => api.getStoreData();
export const updateSettings = (settings: StoreSettings) => api.updateSettings(settings);
export const createOrder = (order: Order) => api.createOrder(order);
