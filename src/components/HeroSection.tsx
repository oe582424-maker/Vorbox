import React from 'react';
import { ShoppingBag, MessageCircle, ShieldCheck, Truck, RefreshCw, Sparkles } from 'lucide-react';
import { StoreSettings } from '../types';
import { cleanPhoneForWhatsApp } from '../utils/helpers';

interface HeroSectionProps {
  settings: StoreSettings;
  onExploreClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ settings, onExploreClick }) => {
  // If hero banner is disabled in settings, do not render
  if (settings.showHeroBanner === false || (settings.heroSettings && settings.heroSettings.enabled === false)) {
    return null;
  }

  const whatsappConsultUrl = `https://wa.me/${cleanPhoneForWhatsApp(settings.whatsappNumber)}?text=${encodeURIComponent(
    `Hello ${settings.storeName}! I want to know about your latest clothing collection.`
  )}`;

  const heroBadge = settings.heroSettings?.badgeText || 'Best Quality Products';
  const heroTitle = settings.heroSettings?.title || 'WEAR YOUR EDGE.';
  const heroSubtitle = settings.heroSettings?.subtitle || 'Delivered directly to your doorstep with Fast Delivery.';
  const heroDescription = settings.heroSettings?.description || (
    <>
      Premium 100% combed cotton t-shirts, refined polos, signature panjabis, and everyday street fits. Zero hassle ordering with{' '}
      <strong className="text-white font-medium">Cash on Delivery</strong> and instant{' '}
      <strong className="text-emerald-400 font-medium">1-Click WhatsApp confirmation</strong>.
    </>
  );

  return (
    <section id="hero-section" className="relative bg-neutral-900 text-white overflow-hidden">
      {/* Subtle geometric grid background */}
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-18">
        <div className="max-w-3xl flex flex-col items-start space-y-5 sm:space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-800/90 border border-neutral-700 text-neutral-300 text-xs font-medium tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>{heroBadge}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-mono uppercase leading-tight">
            {heroTitle}<br />
            <span className="text-neutral-400 font-sans normal-case font-normal text-2xl sm:text-4xl block mt-1">
              {heroSubtitle}
            </span>
          </h1>

          <p className="text-sm sm:text-base text-neutral-300 max-w-2xl font-normal leading-relaxed">
            {typeof heroDescription === 'string' ? heroDescription : heroDescription}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2 w-full sm:w-auto">
            <button
              id="hero-explore-btn"
              onClick={onExploreClick}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-neutral-950 hover:bg-neutral-100 font-semibold text-sm rounded-full transition-all active:scale-95 shadow-md cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Shop All Items</span>
            </button>

            <a
              id="hero-whatsapp-btn"
              href={whatsappConsultUrl}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-full transition-all active:scale-95 shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>

          {/* Value Props Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-neutral-800 w-full text-neutral-300">
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="text-left">
                <p className="text-xs font-semibold text-white">Fast Delivery</p>
                <p className="text-[11px] text-neutral-400">Fast doorstep drop</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="text-left">
                <p className="text-xs font-semibold text-white">Cash on Delivery</p>
                <p className="text-[11px] text-neutral-400">Pay when you receive</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <RefreshCw className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="text-left">
                <p className="text-xs font-semibold text-white">Easy Exchange</p>
                <p className="text-[11px] text-neutral-400">Hassle-free size swap</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
