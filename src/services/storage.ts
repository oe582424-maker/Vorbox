// ==========================================
// 1. PERSISTENT STORAGE SERVICE (IndexedDB + API)
// Replace local state with persistent IndexedDB/API sync
// ==========================================

import { Product, StoreSettings, Order } from '../types';

const DB_NAME = 'CrownBornDB';
const DB_VERSION = 1;

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event: any) => {
      const db: IDBDatabase = event.target.result;
      if (!db.objectStoreNames.contains('products')) {
        db.createObjectStore('products', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('orders')) {
        db.createObjectStore('orders', { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getStoredProducts = async (): Promise<Product[]> => {
  try {
    const db = await initDB();
    return new Promise((resolve) => {
      const transaction = db.transaction('products', 'readonly');
      const store = transaction.objectStore('products');
      const request = store.getAll();
      request.onsuccess = () => resolve((request.result as Product[]) || []);
      request.onerror = () => resolve([]);
    });
  } catch (e) {
    console.warn('IndexedDB getStoredProducts error:', e);
    return [];
  }
};

export const saveProductToDB = async (product: any): Promise<void> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('products', 'readwrite');
      const store = transaction.objectStore('products');
      const request = store.put(product);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.warn('IndexedDB saveProductToDB error:', e);
  }
};

export const deleteProductFromDB = async (id: string): Promise<void> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('products', 'readwrite');
      const store = transaction.objectStore('products');
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.warn('IndexedDB deleteProductFromDB error:', e);
  }
};

export const saveAllProductsToDB = async (products: Product[]): Promise<void> => {
  try {
    const db = await initDB();
    return new Promise((resolve) => {
      const transaction = db.transaction('products', 'readwrite');
      const store = transaction.objectStore('products');
      store.clear();
      products.forEach((p) => store.put(p));
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => resolve();
    });
  } catch (e) {
    console.warn('IndexedDB saveAllProductsToDB error:', e);
  }
};

export const getStoredSettings = async (): Promise<StoreSettings | null> => {
  try {
    const db = await initDB();
    return new Promise((resolve) => {
      const transaction = db.transaction('settings', 'readonly');
      const store = transaction.objectStore('settings');
      const request = store.get('crownborn_main_settings');
      request.onsuccess = () => resolve(request.result?.data || null);
      request.onerror = () => resolve(null);
    });
  } catch (e) {
    return null;
  }
};

export const saveSettingsToDB = async (settings: StoreSettings): Promise<void> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('settings', 'readwrite');
      const store = transaction.objectStore('settings');
      const request = store.put({ id: 'crownborn_main_settings', data: settings });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.warn('IndexedDB saveSettingsToDB error:', e);
  }
};
