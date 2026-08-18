import React, { useState } from 'react';
import { X, ShieldCheck, MapPin, Phone, User, FileText, Truck, ArrowRight, MessageCircle } from 'lucide-react';
import { CartItem, Order, StoreSettings } from '../types';
import { SUNDARGANJ_DELIVERY_AREAS } from '../data/defaultData';
import { formatBDT, generateOrderNumber, createCartWhatsAppUrl } from '../utils/helpers';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  settings: StoreSettings;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  settings,
  onOrderSuccess,
}) => {
  if (!isOpen) return null;

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryArea, setDeliveryArea] = useState(SUNDARGANJ_DELIVERY_AREAS[0]);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const isFreeDelivery = subtotal >= settings.freeDeliveryThreshold;
  const isOutsideCity = deliveryArea.includes('Other Area');
  const deliveryFee = isFreeDelivery
    ? 0
    : isOutsideCity
    ? settings.outsideCityDeliveryFee
    : settings.insideCityDeliveryFee;
  const total = subtotal + deliveryFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }

    const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 14) {
      setErrorMsg('Please enter a valid active phone number (e.g. 017xxxxxxxx)');
      return;
    }

    if (!deliveryAddress.trim()) {
      setErrorMsg(`Please enter your village/road/house or landmark address in ${settings.city}`);
      return;
    }

    setIsSubmitting(true);

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      orderNumber: generateOrderNumber(),
      items: cart.map((i) => ({
        productId: i.productId,
        productName: i.product.name,
        size: i.selectedSize,
        color: i.selectedColor.name,
        price: i.product.price,
        quantity: i.quantity,
        image: i.product.images[0],
      })),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      deliveryArea,
      deliveryAddress: deliveryAddress.trim(),
      deliveryNotes: deliveryNotes.trim() || undefined,
      subtotal,
      deliveryFee,
      totalAmount: total,
      paymentMethod: 'Cash on Delivery (COD)',
      orderChannel: 'Website COD',
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    setTimeout(() => {
      setIsSubmitting(false);
      onOrderSuccess(newOrder);
    }, 400);
  };

  const whatsappCheckoutUrl = createCartWhatsAppUrl(
    cart,
    {
      name: customerName,
      phone: customerPhone,
      area: deliveryArea,
      address: deliveryAddress,
      notes: deliveryNotes,
    },
    deliveryFee,
    settings
  );

  return (
    <div id="checkout-modal-backdrop" className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto" onClick={onClose}>
      <div
        id="checkout-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col relative"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-900 text-white">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base sm:text-lg font-black font-mono">Cash on Delivery Checkout</h2>
              <p className="text-[11px] text-neutral-300">Serving {settings.city} • Pay when package is delivered</p>
            </div>
          </div>

          <button
            id="close-checkout-modal-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
              {errorMsg}
            </div>
          )}

          {/* Customer info */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              1. Customer & Contact Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="checkout-name-input"
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Tanvir Ahmed"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Phone Number (Active) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="checkout-phone-input"
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. 01712-345678"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Location in Sundarganj Thana */}
          <div className="space-y-3 pt-2 border-t border-neutral-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              2. Delivery Address in {settings.city}
            </h3>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Select Area / Zone <span className="text-rose-500">*</span>
              </label>
              <select
                id="checkout-area-select"
                value={deliveryArea}
                onChange={(e) => setDeliveryArea(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
              >
                {SUNDARGANJ_DELIVERY_AREAS.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Full Village / Road / House / Landmark Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                <textarea
                  id="checkout-address-input"
                  required
                  rows={2}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Village / Union, Road or Mor name, nearby School, College or Market landmark..."
                  className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-neutral-900 resize-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Delivery Note (Optional)
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="checkout-notes-input"
                  type="text"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="e.g. Call before coming, urgent delivery within 12h"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Badge */}
          <div className="space-y-2 pt-2 border-t border-neutral-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              3. Payment Method
            </h3>

            <div className="p-3.5 rounded-xl border-2 border-neutral-900 bg-neutral-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-neutral-900 flex items-center justify-center text-white text-xs">
                  ✓
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-neutral-900">Cash on Delivery (COD)</h4>
                  <p className="text-[11px] text-neutral-500">
                    Hand cash to our {settings.city} delivery rider once you inspect your package.
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                No Prepayment
              </span>
            </div>
          </div>

          {/* Order Summary Box */}
          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-2 text-xs">
            <div className="flex justify-between text-neutral-600">
              <span>Items Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
              <span className="font-mono font-semibold text-neutral-900">{formatBDT(subtotal)}</span>
            </div>

            <div className="flex justify-between text-neutral-600">
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-neutral-500" />
                <span>Delivery ({deliveryArea.split('(')[0].trim()})</span>
              </span>
              <span className="font-mono font-semibold text-neutral-900">
                {deliveryFee === 0 ? 'FREE' : formatBDT(deliveryFee)}
              </span>
            </div>

            <div className="flex justify-between text-sm font-black text-neutral-950 pt-2 border-t border-neutral-200">
              <span>Total Payable Amount</span>
              <span className="font-mono text-base text-neutral-950">{formatBDT(total)}</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2 pt-2">
            <button
              id="confirm-order-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-neutral-950 hover:bg-neutral-800 disabled:bg-neutral-400 text-white font-bold text-sm rounded-xl transition-all active:scale-98 shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Confirming your order...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Confirm Order (Pay {formatBDT(total)} on Delivery)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <a
              id="checkout-whatsapp-direct-link"
              href={whatsappCheckoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-all active:scale-98 shadow-sm flex items-center justify-center gap-2 text-center"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Or Place Directly via WhatsApp</span>
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};
