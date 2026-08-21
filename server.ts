import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// Increase body limit for product base64 images
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Persistence Data File Path
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'store-db.json');

// Default initial baseline data
const DEFAULT_FEATURED_DROP = {
  enabled: false,
  badgeText: 'Featured Drop',
  title: 'Heavyweight Boxy Tee',
  subtitle: '220 GSM 100% Combed Cotton',
  price: 550,
  originalPrice: 700,
  image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80',
  productId: 'vb-101',
};

const DEFAULT_STORE_SETTINGS = {
  storeName: 'CROWNBORN',
  tagline: 'For The Ones Born Royal',
  city: 'Rangpur',
  whatsappNumber: '8801866068916',
  whatsappDisplayNumber: '+880 1866-068916',
  insideCityDeliveryFee: 60,
  outsideCityDeliveryFee: 120,
  freeDeliveryThreshold: 1500,
  bannerNotice: 'Your Reliable Shopping Partner.',
  storeAddress: 'Rangpur, Bangladesh',
  adminPassword: 'akm125@#155Ab12*',
  featuredDrop: DEFAULT_FEATURED_DROP,
  categories: ['T-Shirts', 'Polos', 'Panjabis', 'Hoodies & Sweats', 'Pants & Bottoms'],
  showHeroBanner: true,
  heroSettings: {
    enabled: true,
    badgeText: 'Best Quality Products',
    title: 'WEAR YOUR EDGE.',
    subtitle: 'Delivered directly to your doorstep with Fast Delivery.',
    description: 'Crafted for those who demand excellence. Experience high-grade fabrics, tailored fits, and effortless Cash on Delivery ordering across Bangladesh.',
    showDropCard: false,
  },
};

const INITIAL_PRODUCTS = [
  {
    id: 'vb-101',
    name: 'Heavyweight Boxy Drop-Shoulder Tee',
    category: 'T-Shirts',
    price: 550,
    originalPrice: 700,
    description: 'Ultra-durable 220 GSM combed compact cotton with a structured relaxed boxy fit. Pre-shrunk and colorfast for effortless everyday wear.',
    features: [
      '220 GSM 100% Combed Compact Cotton',
      'Boxy drop-shoulder modern silhouette',
      'Double-needle stitching on collar & hem',
      'Pre-washed to prevent shrinkage',
    ],
    fabric: '100% Organic Combed Cotton',
    gsm: '220 GSM',
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80',
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Onyx Black', hex: '#18181b' },
      { name: 'Chalk White', hex: '#f4f4f5' },
      { name: 'Washed Sage', hex: '#718274' },
      { name: 'Mocha Brown', hex: '#5c4838' },
    ],
    inStock: true,
    featured: true,
    tag: 'Best Seller',
  },
  {
    id: 'vb-102',
    name: 'Minimal Pique Cotton Polo',
    category: 'Polos',
    price: 750,
    originalPrice: 950,
    description: 'Clean-cut refined polo tailored from breathable honeycomb pique fabric. Fitted ribbed collar with hidden minimal placket buttons.',
    features: [
      '230 GSM Honeycomb Pique Cotton',
      'Anti-curl tipped ribbed collar',
      'Tailored regular athletic fit',
      'Side vents for easy tucking or un-tucking',
    ],
    fabric: '95% Combed Cotton, 5% Spandex',
    gsm: '230 GSM',
    images: [
      'https://images.unsplash.com/photo-1625910513413-7d312c14041b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=1000&q=80',
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Midnight Navy', hex: '#1e293b' },
      { name: 'Pure White', hex: '#f8fafc' },
      { name: 'Desert Sand', hex: '#d6c7b2' },
      { name: 'Olive Drab', hex: '#434c38' },
    ],
    inStock: true,
    featured: true,
    tag: 'Trending',
  },
  {
    id: 'vb-103',
    name: 'Everyday Essential Cotton Panjabi',
    category: 'Panjabis',
    price: 1250,
    originalPrice: 1550,
    description: 'Modern minimalist semi-fitted cotton panjabi designed with subtle tonal embroidery on the placket and collar. Ideal for Jumuah, campus, and festive gatherings.',
    features: [
      '100% Premium Jacquard Weave Cotton',
      'Mandarin collar with concealed button stand',
      'Two deep practical side pockets',
      'Crisp fall with breathable all-day comfort',
    ],
    fabric: '100% Breathable Fine Cotton',
    gsm: '180 GSM',
    images: [
      'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80',
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Slate Grey', hex: '#475569' },
      { name: 'Ivory White', hex: '#fafaf9' },
      { name: 'Royal Charcoal', hex: '#262626' },
      { name: 'Dusty Olive', hex: '#5b6352' },
    ],
    inStock: true,
    featured: true,
    tag: 'Signature Edition',
  },
  {
    id: 'vb-104',
    name: 'Oversized Fleece Pullover Hoodie',
    category: 'Hoodies & Sweats',
    price: 1100,
    originalPrice: 1400,
    description: 'Heavy 320 GSM brushback fleece hoodie with a double-layered hood and kangaroo pouch. Built for comfortable layering.',
    features: [
      '320 GSM Ultra-Soft Brushed Fleece',
      'Seamless crossover hood without bulky cords',
      'Spacious double-stitched kangaroo pocket',
      'Wide ribbed cuffs and hem retention',
    ],
    fabric: '80% Cotton, 20% Polyester Fleece',
    gsm: '320 GSM',
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1000&q=80',
    ],
    sizes: ['M', 'L', 'XL'],
    colors: [
      { name: 'Jet Black', hex: '#171717' },
      { name: 'Heather Grey', hex: '#9ca3af' },
      { name: 'Forest Pine', hex: '#2d3b2d' },
    ],
    inStock: true,
    featured: false,
    tag: 'Winter Drop',
  },
  {
    id: 'vb-105',
    name: 'Relaxed Tapered Chino Cargo Pant',
    category: 'Pants & Bottoms',
    price: 950,
    originalPrice: 1200,
    description: 'Smart casual stretch twill bottoms with streamlined side utility pockets and semi-elasticated drawcord waistband.',
    features: [
      '98% Cotton Twill with 2% Elastane Flex',
      'Dual flat streamline cargo pockets',
      'Drawcord elastic comfort waistband',
      'Ankle tapered silhouette',
    ],
    fabric: 'Stretch Cotton Twill',
    gsm: '260 GSM',
    images: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=1000&q=80',
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Olive Green', hex: '#444d3b' },
      { name: 'Khaki Beige', hex: '#bda688' },
      { name: 'Matte Black', hex: '#1c1917' },
    ],
    inStock: true,
    featured: true,
    tag: 'Essential',
  },
  {
    id: 'vb-106',
    name: 'Vorbox Signature Back-Print Oversized Tee',
    category: 'T-Shirts',
    price: 590,
    originalPrice: 750,
    description: 'Featuring a high-density subtle typographic Vorbox art print on the back with a minimalist chest crest. Soft silicone wash.',
    features: [
      '210 GSM Combed Ring-Spun Cotton',
      'Durable screen print with crack-resistant ink',
      'Relaxed drop shoulder fit',
      'Anti-pilling fabric finish',
    ],
    fabric: '100% Ring-Spun Cotton',
    gsm: '210 GSM',
    images: [
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1000&q=80',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Pitch Black', hex: '#0f172a' },
      { name: 'Vintage Off-White', hex: '#f1f5f9' },
      { name: 'Terracotta Rust', hex: '#9c4c34' },
    ],
    inStock: true,
    featured: false,
    tag: 'Limited Edit',
  },
  {
    id: 'vb-107',
    name: 'Waffle Knit Thermal Crewneck',
    category: 'Hoodies & Sweats',
    price: 890,
    originalPrice: 1100,
    description: 'Textured honey-comb waffle knit long sleeve pullover. Perfect for breezy evenings with a relaxed casual drape.',
    features: [
      'Heavy textured 280 GSM Waffle Weave',
      'Ribbed stretch neckband & cuffs',
      'Breathable thermal insulation',
      'Minimalist seamless hem',
    ],
    fabric: '100% Combed Cotton Waffle',
    gsm: '280 GSM',
    images: [
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1000&q=80',
    ],
    sizes: ['M', 'L', 'XL'],
    colors: [
      { name: 'Oatmeal Heather', hex: '#d6cbbe' },
      { name: 'Charcoal Black', hex: '#27272a' },
      { name: 'Dusty Slate', hex: '#64748b' },
    ],
    inStock: true,
    featured: false,
    tag: 'New Drop',
  },
  {
    id: 'vb-108',
    name: 'Everyday Relaxed Cotton Shorts',
    category: 'Pants & Bottoms',
    price: 490,
    originalPrice: 650,
    description: 'Casual heavyweight french terry lounge shorts with dual side zip pockets and back pocket. Unmatched comfort for summer and indoor wear.',
    features: [
      '260 GSM French Terry Cotton',
      'Two concealed zipper side pockets',
      'Heavy cotton drawcord with metal aglets',
      'Above-knee tailored length',
    ],
    fabric: '100% French Terry Cotton',
    gsm: '260 GSM',
    images: [
      'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=1000&q=80',
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Heather Grey', hex: '#94a3b8' },
      { name: 'Black', hex: '#18181b' },
      { name: 'Navy', hex: '#1e3a8a' },
    ],
    inStock: true,
    featured: false,
    tag: 'Summer Deal',
  },
];

interface StoreDbStructure {
  products: typeof INITIAL_PRODUCTS;
  settings: typeof DEFAULT_STORE_SETTINGS;
  orders: any[];
  lastUpdated: number;
  version: number;
}

// Ensure database file exists
function loadDatabase(): StoreDbStructure {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(raw);
      return {
        products: Array.isArray(data.products) ? data.products : INITIAL_PRODUCTS,
        settings: {
          ...DEFAULT_STORE_SETTINGS,
          ...(data.settings || {}),
          featuredDrop: data.settings?.featuredDrop || DEFAULT_FEATURED_DROP,
          heroSettings: data.settings?.heroSettings
            ? { ...DEFAULT_STORE_SETTINGS.heroSettings, ...data.settings.heroSettings }
            : DEFAULT_STORE_SETTINGS.heroSettings,
        },
        orders: Array.isArray(data.orders) ? data.orders : [],
        lastUpdated: data.lastUpdated || Date.now(),
        version: (data.version || 1) + 1,
      };
    }
  } catch (err) {
    console.error('Error reading store database file:', err);
  }

  const initialDb: StoreDbStructure = {
    products: INITIAL_PRODUCTS,
    settings: DEFAULT_STORE_SETTINGS,
    orders: [],
    lastUpdated: Date.now(),
    version: 1,
  };
  saveDatabase(initialDb);
  return initialDb;
}

let inMemoryDb: StoreDbStructure = loadDatabase();

// Active SSE Client Connection Pool for Real-Time Synchronization Across Browsers
const sseClients: Set<express.Response> = new Set();

function broadcastStoreUpdate() {
  const payload = JSON.stringify({
    type: 'store_update',
    products: inMemoryDb.products,
    settings: inMemoryDb.settings,
    orders: inMemoryDb.orders,
    version: inMemoryDb.version,
    lastUpdated: inMemoryDb.lastUpdated,
  });

  for (const client of sseClients) {
    try {
      client.write(`data: ${payload}\n\n`);
    } catch (e) {
      sseClients.delete(client);
    }
  }
}

function saveDatabase(db: StoreDbStructure) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    db.lastUpdated = Date.now();
    db.version = (db.version || 0) + 1;
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
    inMemoryDb = db;
    broadcastStoreUpdate();
  } catch (err) {
    console.error('Error saving store database file:', err);
  }
}

async function startServer() {
  // ==================== API ROUTES ====================

  // Ensure no browser/proxy caching for all API endpoints
  app.use('/api', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    next();
  });

  // Real-time Event Stream (Server-Sent Events) for instant multi-device synchronization
  app.get('/api/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    // Send immediate snapshot on connection
    const snapshotPayload = JSON.stringify({
      type: 'store_init',
      products: inMemoryDb.products,
      settings: inMemoryDb.settings,
      orders: inMemoryDb.orders,
      version: inMemoryDb.version,
      lastUpdated: inMemoryDb.lastUpdated,
    });
    res.write(`data: ${snapshotPayload}\n\n`);

    sseClients.add(res);

    // Heartbeat every 25 seconds
    const keepAlive = setInterval(() => {
      try {
        res.write(': heartbeat\n\n');
      } catch (e) {
        clearInterval(keepAlive);
        sseClients.delete(res);
      }
    }, 25000);

    req.on('close', () => {
      clearInterval(keepAlive);
      sseClients.delete(res);
    });
  });
  
  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      storeName: inMemoryDb.settings.storeName,
      productCount: inMemoryDb.products.length,
      orderCount: inMemoryDb.orders.length,
      version: inMemoryDb.version,
      lastUpdated: inMemoryDb.lastUpdated,
      connectedClients: sseClients.size,
    });
  });

  // Get full store data (Products + Settings + Orders)
  app.get('/api/store-data', (req, res) => {
    res.json({
      products: inMemoryDb.products,
      settings: inMemoryDb.settings,
      orders: inMemoryDb.orders,
      version: inMemoryDb.version,
      lastUpdated: inMemoryDb.lastUpdated,
    });
  });

  // ==================== PRODUCTS ====================
  
  app.get('/api/products', (req, res) => {
    res.json(inMemoryDb.products);
  });

  app.post('/api/products', (req, res) => {
    const newProduct = req.body;
    if (!newProduct || !newProduct.name || !newProduct.price) {
      return res.status(400).json({ error: 'Product name and price are required' });
    }
    const productWithId = {
      ...newProduct,
      id: newProduct.id || `vb-${Date.now()}`,
    };
    const updatedProducts = [productWithId, ...inMemoryDb.products.filter(p => p.id !== productWithId.id)];
    inMemoryDb.products = updatedProducts;
    saveDatabase(inMemoryDb);
    res.status(201).json({ success: true, product: productWithId, version: inMemoryDb.version });
  });

  app.put('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const updated = req.body;
    let found = false;
    let finalUpdatedProduct: any = null;
    inMemoryDb.products = inMemoryDb.products.map((p) => {
      if (p.id === id) {
        found = true;
        finalUpdatedProduct = { ...p, ...updated, id };
        return finalUpdatedProduct;
      }
      return p;
    });
    if (!found) {
      finalUpdatedProduct = { ...updated, id };
      inMemoryDb.products.unshift(finalUpdatedProduct);
    }
    saveDatabase(inMemoryDb);
    res.json({ success: true, product: finalUpdatedProduct, version: inMemoryDb.version });
  });

  // Dedicated atomic endpoint to update product images array in database
  app.patch('/api/products/:id/images', (req, res) => {
    const { id } = req.params;
    const { images } = req.body;
    if (!Array.isArray(images)) {
      return res.status(400).json({ error: 'Images array is required' });
    }
    let updatedProduct: any = null;
    inMemoryDb.products = inMemoryDb.products.map((p) => {
      if (p.id === id) {
        updatedProduct = { ...p, images };
        return updatedProduct;
      }
      return p;
    });
    if (updatedProduct) {
      saveDatabase(inMemoryDb);
      return res.json({ success: true, product: updatedProduct, version: inMemoryDb.version });
    }
    return res.status(404).json({ error: 'Product not found' });
  });

  app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    inMemoryDb.products = inMemoryDb.products.filter((p) => p.id !== id);
    saveDatabase(inMemoryDb);
    res.json({ success: true, id, version: inMemoryDb.version });
  });

  // ==================== STORE SETTINGS, CATEGORIES & FEATURED DROP ====================

  app.get('/api/categories', (req, res) => {
    res.json(inMemoryDb.settings.categories || DEFAULT_STORE_SETTINGS.categories);
  });

  app.put('/api/categories', (req, res) => {
    const { categories } = req.body;
    if (Array.isArray(categories)) {
      inMemoryDb.settings = {
        ...inMemoryDb.settings,
        categories,
      };
      saveDatabase(inMemoryDb);
      return res.json({ success: true, categories: inMemoryDb.settings.categories, version: inMemoryDb.version });
    }
    res.status(400).json({ error: 'Categories array required' });
  });

  app.get('/api/settings', (req, res) => {
    res.json(inMemoryDb.settings);
  });

  app.put('/api/settings', (req, res) => {
    const newSettings = req.body;
    inMemoryDb.settings = {
      ...inMemoryDb.settings,
      ...newSettings,
      featuredDrop: newSettings.featuredDrop !== undefined ? newSettings.featuredDrop : (inMemoryDb.settings.featuredDrop || DEFAULT_FEATURED_DROP),
      heroSettings: newSettings.heroSettings !== undefined ? newSettings.heroSettings : inMemoryDb.settings.heroSettings,
    };
    saveDatabase(inMemoryDb);
    res.json({ success: true, settings: inMemoryDb.settings, version: inMemoryDb.version });
  });

  // ==================== ORDERS ====================

  app.get('/api/orders', (req, res) => {
    res.json(inMemoryDb.orders);
  });

  app.post('/api/orders', (req, res) => {
    const newOrder = req.body;
    if (!newOrder || !newOrder.orderNumber || !newOrder.items) {
      return res.status(400).json({ error: 'Valid order data is required' });
    }
    inMemoryDb.orders = [newOrder, ...inMemoryDb.orders];
    saveDatabase(inMemoryDb);
    res.status(201).json({ success: true, order: newOrder, version: inMemoryDb.version });
  });

  app.patch('/api/orders/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    inMemoryDb.orders = inMemoryDb.orders.map((o) =>
      o.id === id ? { ...o, status } : o
    );
    saveDatabase(inMemoryDb);
    res.json({ success: true, id, status, version: inMemoryDb.version });
  });

  app.delete('/api/orders/:id', (req, res) => {
    const { id } = req.params;
    inMemoryDb.orders = inMemoryDb.orders.filter((o) => o.id !== id);
    saveDatabase(inMemoryDb);
    res.json({ success: true, id, version: inMemoryDb.version });
  });

  // ==================== RESET ====================

  app.post('/api/reset', (req, res) => {
    inMemoryDb = {
      products: INITIAL_PRODUCTS,
      settings: DEFAULT_STORE_SETTINGS,
      orders: [],
      lastUpdated: Date.now(),
      version: (inMemoryDb.version || 0) + 1,
    };
    saveDatabase(inMemoryDb);
    res.json({ success: true, storeData: inMemoryDb });
  });

  // ==================== VITE & STATIC SERVING ====================

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Vorbox Store server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
