import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Product, CartItem, Order, StoreSettings } from './types';
import { INITIAL_PRODUCTS, DEFAULT_STORE_SETTINGS } from './data/defaultData';
import { TopNoticeBar } from './components/TopNoticeBar';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CategoryFilters } from './components/CategoryFilters';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { SizeGuideModal } from './components/SizeGuideModal';
import { AdminModal } from './components/AdminModal';
import { Footer } from './components/Footer';
import { FloatingWhatsAppWidget } from './components/FloatingWhatsAppWidget';
import { ShoppingBag, Truck, ShieldCheck, RefreshCw } from 'lucide-react';

const CATEGORIES = [
  'All Collections',
  'T-Shirts',
  'Polos',
  'Panjabis',
  'Hoodies & Sweats',
  'Pants & Bottoms',
];

export default function App() {
  // 1. Settings State
  const [settings, setSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('vorbox_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_STORE_SETTINGS,
          ...parsed,
          adminPassword: parsed.adminPassword || DEFAULT_STORE_SETTINGS.adminPassword,
        };
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_STORE_SETTINGS;
  });

  // 2. Products State
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('vorbox_products');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_PRODUCTS;
  });

  // 3. Cart State
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('vorbox_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  // 4. Orders State (Real customer orders only)
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('vorbox_orders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('All Collections');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'name'>('featured');

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const productSectionRef = useRef<HTMLDivElement>(null);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('vorbox_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('vorbox_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('vorbox_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('vorbox_orders', JSON.stringify(orders));
  }, [orders]);

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

  const handleBuyNowCOD = (
    product: Product,
    size: 'S' | 'M' | 'L' | 'XL' | 'XXL',
    color: { name: string; hex: string },
    quantity: number
  ) => {
    handleAddToCart(product, size, color, quantity);
    setSelectedProduct(null);
    setIsCheckoutOpen(true);
  };

  // Order submission
  const handleOrderSuccess = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
    setCart([]);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setConfirmedOrder(order);
  };

  // Admin order status update
  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  // Admin product operations
  const handleAddProduct = (newProd: Product) => {
    setProducts((prev) => [newProd, ...prev]);
  };

  const handleUpdateProduct = (updatedProd: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProd.id ? updatedProd : p))
    );
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleResetDemoData = () => {
    setProducts(INITIAL_PRODUCTS);
    setSettings(DEFAULT_STORE_SETTINGS);
    setOrders([]);
    setCart([]);
    localStorage.removeItem('vorbox_products');
    localStorage.removeItem('vorbox_settings');
    localStorage.removeItem('vorbox_orders');
    localStorage.removeItem('vorbox_cart');
  };

  // Filtered and Sorted products list
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category filter
        if (selectedCategory !== 'All Collections') {
          if (selectedCategory === 'Hoodies & Sweats' && p.category !== 'Hoodies & Sweats') return false;
          if (selectedCategory === 'Pants & Bottoms' && p.category !== 'Pants & Bottoms') return false;
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
    <div id="vorbox-app-root" className="min-h-screen w-full max-w-full overflow-x-hidden bg-neutral-50 text-neutral-900 font-sans flex flex-col selection:bg-neutral-900 selection:text-white relative">
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
        onFeaturedDropClick={() => {
          if (settings.featuredDrop?.productId) {
            const matched = products.find((p) => p.id === settings.featuredDrop?.productId);
            if (matched) {
              setSelectedProduct(matched);
              return;
            }
          }
          productSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* 4. Products Catalog Section */}
      <main id="catalog-section" ref={productSectionRef} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Category Filters and Sorting */}
        <CategoryFilters
          categories={CATEGORIES}
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
                onOpenProductModal={(p) => setSelectedProduct(p)}
                onQuickAddToCart={(p, sz, clr) => handleAddToCart(p, sz, clr, 1)}
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
                <h4 className="font-bold text-sm sm:text-base font-mono">Fast 12h Dispatch</h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Swift doorstep delivery to your home or office within 12 hours.
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
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(p, sz, clr, qty) => handleAddToCart(p, sz, clr, qty)}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        onBuyNowCOD={handleBuyNowCOD}
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

      {/* 9. Checkout Modal (COD with location picker) */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        settings={settings}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* 10. Order Confirmation Modal */}
      <OrderConfirmationModal
        order={confirmedOrder}
        settings={settings}
        onClose={() => setConfirmedOrder(null)}
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
        orders={orders}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        onDeleteOrder={handleDeleteOrder}
        products={products}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        settings={settings}
        onUpdateSettings={(newSettings) => setSettings(newSettings)}
        onResetDemoData={handleResetDemoData}
      />
    </div>
  );
}
