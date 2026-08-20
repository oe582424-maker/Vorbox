import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, MapPin, Phone, User, FileText, Truck, ArrowRight, ArrowLeft, MessageCircle, Check, Minus, Plus } from 'lucide-react';
import { Product, StoreSettings, Order, CartItem } from '../types';
import { formatBDT, generateOrderNumber, createCartWhatsAppUrl } from '../utils/helpers';

interface QuickOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  initialSize?: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  initialColor?: { name: string; hex: string };
  initialQuantity?: number;
  initialStep?: 1 | 2;
  settings: StoreSettings;
  onOrderSuccess: (order: Order) => void;
  onOpenSizeGuide?: () => void;
}

export const QuickOrderModal: React.FC<QuickOrderModalProps> = ({
  isOpen,
  onClose,
  product,
  initialSize,
  initialColor,
  initialQuantity = 1,
  initialStep = 1,
  settings,
  onOrderSuccess,
  onOpenSizeGuide,
}) => {
  if (!isOpen || !product) return null;

  const [step, setStep] = useState<1 | 2>(initialStep);
  const [selectedSize, setSelectedSize] = useState<'S' | 'M' | 'L' | 'XL' | 'XXL'>(
    initialSize || product.sizes[0] || 'M'
  );
  const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string }>(
    initialColor || product.colors[0] || { name: 'Standard', hex: '#111' }
  );
  const [quantity, setQuantity] = useState<number>(initialQuantity || 1);

  // Step 2 Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedRegionType, setSelectedRegionType] = useState<'local' | 'nationwide'>('local');
  const [districtCity, setDistrictCity] = useState('');
  const [deliveryArea, setDeliveryArea] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state when product or initial values change
  useEffect(() => {
    if (product) {
      setSelectedSize(initialSize || product.sizes[0] || 'M');
      setSelectedColor(initialColor || product.colors[0] || { name: 'Standard', hex: '#111' });
      setQuantity(initialQuantity || 1);
      setStep(initialStep || 1);
      setErrorMsg('');
      setIsSubmitting(false);
    }
  }, [product, initialSize, initialColor, initialQuantity, initialStep]);

  const unitPrice = product.price;
  const subtotal = unitPrice * quantity;
  const isFreeDelivery = subtotal >= settings.freeDeliveryThreshold;
  const isOutsideCity = selectedRegionType !== 'local';
  const deliveryFee = isFreeDelivery
    ? 0
    : isOutsideCity
    ? settings.outsideCityDeliveryFee
    : settings.insideCityDeliveryFee;
  const total = subtotal + deliveryFee;

  // Single item formatted as CartItem for WhatsApp generator
  const directCartItem: CartItem = {
    id: `direct-${product.id}-${selectedSize}-${selectedColor.name}`,
    productId: product.id,
    product,
    selectedSize,
    selectedColor,
    quantity,
  };

  const handleProceedToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setStep(2);
  };

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }

    const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 14) {
      setErrorMsg('Please enter a valid active phone number (e.g. 018xxxxxxxx or 019xxxxxxxx)');
      return;
    }

    if (!districtCity.trim()) {
      setErrorMsg('Please enter your District / City');
      return;
    }

    if (!deliveryAddress.trim()) {
      setErrorMsg('Please enter your detailed street, house, or village address');
      return;
    }

    setIsSubmitting(true);

    const fullAreaString = [deliveryArea.trim(), districtCity.trim()].filter(Boolean).join(', ') || 'Home Delivery';

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      orderNumber: generateOrderNumber(),
      items: [
        {
          productId: product.id,
          productName: product.name,
          size: selectedSize,
          color: selectedColor.name,
          price: product.price,
          quantity,
          image: product.images[0],
        },
      ],
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      deliveryArea: fullAreaString,
      deliveryAddress: deliveryAddress.trim(),
      deliveryNotes: deliveryNotes.trim() || undefined,
      subtotal,
      deliveryFee,
      totalAmount: total,
      paymentMethod: 'Cash on Delivery (COD)',
      orderChannel: 'WhatsApp & Website COD',
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    const whatsappCheckoutUrl = createCartWhatsAppUrl(
      [directCartItem],
      {
        name: customerName,
        phone: customerPhone,
        district: districtCity,
        area: deliveryArea,
        address: deliveryAddress,
        notes: deliveryNotes,
      },
      deliveryFee,
      settings
    );

    // Save order in admin list (does NOT touch shopping bag)
    onOrderSuccess(newOrder);

    // IMMEDIATELY trigger direct redirect to WhatsApp without intermediate screens
    try {
      window.location.href = whatsappCheckoutUrl;
    } catch {
      window.open(whatsappCheckoutUrl, '_top');
    }
  };

  return (
    <div
      id="quick-order-modal-backdrop"
      className="fixed inset-0 z-50 bg-neutral-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="quick-order-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-lg rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col relative animate-scaleIn"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-900 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <h2 className="text-sm sm:text-base font-black font-mono tracking-tight">
                {step === 1 ? 'Quick Order — Select Variant' : 'Quick Order — Delivery Info'}
              </h2>
              <p className="text-[11px] text-neutral-300">
                {step === 1 ? 'Step 1 of 2: Choose color, size & quantity' : 'Step 2 of 2: Cash on Delivery details'}
              </p>
            </div>
          </div>

          <button
            id="close-quick-order-modal-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Bar */}
        <div className="flex border-b border-neutral-100 bg-neutral-50 px-4 py-2 text-xs font-semibold text-neutral-600 gap-4 shrink-0">
          <div className={`flex items-center gap-1.5 ${step === 1 ? 'text-neutral-900 font-bold' : 'text-neutral-500'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 1 ? 'bg-neutral-900 text-white' : 'bg-neutral-200 text-neutral-700'}`}>
              1
            </span>
            <span>Options</span>
          </div>
          <span className="text-neutral-300">→</span>
          <div className={`flex items-center gap-1.5 ${step === 2 ? 'text-neutral-900 font-bold' : 'text-neutral-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 2 ? 'bg-neutral-900 text-white' : 'bg-neutral-200 text-neutral-500'}`}>
              2
            </span>
            <span>Delivery & WhatsApp</span>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl animate-fadeIn">
              {errorMsg}
            </div>
          )}

          {/* STEP 1: VARIANT SELECTION */}
          {step === 1 && (
            <form onSubmit={handleProceedToStep2} className="space-y-5">
              {/* Product Preview Card */}
              <div className="flex items-center gap-3.5 p-3 bg-neutral-50 border border-neutral-200 rounded-xl">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-16 h-20 sm:w-20 sm:h-24 object-cover rounded-lg border border-neutral-200 bg-white shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-500 block">
                    {product.category}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-neutral-900 truncate">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-base font-mono font-black text-neutral-900">
                      {formatBDT(product.price)}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-xs font-mono text-neutral-400 line-through">
                        {formatBDT(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  <span className="inline-block mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Cash on Delivery Available
                  </span>
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
                  1. Select Color: <span className="text-neutral-900 font-semibold normal-case">{selectedColor.name}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => {
                    const isSelected = selectedColor.name === color.name;
                    return (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                            : 'border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span>{color.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 ml-0.5 text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Size Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider">
                    2. Select Size: <span className="text-neutral-900 font-semibold normal-case">{selectedSize}</span>
                  </label>
                  {onOpenSizeGuide && (
                    <button
                      type="button"
                      onClick={onOpenSizeGuide}
                      className="text-[11px] font-semibold text-neutral-600 hover:text-neutral-900 underline cursor-pointer"
                    >
                      Size Guide
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {product.sizes.map((size) => {
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`py-2.5 text-xs font-bold rounded-xl border transition-all text-center cursor-pointer ${
                          isSelected
                            ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs ring-2 ring-neutral-900/20'
                            : 'border-neutral-200 bg-white text-neutral-800 hover:border-neutral-400'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity Selection */}
              <div>
                <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
                  3. Quantity
                </label>
                <div className="flex items-center justify-between p-3 bg-neutral-50 border border-neutral-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-8 h-8 rounded-lg bg-white border border-neutral-300 flex items-center justify-center text-neutral-700 hover:bg-neutral-100 disabled:opacity-40 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center font-mono font-bold text-base text-neutral-900">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-8 h-8 rounded-lg bg-white border border-neutral-300 flex items-center justify-center text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-neutral-500 block">Item Subtotal:</span>
                    <span className="text-base font-mono font-black text-neutral-900">
                      {formatBDT(subtotal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Primary CTA Button for Step 1 */}
              <div className="pt-2">
                <button
                  id="proceed-to-delivery-info-btn"
                  type="submit"
                  className="w-full py-4 px-4 bg-neutral-950 hover:bg-neutral-900 active:bg-black text-white font-bold text-sm sm:text-base rounded-xl sm:rounded-2xl transition-all active:scale-98 shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Proceed to Delivery Info</span>
                  <ArrowRight className="w-4 h-4 text-emerald-400" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: DELIVERY ADDRESS & WHATSAPP REDIRECTION */}
          {step === 2 && (
            <form onSubmit={handleConfirmOrder} className="space-y-4">
              {/* Back to Step 1 link */}
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 flex items-center gap-1 cursor-pointer mb-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Change Size, Color or Quantity</span>
              </button>

              {/* Selected Variant Summary Pill */}
              <div className="flex items-center justify-between p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-9 h-11 object-cover rounded border border-neutral-200 shrink-0"
                  />
                  <div className="truncate">
                    <span className="font-bold text-neutral-900 block truncate">{product.name}</span>
                    <span className="text-neutral-500 text-[11px]">
                      Size: {selectedSize} • Color: {selectedColor.name} • Qty: {quantity}
                    </span>
                  </div>
                </div>
                <span className="font-mono font-bold text-neutral-900 shrink-0 ml-2">
                  {formatBDT(subtotal)}
                </span>
              </div>

              {/* Contact details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Your Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                    <input
                      id="quick-order-name-input"
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
                    Mobile Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                    <input
                      id="quick-order-phone-input"
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="018XXXXXXXX"
                      className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-neutral-900 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Zone Selection */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                  Delivery Region <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRegionType('local')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedRegionType === 'local'
                        ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                        : 'border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">Inside Rangpur</span>
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        selectedRegionType === 'local' ? 'bg-neutral-800 text-emerald-300' : 'bg-neutral-200 text-neutral-700'
                      }`}>
                        ৳{settings.insideCityDeliveryFee}
                      </span>
                    </div>
                    <p className={`text-[11px] mt-0.5 ${selectedRegionType === 'local' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                      Rangpur city & nearby local areas
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRegionType('nationwide')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedRegionType === 'nationwide'
                        ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                        : 'border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">Nationwide Courier</span>
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        selectedRegionType === 'nationwide' ? 'bg-neutral-800 text-emerald-300' : 'bg-neutral-200 text-neutral-700'
                      }`}>
                        ৳{settings.outsideCityDeliveryFee}
                      </span>
                    </div>
                    <p className={`text-[11px] mt-0.5 ${selectedRegionType === 'nationwide' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                      All other Districts & Thanas in BD
                    </p>
                  </button>
                </div>
              </div>

              {/* District & Thana */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    District / City <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="quick-order-district-input"
                    type="text"
                    required
                    value={districtCity}
                    onChange={(e) => setDistrictCity(e.target.value)}
                    placeholder="e.g. Dhaka, Rangpur, Chittagong, Sylhet..."
                    className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Thana / Area / Union
                  </label>
                  <input
                    id="quick-order-area-input"
                    type="text"
                    value={deliveryArea}
                    onChange={(e) => setDeliveryArea(e.target.value)}
                    placeholder="e.g. Dhanmondi, Mirpur, Sadar, Station Road..."
                    className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Full Street / Village / House Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                  <textarea
                    id="quick-order-address-input"
                    required
                    rows={2}
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="House #, Road #, Village, Holding #, nearby landmark..."
                    className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-neutral-900 resize-none"
                  />
                </div>
              </div>

              {/* Optional Notes */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Special Notes / Delivery Time (Optional)
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    id="quick-order-notes-input"
                    type="text"
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="e.g. Please call before arrival, delivery in the afternoon"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
              </div>

              {/* Order Cost Breakdown */}
              <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>Item Subtotal ({quantity} {quantity > 1 ? 'items' : 'item'})</span>
                  <span className="font-mono font-semibold text-neutral-900">{formatBDT(subtotal)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Delivery ({selectedRegionType === 'local' ? `Inside Rangpur` : 'Nationwide'})</span>
                  </span>
                  <span className="font-mono font-semibold text-neutral-900">
                    {deliveryFee === 0 ? 'FREE' : formatBDT(deliveryFee)}
                  </span>
                </div>
                <div className="pt-2 border-t border-neutral-200 flex justify-between items-center text-sm font-bold text-neutral-900">
                  <span>Grand Total (Pay on Delivery):</span>
                  <span className="text-base font-mono font-black text-neutral-950">{formatBDT(total)}</span>
                </div>
              </div>

              {/* Primary Submit Button */}
              <div className="pt-1">
                <button
                  id="confirm-quick-order-whatsapp-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-4 bg-neutral-950 hover:bg-neutral-900 active:bg-black disabled:bg-neutral-400 text-white font-bold text-sm sm:text-base rounded-xl sm:rounded-2xl transition-all active:scale-98 shadow-lg flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Redirecting to WhatsApp...</span>
                  ) : (
                    <>
                      <MessageCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                      <span>Confirm Order via WhatsApp (Pay {formatBDT(total)} COD)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Guarantees */}
              <div className="flex items-center justify-center gap-3 text-[10px] text-neutral-500 pt-1">
                <span>🛡️ Cash on Delivery</span>
                <span>•</span>
                <span>⚡ Fast Delivery</span>
                <span>•</span>
                <span>🔄 Easy 7-Day Exchange</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
