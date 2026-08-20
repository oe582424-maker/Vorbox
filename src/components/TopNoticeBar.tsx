import React from 'react';
import { PhoneCall, MessageCircle, MapPin, Truck } from 'lucide-react';
import { StoreSettings } from '../types';
import { cleanPhoneForWhatsApp } from '../utils/helpers';

interface TopNoticeBarProps {
  settings: StoreSettings;
}

export const TopNoticeBar: React.FC<TopNoticeBarProps> = ({ settings }) => {
  const whatsappUrl = `https://wa.me/${cleanPhoneForWhatsApp(settings.whatsappNumber)}?text=${encodeURIComponent(
    `Hello ${settings.storeName}! I have a question regarding products & fast delivery.`
  )}`;

  return (
    <div id="top-notice-bar" className="bg-neutral-950 text-neutral-300 text-xs font-normal border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-medium text-[11px] border border-emerald-500/30">
            <Truck className="w-3 h-3" /> Fast Delivery
          </span>
          <span className="hidden md:inline text-neutral-400">|</span>
          <span className="truncate">{settings.bannerNotice}</span>
        </div>

        <div className="flex items-center gap-4 text-[12px]">
          <div className="flex items-center gap-1 text-neutral-400">
            <Truck className="w-3.5 h-3.5 text-neutral-300" />
            <span>Cash on Delivery (COD)</span>
          </div>

          <a
            id="top-whatsapp-link"
            href={whatsappUrl}
            className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{settings.whatsappDisplayNumber ? `WhatsApp: ${settings.whatsappDisplayNumber}` : 'WhatsApp Support'}</span>
          </a>
        </div>
      </div>
    </div>
  );
};
