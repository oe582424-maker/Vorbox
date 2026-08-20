import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { StoreSettings } from '../types';
import { cleanPhoneForWhatsApp } from '../utils/helpers';

interface FloatingWhatsAppWidgetProps {
  settings: StoreSettings;
}

export const FloatingWhatsAppWidget: React.FC<FloatingWhatsAppWidgetProps> = ({ settings }) => {
  const [tooltipDismissed, setTooltipDismissed] = useState(false);

  const whatsappUrl = `https://wa.me/${cleanPhoneForWhatsApp(settings.whatsappNumber)}?text=${encodeURIComponent(
    `Hello ${settings.storeName}! I want to order clothing or ask about delivery in ${settings.city}.`
  )}`;

  return (
    <div id="floating-whatsapp-widget" className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2">
      {/* Friendly Tooltip */}
      {!tooltipDismissed && (
        <div className="hidden sm:flex items-center gap-2 bg-white text-neutral-900 px-3.5 py-2 rounded-2xl shadow-xl border border-neutral-200 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Need help or want to order on WhatsApp?</span>
          <button
            type="button"
            onClick={() => setTooltipDismissed(true)}
            className="text-neutral-400 hover:text-neutral-700 p-0.5 ml-1"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Floating Button */}
      <a
        id="floating-whatsapp-btn"
        href={whatsappUrl}
        className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-200"
        title="Chat or Order directly on WhatsApp"
        aria-label="WhatsApp Contact"
      >
        <MessageCircle className="w-7 h-7" />
      </a>
    </div>
  );
};
