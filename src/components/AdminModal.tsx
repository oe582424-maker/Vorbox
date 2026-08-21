import React, { useState, useEffect } from 'react';
import {
  X,
  Settings,
  ShoppingBag,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  MessageCircle,
  Phone,
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
  Search,
  Check,
  AlertCircle,
  Tag,
  Sliders,
  ArrowUpDown,
} from 'lucide-react';
import { Product, StoreSettings, FeaturedDrop, HeroSettings } from '../types';
import { DEFAULT_FEATURED_DROP, DEFAULT_CATEGORIES } from '../data/defaultData';
import { formatBDT, cleanPhoneForWhatsApp } from '../utils/helpers';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
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
    return (
      sessionStorage.getItem('crownborn_admin_auth') === 'true' ||
      sessionStorage.getItem('vorbox_admin_auth') === 'true'
    );
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  // Active Admin Tab (Catalog Management & Store Settings)
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'hero' | 'settings'>('products');

  // Store Settings Form State
  const [formSettings, setFormSettings] = useState<StoreSettings>(settings);
  const [savedSettingsNotice, setSavedSettingsNotice] = useState(false);

  // Dynamic Categories Management State
  const activeCategories = formSettings.categories || DEFAULT_CATEGORIES;
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryIndex, setEditingCategoryIndex] = useState<number | null>(null);
  const [editingCategoryValue, setEditingCategoryValue] = useState('');

  // Hero & Banner Settings Form State
  const [heroForm, setHeroForm] = useState<HeroSettings>(() => {
    return (
      settings.heroSettings || {
        enabled: settings.showHeroBanner ?? true,
        badgeText: 'Best Quality Products',
        title: 'WEAR YOUR EDGE.',
        subtitle: 'Delivered directly to your doorstep with Fast Delivery.',
        description:
          'Crafted for those who demand excellence. Experience high-grade fabrics, tailored fits, and effortless Cash on Delivery ordering across Bangladesh.',
        showDropCard: false,
      }
    );
  });
  const [featuredDropForm, setFeaturedDropForm] = useState<FeaturedDrop>(() => {
    return settings.featuredDrop || DEFAULT_FEATURED_DROP;
  });
  const [dropImageUrlInput, setDropImageUrlInput] = useState('');
  const [savedHeroNotice, setSavedHeroNotice] = useState(false);

  // Synchronize internal form state when global store settings update from server
  useEffect(() => {
    setFormSettings(settings);
    if (settings.heroSettings) {
      setHeroForm({
        ...settings.heroSettings,
        enabled: settings.showHeroBanner !== undefined ? settings.showHeroBanner : (settings.heroSettings.enabled ?? true),
      });
    }
    if (settings.featuredDrop) {
      setFeaturedDropForm(settings.featuredDrop);
    }
  }, [settings]);

  // Password Change Form State
  const [currentPasswordConfirm, setCurrentPasswordConfirm] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);
  const [passwordChangeError, setPasswordChangeError] = useState('');

  // Product Add / Edit Modal State
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productToDeleteId, setProductToDeleteId] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const [newFeatureInput, setNewFeatureInput] = useState('');
  const [newImageUrlInput, setNewImageUrlInput] = useState('');
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#111111');
  const [newColorImage, setNewColorImage] = useState('');
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [categoryMode, setCategoryMode] = useState<'preset' | 'custom'>('preset');
  const [customCategoryInput, setCustomCategoryInput] = useState('');

  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '',
    category: activeCategories[0] || 'T-Shirts',
    price: 550,
    originalPrice: 700,
    description: '',
    fabric: '',
    gsm: '',
    images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80'],
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Onyx Black', hex: '#111111' },
      { name: 'Chalk White', hex: '#fafaf9' },
    ],
    inStock: true,
    featured: true,
    tag: 'Best Seller',
    features: ['Pre-shrunk finish', 'Reinforced stitching'],
  });

  const correctPassword = settings.adminPassword || 'akm125@#155Ab12*';

  // -------------------- AUTHENTICATION HANDLERS --------------------
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === correctPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem('crownborn_admin_auth', 'true');
      setAuthError('');
    } else {
      setAuthError('Incorrect admin password. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('crownborn_admin_auth');
    sessionStorage.removeItem('vorbox_admin_auth');
    setPasswordInput('');
  };

  // -------------------- CATEGORY MANAGEMENT HANDLERS --------------------
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    if (activeCategories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      alert('This category already exists.');
      return;
    }
    const updated = [...activeCategories, trimmed];
    const newSettings = { ...formSettings, categories: updated };
    setFormSettings(newSettings);
    onUpdateSettings(newSettings);
    setNewCategoryName('');
  };

  const handleSaveEditedCategory = (index: number) => {
    const trimmed = editingCategoryValue.trim();
    if (!trimmed) {
      setEditingCategoryIndex(null);
      return;
    }
    const oldName = activeCategories[index];
    const updated = [...activeCategories];
    updated[index] = trimmed;
    const newSettings = { ...formSettings, categories: updated };
    setFormSettings(newSettings);
    onUpdateSettings(newSettings);

    // Also update any products currently assigned to oldName
    products.forEach((p) => {
      if (p.category === oldName) {
        onUpdateProduct({ ...p, category: trimmed });
      }
    });

    setEditingCategoryIndex(null);
    setEditingCategoryValue('');
  };

  const handleDeleteCategory = (catName: string) => {
    const assignedProductsCount = products.filter((p) => p.category === catName).length;
    if (assignedProductsCount > 0) {
      const confirmDelete = window.confirm(
        `There are ${assignedProductsCount} product(s) in category "${catName}". Deleting this category will reassign them to "${activeCategories[0] || 'General'}". Continue?`
      );
      if (!confirmDelete) return;

      const fallbackCat = activeCategories.find((c) => c !== catName) || 'T-Shirts';
      products.forEach((p) => {
        if (p.category === catName) {
          onUpdateProduct({ ...p, category: fallbackCat });
        }
      });
    }

    const updated = activeCategories.filter((c) => c !== catName);
    const newSettings = { ...formSettings, categories: updated.length ? updated : ['T-Shirts'] };
    setFormSettings(newSettings);
    onUpdateSettings(newSettings);
  };

  const handleResetCategories = () => {
    const updated = DEFAULT_CATEGORIES;
    const newSettings = { ...formSettings, categories: updated };
    setFormSettings(newSettings);
    onUpdateSettings(newSettings);
  };

  // -------------------- HERO & BANNER HANDLERS --------------------
  const handleSaveHeroAndDrop = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updatedSettings: StoreSettings = {
      ...formSettings,
      showHeroBanner: heroForm.enabled,
      heroSettings: heroForm,
      featuredDrop: featuredDropForm,
    };
    setFormSettings(updatedSettings);
    onUpdateSettings(updatedSettings);
    setSavedHeroNotice(true);
    setTimeout(() => setSavedHeroNotice(false), 2500);
  };

  const handleFeaturedDropFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const result = loadEvt.target?.result as string;
      if (result) {
        setFeaturedDropForm((prev) => ({ ...prev, image: result, enabled: true }));
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAddDropImageUrl = () => {
    if (!dropImageUrlInput.trim()) return;
    setFeaturedDropForm((prev) => ({ ...prev, image: dropImageUrlInput.trim(), enabled: true }));
    setDropImageUrlInput('');
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

  // -------------------- PRODUCT SPECS & PIC HANDLERS --------------------
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

  const handleToggleSize = (size: string) => {
    const currentSizes = productForm.sizes || ['M', 'L', 'XL'];
    if (currentSizes.includes(size)) {
      if (currentSizes.length === 1) return;
      setProductForm({ ...productForm, sizes: currentSizes.filter((s) => s !== size) });
    } else {
      setProductForm({ ...productForm, sizes: [...currentSizes, size] });
    }
  };

  const handleAddCustomSize = () => {
    const trimmed = customSizeInput.trim();
    if (!trimmed) return;
    const currentSizes = productForm.sizes || [];
    if (!currentSizes.includes(trimmed)) {
      setProductForm({ ...productForm, sizes: [...currentSizes, trimmed] });
    }
    setCustomSizeInput('');
  };

  const handleRemoveSize = (sizeToRemove: string) => {
    const currentSizes = productForm.sizes || [];
    if (currentSizes.length <= 1) return;
    setProductForm({ ...productForm, sizes: currentSizes.filter((s) => s !== sizeToRemove) });
  };

  const handleAddColor = () => {
    if (!newColorName.trim()) return;
    const currentColors = productForm.colors || [];
    setProductForm({
      ...productForm,
      colors: [
        ...currentColors,
        {
          name: newColorName.trim(),
          hex: newColorHex,
          image: newColorImage.trim() || undefined,
        },
      ],
    });
    setNewColorName('');
    setNewColorHex('#111111');
    setNewColorImage('');
  };

  const handleRemoveColor = (index: number) => {
    const currentColors = productForm.colors || [];
    if (currentColors.length === 1) return;
    setProductForm({
      ...productForm,
      colors: currentColors.filter((_, i) => i !== index),
    });
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price) return;

    // Resolve category
    let finalCategory = productForm.category || activeCategories[0] || 'T-Shirts';
    if (categoryMode === 'custom' && customCategoryInput.trim()) {
      finalCategory = customCategoryInput.trim();
      // If it's a new category not yet in store categories, add it to store settings
      if (!activeCategories.some((c) => c.toLowerCase() === finalCategory.toLowerCase())) {
        const updatedCategories = [...activeCategories, finalCategory];
        const newSettings = { ...formSettings, categories: updatedCategories };
        setFormSettings(newSettings);
        onUpdateSettings(newSettings);
      }
    }

    const cleanedSizes = productForm.sizes?.length ? productForm.sizes : ['Standard'];
    const cleanedColors = productForm.colors?.length
      ? productForm.colors
      : [{ name: 'Standard', hex: '#111111' }];

    const cleanedFabric = productForm.fabric?.trim() || undefined;
    const cleanedGsm = productForm.gsm?.trim() || undefined;
    const cleanedDescription = productForm.description?.trim() || '';
    const cleanedFeatures = productForm.features?.filter(Boolean) || [];

    if (editingProductId) {
      const updatedProduct: Product = {
        id: editingProductId,
        name: productForm.name.trim(),
        category: finalCategory,
        price: Number(productForm.price) || 0,
        originalPrice: productForm.originalPrice ? Number(productForm.originalPrice) : undefined,
        description: cleanedDescription,
        features: cleanedFeatures,
        fabric: cleanedFabric,
        gsm: cleanedGsm,
        images: productForm.images?.length ? productForm.images : ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80'],
        sizes: cleanedSizes,
        colors: cleanedColors,
        inStock: productForm.inStock ?? true,
        featured: productForm.featured ?? false,
        tag: productForm.tag?.trim() || undefined,
      };
      onUpdateProduct(updatedProduct);
      setEditingProductId(null);
    } else {
      const newProd: Product = {
        id: `cb-${Date.now().toString().slice(-5)}`,
        name: productForm.name.trim(),
        category: finalCategory,
        price: Number(productForm.price) || 500,
        originalPrice: productForm.originalPrice ? Number(productForm.originalPrice) : undefined,
        description: cleanedDescription,
        features: cleanedFeatures,
        fabric: cleanedFabric,
        gsm: cleanedGsm,
        images: productForm.images?.length ? productForm.images : ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80'],
        sizes: cleanedSizes,
        colors: cleanedColors,
        inStock: productForm.inStock ?? true,
        featured: productForm.featured ?? false,
        tag: productForm.tag?.trim() || undefined,
      };
      onAddProduct(newProd);
    }
    setIsAddingProduct(false);
    setCategoryMode('preset');
    setCustomCategoryInput('');
  };

  const startEditProduct = (prod: Product) => {
    setProductForm({ ...prod });
    setEditingProductId(prod.id);
    if (!activeCategories.includes(prod.category)) {
      setCategoryMode('custom');
      setCustomCategoryInput(prod.category);
    } else {
      setCategoryMode('preset');
      setCustomCategoryInput('');
    }
    setIsAddingProduct(true);
  };

  const startAddProduct = () => {
    setProductForm({
      name: '',
      category: activeCategories[0] || 'T-Shirts',
      price: 550,
      originalPrice: 700,
      description: '',
      fabric: '',
      gsm: '',
      images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80'],
      sizes: ['M', 'L', 'XL', 'XXL'],
      colors: [
        { name: 'Onyx Black', hex: '#111111' },
        { name: 'Chalk White', hex: '#fafaf9' },
      ],
      inStock: true,
      featured: false,
      tag: '',
      features: [],
    });
    setEditingProductId(null);
    setCategoryMode('preset');
    setCustomCategoryInput('');
    setIsAddingProduct(true);
  };

  // -------------------- SETTINGS & PASSWORD HANDLERS --------------------
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
      setPasswordChangeError('Current password is incorrect.');
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

  const testWhatsAppUrl = `https://wa.me/${cleanPhoneForWhatsApp(formSettings.whatsappNumber)}?text=${encodeURIComponent(
    `Hello! This is a test message from CrownBorn Admin Portal for ${formSettings.storeName} in ${formSettings.city}.`
  )}`;

  return (
    <div
      id="admin-modal-backdrop"
      className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="admin-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-5xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col relative"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-emerald-400">
              {isAuthenticated ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black font-mono tracking-tight">{settings.storeName} Admin Portal</h2>
                {isAuthenticated && (
                  <>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Authorized
                    </span>
                    <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono text-emerald-300 bg-neutral-900 border border-emerald-500/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Live Sync Active</span>
                    </span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-neutral-400">
                {isAuthenticated
                  ? `Control products, orders, WhatsApp routing, categories, and hero banner for ${settings.city}`
                  : 'Enter password to access merchant controls & settings'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold border border-neutral-700 transition-colors cursor-pointer"
                title="Lock admin session"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Lock Session</span>
              </button>
            )}

            <button
              id="close-admin-modal-btn"
              type="button"
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* -------------------- LOGIN SCREEN -------------------- */}
        {!isAuthenticated ? (
          <div className="p-6 sm:p-10 flex flex-col items-center justify-center max-w-md mx-auto my-auto text-center space-y-6 w-full">
            <div className="w-16 h-16 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-900 shadow-xs">
              <KeyRound className="w-8 h-8 text-neutral-800" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-neutral-950 font-mono">Store Admin Login</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Please enter your store password to manage products, categories, customer orders, and store settings.
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
                  className="flex-1 py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold rounded-xl transition-colors text-center cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  id="admin-login-submit-btn"
                  type="submit"
                  className="flex-2 py-2.5 px-4 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Unlock Admin Portal</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* -------------------- AUTHENTICATED PORTAL -------------------- */
          <>
            {/* Tab Navigation */}
            <div className="p-2 sm:px-6 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                <button
                  id="admin-tab-products"
                  onClick={() => setActiveTab('products')}
                  className={`px-3 py-2 text-xs sm:text-sm font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'products' ? 'bg-neutral-900 text-white shadow-xs' : 'text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Products</span>
                  <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'products' ? 'bg-neutral-700 text-white' : 'bg-neutral-200 text-neutral-700'}`}>
                    {products.length}
                  </span>
                </button>

                <button
                  id="admin-tab-categories"
                  onClick={() => {
                    setActiveTab('categories');
                    setIsAddingProduct(false);
                  }}
                  className={`px-3 py-2 text-xs sm:text-sm font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'categories' ? 'bg-neutral-900 text-white shadow-xs' : 'text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  <Layers className="w-4 h-4 text-amber-500" />
                  <span>Categories & Filters</span>
                  <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'categories' ? 'bg-neutral-700 text-white' : 'bg-neutral-200 text-neutral-700'}`}>
                    {activeCategories.length}
                  </span>
                </button>

                <button
                  id="admin-tab-hero"
                  onClick={() => {
                    setActiveTab('hero');
                    setIsAddingProduct(false);
                  }}
                  className={`px-3 py-2 text-xs sm:text-sm font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'hero' ? 'bg-neutral-900 text-white shadow-xs' : 'text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Hero & Banners</span>
                  {heroForm.enabled ? (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-emerald-500 text-white font-bold">
                      Active
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-neutral-300 text-neutral-600 font-medium">
                      Hidden
                    </span>
                  )}
                </button>

                <button
                  id="admin-tab-settings"
                  onClick={() => {
                    setActiveTab('settings');
                    setIsAddingProduct(false);
                  }}
                  className={`px-3 py-2 text-xs sm:text-sm font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'settings' ? 'bg-neutral-900 text-white shadow-xs' : 'text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Store Settings</span>
                </button>
              </div>
            </div>

            {/* ==================== TAB: PRODUCTS & INVENTORY ==================== */}
            {activeTab === 'products' && (
              <div className="p-4 sm:p-6 overflow-y-auto space-y-4 max-h-[72vh]">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900 font-mono">
                      Product Catalog ({products.length} Items)
                    </h3>
                    <p className="text-[11px] text-neutral-500">
                      Manage prices, stock status, sizing (S, M, L, XL, XXL), colors, and images
                    </p>
                  </div>

                  {!isAddingProduct && (
                    <button
                      onClick={startAddProduct}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-neutral-950 text-white text-xs font-semibold rounded-xl hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Product / Bundle</span>
                    </button>
                  )}
                </div>

                {/* Add / Edit Product Form */}
                {isAddingProduct ? (
                  <form onSubmit={handleSaveProduct} className="bg-neutral-50 p-4 sm:p-6 rounded-2xl border border-neutral-300 space-y-6">
                    <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <h4 className="font-bold text-sm text-neutral-900">
                          {editingProductId ? 'Edit Product & Specifications' : 'Add New Item / Outfit / Bundle to CrownBorn'}
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAddingProduct(false)}
                        className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 bg-neutral-200/80 px-2.5 py-1 rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>

                    {/* 1. Basic Details */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">1. Basic Information & Pricing</h5>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="sm:col-span-2">
                          <label className="block font-semibold text-neutral-700 mb-1">
                            Product / Bundle Title <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={productForm.name || ''}
                            onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                            placeholder="e.g. Heavyweight Boxy Drop-Shoulder Tee OR Urban Minimalist Combo Set"
                            className="w-full p-2.5 bg-white border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                          />
                        </div>

                        {/* Category Selector (Predefined vs Custom) */}
                        <div className="sm:col-span-2 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="block font-semibold text-neutral-700">
                              Category / Collection <span className="text-rose-500">*</span>
                            </label>
                            <div className="flex items-center gap-1 text-[11px]">
                              <button
                                type="button"
                                onClick={() => setCategoryMode('preset')}
                                className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                                  categoryMode === 'preset' ? 'bg-neutral-900 text-white font-bold' : 'text-neutral-500 hover:text-neutral-800'
                                }`}
                              >
                                Select Preset
                              </button>
                              <span className="text-neutral-300">|</span>
                              <button
                                type="button"
                                onClick={() => setCategoryMode('custom')}
                                className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                                  categoryMode === 'custom' ? 'bg-neutral-900 text-white font-bold' : 'text-neutral-500 hover:text-neutral-800'
                                }`}
                              >
                                Type Custom Name
                              </button>
                            </div>
                          </div>

                          {categoryMode === 'preset' ? (
                            <select
                              value={productForm.category || activeCategories[0] || 'T-Shirts'}
                              onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                              className="w-full p-2.5 bg-white border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                            >
                              {activeCategories.map((cat) => (
                                <option key={cat} value={cat}>
                                  {cat}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={customCategoryInput}
                              onChange={(e) => setCustomCategoryInput(e.target.value)}
                              placeholder="e.g. Full Set, Combo Drops, Accessories, Winter Collection"
                              className="w-full p-2.5 bg-white border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                            />
                          )}
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

                        <div className="sm:col-span-2">
                          <label className="block font-semibold text-neutral-700 mb-1">
                            Badge Tag (Optional)
                          </label>
                          <input
                            type="text"
                            value={productForm.tag || ''}
                            onChange={(e) => setProductForm({ ...productForm, tag: e.target.value })}
                            placeholder="e.g. Best Seller, Combo Drop, Limited Edition, New Arrival"
                            className="w-full p-2.5 bg-white border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 2. Custom Size Specifications */}
                    <div className="space-y-3 border-t border-neutral-200 pt-4">
                      <div className="flex items-center justify-between">
                        <h5 className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                          2. Size Options (Standard Sizes or Custom Sets / Free Size)
                        </h5>
                        <span className="text-[11px] text-neutral-500">
                          {(productForm.sizes || []).length} active size(s)
                        </span>
                      </div>

                      {/* Quick Standard Size Toggles */}
                      <div className="space-y-1.5">
                        <p className="text-[11px] text-neutral-500">Quick toggle standard sizes:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => {
                            const active = productForm.sizes?.includes(sz);
                            return (
                              <button
                                key={sz}
                                type="button"
                                onClick={() => handleToggleSize(sz)}
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                                  active
                                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-2xs'
                                    : 'bg-white text-neutral-600 border-neutral-300 hover:border-neutral-500'
                                }`}
                              >
                                {sz} {active && '✓'}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Custom Size Input */}
                      <div className="space-y-1.5 pt-1">
                        <p className="text-[11px] text-neutral-500">Or add custom size labels (e.g. "Free Size", "One Size", "Polo M + Pants L"):</p>
                        <div className="flex gap-2 max-w-md">
                          <input
                            type="text"
                            value={customSizeInput}
                            onChange={(e) => setCustomSizeInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddCustomSize();
                              }
                            }}
                            placeholder='e.g. Free Size, One Size, Set M (Chest 38 / Waist 30)'
                            className="flex-1 p-2 bg-white border border-neutral-300 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                          />
                          <button
                            type="button"
                            onClick={handleAddCustomSize}
                            className="px-3.5 py-2 bg-neutral-900 text-white text-xs font-semibold rounded-lg hover:bg-neutral-800 cursor-pointer"
                          >
                            + Add Size
                          </button>
                        </div>
                      </div>

                      {/* Active Sizes List */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(productForm.sizes || []).map((sz) => (
                          <span
                            key={sz}
                            className="inline-flex items-center gap-1.5 bg-neutral-900 text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-2xs"
                          >
                            <span>{sz}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSize(sz)}
                              className="text-neutral-400 hover:text-rose-300 cursor-pointer"
                              title="Remove size"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* 3. Description & Optional Fabric / Specifications */}
                    <div className="space-y-3 border-t border-neutral-200 pt-4">
                      <h5 className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                        3. Description & Specifications (Optional Clothing Badges)
                      </h5>

                      <div>
                        <label className="block font-semibold text-neutral-700 text-xs mb-1">
                          Product Description (Supports Multi-line / Outfits / Bundle breakdown)
                        </label>
                        <textarea
                          rows={4}
                          value={productForm.description || ''}
                          onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                          placeholder="Describe the fabric feel, bundle contents (e.g. 1x Drop-shoulder Tee + 1x Heavy Twill Shorts), sizing recommendations, care instructions, or styling tips..."
                          className="w-full p-2.5 bg-white border border-neutral-300 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-neutral-900 leading-relaxed font-sans"
                        />
                      </div>

                      {/* Key Bullet Points / Features */}
                      <div className="space-y-2">
                        <label className="block font-semibold text-neutral-700 text-xs">
                          Bullet Highlights / Specifications (Optional)
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
                            placeholder="e.g. Includes 1x Polo + 1x Chino Pants OR Pre-shrunk colorfast finish"
                            className="flex-1 p-2 bg-white border border-neutral-300 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                          />
                          <button
                            type="button"
                            onClick={handleAddFeature}
                            className="px-3.5 py-2 bg-neutral-900 text-white text-xs font-semibold rounded-lg hover:bg-neutral-800 cursor-pointer"
                          >
                            + Add Bullet
                          </button>
                        </div>

                        {/* Active Features List */}
                        <div className="space-y-1.5 pt-1">
                          {(productForm.features || []).map((feat, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-neutral-200 text-xs"
                            >
                              <span className="text-neutral-700">• {feat}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveFeature(idx)}
                                className="text-neutral-400 hover:text-rose-600 p-0.5 cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Optional Fabric and GSM Fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                        <div>
                          <label className="block font-semibold text-neutral-700 mb-1">
                            Fabric Material <span className="text-neutral-400 font-normal">(Optional)</span>
                          </label>
                          <input
                            type="text"
                            value={productForm.fabric || ''}
                            onChange={(e) => setProductForm({ ...productForm, fabric: e.target.value })}
                            placeholder="e.g. 100% Organic Combed Cotton (Leave blank for sets/combos)"
                            className="w-full p-2.5 bg-white border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                          />
                          <p className="text-[10px] text-neutral-400 mt-0.5">If left empty, the fabric badge will be cleanly hidden.</p>
                        </div>

                        <div>
                          <label className="block font-semibold text-neutral-700 mb-1">
                            Fabric Weight / GSM <span className="text-neutral-400 font-normal">(Optional)</span>
                          </label>
                          <input
                            type="text"
                            value={productForm.gsm || ''}
                            onChange={(e) => setProductForm({ ...productForm, gsm: e.target.value })}
                            placeholder="e.g. 220 GSM (Leave blank if not applicable)"
                            className="w-full p-2.5 bg-white border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                          />
                          <p className="text-[10px] text-neutral-400 mt-0.5">If left empty, the GSM badge will be cleanly hidden.</p>
                        </div>
                      </div>
                    </div>

                    {/* 4. Color / Variant Tagging */}
                    <div className="space-y-3 border-t border-neutral-200 pt-4">
                      <div className="flex items-center justify-between">
                        <h5 className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                          4. Color & Variant Tagging
                        </h5>
                        <span className="text-[11px] text-neutral-500">
                          {(productForm.colors || []).length} variant(s)
                        </span>
                      </div>

                      {/* Active Variants */}
                      <div className="flex flex-wrap gap-2">
                        {(productForm.colors || []).map((clr, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-neutral-300 text-xs shadow-2xs"
                          >
                            {clr.image ? (
                              <img src={clr.image} alt={clr.name} className="w-5 h-5 rounded object-cover border border-neutral-300" referrerPolicy="no-referrer" />
                            ) : (
                              <span className="w-4 h-4 rounded-full border border-neutral-300" style={{ backgroundColor: clr.hex }} />
                            )}
                            <span className="font-medium text-neutral-800">{clr.name}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveColor(idx)}
                              className="text-neutral-400 hover:text-rose-600 ml-0.5 p-0.5 cursor-pointer"
                              title="Remove variant"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add Variant Form */}
                      <div className="space-y-2 bg-white p-3 rounded-xl border border-neutral-200 text-xs">
                        <p className="font-semibold text-neutral-700">Add New Variant Tag:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={newColorHex}
                              onChange={(e) => setNewColorHex(e.target.value)}
                              className="w-8 h-8 rounded border border-neutral-300 cursor-pointer p-0.5 bg-white shrink-0"
                              title="Pick Swatch Color"
                            />
                            <input
                              type="text"
                              value={newColorName}
                              onChange={(e) => setNewColorName(e.target.value)}
                              placeholder="Variant Name (e.g. Navy Polo + Olive Chino)"
                              className="flex-1 p-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs focus:outline-hidden"
                            />
                          </div>

                          <div>
                            <input
                              type="text"
                              value={newColorImage}
                              onChange={(e) => setNewColorImage(e.target.value)}
                              placeholder="Optional Variant Image URL (https://...)"
                              className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs focus:outline-hidden"
                            />
                          </div>

                          <div>
                            <button
                              type="button"
                              onClick={handleAddColor}
                              className="w-full py-2 bg-neutral-900 text-white text-xs font-semibold rounded-lg hover:bg-neutral-800 cursor-pointer text-center"
                            >
                              + Add Variant Tag
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 5. Images Manager */}
                    <div className="space-y-3 border-t border-neutral-200 pt-4">
                      <h5 className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">5. Product Photos & Media</h5>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {(productForm.images || []).map((img, idx) => (
                          <div key={idx} className="relative group bg-white rounded-lg border border-neutral-300 overflow-hidden aspect-square">
                            <img src={img} alt="Product preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            {idx === 0 && (
                              <span className="absolute top-1 left-1 bg-neutral-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                Primary
                              </span>
                            )}
                            <div className="absolute inset-0 bg-neutral-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-1">
                              {idx !== 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleSetPrimaryImage(idx)}
                                  className="text-[10px] bg-white text-neutral-900 px-2 py-1 rounded font-bold hover:bg-neutral-100 cursor-pointer"
                                >
                                  Make Primary
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(idx)}
                                className="p-1 bg-rose-600 text-white rounded hover:bg-rose-700 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Image Input Options */}
                      <div className="flex flex-col sm:flex-row gap-2 pt-1 text-xs">
                        <div className="flex-1 flex gap-1.5">
                          <input
                            type="text"
                            value={newImageUrlInput}
                            onChange={(e) => setNewImageUrlInput(e.target.value)}
                            placeholder="Paste Image URL (https://...)"
                            className="flex-1 p-2 bg-white border border-neutral-300 rounded-lg text-xs focus:outline-hidden"
                          />
                          <button
                            type="button"
                            onClick={handleAddImageUrl}
                            className="px-3 py-2 bg-neutral-900 text-white font-semibold rounded-lg hover:bg-neutral-800 cursor-pointer"
                          >
                            Add URL
                          </button>
                        </div>

                        <label className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-neutral-300 rounded-lg font-semibold text-neutral-700 hover:bg-neutral-100 cursor-pointer">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Image File</span>
                          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                        </label>
                      </div>
                    </div>

                    {/* 6. Stock & Feature Flags */}
                    <div className="flex items-center gap-6 border-t border-neutral-200 pt-4 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={productForm.inStock ?? true}
                          onChange={(e) => setProductForm({ ...productForm, inStock: e.target.checked })}
                          className="w-4 h-4 rounded text-neutral-900 focus:ring-neutral-900"
                        />
                        <span className="font-semibold text-neutral-800">In Stock for Immediate Delivery</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={productForm.featured ?? false}
                          onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                          className="w-4 h-4 rounded text-neutral-900 focus:ring-neutral-900"
                        />
                        <span className="font-semibold text-neutral-800">Feature on Homepage</span>
                      </label>
                    </div>

                    {/* Save Product Action */}
                    <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-200">
                      <button
                        type="button"
                        onClick={() => setIsAddingProduct(false)}
                        className="px-4 py-2.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-200 rounded-xl cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>{editingProductId ? 'Update Product' : 'Save & Publish Product'}</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Product Grid / List in Admin */
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {products.map((prod) => (
                      <div
                        key={prod.id}
                        className="bg-white p-3 rounded-xl border border-neutral-200 shadow-xs flex flex-col justify-between hover:border-neutral-400 transition-colors"
                      >
                        <div className="space-y-2">
                          <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-neutral-100">
                            <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-900 text-white">
                              {prod.category}
                            </span>
                            {!prod.inStock && (
                              <span className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white">
                                Out of Stock
                              </span>
                            )}
                          </div>

                          <div>
                            <h4 className="font-bold text-xs sm:text-sm text-neutral-900 line-clamp-1">{prod.name}</h4>
                            <div className="flex items-center justify-between text-xs mt-1">
                              <span className="font-mono font-bold text-neutral-950">{formatBDT(prod.price)}</span>
                              <span className="text-[11px] text-neutral-500">
                                Sizes: {prod.sizes.join(', ')}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-neutral-100">
                          {/* In Stock toggle button */}
                          <button
                            type="button"
                            onClick={() => onUpdateProduct({ ...prod, inStock: !prod.inStock })}
                            className={`text-[10px] font-semibold px-2 py-1 rounded-md cursor-pointer ${
                              prod.inStock ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {prod.inStock ? '✓ In Stock' : '✕ Out of Stock'}
                          </button>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => startEditProduct(prod)}
                              className="p-1.5 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 rounded-lg cursor-pointer"
                              title="Edit product specs"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Delete "${prod.name}" permanently from the store?`)) {
                                  onDeleteProduct(prod.id);
                                }
                              }}
                              className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                              title="Delete product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ==================== TAB 3: DYNAMIC CATEGORIES & FILTERS ==================== */}
            {activeTab === 'categories' && (
              <div className="p-4 sm:p-6 overflow-y-auto space-y-5 max-h-[72vh]">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900 font-mono">
                      Dynamic Category & Type Management
                    </h3>
                    <p className="text-[11px] text-neutral-500">
                      Add, rename, or delete category tabs. Any change automatically updates customer navigation and filters live.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleResetCategories}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Default Categories</span>
                  </button>
                </div>

                {/* Add Category Form */}
                <form onSubmit={handleAddCategory} className="bg-neutral-50 p-4 rounded-xl border border-neutral-300 flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    required
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="New Category Name (e.g. Premium Polos, Denim, Accessories, Winter Sweaters)..."
                    className="flex-1 p-2.5 bg-white border border-neutral-300 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold rounded-lg shadow-sm flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Category Tab</span>
                  </button>
                </form>

                {/* Categories Table / List */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                    Active Categories ({activeCategories.length})
                  </h4>

                  <div className="divide-y divide-neutral-200 border border-neutral-200 rounded-xl bg-white overflow-hidden">
                    {activeCategories.map((cat, idx) => {
                      const count = products.filter((p) => p.category === cat).length;
                      const isEditing = editingCategoryIndex === idx;

                      return (
                        <div key={cat} className="p-3.5 flex items-center justify-between gap-3 hover:bg-neutral-50 transition-colors">
                          <div className="flex items-center gap-3 flex-1">
                            <span className="w-6 text-center text-xs font-mono text-neutral-400">{idx + 1}</span>

                            {isEditing ? (
                              <div className="flex items-center gap-2 flex-1 max-w-sm">
                                <input
                                  type="text"
                                  value={editingCategoryValue}
                                  onChange={(e) => setEditingCategoryValue(e.target.value)}
                                  className="w-full p-1.5 text-xs bg-white border border-neutral-300 rounded-md focus:outline-hidden"
                                  autoFocus
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveEditedCategory(idx)}
                                  className="p-1.5 bg-neutral-900 text-white rounded-md text-xs cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingCategoryIndex(null)}
                                  className="p-1.5 bg-neutral-200 text-neutral-700 rounded-md text-xs cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs sm:text-sm text-neutral-900">{cat}</span>
                                <span className="text-[11px] text-neutral-500 font-medium bg-neutral-100 px-2 py-0.5 rounded-full">
                                  {count} item{count !== 1 ? 's' : ''}
                                </span>
                              </div>
                            )}
                          </div>

                          {!isEditing && (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCategoryIndex(idx);
                                  setEditingCategoryValue(cat);
                                }}
                                className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-md cursor-pointer"
                                title="Rename Category"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteCategory(cat)}
                                className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-md cursor-pointer"
                                title="Delete Category"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ==================== TAB 4: HERO & BANNERS MANAGER ==================== */}
            {activeTab === 'hero' && (
              <form onSubmit={handleSaveHeroAndDrop} className="p-4 sm:p-6 overflow-y-auto space-y-6 max-h-[72vh]">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900 font-mono">
                      Hero Banner & Featured Drop Customization
                    </h3>
                    <p className="text-[11px] text-neutral-500">
                      Completely upload, replace, or hide the main homepage Hero Banner and Featured Drop showcase
                    </p>
                  </div>

                  {savedHeroNotice && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                      <Check className="w-3.5 h-3.5" /> Saved & Updated Live
                    </span>
                  )}
                </div>

                {/* Master Hero Banner Visibility Toggle */}
                <div className="bg-neutral-950 text-white p-4 rounded-2xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-xs sm:text-sm font-mono flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" /> Homepage Hero Banner Section
                    </span>
                    <p className="text-[11px] text-neutral-400">
                      Toggle to display or completely hide the top hero presentation section on your store homepage.
                    </p>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={heroForm.enabled}
                      onChange={(e) => setHeroForm({ ...heroForm, enabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                {heroForm.enabled && (
                  <div className="space-y-4">
                    {/* Hero Text Customization */}
                    <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-300 space-y-3">
                      <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                        Hero Headlines & Tagline
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block font-semibold text-neutral-700 mb-1">Top Badge Pill</label>
                          <input
                            type="text"
                            value={heroForm.badgeText || ''}
                            onChange={(e) => setHeroForm({ ...heroForm, badgeText: e.target.value })}
                            placeholder="e.g. Best Quality Products"
                            className="w-full p-2.5 bg-white border border-neutral-300 rounded-lg text-xs focus:outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-neutral-700 mb-1">Main Headline</label>
                          <input
                            type="text"
                            value={heroForm.title || ''}
                            onChange={(e) => setHeroForm({ ...heroForm, title: e.target.value })}
                            placeholder="e.g. WEAR YOUR EDGE."
                            className="w-full p-2.5 bg-white border border-neutral-300 rounded-lg text-xs focus:outline-hidden font-mono"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block font-semibold text-neutral-700 mb-1">Subtitle / Delivery Guarantee</label>
                          <input
                            type="text"
                            value={heroForm.subtitle || ''}
                            onChange={(e) => setHeroForm({ ...heroForm, subtitle: e.target.value })}
                            placeholder="e.g. Delivered directly to your doorstep with Fast Delivery."
                            className="w-full p-2.5 bg-white border border-neutral-300 rounded-lg text-xs focus:outline-hidden"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Featured Drop Showcase Box Customization */}
                    <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-300 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                          Featured Drop Visual Showcase Card
                        </h4>

                        <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={featuredDropForm.enabled}
                            onChange={(e) => setFeaturedDropForm({ ...featuredDropForm, enabled: e.target.checked })}
                            className="w-4 h-4 rounded text-neutral-900"
                          />
                          <span>Show Drop Card</span>
                        </label>
                      </div>

                      {featuredDropForm.enabled && (
                        <div className="space-y-3">
                          {/* Quick Link from Existing Product */}
                          <div className="bg-white p-3 rounded-lg border border-neutral-200">
                            <label className="block text-xs font-semibold text-neutral-700 mb-1">
                              Quick Autofill from Catalog Product:
                            </label>
                            <select
                              onChange={(e) => handleSelectProductForDrop(e.target.value)}
                              value={featuredDropForm.productId || ''}
                              className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs focus:outline-hidden cursor-pointer"
                            >
                              <option value="">-- Choose a product to feature --</option>
                              {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} ({formatBDT(p.price)})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                              <label className="block font-semibold text-neutral-700 mb-1">Featured Card Title</label>
                              <input
                                type="text"
                                value={featuredDropForm.title || ''}
                                onChange={(e) => setFeaturedDropForm({ ...featuredDropForm, title: e.target.value })}
                                placeholder="e.g. Heavyweight Boxy Tee"
                                className="w-full p-2.5 bg-white border border-neutral-300 rounded-lg text-xs focus:outline-hidden"
                              />
                            </div>

                            <div>
                              <label className="block font-semibold text-neutral-700 mb-1">Subtitle / Spec</label>
                              <input
                                type="text"
                                value={featuredDropForm.subtitle || ''}
                                onChange={(e) => setFeaturedDropForm({ ...featuredDropForm, subtitle: e.target.value })}
                                placeholder="e.g. 220 GSM 100% Combed Cotton"
                                className="w-full p-2.5 bg-white border border-neutral-300 rounded-lg text-xs focus:outline-hidden"
                              />
                            </div>

                            <div>
                              <label className="block font-semibold text-neutral-700 mb-1">Price (৳ BDT)</label>
                              <input
                                type="number"
                                value={featuredDropForm.price || ''}
                                onChange={(e) => setFeaturedDropForm({ ...featuredDropForm, price: Number(e.target.value) })}
                                placeholder="550"
                                className="w-full p-2.5 bg-white border border-neutral-300 rounded-lg text-xs focus:outline-hidden font-mono"
                              />
                            </div>

                            <div>
                              <label className="block font-semibold text-neutral-700 mb-1">Badge Text</label>
                              <input
                                type="text"
                                value={featuredDropForm.badgeText || ''}
                                onChange={(e) => setFeaturedDropForm({ ...featuredDropForm, badgeText: e.target.value })}
                                placeholder="e.g. Featured Drop"
                                className="w-full p-2.5 bg-white border border-neutral-300 rounded-lg text-xs focus:outline-hidden"
                              />
                            </div>
                          </div>

                          {/* Image Manager for Drop Card */}
                          <div className="space-y-2 pt-2 border-t border-neutral-200">
                            <label className="block text-xs font-semibold text-neutral-700">
                              Drop Showcase Image:
                            </label>

                            {featuredDropForm.image ? (
                              <div className="relative rounded-xl overflow-hidden border border-neutral-300 max-w-xs aspect-video bg-neutral-900">
                                <img
                                  src={featuredDropForm.image}
                                  alt="Featured Drop Preview"
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                                <button
                                  type="button"
                                  onClick={() => setFeaturedDropForm({ ...featuredDropForm, image: '' })}
                                  className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 text-xs flex items-center gap-1 shadow-md cursor-pointer"
                                  title="Remove image"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Remove</span>
                                </button>
                              </div>
                            ) : (
                              <p className="text-xs text-amber-700 font-medium">No image attached yet. Add an image below.</p>
                            )}

                            <div className="flex flex-col sm:flex-row gap-2 text-xs pt-1">
                              <div className="flex-1 flex gap-1.5">
                                <input
                                  type="text"
                                  value={dropImageUrlInput}
                                  onChange={(e) => setDropImageUrlInput(e.target.value)}
                                  placeholder="Paste image URL (https://...)"
                                  className="flex-1 p-2 bg-white border border-neutral-300 rounded-lg text-xs focus:outline-hidden"
                                />
                                <button
                                  type="button"
                                  onClick={handleAddDropImageUrl}
                                  className="px-3 py-2 bg-neutral-900 text-white font-semibold rounded-lg hover:bg-neutral-800 cursor-pointer"
                                >
                                  Set URL
                                </button>
                              </div>

                              <label className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-neutral-300 rounded-lg font-semibold text-neutral-700 hover:bg-neutral-100 cursor-pointer">
                                <Upload className="w-3.5 h-3.5" />
                                <span>Upload File</span>
                                <input type="file" accept="image/*" onChange={handleFeaturedDropFileUpload} className="hidden" />
                              </label>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Save button */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Hero & Banner Changes</span>
                  </button>
                </div>
              </form>
            )}

            {/* ==================== TAB 5: STORE & DELIVERY SETTINGS ==================== */}
            {activeTab === 'settings' && (
              <div className="p-4 sm:p-6 overflow-y-auto space-y-6 max-h-[72vh]">
                <form onSubmit={handleSaveSettings} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900 font-mono">Store & WhatsApp Settings</h3>
                      <p className="text-[11px] text-neutral-500">
                        Configure WhatsApp numbers, delivery charges, announcement notice, and city dispatch
                      </p>
                    </div>

                    {savedSettingsNotice && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                        <Check className="w-3.5 h-3.5" /> Saved Live
                      </span>
                    )}
                  </div>

                  <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-300 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block font-semibold text-neutral-700 mb-1">Store Brand Name</label>
                        <input
                          type="text"
                          required
                          value={formSettings.storeName}
                          onChange={(e) => setFormSettings({ ...formSettings, storeName: e.target.value })}
                          className="w-full p-2.5 bg-white border border-neutral-300 rounded-lg text-xs font-bold font-mono"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-neutral-700 mb-1">City / Base Location</label>
                        <input
                          type="text"
                          required
                          value={formSettings.city}
                          onChange={(e) => setFormSettings({ ...formSettings, city: e.target.value })}
                          className="w-full p-2.5 bg-white border border-neutral-300 rounded-lg text-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-neutral-700 mb-1">
                          WhatsApp Number (International format e.g. 8801866068916)
                        </label>
                        <input
                          type="text"
                          required
                          value={formSettings.whatsappNumber}
                          onChange={(e) => setFormSettings({ ...formSettings, whatsappNumber: e.target.value })}
                          className="w-full p-2.5 bg-white border border-neutral-300 rounded-lg text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-neutral-700 mb-1">
                          WhatsApp Display Phone (e.g. +880 1866-068916)
                        </label>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            required
                            value={formSettings.whatsappDisplayNumber}
                            onChange={(e) => setFormSettings({ ...formSettings, whatsappDisplayNumber: e.target.value })}
                            className="flex-1 p-2.5 bg-white border border-neutral-300 rounded-lg text-xs font-mono"
                          />
                          <a
                            href={testWhatsAppUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                            title="Test WhatsApp Link"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Test</span>
                          </a>
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-neutral-700 mb-1">
                          Inside {formSettings.city} Delivery Fee (৳ BDT)
                        </label>
                        <input
                          type="number"
                          required
                          value={formSettings.insideCityDeliveryFee}
                          onChange={(e) => setFormSettings({ ...formSettings, insideCityDeliveryFee: Number(e.target.value) })}
                          className="w-full p-2.5 bg-white border border-neutral-300 rounded-lg text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-neutral-700 mb-1">
                          Outside City / Nationwide Delivery Fee (৳ BDT)
                        </label>
                        <input
                          type="number"
                          required
                          value={formSettings.outsideCityDeliveryFee}
                          onChange={(e) => setFormSettings({ ...formSettings, outsideCityDeliveryFee: Number(e.target.value) })}
                          className="w-full p-2.5 bg-white border border-neutral-300 rounded-lg text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-neutral-700 mb-1">
                          Free Delivery Threshold (৳ BDT)
                        </label>
                        <input
                          type="number"
                          required
                          value={formSettings.freeDeliveryThreshold}
                          onChange={(e) => setFormSettings({ ...formSettings, freeDeliveryThreshold: Number(e.target.value) })}
                          className="w-full p-2.5 bg-white border border-neutral-300 rounded-lg text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-neutral-700 mb-1">Store Dispatch Address</label>
                        <input
                          type="text"
                          value={formSettings.storeAddress}
                          onChange={(e) => setFormSettings({ ...formSettings, storeAddress: e.target.value })}
                          className="w-full p-2.5 bg-white border border-neutral-300 rounded-lg text-xs"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block font-semibold text-neutral-700 mb-1">Top Announcement Notice Bar</label>
                        <input
                          type="text"
                          value={formSettings.bannerNotice}
                          onChange={(e) => setFormSettings({ ...formSettings, bannerNotice: e.target.value })}
                          className="w-full p-2.5 bg-white border border-neutral-300 rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save Store Settings</span>
                      </button>
                    </div>
                  </div>
                </form>

                {/* Password Change Box */}
                <form onSubmit={handlePasswordChangeSubmit} className="bg-neutral-50 p-4 rounded-xl border border-neutral-300 space-y-3">
                  <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-neutral-600" />
                    <span>Change Admin Password</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold text-neutral-700 mb-1">Current Password</label>
                      <input
                        type="password"
                        required
                        value={currentPasswordConfirm}
                        onChange={(e) => setCurrentPasswordConfirm(e.target.value)}
                        placeholder="Current admin password"
                        className="w-full p-2 bg-white border border-neutral-300 rounded-lg text-xs font-mono focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-neutral-700 mb-1">New Password (min. 6 chars)</label>
                      <input
                        type="password"
                        required
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="w-full p-2 bg-white border border-neutral-300 rounded-lg text-xs font-mono focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {passwordChangeError && (
                    <p className="text-xs text-rose-600 font-medium">{passwordChangeError}</p>
                  )}
                  {passwordChangeSuccess && (
                    <p className="text-xs text-emerald-600 font-medium">✓ Admin password updated successfully!</p>
                  )}

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg cursor-pointer"
                    >
                      Update Password
                    </button>
                  </div>
                </form>

                {/* Reset Data Box */}
                <div className="bg-rose-50/70 p-4 rounded-xl border border-rose-200 space-y-2">
                  <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                    Danger Zone: Reset Store Data
                  </h4>
                  <p className="text-xs text-rose-700">
                    Reset all products, settings, and orders back to the initial CrownBorn catalogue.
                  </p>

                  {showResetConfirm ? (
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          onResetDemoData();
                          setShowResetConfirm(false);
                        }}
                        className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700 cursor-pointer"
                      >
                        Yes, Reset Everything
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowResetConfirm(false)}
                        className="px-3 py-2 bg-neutral-200 text-neutral-700 text-xs font-semibold rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowResetConfirm(true)}
                      className="px-3.5 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold rounded-lg border border-rose-300 transition-colors cursor-pointer"
                    >
                      Reset Store to Initial Data
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
