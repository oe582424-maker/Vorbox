import React, { useState } from 'react';
import {
  X,
  Package,
  Settings,
  ShoppingBag,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  MessageCircle,
  Phone,
  Download,
  RotateCcw,
  Save,
  Truck,
  Lock,
  Unlock,
  KeyRound,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Upload,
  Layers,
  Sparkles,
  ExternalLink,
  Search,
  Check,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { Order, Product, StoreSettings, FeaturedDrop } from '../types';
import { DEFAULT_FEATURED_DROP } from '../data/defaultData';
import { formatBDT, cleanPhoneForWhatsApp } from '../utils/helpers';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  onDeleteOrder: (orderId: string) => void;
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  settings: StoreSettings;
  onUpdateSettings: (settings: StoreSettings) => void;
  onResetDemoData: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  orders,
  onUpdateOrderStatus,
  onDeleteOrder,
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  settings,
  onUpdateSettings,
  onResetDemoData,
}) => {
  if (!isOpen) return null;

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('vorbox_admin_auth') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  // Tab & Filter States
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'featureddrop' | 'settings'>('orders');
  const [orderFilter, setOrderFilter] = useState<'all' | Order['status']>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');

  // Store settings form state
  const [formSettings, setFormSettings] = useState<StoreSettings>(settings);
  const [savedSettingsNotice, setSavedSettingsNotice] = useState(false);

  // Featured Drop form state
  const [featuredDropForm, setFeaturedDropForm] = useState<FeaturedDrop>(() => {
    return settings.featuredDrop || DEFAULT_FEATURED_DROP;
  });
  const [featuredDropImageUrlInput, setFeaturedDropImageUrlInput] = useState('');
  const [showDeleteDropConfirm, setShowDeleteDropConfirm] = useState(false);
  const [savedDropNotice, setSavedDropNotice] = useState(false);

  // Admin password change state
  const [currentPasswordConfirm, setCurrentPasswordConfirm] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);
  const [passwordChangeError, setPasswordChangeError] = useState('');

  // Product form modal state
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productToDeleteId, setProductToDeleteId] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [newFeatureInput, setNewFeatureInput] = useState('');
  const [newImageUrlInput, setNewImageUrlInput] = useState('');
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#111111');

  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '',
    category: 'T-Shirts',
    price: 550,
    originalPrice: 700,
    description: '',
    fabric: '100% Combed Cotton',
    gsm: '220 GSM',
    images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80'],
    sizes: ['M', 'L', 'XL'],
    colors: [
      { name: 'Onyx Black', hex: '#111111' },
      { name: 'Pure White', hex: '#fafaf9' },
    ],
    inStock: true,
    featured: true,
    tag: 'Best Seller',
    features: ['220 GSM 100% Combed Cotton', 'Pre-shrunk finish', 'Reinforced neck ribbing'],
  });

  const correctPassword = settings.adminPassword || 'akm125@#155Ab12*';

  // Handle Admin Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === correctPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem('crownborn_admin_auth', 'true');
      setAuthError('');
    } else {
      setAuthError('Incorrect admin password. Please check and try again.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('crownborn_admin_auth');
    sessionStorage.removeItem('vbox_admin_auth');
    sessionStorage.removeItem('vorbox_admin_auth');
    setPasswordInput('');
  };

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = orderFilter === 'all' || o.status === orderFilter;
    const matchesSearch =
      !orderSearchQuery ||
      o.orderNumber.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      o.customerPhone.includes(orderSearchQuery) ||
      o.deliveryArea.toLowerCase().includes(orderSearchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formSettings);
    setSavedSettingsNotice(true);
    setTimeout(() => setSavedSettingsNotice(false), 2500);
  };

  const handlePasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeError('');
    setPasswordChangeSuccess(false);

    if (currentPasswordConfirm !== correctPassword) {
      setPasswordChangeError('Current password is wrong.');
      return;
    }
    if (!newAdminPassword || newAdminPassword.length < 6) {
      setPasswordChangeError('New password must be at least 6 characters long.');
      return;
    }

    const updated = {
      ...formSettings,
      adminPassword: newAdminPassword,
    };
    setFormSettings(updated);
    onUpdateSettings(updated);
    setCurrentPasswordConfirm('');
    setNewAdminPassword('');
    setPasswordChangeSuccess(true);
    setTimeout(() => setPasswordChangeSuccess(false), 3000);
  };

  // Featured Drop Handlers
  const handleSaveFeaturedDrop = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updatedSettings: StoreSettings = {
      ...formSettings,
      featuredDrop: featuredDropForm,
    };
    setFormSettings(updatedSettings);
    onUpdateSettings(updatedSettings);
    setSavedDropNotice(true);
    setTimeout(() => setSavedDropNotice(false), 2500);
  };

  const handleDeleteFeaturedDrop = () => {
    const updatedDrop: FeaturedDrop = {
      ...featuredDropForm,
      enabled: false,
    };
    setFeaturedDropForm(updatedDrop);
    const updatedSettings: StoreSettings = {
      ...formSettings,
      featuredDrop: updatedDrop,
    };
    setFormSettings(updatedSettings);
    onUpdateSettings(updatedSettings);
    setShowDeleteDropConfirm(false);
    setSavedDropNotice(true);
    setTimeout(() => setSavedDropNotice(false), 2500);
  };

  const handleEnableFeaturedDrop = () => {
    const updatedDrop: FeaturedDrop = {
      ...featuredDropForm,
      enabled: true,
    };
    setFeaturedDropForm(updatedDrop);
    const updatedSettings: StoreSettings = {
      ...formSettings,
      featuredDrop: updatedDrop,
    };
    setFormSettings(updatedSettings);
    onUpdateSettings(updatedSettings);
    setSavedDropNotice(true);
    setTimeout(() => setSavedDropNotice(false), 2500);
  };

  const handleSelectProductForDrop = (prodId: string) => {
    const selectedProd = products.find((p) => p.id === prodId);
    if (!selectedProd) return;
    setFeaturedDropForm((prev) => ({
      ...prev,
      enabled: true,
      title: selectedProd.name,
      price: selectedProd.price,
      originalPrice: selectedProd.originalPrice || undefined,
      subtitle: selectedProd.gsm ? `${selectedProd.gsm} ${selectedProd.fabric}` : selectedProd.fabric || '100% Combed Cotton',
      image: selectedProd.images[0] || prev.image,
      productId: selectedProd.id,
      badgeText: prev.badgeText || 'Featured Drop',
    }));
  };

  const handleFeaturedDropImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const result = loadEvt.target?.result as string;
      if (result) {
        setFeaturedDropForm((prev) => ({ ...prev, image: result }));
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAddFeaturedDropImageUrl = () => {
    if (!featuredDropImageUrlInput.trim()) return;
    setFeaturedDropForm((prev) => ({ ...prev, image: featuredDropImageUrlInput.trim() }));
    setFeaturedDropImageUrlInput('');
  };

  // Product Spec & Pic Helpers
  const handleAddFeature = () => {
    if (!newFeatureInput.trim()) return;
    setProductForm({
      ...productForm,
      features: [...(productForm.features || []), newFeatureInput.trim()],
    });
    setNewFeatureInput('');
  };

  const handleRemoveFeature = (index: number) => {
    const updated = (productForm.features || []).filter((_, i) => i !== index);
    setProductForm({ ...productForm, features: updated });
  };

  const handleAddImageUrl = () => {
    if (!newImageUrlInput.trim()) return;
    setProductForm({
      ...productForm,
      images: [...(productForm.images || []), newImageUrlInput.trim()],
    });
    setNewImageUrlInput('');
  };

  const handleRemoveImage = (index: number) => {
    const updated = (productForm.images || []).filter((_, i) => i !== index);
    setProductForm({ ...productForm, images: updated });
  };

  const handleSetPrimaryImage = (index: number) => {
    const currentImages = [...(productForm.images || [])];
    if (index === 0 || index >= currentImages.length) return;
    const selected = currentImages.splice(index, 1)[0];
    currentImages.unshift(selected);
    setProductForm({ ...productForm, images: currentImages });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setProductForm({
          ...productForm,
          images: [event.target.result, ...(productForm.images || [])],
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleToggleSize = (size: 'S' | 'M' | 'L' | 'XL' | 'XXL') => {
    const currentSizes = productForm.sizes || ['M', 'L', 'XL'];
    if (currentSizes.includes(size)) {
      if (currentSizes.length === 1) return; // keep at least one size
      setProductForm({ ...productForm, sizes: currentSizes.filter((s) => s !== size) });
    } else {
      setProductForm({ ...productForm, sizes: [...currentSizes, size] });
    }
  };

  const handleAddColor = () => {
    if (!newColorName.trim()) return;
    const currentColors = productForm.colors || [];
    setProductForm({
      ...productForm,
      colors: [...currentColors, { name: newColorName.trim(), hex: newColorHex }],
    });
    setNewColorName('');
    setNewColorHex('#111111');
  };

  const handleRemoveColor = (index: number) => {
    const currentColors = productForm.colors || [];
    if (currentColors.length === 1) return; // keep at least 1
    setProductForm({
      ...productForm,
      colors: currentColors.filter((_, i) => i !== index),
    });
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price) return;

    if (editingProductId) {
      onUpdateProduct({
        ...(productForm as Product),
        id: editingProductId,
      });
      setEditingProductId(null);
    } else {
      const newProd: Product = {
        id: `vb-${Date.now().toString().slice(-5)}`,
        name: productForm.name || 'New Clothing Item',
        category: productForm.category || 'T-Shirts',
        price: Number(productForm.price) || 500,
        originalPrice: productForm.originalPrice ? Number(productForm.originalPrice) : undefined,
        description: productForm.description || `Premium minimalist wear tailored for everyday comfort in ${settings.city}.`,
        features: productForm.features?.length ? productForm.features : ['100% Combed Cotton', 'Pre-shrunk', 'Regular fit'],
        fabric: productForm.fabric || '100% Combed Cotton',
        gsm: productForm.gsm || '220 GSM',
        images: productForm.images?.length ? productForm.images : ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80'],
        sizes: productForm.sizes?.length ? productForm.sizes : ['M', 'L', 'XL'],
        colors: productForm.colors?.length ? productForm.colors : [{ name: 'Black', hex: '#111' }],
        inStock: productForm.inStock ?? true,
        featured: productForm.featured ?? false,
        tag: productForm.tag,
      };
      onAddProduct(newProd);
    }
    setIsAddingProduct(false);
  };

  const startEditProduct = (prod: Product) => {
    setProductForm({ ...prod });
    setEditingProductId(prod.id);
    setIsAddingProduct(true);
  };

  const exportOrdersCSV = () => {
    const headers = ['OrderID', 'CustomerName', 'Phone', 'Area', 'Address', 'Items', 'TotalAmount', 'Status', 'CreatedAt'];
    const rows = orders.map((o) => [
      o.orderNumber,
      `"${o.customerName.replace(/"/g, '""')}"`,
      o.customerPhone,
      `"${o.deliveryArea.replace(/"/g, '""')}"`,
      `"${o.deliveryAddress.replace(/"/g, '""')}"`,
      `"${o.items.map((i) => `${i.productName} (${i.size}, ${i.color}, x${i.quantity})`).join('; ')}"`,
      o.totalAmount,
      o.status,
      o.createdAt,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `crownborn_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const testWhatsAppUrl = `https://wa.me/${cleanPhoneForWhatsApp(formSettings.whatsappNumber)}?text=${encodeURIComponent(
    `Hello! This is a test message from CrownBorn Admin Portal for ${formSettings.storeName} in ${formSettings.city}.`
  )}`;

  return (
    <div id="admin-modal-backdrop" className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto" onClick={onClose}>
      <div
        id="admin-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-4xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col relative"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-emerald-400">
              {isAuthenticated ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black font-mono tracking-tight">{settings.storeName} Merchant Portal</h2>
                {isAuthenticated && (
                  <>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Authorized
                    </span>
                    <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono text-emerald-300 bg-neutral-900 border border-emerald-500/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Live Multi-Device Sync</span>
                    </span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-neutral-400">
                {isAuthenticated
                  ? `Control products, pictures, specs, orders & WhatsApp number for ${settings.city}`
                  : 'Enter password to access merchant controls & settings'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold border border-neutral-700 transition-colors"
                title="Lock admin session"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Lock / Sign Out</span>
              </button>
            )}

            <button
              id="close-admin-modal-btn"
              type="button"
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* -------------------- LOGIN SCREEN (WHEN NOT AUTHENTICATED) -------------------- */}
        {!isAuthenticated ? (
          <div className="p-6 sm:p-10 flex flex-col items-center justify-center max-w-md mx-auto my-auto text-center space-y-6 w-full">
            <div className="w-16 h-16 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-900 shadow-xs">
              <KeyRound className="w-8 h-8 text-neutral-800" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-neutral-950 font-mono">Admin Login Required</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Please enter your store password to manage products, pictures, specs, customer orders, and store settings.
              </p>
            </div>

            <form onSubmit={handleLogin} className="w-full space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Store Admin Password
                </label>
                <div className="relative">
                  <input
                    id="admin-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      if (authError) setAuthError('');
                    }}
                    placeholder="Enter admin password..."
                    className="w-full pl-3.5 pr-10 py-2.5 text-sm bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-neutral-900 transition-all font-mono"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {authError && (
                  <p className="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{authError}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold rounded-xl transition-colors text-center"
                >
                  Cancel
                </button>

                <button
                  id="admin-login-submit-btn"
                  type="submit"
                  className="flex-2 py-2.5 px-4 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Unlock Admin Portal</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* -------------------- AUTHENTICATED ADMIN PORTAL -------------------- */
          <>
            {/* Tab Navigation */}
            <div className="p-3 sm:px-6 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                <button
                  id="admin-tab-orders"
                  onClick={() => {
                    setActiveTab('orders');
                    setIsAddingProduct(false);
                  }}
                  className={`px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'orders' ? 'bg-neutral-900 text-white shadow-xs' : 'text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>COD & WhatsApp Orders</span>
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-neutral-700 text-white">
                    {orders.length}
                  </span>
                </button>

                <button
                  id="admin-tab-products"
                  onClick={() => setActiveTab('products')}
                  className={`px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'products' ? 'bg-neutral-900 text-white shadow-xs' : 'text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Products & Specs</span>
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-neutral-200 text-neutral-800 font-bold">
                    {products.length}
                  </span>
                </button>

                <button
                  id="admin-tab-featureddrop"
                  onClick={() => {
                    setActiveTab('featureddrop');
                    setIsAddingProduct(false);
                  }}
                  className={`px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'featureddrop' ? 'bg-neutral-900 text-white shadow-xs' : 'text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Featured Drop</span>
                  {featuredDropForm.enabled ? (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-emerald-500 text-white font-bold">
                      Live
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-neutral-300 text-neutral-600 font-medium">
                      Off
                    </span>
                  )}
                </button>

                <button
                  id="admin-tab-settings"
                  onClick={() => {
                    setActiveTab('settings');
                    setIsAddingProduct(false);
                  }}
                  className={`px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'settings' ? 'bg-neutral-900 text-white shadow-xs' : 'text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Store & WhatsApp Settings</span>
                </button>
              </div>

              {activeTab === 'orders' && orders.length > 0 && (
                <button
                  onClick={exportOrdersCSV}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 px-3 py-1.5 rounded-lg hover:bg-neutral-50 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" /> <span>Export CSV</span>
                </button>
              )}
            </div>

            {/* ==================== TAB 1: ORDERS VIEW ==================== */}
            {activeTab === 'orders' && (
              <div className="p-4 sm:p-6 overflow-y-auto space-y-4 max-h-[70vh]">
                {/* Filter and Search Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                    {(['all', 'Pending', 'Confirmed', 'Dispatched', 'Delivered', 'Cancelled'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => setOrderFilter(st)}
                        className={`px-3 py-1 text-xs font-semibold rounded-full capitalize whitespace-nowrap transition-colors ${
                          orderFilter === st
                            ? 'bg-neutral-900 text-white'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        {st} {st !== 'all' && `(${orders.filter((o) => o.status === st).length})`}
                      </button>
                    ))}
                  </div>

                  <div className="relative min-w-[200px]">
                    <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                      placeholder="Search name, phone, area..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                    />
                  </div>
                </div>

                {filteredOrders.length === 0 ? (
                  <div className="text-center py-12 bg-neutral-50 rounded-2xl border border-neutral-200 text-neutral-500 text-xs">
                    <Package className="w-10 h-10 mx-auto text-neutral-300 mb-2" />
                    <p className="font-semibold text-sm text-neutral-700">No orders match your filter</p>
                    <p className="mt-1">When customers place COD orders or contact via WhatsApp, orders are recorded here.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredOrders.map((ord) => {
                      const customerCleanPhone = cleanPhoneForWhatsApp(ord.customerPhone);
                      const whatsappCustomerChat = `https://wa.me/${customerCleanPhone}?text=${encodeURIComponent(
                        `Hello ${ord.customerName}! We received your Vorbox COD order (${ord.orderNumber}). Current Status: ${ord.status}. Delivery Address: ${ord.deliveryAddress}, ${ord.deliveryArea}. Total Cash to Collect: ${formatBDT(ord.totalAmount)}.`
                      )}`;

                      return (
                        <div
                          key={ord.id}
                          className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs space-y-3 hover:border-neutral-400 transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-2.5">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-black text-sm text-neutral-900">{ord.orderNumber}</span>
                                <span className="text-[11px] text-neutral-500 font-medium">
                                  {new Date(ord.createdAt).toLocaleDateString()} at{' '}
                                  {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-neutral-100 text-neutral-700">
                                  {ord.orderChannel}
                                </span>
                              </div>
                              <p className="text-xs text-neutral-600 mt-0.5">
                                <strong>{ord.customerName}</strong> • Phone:{' '}
                                <a href={`tel:${ord.customerPhone}`} className="underline text-neutral-900 font-semibold">
                                  {ord.customerPhone}
                                </a>
                              </p>
                            </div>

                            {/* Order Status Select */}
                            <div className="flex items-center gap-2">
                              <label className="text-xs text-neutral-500 font-medium">Status:</label>
                              <select
                                value={ord.status}
                                onChange={(e) => onUpdateOrderStatus(ord.id, e.target.value as any)}
                                className={`text-xs font-bold px-2.5 py-1 rounded-lg border focus:outline-hidden cursor-pointer ${
                                  ord.status === 'Delivered'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                    : ord.status === 'Dispatched'
                                    ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                                    : ord.status === 'Confirmed'
                                    ? 'bg-blue-50 text-blue-800 border-blue-300'
                                    : ord.status === 'Cancelled'
                                    ? 'bg-rose-50 text-rose-800 border-rose-300'
                                    : 'bg-amber-50 text-amber-800 border-amber-300'
                                }`}
                              >
                                <option value="Pending">Pending (Received)</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Dispatched">Dispatched (Out for Delivery)</option>
                                <option value="Delivered">Delivered (Cash Collected)</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </div>
                          </div>

                          {/* Delivery Address */}
                          <div className="bg-neutral-50 p-2.5 rounded-lg text-xs space-y-1 text-neutral-700">
                            <div>
                              <span className="text-neutral-400">Delivery Address: </span>
                              <strong className="text-neutral-900">{ord.deliveryAddress}</strong> ({ord.deliveryArea})
                            </div>
                            {ord.deliveryNotes && (
                              <div className="text-amber-800 text-[11px]">
                                <span>Customer Note: </span>
                                <em>{ord.deliveryNotes}</em>
                              </div>
                            )}
                          </div>

                          {/* Items Ordered */}
                          <div className="text-xs space-y-1">
                            <span className="text-[11px] font-semibold text-neutral-500 uppercase">Items Ordered:</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {ord.items.map((it, i) => (
                                <div key={i} className="flex items-center gap-2 bg-neutral-100/80 p-2 rounded-md">
                                  <img
                                    src={it.image}
                                    alt={it.productName}
                                    className="w-9 h-9 object-cover rounded bg-neutral-200"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="text-[11px] leading-tight">
                                    <span className="font-semibold text-neutral-900 block line-clamp-1">{it.productName}</span>
                                    <span className="text-neutral-500 block">
                                      Size: {it.size} | Color: {it.color} | Qty: {it.quantity} × {formatBDT(it.price)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Total & Action Toolbar */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-100 text-xs">
                            <div className="flex items-center gap-3">
                              <span className="text-neutral-600">
                                Total COD to collect:{' '}
                                <strong className="font-mono font-black text-sm text-neutral-950">
                                  {formatBDT(ord.totalAmount)}
                                </strong>
                              </span>
                              <span className="text-[11px] text-neutral-400">
                                (Items: {formatBDT(ord.subtotal)} + Delivery: {formatBDT(ord.deliveryFee)})
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <a
                                href={whatsappCustomerChat}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold"
                                title="Update Customer on WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                                <span>WhatsApp Customer</span>
                              </a>

                              <a
                                href={`tel:${ord.customerPhone}`}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-semibold"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span>Call</span>
                              </a>

                              <button
                                type="button"
                                onClick={() => onDeleteOrder(ord.id)}
                                className="p-1.5 text-neutral-400 hover:text-rose-600 transition-colors"
                                title="Delete order"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ==================== TAB 2: PRODUCTS & SPECS MANAGER ==================== */}
            {activeTab === 'products' && (
              <div className="p-4 sm:p-6 overflow-y-auto space-y-4 max-h-[70vh]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900 font-mono">
                      Vorbox Product Catalog ({products.length} Items)
                    </h3>
                    <p className="text-[11px] text-neutral-500">
                      Add, update pics, specifications, fabric GSM, sizes, and stock availability
                    </p>
                  </div>

                  {!isAddingProduct && (
                    <button
                      onClick={() => {
                        setEditingProductId(null);
                        setProductForm({
                          name: '',
                          category: 'T-Shirts',
                          price: 590,
                          originalPrice: 750,
                          description: '',
                          fabric: '100% Organic Combed Cotton',
                          gsm: '220 GSM',
                          images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80'],
                          sizes: ['M', 'L', 'XL'],
                          colors: [
                            { name: 'Onyx Black', hex: '#111111' },
                            { name: 'Pure White', hex: '#fafaf9' },
                          ],
                          inStock: true,
                          featured: true,
                          tag: 'Sundarganj Special',
                          features: ['220 GSM 100% Combed Cotton', 'Pre-shrunk', 'Regular fit'],
                        });
                        setIsAddingProduct(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-neutral-950 text-white text-xs font-semibold rounded-xl hover:bg-neutral-800 transition-colors shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Clothing Item</span>
                    </button>
                  )}
                </div>

                {/* Add / Edit Product Form */}
                {isAddingProduct ? (
                  <form onSubmit={handleSaveProduct} className="bg-neutral-50 p-4 sm:p-6 rounded-2xl border border-neutral-300 space-y-5">
                    <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <h4 className="font-bold text-sm text-neutral-900">
                          {editingProductId ? 'Edit Product & Specs' : 'Add New Clothing Product to Vorbox'}
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAddingProduct(false)}
                        className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 bg-neutral-200/80 px-2.5 py-1 rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>

                    {/* Section 1: Basic Info */}
                    <div className="space-y-3">
                      <h5 className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">1. Basic Details</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block font-semibold text-neutral-700 mb-1">
                            Product Name <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={productForm.name || ''}
                            onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                            placeholder="e.g. Heavyweight Boxy Drop-Shoulder Tee"
                            className="w-full p-2.5 bg-white border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-neutral-700 mb-1">Category</label>
                          <select
                            value={productForm.category || 'T-Shirts'}
                            onChange={(e) => setProductForm({ ...productForm, category: e.target.value as any })}
                            className="w-full p-2.5 bg-white border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                          >
                            <option value="T-Shirts">T-Shirts</option>
                            <option value="Polos">Polos</option>
                            <option value="Panjabis">Panjabis</option>
                            <option value="Hoodies & Sweats">Hoodies & Sweats</option>
                            <option value="Pants & Bottoms">Pants & Bottoms</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-semibold text-neutral-700 mb-1">
                            Selling Price (৳ BDT) <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="number"
                            required
                            value={productForm.price || ''}
                            onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                            placeholder="550"
                            className="w-full p-2.5 bg-white border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-neutral-700 mb-1">
                            Original / Strikethrough Price (৳ Optional)
                          </label>
                          <input
                            type="number"
                            value={productForm.originalPrice || ''}
                            onChange={(e) => setProductForm({ ...productForm, originalPrice: Number(e.target.value) })}
                            placeholder="700"
                            className="w-full p-2.5 bg-white border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900 font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Product Pictures Control */}
                    <div className="space-y-3 pt-3 border-t border-neutral-200">
                      <div className="flex items-center justify-between">
                        <h5 className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>2. Product Pictures & Gallery</span>
                        </h5>
                        <span className="text-[11px] text-neutral-500">
                          {productForm.images?.length || 0} image(s) attached
                        </span>
                      </div>

                      {/* Current Images Preview */}
                      {productForm.images && productForm.images.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {productForm.images.map((imgUrl, idx) => (
                            <div key={idx} className="relative bg-white border border-neutral-300 rounded-xl overflow-hidden aspect-square shadow-2xs group">
                              <img src={imgUrl} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              {idx === 0 ? (
                                <span className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-neutral-900 text-white text-[9px] font-bold rounded-md shadow-xs z-10">
                                  Cover
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleSetPrimaryImage(idx);
                                  }}
                                  className="absolute bottom-1.5 left-1.5 px-2 py-1 bg-white/95 hover:bg-white text-neutral-900 text-[10px] font-bold rounded-md shadow-md border border-neutral-200 z-10 transition-all cursor-pointer"
                                  title="Set as Cover Image"
                                >
                                  Make Cover
                                </button>
                              )}

                              {/* Always visible, easy-to-tap delete button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleRemoveImage(idx);
                                }}
                                className="absolute top-1.5 right-1.5 p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-md z-20 transition-transform active:scale-90 cursor-pointer flex items-center justify-center"
                                title="Delete image"
                                aria-label="Delete image"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 bg-white rounded-xl border border-dashed border-neutral-300 text-center text-xs text-neutral-400">
                          No product images attached yet. Add an image URL or upload a file below.
                        </div>
                      )}

                      {/* Add Image Inputs */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
                        <div className="sm:col-span-9 flex gap-2">
                          <input
                            type="url"
                            value={newImageUrlInput}
                            onChange={(e) => setNewImageUrlInput(e.target.value)}
                            placeholder="Paste Image URL (https://...)"
                            className="flex-1 p-2 bg-white border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                          />
                          <button
                            type="button"
                            onClick={handleAddImageUrl}
                            className="px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg font-semibold shrink-0"
                          >
                            + Add URL
                          </button>
                        </div>

                        {/* Local File Upload */}
                        <div className="sm:col-span-3">
                          <label className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-neutral-300 rounded-lg font-semibold text-neutral-700 hover:bg-neutral-50 cursor-pointer text-center">
                            <Upload className="w-3.5 h-3.5 text-neutral-500" />
                            <span>Upload File</span>
                            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Specs & Fabric */}
                    <div className="space-y-3 pt-3 border-t border-neutral-200">
                      <h5 className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" />
                        <span>3. Specs, Fabric & Features</span>
                      </h5>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="block font-semibold text-neutral-700 mb-1">Fabric Composition</label>
                          <input
                            type="text"
                            value={productForm.fabric || ''}
                            onChange={(e) => setProductForm({ ...productForm, fabric: e.target.value })}
                            placeholder="e.g. 100% Combed Cotton"
                            className="w-full p-2.5 bg-white border border-neutral-300 rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-neutral-700 mb-1">GSM / Density</label>
                          <input
                            type="text"
                            value={productForm.gsm || ''}
                            onChange={(e) => setProductForm({ ...productForm, gsm: e.target.value })}
                            placeholder="e.g. 220 GSM"
                            className="w-full p-2.5 bg-white border border-neutral-300 rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-neutral-700 mb-1">Custom Badge / Tag</label>
                          <input
                            type="text"
                            value={productForm.tag || ''}
                            onChange={(e) => setProductForm({ ...productForm, tag: e.target.value })}
                            placeholder="e.g. Sundarganj Special, Best Seller"
                            className="w-full p-2.5 bg-white border border-neutral-300 rounded-lg"
                          />
                        </div>
                      </div>

                      {/* Bullet Specs / Feature Tags */}
                      <div className="space-y-1.5 text-xs">
                        <label className="block font-semibold text-neutral-700">
                          Bullet Specifications & Highlights
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newFeatureInput}
                            onChange={(e) => setNewFeatureInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddFeature();
                              }
                            }}
                            placeholder="e.g. High-density embroidery, Anti-pilling silicone wash..."
                            className="flex-1 p-2 bg-white border border-neutral-300 rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={handleAddFeature}
                            className="px-3 py-2 bg-neutral-900 text-white rounded-lg font-semibold"
                          >
                            + Add Spec
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          {productForm.features?.map((ft, ftIdx) => (
                            <span
                              key={ftIdx}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-neutral-300 rounded-lg text-[11px] font-medium text-neutral-800"
                            >
                              <span>{ft}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveFeature(ftIdx)}
                                className="text-neutral-400 hover:text-rose-600"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Sizes Checkboxes */}
                      <div className="space-y-1.5 text-xs pt-1">
                        <label className="block font-semibold text-neutral-700">Available Sizes</label>
                        <div className="flex items-center gap-2">
                          {(['S', 'M', 'L', 'XL', 'XXL'] as const).map((sz) => {
                            const isChecked = (productForm.sizes || []).includes(sz);
                            return (
                              <button
                                key={sz}
                                type="button"
                                onClick={() => handleToggleSize(sz)}
                                className={`w-9 h-9 rounded-lg font-bold text-xs border transition-all ${
                                  isChecked
                                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                                    : 'bg-white text-neutral-500 border-neutral-300 hover:border-neutral-500'
                                }`}
                              >
                                {sz}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Colors Manager */}
                      <div className="space-y-1.5 text-xs pt-1">
                        <label className="block font-semibold text-neutral-700">Available Colors</label>
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          {productForm.colors?.map((c, cIdx) => (
                            <span
                              key={cIdx}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-neutral-300 rounded-lg text-[11px] font-medium text-neutral-800 shadow-2xs"
                            >
                              <span className="w-3.5 h-3.5 rounded-full border border-neutral-300" style={{ backgroundColor: c.hex }} />
                              <span>{c.name}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveColor(cIdx)}
                                className="text-neutral-400 hover:text-rose-600"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={newColorName}
                            onChange={(e) => setNewColorName(e.target.value)}
                            placeholder="Color Name (e.g. Royal Navy)"
                            className="p-2 text-xs bg-white border border-neutral-300 rounded-lg w-48"
                          />
                          <input
                            type="color"
                            value={newColorHex}
                            onChange={(e) => setNewColorHex(e.target.value)}
                            className="w-9 h-8 p-0.5 bg-white border border-neutral-300 rounded-lg cursor-pointer"
                          />
                          <button
                            type="button"
                            onClick={handleAddColor}
                            className="px-3 py-2 bg-neutral-900 text-white rounded-lg text-xs font-semibold"
                          >
                            + Add Color
                          </button>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="space-y-1 text-xs pt-1">
                        <label className="block font-semibold text-neutral-700">Description</label>
                        <textarea
                          rows={3}
                          value={productForm.description || ''}
                          onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                          placeholder="Describe fabric texture, fit style, styling suggestions..."
                          className="w-full p-2.5 bg-white border border-neutral-300 rounded-lg"
                        />
                      </div>

                      {/* Stock & Featured Toggles */}
                      <div className="flex items-center gap-6 pt-2 text-xs">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={productForm.inStock ?? true}
                            onChange={(e) => setProductForm({ ...productForm, inStock: e.target.checked })}
                            className="w-4 h-4 rounded text-neutral-900 focus:ring-neutral-900"
                          />
                          <span className="font-semibold text-neutral-800">In Stock (Available for Instant COD)</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={productForm.featured ?? false}
                            onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                            className="w-4 h-4 rounded text-neutral-900 focus:ring-neutral-900"
                          />
                          <span className="font-semibold text-neutral-800">Featured on Top</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2.5 pt-4 border-t border-neutral-200">
                      <button
                        type="button"
                        onClick={() => setIsAddingProduct(false)}
                        className="px-4 py-2.5 bg-neutral-200 text-neutral-700 text-xs font-semibold rounded-xl hover:bg-neutral-300 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{editingProductId ? 'Save Changes' : 'Publish Product'}</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Products Grid */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {products.map((prod) => (
                      <div
                        key={prod.id}
                        className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200 flex gap-3.5 items-center justify-between hover:border-neutral-400 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative w-14 h-16 rounded-xl overflow-hidden bg-neutral-200 shrink-0">
                            <img
                              src={prod.images[0]}
                              alt={prod.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            {!prod.inStock && (
                              <span className="absolute inset-0 bg-neutral-950/70 text-white text-[8px] font-bold flex items-center justify-center">
                                OUT
                              </span>
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-neutral-900 line-clamp-1">{prod.name}</h4>
                            <p className="text-[11px] text-neutral-500 font-medium">
                              {prod.category} • <strong className="text-neutral-900 font-mono">{formatBDT(prod.price)}</strong>
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-[10px] text-neutral-400 bg-neutral-200/70 px-1.5 py-0.5 rounded">
                                {prod.fabric || prod.gsm || 'Cotton'}
                              </span>
                              {prod.tag && (
                                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                                  {prod.tag}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {productToDeleteId === prod.id ? (
                            <div className="flex items-center gap-1 bg-rose-50 border border-rose-300 p-1 rounded-xl">
                              <span className="text-[10px] font-bold text-rose-800 px-1">Delete item?</span>
                              <button
                                type="button"
                                onClick={() => {
                                  onDeleteProduct(prod.id);
                                  setProductToDeleteId(null);
                                }}
                                className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold shadow-xs cursor-pointer"
                              >
                                Yes
                              </button>
                              <button
                                type="button"
                                onClick={() => setProductToDeleteId(null)}
                                className="px-1.5 py-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-lg text-[10px] font-semibold cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => startEditProduct(prod)}
                                className="p-2 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
                                title="Edit specs and pictures"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setProductToDeleteId(prod.id)}
                                className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ==================== TAB: FEATURED DROP SETTINGS ==================== */}
            {activeTab === 'featureddrop' && (
              <div className="p-4 sm:p-6 overflow-y-auto space-y-6 max-h-[70vh]">
                {/* Saved notification */}
                {savedDropNotice && (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2 animate-fadeIn">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Featured Drop configuration updated and saved successfully!</span>
                  </div>
                )}

                {/* Hero Featured Drop Header & Status Card */}
                <div className="p-4 sm:p-5 bg-neutral-900 text-white rounded-2xl border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-neutral-800 text-[10px] font-mono text-emerald-400 border border-neutral-700">
                      <Sparkles className="w-3 h-3" />
                      <span>Homepage Hero Showcase</span>
                    </div>
                    <h3 className="text-base font-bold font-mono">Hero Featured Drop Card</h3>
                    <p className="text-xs text-neutral-400">
                      Showcase a hero item right beside the main title and WhatsApp order buttons on your homepage.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    {featuredDropForm.enabled ? (
                      <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Live on Homepage</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-neutral-800 text-neutral-400 border border-neutral-700 rounded-lg text-xs font-semibold">
                        Hidden / Disabled
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        if (featuredDropForm.enabled) {
                          handleDeleteFeaturedDrop();
                        } else {
                          handleEnableFeaturedDrop();
                        }
                      }}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        featuredDropForm.enabled
                          ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                      }`}
                    >
                      {featuredDropForm.enabled ? 'Disable / Hide' : 'Enable / Add'}
                    </button>
                  </div>
                </div>

                {/* Main 2-Column Grid: Form on Left, Live Preview on Right */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Column: Form Controls */}
                  <form onSubmit={handleSaveFeaturedDrop} className="lg:col-span-7 space-y-4 text-xs">
                    
                    {/* Quick Select From Existing Catalog Product */}
                    <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-neutral-900 flex items-center gap-1.5">
                          <ShoppingBag className="w-3.5 h-3.5 text-neutral-700" />
                          <span>Quick Auto-Fill From Catalog</span>
                        </label>
                        <span className="text-[10px] text-neutral-500">Auto-fills specs, picture & price</span>
                      </div>

                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleSelectProductForDrop(e.target.value);
                          }
                        }}
                        defaultValue=""
                        className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl focus:ring-2 focus:ring-neutral-900 font-medium text-xs cursor-pointer"
                      >
                        <option value="" disabled>-- Select a product to auto-fill details --</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} — ৳{p.price} ({p.category})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Core Drop Details */}
                    <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3.5">
                      <h4 className="font-bold text-neutral-900 text-xs uppercase tracking-wider">
                        Drop Card Specifications
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-neutral-700 mb-1">
                            Badge Tag Text
                          </label>
                          <input
                            type="text"
                            required
                            value={featuredDropForm.badgeText}
                            onChange={(e) =>
                              setFeaturedDropForm({ ...featuredDropForm, badgeText: e.target.value })
                            }
                            placeholder="e.g. Featured Drop, Top Pick..."
                            className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl focus:ring-2 focus:ring-neutral-900"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-neutral-700 mb-1">
                            Product / Drop Title
                          </label>
                          <input
                            type="text"
                            required
                            value={featuredDropForm.title}
                            onChange={(e) =>
                              setFeaturedDropForm({ ...featuredDropForm, title: e.target.value })
                            }
                            placeholder="e.g. Heavyweight Boxy Tee..."
                            className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl focus:ring-2 focus:ring-neutral-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-neutral-700 mb-1">
                          Subtitle / Fabric & GSM Info
                        </label>
                        <input
                          type="text"
                          value={featuredDropForm.subtitle}
                          onChange={(e) =>
                            setFeaturedDropForm({ ...featuredDropForm, subtitle: e.target.value })
                          }
                          placeholder="e.g. 220 GSM 100% Combed Cotton"
                          className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl focus:ring-2 focus:ring-neutral-900"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-neutral-700 mb-1">
                            Special Offer Price (৳ BDT)
                          </label>
                          <input
                            type="number"
                            required
                            min="0"
                            value={featuredDropForm.price}
                            onChange={(e) =>
                              setFeaturedDropForm({ ...featuredDropForm, price: Number(e.target.value) })
                            }
                            className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl focus:ring-2 focus:ring-neutral-900 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-neutral-700 mb-1">
                            Original Price (৳ BDT - Optional Strike-through)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={featuredDropForm.originalPrice || ''}
                            onChange={(e) =>
                              setFeaturedDropForm({
                                ...featuredDropForm,
                                originalPrice: e.target.value ? Number(e.target.value) : undefined,
                              })
                            }
                            placeholder="e.g. 700"
                            className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl focus:ring-2 focus:ring-neutral-900 font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-neutral-700 mb-1">
                          Link to Catalog Product (Opens modal on click)
                        </label>
                        <select
                          value={featuredDropForm.productId || ''}
                          onChange={(e) =>
                            setFeaturedDropForm({
                              ...featuredDropForm,
                              productId: e.target.value || undefined,
                            })
                          }
                          className="w-full p-2.5 bg-white border border-neutral-300 rounded-xl focus:ring-2 focus:ring-neutral-900 cursor-pointer"
                        >
                          <option value="">None (Scrolls to catalog)</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (৳{p.price})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Image / Picture Uploader */}
                    <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-neutral-900 flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-neutral-700" />
                          <span>Cover Picture / Showcase Image</span>
                        </label>
                      </div>

                      {/* Image URL input */}
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={featuredDropImageUrlInput}
                          onChange={(e) => setFeaturedDropImageUrlInput(e.target.value)}
                          placeholder="Paste image web link (https://...)"
                          className="flex-1 p-2 bg-white border border-neutral-300 rounded-xl focus:ring-2 focus:ring-neutral-900"
                        />
                        <button
                          type="button"
                          onClick={handleAddFeaturedDropImageUrl}
                          disabled={!featuredDropImageUrlInput.trim()}
                          className="px-3 py-2 bg-neutral-900 text-white rounded-xl font-semibold disabled:opacity-40 hover:bg-neutral-800 transition-colors cursor-pointer"
                        >
                          Set URL
                        </button>
                      </div>

                      {/* Direct file upload */}
                      <div className="flex items-center gap-2 pt-1">
                        <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 p-2.5 bg-white border border-dashed border-neutral-300 rounded-xl hover:bg-neutral-100 hover:border-neutral-400 transition-colors text-neutral-700 font-medium">
                          <Upload className="w-3.5 h-3.5 text-neutral-500" />
                          <span>Upload Image from Device</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFeaturedDropImageFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Save & Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      {showDeleteDropConfirm ? (
                        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 p-2 rounded-xl">
                          <span className="text-xs font-bold text-rose-800">Delete / Remove drop?</span>
                          <button
                            type="button"
                            onClick={handleDeleteFeaturedDrop}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                          >
                            Yes, Remove
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowDeleteDropConfirm(false)}
                            className="px-2 py-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-lg text-xs font-semibold cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowDeleteDropConfirm(true)}
                          className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-800 font-semibold px-3 py-2 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete / Remove Drop</span>
                        </button>
                      )}

                      <div className="flex items-center gap-2 ml-auto">
                        <button
                          type="button"
                          onClick={() => {
                            setFeaturedDropForm(DEFAULT_FEATURED_DROP);
                          }}
                          className="px-3 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                          title="Reset to default drop"
                        >
                          Restore Default
                        </button>

                        <button
                          type="submit"
                          className="px-5 py-2 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Save Featured Drop</span>
                        </button>
                      </div>
                    </div>
                  </form>

                  {/* Right Column: Live Real-Time Card Preview */}
                  <div className="lg:col-span-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                        Live Hero Preview
                      </span>
                      <span className="text-[11px] text-neutral-500">
                        {featuredDropForm.enabled ? '🟢 Displayed on Website' : '🔴 Currently Hidden'}
                      </span>
                    </div>

                    <div className="p-4 bg-neutral-900 rounded-3xl border border-neutral-800 shadow-xl">
                      <div className="text-[10px] text-neutral-400 font-mono mb-2 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        <span>Homepage Preview</span>
                      </div>

                      {/* The Card */}
                      <div className="relative rounded-2xl overflow-hidden bg-neutral-800 border border-neutral-700 shadow-2xl group">
                        <img
                          src={featuredDropForm.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80'}
                          alt={featuredDropForm.title || 'Featured Drop'}
                          className="w-full h-64 sm:h-72 object-cover object-center"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-transparent to-transparent flex flex-col justify-end p-5">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-mono font-semibold">
                                {featuredDropForm.badgeText || 'Featured Drop'}
                              </span>
                              <h3 className="text-base font-bold text-white font-mono leading-tight">
                                {featuredDropForm.title || 'Product Title'}
                              </h3>
                              {featuredDropForm.subtitle && (
                                <p className="text-[11px] text-neutral-300 mt-0.5">
                                  {featuredDropForm.subtitle}
                                </p>
                              )}
                            </div>
                            <div className="text-right shrink-0 ml-3">
                              <span className="text-base font-black text-white font-mono">
                                ৳{featuredDropForm.price}
                              </span>
                              {featuredDropForm.originalPrice && featuredDropForm.originalPrice > featuredDropForm.price && (
                                <span className="block text-[10px] text-neutral-400 line-through">
                                  ৳{featuredDropForm.originalPrice}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 text-center">
                        <p className="text-[11px] text-neutral-400">
                          {featuredDropForm.enabled
                            ? '✅ This showcase is currently visible to all visitors on the top Hero section.'
                            : '⚠️ This showcase is disabled and hidden from the homepage hero banner.'}
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* ==================== TAB 3: STORE & WHATSAPP SETTINGS ==================== */}
            {activeTab === 'settings' && (
              <div className="p-4 sm:p-6 overflow-y-auto space-y-6 max-h-[70vh]">
                {savedSettingsNotice && (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2 animate-fadeIn">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Store settings & WhatsApp numbers saved successfully!</span>
                  </div>
                )}

                {/* Featured Drop Quick Access Card */}
                <div className="p-4 bg-neutral-900 text-white rounded-2xl border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-emerald-400 shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold font-mono">Homepage Hero Featured Drop</h4>
                      <p className="text-[11px] text-neutral-400">
                        {formSettings.featuredDrop?.enabled
                          ? `Active: "${formSettings.featuredDrop.title}" (৳${formSettings.featuredDrop.price})`
                          : 'Currently Hidden / Disabled on top banner'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('featureddrop')}
                    className="px-3.5 py-2 bg-white text-neutral-950 hover:bg-neutral-100 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
                  >
                    Configure Featured Drop →
                  </button>
                </div>

                <form onSubmit={handleSaveSettings} className="space-y-5">
                  {/* WhatsApp Ordering Configuration */}
                  <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                          <MessageCircle className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-emerald-950">
                            WhatsApp Ordering & Direct Chat Configuration
                          </h4>
                          <p className="text-[11px] text-emerald-700">
                            All 1-click WhatsApp order links, cards, & Floating Chat will route to this number
                          </p>
                        </div>
                      </div>

                      <a
                        href={testWhatsAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Test Live Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    {/* Quick Preset Selector Buttons */}
                    <div className="pt-2 border-t border-emerald-200/80">
                      <label className="block text-[11px] font-bold text-emerald-950 mb-1.5">
                        Quick Preset Switcher:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setFormSettings({
                              ...formSettings,
                              whatsappNumber: '8801866068916',
                              whatsappDisplayNumber: '+880 1866-068916',
                            });
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                            formSettings.whatsappNumber === '8801866068916'
                              ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs font-bold'
                              : 'border-emerald-300 bg-white hover:bg-emerald-100 text-emerald-950'
                          }`}
                        >
                          <div>
                            <span className="text-xs block font-bold">Primary Number</span>
                            <span className="text-[11px] font-mono opacity-90">+880 1866-068916</span>
                          </div>
                          {formSettings.whatsappNumber === '8801866068916' && (
                            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-mono">Active</span>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setFormSettings({
                              ...formSettings,
                              whatsappNumber: '8801982135000',
                              whatsappDisplayNumber: '+880 1982-135000',
                            });
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                            formSettings.whatsappNumber === '8801982135000'
                              ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs font-bold'
                              : 'border-emerald-300 bg-white hover:bg-emerald-100 text-emerald-950'
                          }`}
                        >
                          <div>
                            <span className="text-xs block font-bold">Secondary Number</span>
                            <span className="text-[11px] font-mono opacity-90">+880 1982-135000</span>
                          </div>
                          {formSettings.whatsappNumber === '8801982135000' && (
                            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-mono">Active</span>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                      <div>
                        <label className="block font-semibold text-emerald-950 mb-1">
                          WhatsApp Raw Number (With Country Code) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formSettings.whatsappNumber}
                          onChange={(e) => setFormSettings({ ...formSettings, whatsappNumber: e.target.value })}
                          placeholder="8801866068916"
                          className="w-full p-2.5 bg-white border border-emerald-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600 font-mono text-xs"
                        />
                        <span className="text-[10px] text-emerald-800 mt-1 block font-mono">
                          Live wa.me route: https://wa.me/{cleanPhoneForWhatsApp(formSettings.whatsappNumber)}
                        </span>
                      </div>

                      <div>
                        <label className="block font-semibold text-emerald-950 mb-1">
                          WhatsApp Friendly Display Number <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formSettings.whatsappDisplayNumber}
                          onChange={(e) => setFormSettings({ ...formSettings, whatsappDisplayNumber: e.target.value })}
                          placeholder="+880 1866-068916"
                          className="w-full p-2.5 bg-white border border-emerald-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600 font-mono text-xs"
                        />
                        <span className="text-[10px] text-emerald-800 mt-1 block">
                          Shown on site header, footer, & contact buttons
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* General Store Details */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                      Store Branding & Location
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block font-semibold text-neutral-700 mb-1">Store Name</label>
                        <input
                          type="text"
                          required
                          value={formSettings.storeName}
                          onChange={(e) => setFormSettings({ ...formSettings, storeName: e.target.value })}
                          className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-neutral-700 mb-1">Tagline</label>
                        <input
                          type="text"
                          value={formSettings.tagline}
                          onChange={(e) => setFormSettings({ ...formSettings, tagline: e.target.value })}
                          className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-neutral-700 mb-1">Service City / Thana</label>
                        <input
                          type="text"
                          required
                          value={formSettings.city}
                          onChange={(e) => setFormSettings({ ...formSettings, city: e.target.value })}
                          className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:bg-white"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block font-semibold text-neutral-700 mb-1">
                          Store / Pickup Point Address
                        </label>
                        <input
                          type="text"
                          value={formSettings.storeAddress}
                          onChange={(e) => setFormSettings({ ...formSettings, storeAddress: e.target.value })}
                          className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Delivery Charges & Thresholds */}
                  <div className="space-y-3 pt-3 border-t border-neutral-200">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                      Delivery Pricing & Promises
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block font-semibold text-neutral-700 mb-1">
                          Inside {formSettings.city} COD Fee (৳)
                        </label>
                        <input
                          type="number"
                          required
                          value={formSettings.insideCityDeliveryFee}
                          onChange={(e) => setFormSettings({ ...formSettings, insideCityDeliveryFee: Number(e.target.value) })}
                          className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:bg-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-neutral-700 mb-1">
                          Outside / Remote Union COD Fee (৳)
                        </label>
                        <input
                          type="number"
                          required
                          value={formSettings.outsideCityDeliveryFee}
                          onChange={(e) => setFormSettings({ ...formSettings, outsideCityDeliveryFee: Number(e.target.value) })}
                          className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:bg-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-neutral-700 mb-1">
                          Free Delivery Threshold (৳)
                        </label>
                        <input
                          type="number"
                          required
                          value={formSettings.freeDeliveryThreshold}
                          onChange={(e) => setFormSettings({ ...formSettings, freeDeliveryThreshold: Number(e.target.value) })}
                          className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:bg-white font-mono"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block font-semibold text-neutral-700 mb-1">
                          Top Announcement Promo Banner
                        </label>
                        <input
                          type="text"
                          value={formSettings.bannerNotice}
                          onChange={(e) => setFormSettings({ ...formSettings, bannerNotice: e.target.value })}
                          className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-2">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-all shadow-md"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save General Settings</span>
                    </button>
                  </div>
                </form>

                {/* Change Admin Password Section */}
                <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-neutral-800" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                      Change Admin Login Password
                    </h4>
                  </div>

                  {passwordChangeSuccess && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Admin password changed successfully!</span>
                    </div>
                  )}

                  {passwordChangeError && (
                    <div className="p-2.5 bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold rounded-lg flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      <span>{passwordChangeError}</span>
                    </div>
                  )}

                  <form onSubmit={handlePasswordChangeSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold text-neutral-700 mb-1">
                        Current Admin Password
                      </label>
                      <input
                        type="password"
                        required
                        value={currentPasswordConfirm}
                        onChange={(e) => setCurrentPasswordConfirm(e.target.value)}
                        placeholder="Enter current password..."
                        className="w-full p-2.5 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-neutral-700 mb-1">
                        New Admin Password
                      </label>
                      <input
                        type="password"
                        required
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(e.target.value)}
                        placeholder="Enter new password (min 6 chars)..."
                        className="w-full p-2.5 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900"
                      />
                    </div>

                    <div className="sm:col-span-2 flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-lg transition-colors"
                      >
                        Update Admin Password
                      </button>
                    </div>
                  </form>
                </div>

                {/* Reset Data Button */}
                <div className="pt-4 border-t border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs text-neutral-500">
                    Need to restore standard store catalog and baseline settings?
                  </div>
                  {showResetConfirm ? (
                    <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 p-2 rounded-xl">
                      <span className="text-xs font-bold text-rose-800">Reset all store data?</span>
                      <button
                        type="button"
                        onClick={() => {
                          onResetDemoData();
                          setShowResetConfirm(false);
                        }}
                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                      >
                        Yes, Reset
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowResetConfirm(false)}
                        className="px-2 py-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowResetConfirm(true)}
                      className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-800 font-semibold px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Store Catalog</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
