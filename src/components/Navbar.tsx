import React, { useState } from 'react';
import { ShoppingBag, Settings, Menu, X } from 'lucide-react';
import { StoreSettings } from '../types';

interface NavbarProps {
  settings: StoreSettings;
  cartCount: number;
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  onOpenSizeGuide: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  cartCount,
  onOpenCart,
  onOpenAdmin,
  onOpenSizeGuide,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header id="main-header" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Brand Logo & Location badge */}
          <div className="flex items-center gap-3 sm:gap-4">
            <a href="#" className="flex flex-col group">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 font-mono flex items-center gap-1.5">
                {settings.storeName}
                <span className="w-2 h-2 rounded-full bg-neutral-900 group-hover:scale-125 transition-transform" />
              </span>
              <span className="text-[10px] tracking-widest uppercase text-neutral-500 font-medium -mt-1 hidden sm:block">
                {settings.tagline}
              </span>
            </a>

            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-[11px] font-medium text-neutral-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>COD in {settings.city}</span>
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Size Guide Button */}
            <button
              id="size-guide-nav-btn"
              onClick={onOpenSizeGuide}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100 rounded-full border border-neutral-200 transition-colors"
            >
              <span>Size Guide</span>
            </button>

            {/* Cart Drawer Trigger - High Visibility Design */}
            <button
              id="cart-drawer-trigger-btn"
              onClick={onOpenCart}
              className={`relative inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 min-h-[42px] sm:min-h-[44px] rounded-full transition-all duration-200 active:scale-95 cursor-pointer shadow-sm ${
                cartCount > 0
                  ? 'bg-neutral-950 text-white ring-2 ring-emerald-500/80 shadow-emerald-500/20 shadow-md hover:bg-neutral-900'
                  : 'bg-neutral-900 text-white hover:bg-neutral-800'
              }`}
              aria-label={`Open Shopping Bag with ${cartCount} items`}
            >
              {/* Glowing active dot when cart has items */}
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white" />
                </span>
              )}

              <div className="relative">
                <ShoppingBag className={`w-4 h-4 sm:w-5 sm:h-5 ${cartCount > 0 ? 'text-emerald-400' : 'text-white'}`} />
              </div>

              <span className="font-bold text-xs sm:text-sm tracking-tight">Bag</span>

              <span
                id="cart-count-badge"
                className={`flex items-center justify-center min-w-[22px] h-[22px] px-1.5 text-[11px] sm:text-xs font-black rounded-full transition-transform ${
                  cartCount > 0
                    ? 'bg-emerald-500 text-white shadow-xs scale-105'
                    : 'bg-neutral-800 text-neutral-300'
                }`}
              >
                {cartCount}
              </span>
            </button>

            {/* Store Admin & Settings */}
            <button
              id="admin-settings-nav-btn"
              onClick={onOpenAdmin}
              className="p-2 text-neutral-500 hover:text-neutral-900 rounded-full hover:bg-neutral-100 transition-colors"
              title="CrownBorn Store Manager / Admin"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-neutral-700 hover:text-neutral-900 md:hidden rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-neutral-100 flex flex-col gap-2">
            <button
              id="mobile-size-guide-btn"
              onClick={() => {
                onOpenSizeGuide();
                setMobileMenuOpen(false);
              }}
              className="text-left px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 rounded-lg"
            >
              📏 Bangladeshi Size Measurement Guide
            </button>
            <button
              id="mobile-admin-btn"
              onClick={() => {
                onOpenAdmin();
                setMobileMenuOpen(false);
              }}
              className="text-left px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 rounded-lg flex items-center justify-between"
            >
              <span>⚙️ Store Manager (Admin)</span>
              <span className="text-xs text-emerald-600 font-semibold">Orders & Stock</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
