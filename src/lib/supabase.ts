import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, StoreSettings } from '../types';

// Load Supabase URL and Publishable/Anon Key from Vite / Process environment
const SUPABASE_URL =
  (import.meta as any).env?.VITE_SUPABASE_URL ||
  (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_URL : '') ||
  '';

const SUPABASE_ANON_KEY =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_ANON_KEY : '') ||
  '';

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    SUPABASE_URL.startsWith('http') &&
    !SUPABASE_URL.includes('your-supabase') &&
    !SUPABASE_URL.includes('placeholder')
);

let supabaseClientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!supabaseClientInstance) {
    try {
      supabaseClientInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        global: {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
          },
        },
      });
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }
  return supabaseClientInstance;
}

export const supabase = getSupabaseClient();

// Helper to convert frontend Product to database row (supports both snake_case and camelCase)
export function productToSupabaseRow(product: Product): Record<string, any> {
  return {
    id: product.id,
    name: product.name,
    category: product.category || 'General',
    price: Number(product.price) || 0,
    original_price: product.originalPrice ? Number(product.originalPrice) : null,
    originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
    fabric: product.fabric || '',
    gsm: product.gsm || '',
    description: product.description || '',
    features: product.features || [],
    sizes: product.sizes || ['S', 'M', 'L', 'XL'],
    colors: product.colors || [],
    images: Array.isArray(product.images) ? product.images : [],
    in_stock: product.inStock ?? true,
    inStock: product.inStock ?? true,
    featured: product.featured ?? false,
    tag: product.tag || null,
    updated_at: new Date().toISOString(),
  };
}

// Helper to convert database row back to frontend Product
export function supabaseRowToProduct(row: any): Product {
  return {
    id: String(row.id),
    name: String(row.name || ''),
    category: String(row.category || 'General'),
    price: Number(row.price) || 0,
    originalPrice:
      row.original_price !== null && row.original_price !== undefined
        ? Number(row.original_price)
        : row.originalPrice !== null && row.originalPrice !== undefined
        ? Number(row.originalPrice)
        : undefined,
    fabric: row.fabric || '',
    gsm: row.gsm || '',
    description: String(row.description || ''),
    features: Array.isArray(row.features) ? row.features : [],
    sizes: Array.isArray(row.sizes) ? row.sizes : ['S', 'M', 'L', 'XL'],
    colors: Array.isArray(row.colors) ? row.colors : [],
    images: Array.isArray(row.images) ? row.images : [],
    inStock:
      row.in_stock !== undefined
        ? Boolean(row.in_stock)
        : row.inStock !== undefined
        ? Boolean(row.inStock)
        : true,
    featured: Boolean(row.featured),
    tag: row.tag || undefined,
  };
}

// ==========================================
// SUPABASE DIRECT DATABASE OPERATIONS
// ==========================================

export async function fetchProductsFromSupabase(): Promise<Product[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('products')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch products notice:', error.message);
      return null;
    }

    if (Array.isArray(data) && data.length > 0) {
      return data.map(supabaseRowToProduct);
    }
    return null;
  } catch (err) {
    console.warn('Supabase fetchProductsFromSupabase exception:', err);
    return null;
  }
}

export async function insertProductToSupabase(product: Product): Promise<Product | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const row = productToSupabaseRow(product);
    const { data, error } = await client
      .from('products')
      .upsert([row], { onConflict: 'id' })
      .select();

    if (error) {
      console.warn('Supabase upsert product error:', error.message);
      return null;
    }

    if (data && data.length > 0) {
      return supabaseRowToProduct(data[0]);
    }
    return product;
  } catch (err) {
    console.warn('Supabase insertProductToSupabase exception:', err);
    return null;
  }
}

export async function updateProductInSupabase(
  productId: string,
  product: Partial<Product> | Product
): Promise<Product | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (product.name !== undefined) updates.name = product.name;
    if (product.category !== undefined) updates.category = product.category;
    if (product.price !== undefined) updates.price = Number(product.price);
    if (product.originalPrice !== undefined) {
      updates.original_price = product.originalPrice ? Number(product.originalPrice) : null;
      updates.originalPrice = product.originalPrice ? Number(product.originalPrice) : null;
    }
    if (product.fabric !== undefined) updates.fabric = product.fabric;
    if (product.gsm !== undefined) updates.gsm = product.gsm;
    if (product.description !== undefined) updates.description = product.description;
    if (product.features !== undefined) updates.features = product.features;
    if (product.sizes !== undefined) updates.sizes = product.sizes;
    if (product.colors !== undefined) updates.colors = product.colors;
    if (product.images !== undefined) updates.images = product.images;
    if (product.inStock !== undefined) {
      updates.in_stock = product.inStock;
      updates.inStock = product.inStock;
    }
    if (product.featured !== undefined) updates.featured = product.featured;
    if (product.tag !== undefined) updates.tag = product.tag;

    const { data, error } = await client
      .from('products')
      .update(updates)
      .eq('id', productId)
      .select();

    if (error) {
      console.warn('Supabase update product error:', error.message);
      return null;
    }

    if (data && data.length > 0) {
      return supabaseRowToProduct(data[0]);
    }
    return null;
  } catch (err) {
    console.warn('Supabase updateProductInSupabase exception:', err);
    return null;
  }
}

export async function updateProductImagesInSupabase(
  productId: string,
  images: string[]
): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client
      .from('products')
      .update({
        images,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId);

    if (error) {
      console.warn('Supabase updateProductImages error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase updateProductImages exception:', err);
    return false;
  }
}

export async function deleteProductFromSupabase(productId: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('products').delete().eq('id', productId);

    if (error) {
      console.warn('Supabase deleteProduct error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase deleteProductFromSupabase exception:', err);
    return false;
  }
}

// ==========================================
// DYNAMIC CATEGORIES PERSISTENCE IN SUPABASE
// ==========================================

export async function fetchCategoriesFromSupabase(): Promise<string[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    // 1. Try dedicated 'categories' table first
    const { data, error } = await client
      .from('categories')
      .select('name, position')
      .order('position', { ascending: true });

    if (!error && Array.isArray(data) && data.length > 0) {
      return data.map((item: any) => String(item.name || item.id || item));
    }

    // 2. Fallback to 'settings' table categories field
    const settings = await fetchSettingsFromSupabase();
    if (settings && Array.isArray(settings.categories) && settings.categories.length > 0) {
      return settings.categories;
    }

    return null;
  } catch (err) {
    return null;
  }
}

export async function saveCategoriesToSupabase(categories: string[]): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    // 1. Save to dedicated 'categories' table if it exists
    const categoryRows = categories.map((name, index) => ({
      id: name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      name,
      position: index,
      updated_at: new Date().toISOString(),
    }));

    // Replace category rows
    try {
      await client.from('categories').delete().neq('id', '___non_existent___');
      await client.from('categories').insert(categoryRows);
    } catch (e) {
      // ignore if categories table is not created
    }

    // 2. Also save into settings row for redundancy
    const existingSettings = (await fetchSettingsFromSupabase()) || ({} as StoreSettings);
    await saveSettingsToSupabase({
      ...existingSettings,
      categories,
    });

    return true;
  } catch (err) {
    console.warn('Supabase saveCategoriesToSupabase error:', err);
    return false;
  }
}

// ==========================================
// STORE SETTINGS SUPPORT IN SUPABASE
// ==========================================

export async function fetchSettingsFromSupabase(): Promise<StoreSettings | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('settings')
      .select('data')
      .eq('id', 'main_settings')
      .single();

    if (error || !data || !data.data) return null;
    return data.data as StoreSettings;
  } catch (err) {
    return null;
  }
}

export async function saveSettingsToSupabase(settings: StoreSettings): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('settings').upsert(
      [
        {
          id: 'main_settings',
          data: settings,
          updated_at: new Date().toISOString(),
        },
      ],
      { onConflict: 'id' }
    );

    return !error;
  } catch (err) {
    return false;
  }
}
