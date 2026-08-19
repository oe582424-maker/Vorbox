import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, MessageCircle, Truck, ArrowRight, ShieldCheck } from 'lucide-react';
import { CartItem, StoreSettings } from '../types';
import { formatBDT, createCartWhatsAppUrl } from '../utils/helpers';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  settings: StoreSettings;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  settings,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const isFreeDelivery = subtotal >= settings.freeDeliveryThreshold;
  const deliveryFee = cart.length === 0 ? 0 : isFreeDelivery ? 0 : settings.insideCityDeliveryFee;
  const total = subtotal + deliveryFee;
  const amountNeededForFreeDelivery = Math.max(0, settings.freeDeliveryThreshold - subtotal);
  const freeDeliveryProgress = Math.min(100, Math.round((subtotal / settings.freeDeliveryThreshold) * 100));

  const directWhatsAppUrl = createCartWhatsAppUrl(
    cart,
    {
      area: `${settings.city} Sadar`,
    },
    deliveryFee,
    settings
  );

  return (
    <div id="cart-drawer-backdrop" className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex justify-end" onClick={onClose}>
      <div
        id="cart-drawer-panel"
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300 relative"
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-neutral-900" />
            <h2 className="text-base sm:text-lg font-black text-neutral-900 font-mono">
              Your Bag ({cart.reduce((sum, i) => sum + i.quantity, 0)})
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                type="button"
                onClick={onClearCart}
                className="text-[11px] text-neutral-400 hover:text-rose-600 transition-colors"
              >
                Clear all
              </button>
            )}
            <button
              id="close-cart-drawer-btn"
              type="button"
              onClick={onClose}
              className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded-full hover:bg-neutral-100 transition-colors"
              aria-label="Close Shopping Bag"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Free Delivery Bar inside City */}
        {cart.length > 0 && (
          <div className="bg-neutral-50 p-3 border-b border-neutral-200">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium text-neutral-700 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-emerald-600" />
                {isFreeDelivery ? (
                  <strong className="text-emerald-700 font-bold">🎉 Free Delivery Unlocked!</strong>
                ) : (
                  <span>Add <strong className="text-neutral-900 font-mono">{formatBDT(amountNeededForFreeDelivery)}</strong> more for Free Delivery</span>
                )}
              </span>
              <span className="text-[11px] font-mono text-neutral-500">{freeDeliveryProgress}%</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${isFreeDelivery ? 'bg-emerald-500' : 'bg-neutral-900'}`}
                style={{ width: `${freeDeliveryProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-neutral-900 text-base">Your bag is empty</h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-xs">
                  Discover our minimalist clothing drops crafted from premium combed cotton.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-neutral-900 text-white rounded-full text-xs font-semibold hover:bg-neutral-800 transition-colors"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                id={`cart-item-${item.id}`}
                className="flex gap-3 bg-neutral-50 p-3 rounded-xl border border-neutral-200"
              >
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="w-18 h-22 object-cover rounded-lg bg-neutral-200 shrink-0"
                  referrerPolicy="no-referrer"
                />

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-bold text-neutral-900 text-xs sm:text-sm line-clamp-1">
                        {item.product.name}
                      </h4>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.id)}
                        className="text-neutral-400 hover:text-rose-600 p-1 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-600">
                      <span className="bg-white px-2 py-0.5 rounded border border-neutral-200 font-medium">
                        Size: {item.selectedSize}
                      </span>
                      <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-neutral-200 font-medium">
                        <span
                          className="w-2 h-2 rounded-full border border-black/20"
                          style={{ backgroundColor: item.selectedColor.hex }}
                        />
                        {item.selectedColor.name}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-neutral-200/60">
                    <div className="flex items-center border border-neutral-300 rounded-md bg-white">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="px-2 py-0.5 text-xs text-neutral-700 hover:bg-neutral-100"
                        title="Decrease"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-mono font-bold text-neutral-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="px-2 py-0.5 text-xs text-neutral-700 hover:bg-neutral-100"
                        title="Increase"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="font-mono font-bold text-xs sm:text-sm text-neutral-900">
                      {formatBDT(item.product.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer & Checkout CTAs */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-neutral-200 bg-white space-y-3 shadow-lg">
            {/* Calculation rows */}
            <div className="space-y-1.5 text-xs text-neutral-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono font-semibold text-neutral-900">{formatBDT(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">
                  <span>Delivery ({settings.city})</span>
                  {isFreeDelivery && <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1 rounded font-semibold">FREE</span>}
                </span>
                <span className="font-mono font-semibold text-neutral-900">
                  {deliveryFee === 0 ? '৳0' : formatBDT(deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-neutral-950 pt-2 border-t border-neutral-200">
                <span>Total to Pay (COD)</span>
                <span className="font-mono text-base">{formatBDT(total)}</span>
              </div>
            </div>

            {/* Main Action Buttons */}
            <div className="pt-1">
              {/* Single Green WhatsApp Button to proceed to Cash on Delivery / WhatsApp Checkout */}
              <button
                id="drawer-whatsapp-checkout-btn"
                type="button"
                onClick={onProceedToCheckout}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-all active:scale-98 shadow-md flex items-center justify-center gap-2 text-center cursor-pointer"
                title="Proceed to WhatsApp & COD Checkout"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Order via WhatsApp (Free)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-center text-neutral-400">
              No online payment required • Pay cash upon doorstep delivery
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
