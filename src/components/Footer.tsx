import React from 'react';
import { MessageCircle, Phone, MapPin, Truck, ShieldCheck, RefreshCw, Heart } from 'lucide-react';
import { StoreSettings } from '../types';
import { cleanPhoneForWhatsApp } from '../utils/helpers';

interface FooterProps {
  settings: StoreSettings;
  onOpenSizeGuide: () => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onOpenSizeGuide,
  onOpenAdmin,
}) => {
  const whatsappUrl = `https://wa.me/${cleanPhoneForWhatsApp(settings.whatsappNumber)}?text=${encodeURIComponent(
    `Hello ${settings.storeName}! I want to inquire about clothing products and delivery.`
  )}`;

  return (
    <footer id="main-footer" className="bg-neutral-950 text-neutral-300 border-t border-neutral-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-neutral-800">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-white font-mono">{settings.storeName}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Everyday minimalist clothing crafted for effortless comfort and durable longevity. Direct Cash on Delivery and easy WhatsApp ordering.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-neutral-400">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{settings.storeAddress}</span>
            </div>
          </div>

          {/* Quick Ordering & Delivery Guarantees */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Delivery Guarantees
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Fast Doorstep Delivery</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Cash on Delivery (No advance card required)</span>
              </li>
              <li className="flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Hassle-Free Size Exchange</span>
              </li>
            </ul>
          </div>

          {/* Customer Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Customer Help & Sizing
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <button
                  type="button"
                  onClick={onOpenSizeGuide}
                  className="hover:text-white transition-colors text-left"
                >
                  📏 Bangladeshi Size Measurement Chart
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenAdmin}
                  className="hover:text-white transition-colors text-left text-neutral-500 hover:text-neutral-300"
                >
                  ⚙️ Store Management Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Direct WhatsApp Ordering */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Direct Contact & WhatsApp
            </h4>
            <p className="text-xs text-neutral-400">
              Have questions about sizes, bulk discounts, or urgent delivery?
            </p>
            <div className="space-y-2">
              <a
                id="footer-whatsapp-btn"
                href={whatsappUrl}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition-all shadow-sm w-full justify-center"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{settings.whatsappDisplayNumber ? `Chat: ${settings.whatsappDisplayNumber}` : 'Chat on WhatsApp'}</span>
              </a>
              <p className="text-[11px] text-neutral-500 text-center">
                Available daily: 9:00 AM - 11:00 PM
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} {settings.storeName}. All rights reserved.</p>
          <div className="flex items-center gap-1 text-[11px]">
            <span>Crafted with</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline" />
          </div>
        </div>
      </div>
    </footer>
  );
};
