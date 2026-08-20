import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Product, CartItem, Order, StoreSettings } from './types';
import { INITIAL_PRODUCTS, DEFAULT_STORE_SETTINGS, DEFAULT_CATEGORIES } from './data/defaultData';
import { api } from './services/api';
import { TopNoticeBar } from './components/TopNoticeBar';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CategoryFilters } from './components/CategoryFilters';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { QuickOrderModal } from './components/QuickOrderModal';
import { SizeGuideModal } from './components/SizeGuideModal';
import { AdminModal } from './components/AdminModal';
import { Footer } from './components/Footer';
import { FloatingWhatsAppWidget } from './components/FloatingWhatsAppWidget';
import { ShoppingBag, Truck, ShieldCheck, RefreshCw } from 'lucide-react';

export default function App() {
  // 1. Settings State (Loaded directly from central database/API, default baseline initial)
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);

  // 2. Products State (Loaded directly from central database/API)
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);

  // 3. User-Specific Cart State (Strictly Local Browser Storage Only - Never synced to backend)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('crownborn_cart') || localStorage.getItem('vbox_cart');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading private local cart:', e);
    }
    return [];
  });

  // 4. Orders State (Real customer orders only)
  const [orders, setOrders] = useState<Order[]>([]);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('All Collections');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'name'>('featured');

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [quickOrderProduct, setQuickOrderProduct] = useState<Product | null>(null);
  const [quickOrderMode, setQuickOrderMode] = useState<'place_order' | 'add_to_bag'>('place_order');
  const [quickOrderInitialSize, setQuickOrderInitialSize] = useState<'S' | 'M' | 'L' | 'XL' | 'XXL' | undefined>();
  const [quickOrderInitialColor, setQuickOrderInitialColor] = useState<{ name: string; hex: string } | undefined>();
  const [quickOrderInitialQuantity, setQuickOrderInitialQuantity] = useState<number>(1);
  const [quickOrderInitialStep, setQuickOrderInitialStep] = useState<1 | 2>(1);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const productSectionRef = useRef<HTMLDivElement>(null);
  const isSyncingRef = useRef(false);

  // Clean up any legacy settings/products from localStorage so visitor browsers NEVER see stale local overrides
  useEffect(() => {
    try {
      localStorage.removeItem('crownborn_settings');
      localStorage.removeItem('crownborn_products');
      localStorage.removeItem('crownborn_orders');
      localStorage.removeItem('vbox_settings');
      localStorage.removeItem('vbox_products');
      localStorage.removeItem('vbox_orders');
      localStorage.removeItem('vorbox_settings');
      localStorage.removeItem('vorbox_products');
      localStorage.removeItem('vorbox_orders');
    } catch (e) {
      // ignore
    }
  }, []);

  // Sync ONLY user-specific shopping cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('crownborn_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Error saving local cart:', e);
    }
  }, [cart]);

  // Real-time multi-device synchronization engine
  const fetchLatestStoreData = useCallback(async () => {
    if (isSyncingRef.current) return;
    try {
      isSyncingRef.current = true;
      const data = await api.getStoreData();
      if (data) {
        if (Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
        }
        if (data.settings) {
          setSettings((prev) => ({
            ...prev,
            ...data.settings,
            adminPassword: data.settings.adminPassword || prev.adminPassword,
            heroSettings: data.settings.heroSettings || prev.heroSettings,
            featuredDrop: data.settings.featuredDrop || prev.featuredDrop,
          }));
        }
        if (Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
      }
    } catch (err) {
      console.warn('Sync poll error:', err);
    } finally {
      isSyncingRef.current = false;
    }
  }, []);

  // Sync on initial mount + live real-time SSE listener + background polling across all visitor devices
  useEffect(() => {
    // 1. Initial snapshot load
    fetchLatestStoreData();

    // 2. Real-time Server-Sent Events (instant global update when admin saves in any browser)
    const unsubscribeSSE = api.subscribeToStoreUpdates((syncData) => {
      if (!syncData) return;
      if (syncData.settings) {
        setSettings((prev) => ({
          ...prev,
          ...syncData.settings,
          adminPassword: syncData.settings.adminPassword || prev.adminPassword,
          heroSettings: syncData.settings.heroSettings || prev.heroSettings,
          featuredDrop: syncData.settings.featuredDrop || prev.featuredDrop,
        }));
      }
      if (Array.isArray(syncData.products) && syncData.products.length > 0) {
        setProducts(syncData.products);
      }
      if (Array.isArray(syncData.orders)) {
        setOrders(syncData.orders);
      }
    });

    // 3. Fallback background polling every 2.5 seconds
    const interval = setInterval(() => {
      fetchLatestStoreData();
    }, 2500);

    // 4. Instant sync on window focus or tab visibility change
    const onVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        fetchLatestStoreData();
      }
    };
    window.addEventListener('focus', onVisibilityOrFocus);
    document.addEventListener('visibilitychange', onVisibilityOrFocus);

    return () => {
      unsubscribeSSE();
      clearInterval(interval);
      window.removeEventListener('focus', onVisibilityOrFocus);
      document.removeEventListener('visibilitychange', onVisibilityOrFocus);
    };
  }, [fetchLatestStoreData]);

  // Cart operations
  const handleAddToCart = (
    product: Product,
    size: 'S' | 'M' | 'L' | 'XL' | 'XXL',
    color: { name: string; hex: string },
    quantity: number = 1
  ) => {
    const comboId = `${product.id}-${size}-${color.name}`;
    setCart((prev) => {
      const existing = prev.find((item) => item.id === comboId);
      if (existing) {
        return prev.map((item) =>
          item.id === comboId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [
        ...prev,
        {
          id: comboId,
          productId: product.id,
          product,
          selectedSize: size,
          selectedColor: color,
          quantity,
        },
      ];
    });
  };

  const handleUpdateQuantity = (comboId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === comboId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveFromCart = (comboId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== comboId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Open Variant Modal for "Add to Bag"
  const handleOpenAddToBagModal = (
    product: Product,
    size?: 'S' | 'M' | 'L' | 'XL' | 'XXL',
    color?: { name: string; hex: string }
  ) => {
    setQuickOrderMode('add_to_bag');
    setQuickOrderProduct(product);
    setQuickOrderInitialSize(size || product.sizes[0] || 'M');
    setQuickOrderInitialColor(color || product.colors[0] || { name: 'Standard', hex: '#111' });
    setQuickOrderInitialQuantity(1);
    setQuickOrderInitialStep(1);
  };

  // Open Quick Order from ProductCard "Place Order" (Step 1: Choose Variant -> Step 2 Delivery)
  const handleOpenQuickOrder = (
    product: Product,
    size?: 'S' | 'M' | 'L' | 'XL' | 'XXL',
    color?: { name: string; hex: string }
  ) => {
    setQuickOrderMode('place_order');
    setQuickOrderProduct(product);
    setQuickOrderInitialSize(size || product.sizes[0] || 'M');
    setQuickOrderInitialColor(color || product.colors[0] || { name: 'Standard', hex: '#111' });
    setQuickOrderInitialQuantity(1);
    setQuickOrderInitialStep(1); // Starts at Step 1: Variant Selection
  };

  // Open Quick Order from ProductModal "Place Order (Cash on Delivery)" (Step 2: Delivery Details)
  const handleBuyNowFromModal = (
    product: Product,
    size: 'S' | 'M' | 'L' | 'XL' | 'XXL',
    color: { name: string; hex: string },
    quantity: number
  ) => {
    setSelectedProduct(null);
    setQuickOrderMode('place_order');
    setQuickOrderProduct(product);
    setQuickOrderInitialSize(size);
    setQuickOrderInitialColor(color);
    setQuickOrderInitialQuantity(quantity);
    setQuickOrderInitialStep(2); // Directly opens Step 2: Delivery Details
  };

  // Quick Order Submission (saves order to backend and navigates to WhatsApp)
  const handleQuickOrderSuccess = async (order: Order) => {
    setOrders((prev) => [order, ...prev]);
    setQuickOrderProduct(null);
    await api.createOrder(order);
  };

  // Cart Drawer Checkout submission (clears persistent cart, saves order, navigates to WhatsApp)
  const handleCartOrderSuccess = async (order: Order) => {
    setOrders((prev) => [order, ...prev]);
    setCart([]);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    await api.createOrder(order);
  };

  // Admin order status update
  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    await api.updateOrderStatus(orderId, status);
  };

  const handleDeleteOrder = async (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    await api.deleteOrder(orderId);
  };

  // Admin product operations
  const handleAddProduct = async (newProd: Product) => {
    setProducts((prev) => [newProd, ...prev]);
    await api.createProduct(newProd);
    await fetchLatestStoreData();
  };

  const handleUpdateProduct = async (updatedProd: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProd.id ? updatedProd : p))
    );
    await api.updateProduct(updatedProd);
    await fetchLatestStoreData();
  };

  const handleDeleteProduct = async (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    await api.deleteProduct(productId);
    await fetchLatestStoreData();
  };

  const handleUpdateSettings = async (newSettings: StoreSettings) => {
    setSettings(newSettings);
    await api.updateSettings(newSettings);
    await fetchLatestStoreData();
  };

  const handleResetDemoData = async () => {
    setProducts(INITIAL_PRODUCTS);
    setSettings(DEFAULT_STORE_SETTINGS);
    setOrders([]);
    setCart([]);
    localStorage.removeItem('crownborn_cart');
    localStorage.removeItem('vbox_cart');
    await api.resetStoreData();
    await fetchLatestStoreData();
  };

  // Dynamic Categories derived from settings
  const dynamicCategories = useMemo(() => {
    const customList = settings.categories && settings.categories.length > 0 ? settings.categories : DEFAULT_CATEGORIES;
    return ['All Collections', ...customList];
  }, [settings.categories]);

  // Filtered and Sorted products list
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category filter
        if (selectedCategory !== 'All Collections') {
          if (p.category !== selectedCategory) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        // Featured default
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
      });
  }, [products, selectedCategory, sortBy]);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div id="crownborn-app-root" className="min-h-screen min-h-[100dvh] w-full m-0 p-0 overflow-x-hidden bg-neutral-50 text-neutral-900 font-sans flex flex-col selection:bg-neutral-900 selection:text-white relative">
      {/* 1. Top Notice Announcement */}
      <TopNoticeBar settings={settings} />

      {/* 2. Main Navigation Bar */}
      <Navbar
        settings={settings}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
      />

      {/* 3. Hero Showcase Section */}
      <HeroSection
        settings={settings}
        onExploreClick={() => {
          productSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* 4. Products Catalog Section */}
      <main id="catalog-section" ref={productSectionRef} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Category Filters and Sorting */}
        <CategoryFilters
          categories={dynamicCategories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          sortBy={sortBy}
          onSortChange={setSortBy}
          totalCount={filteredProducts.length}
        />

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-neutral-200 mt-6">
            <ShoppingBag className="w-12 h-12 text-neutral-300 mx-auto" />
            <h3 className="text-base font-bold text-neutral-800">No clothing items in this category</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Please select another category or view all collections.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All Collections');
              }}
              className="px-4 py-2 bg-neutral-900 text-white rounded-full text-xs font-semibold hover:bg-neutral-800 transition-colors"
            >
              View All Collections
            </button>
          </div>
        ) : (
          <div id="product-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 mt-8">
            {filteredProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                settings={settings}
                cart={cart}
                onOpenProductModal={(p) => setSelectedProduct(p)}
                onOpenAddToBag={(p, sz, clr) => handleOpenAddToBagModal(p, sz, clr)}
                onRemoveFromCart={handleRemoveFromCart}
                onPlaceOrder={(p, sz, clr) => handleOpenQuickOrder(p, sz, clr)}
              />
            ))}
          </div>
        )}

        {/* Local Trust Banner */}
        <section id="trust-banner" className="mt-16 bg-neutral-900 text-white rounded-3xl p-6 sm:p-10 relative overflow-hidden border border-neutral-800">
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-center text-left">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-emerald-400 shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base font-mono">Fast Delivery</h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Swift doorstep delivery to your home or office with Fast Delivery.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base font-mono">100% Cash on Delivery</h4>
                <p className="text-xs text-neutral-400 mt-1">
                  No online payment card needed. Pay cash directly to the delivery rider upon inspecting your fit.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-emerald-400 shrink-0">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base font-mono">Direct WhatsApp Support</h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Got sizing doubts or need custom adjustments? Chat directly with our support team in seconds.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 5. Footer */}
      <Footer
        settings={settings}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* 6. Floating WhatsApp Button */}
      <FloatingWhatsAppWidget settings={settings} />

      {/* 7. Product Modal (Details, Gallery, Specs) */}
      <ProductModal
        product={selectedProduct}
        settings={settings}
        cart={cart}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(p, sz, clr, qty) => handleAddToCart(p, sz, clr, qty)}
        onRemoveFromCart={handleRemoveFromCart}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        onBuyNowCOD={handleBuyNowFromModal}
      />

      {/* 8. Cart Slide-Over Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        settings={settings}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* 9. Checkout Modal (Cart Drawer COD Checkout) */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        settings={settings}
        onOrderSuccess={handleCartOrderSuccess}
      />

      {/* 10. Quick Order 2-Step Modal (Variant Selection -> Delivery Info -> WhatsApp) */}
      <QuickOrderModal
        isOpen={!!quickOrderProduct}
        onClose={() => setQuickOrderProduct(null)}
        product={quickOrderProduct}
        mode={quickOrderMode}
        initialSize={quickOrderInitialSize}
        initialColor={quickOrderInitialColor}
        initialQuantity={quickOrderInitialQuantity}
        initialStep={quickOrderInitialStep}
        settings={settings}
        onOrderSuccess={handleQuickOrderSuccess}
        onAddToCart={(p, sz, clr, qty) => handleAddToCart(p, sz, clr, qty)}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
      />

      {/* 11. Bangladeshi Standard Size Guide Modal */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />

      {/* 12. Admin Store Manager Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onResetDemoData={handleResetDemoData}
      />
    </div>
  );
}
