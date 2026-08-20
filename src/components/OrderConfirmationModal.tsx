import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, MessageCircle, Truck, Package, Copy, Check, ShieldCheck, X } from 'lucide-react';
import { Order, StoreSettings } from '../types';
import { formatBDT, createOrderReceiptWhatsAppUrl } from '../utils/helpers';

interface OrderConfirmationModalProps {
  order: Order | null;
  settings: StoreSettings;
  onClose: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  settings,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (order) {
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.6 },
      });
      setCopied(false);
    }
  }, [order]);

  if (!order) return null;

  const whatsappReceiptUrl = createOrderReceiptWhatsAppUrl(order, settings);

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div id="order-confirm-backdrop" className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto" onClick={onClose}>
      <div
        id="order-confirm-card"
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-lg rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col relative animate-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          id="close-confirmation-modal-btn"
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Celebration Header */}
        <div className="bg-emerald-700 text-white p-6 text-center space-y-2">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 className="w-9 h-9 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-mono">Order Received!</h2>
          <p className="text-xs text-emerald-100 max-w-xs mx-auto">
            Thank you, {order.customerName}. Your Cash on Delivery order is recorded and prepared for dispatch in {settings.city}.
          </p>
        </div>

        {/* Order Details Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {/* Order ID Box */}
          <div className="flex items-center justify-between p-3.5 bg-neutral-100 rounded-xl border border-neutral-200">
            <div>
              <span className="text-[11px] text-neutral-500 font-medium block">Order ID Reference:</span>
              <span className="text-base font-black font-mono text-neutral-900">{order.orderNumber}</span>
            </div>
            <button
              id="copy-order-id-btn"
              type="button"
              onClick={copyOrderNumber}
              className={`px-2.5 py-1 border rounded-lg font-medium flex items-center gap-1 text-[11px] transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                  : 'bg-white hover:bg-neutral-200 border-neutral-300 text-neutral-700'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-white" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Delivery & Payment note */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>Cash on Delivery (COD) Reminder</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-normal">
              Keep <strong>{formatBDT(order.totalAmount)}</strong> cash ready. Our delivery executive will call your number (<strong>{order.customerPhone}</strong>) before arrival at <em>{order.deliveryArea}</em>.
            </p>
          </div>

          {/* Items Summary */}
          <div className="space-y-2 border-t border-neutral-200 pt-3">
            <h4 className="font-bold text-neutral-900 uppercase tracking-wider text-[11px]">
              Ordered Clothing Items
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-neutral-50 p-2 rounded-lg border border-neutral-100">
                  <div className="flex items-center gap-2">
                    <img src={item.image} alt={item.productName} className="w-10 h-10 object-cover rounded bg-neutral-200" referrerPolicy="no-referrer" />
                    <div>
                      <p className="font-semibold text-neutral-900 text-[11px] line-clamp-1">{item.productName}</p>
                      <p className="text-[10px] text-neutral-500">Size: {item.size} • Color: {item.color} • Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-neutral-900">{formatBDT(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Price Totals */}
          <div className="space-y-1 pt-2 border-t border-neutral-200 text-neutral-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-mono font-medium text-neutral-900">{formatBDT(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee ({order.deliveryArea.split('(')[0]})</span>
              <span className="font-mono font-medium text-neutral-900">{order.deliveryFee === 0 ? 'FREE' : formatBDT(order.deliveryFee)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-neutral-950 pt-1 border-t border-neutral-200">
              <span>Total to Pay at Doorstep</span>
              <span className="font-mono text-base">{formatBDT(order.totalAmount)}</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2 pt-3 border-t border-neutral-200">
            {/* Direct WhatsApp Sync Button */}
            <a
              id="confirm-whatsapp-sync-btn"
              href={whatsappReceiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-all active:scale-98 shadow-sm flex items-center justify-center gap-2 text-center"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Send Order to Store's WhatsApp</span>
            </a>

            <button
              id="continue-shopping-confirm-btn"
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-3 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 text-center"
            >
              <span>Continue Shopping</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
