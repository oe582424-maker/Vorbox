import React, { useState } from 'react';
import { X, MessageCircle, ShoppingBag, Truck, ShieldCheck, Check, Info, Sparkles } from 'lucide-react';
import { Product, StoreSettings, CartItem } from '../types';
import { formatBDT, createProductWhatsAppUrl } from '../utils/helpers';

interface ProductModalProps {
  product: Product | null;
  settings: StoreSettings;
  cart?: CartItem[];
  onClose: () => void;
  onAddToCart: (
    product: Product,
    size: 'S' | 'M' | 'L' | 'XL' | 'XXL',
    color: { name: string; hex: string },
    quantity: number
  ) => void;
  onOpenSizeGuide: () => void;
  onBuyNowCOD: (
    product: Product,
    size: 'S' | 'M' | 'L' | 'XL' | 'XXL',
    color: { name: string; hex: string },
    quantity: number
  ) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  settings,
  cart = [],
  onClose,
  onAddToCart,
  onOpenSizeGuide,
  onBuyNowCOD,
}) => {
  if (!product) return null;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<'S' | 'M' | 'L' | 'XL' | 'XXL'>(product.sizes[0] || 'M');
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || { name: 'Standard', hex: '#111' });
  const [quantity, setQuantity] = useState(1);
  const [showAddedNotice, setShowAddedNotice] = useState(false);

  // Persistent in-bag verification
  const isInCart = cart.some(
    (item) =>
      item.productId === product.id &&
      item.selectedSize === selectedSize &&
      item.selectedColor.name === selectedColor.name
  );

  const handleAddToCart = () => {
    onAddToCart(product, selectedSize, selectedColor, quantity);
    setShowAddedNotice(true);
    setTimeout(() => setShowAddedNotice(false), 2000);
  };

  const handleBuyNow = () => {
    onBuyNowCOD(product, selectedSize, selectedColor, quantity);
  };

  const whatsappUrl = createProductWhatsAppUrl(
    product,
    selectedSize,
    selectedColor.name,
    quantity,
    settings
  );

  return (
    <div
      id="product-modal-backdrop"
      className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="product-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-4xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col md:flex-row relative"
      >
        {/* Close Button */}
        <button
          id="close-product-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-neutral-100 text-neutral-700 hover:text-neutral-950 rounded-full border border-neutral-200 transition-colors shadow-sm"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: Image Gallery */}
        <div className="w-full md:w-1/2 bg-neutral-100 p-4 sm:p-6 flex flex-col justify-between">
          <div className="relative aspect-4/5 w-full rounded-xl overflow-hidden bg-neutral-200 shadow-inner">
            <img
              src={product.images[activeImageIndex] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
            {product.tag && (
              <span className="absolute top-3 left-3 bg-neutral-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                {product.tag}
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-16 h-20 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                    activeImageIndex === idx ? 'border-neutral-950 ring-2 ring-neutral-400' : 'border-neutral-300 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Controls */}
        <div className="w-full md:w-1/2 p-5 sm:p-8 overflow-y-auto max-h-[75vh] md:max-h-[85vh] flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between text-xs text-neutral-500 font-medium mb-1">
                <span>{product.category}</span>
                {product.gsm && <span className="bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded font-mono">{product.gsm}</span>}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 font-mono leading-tight">
                {product.name}
              </h2>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-black text-neutral-950 font-mono">
                {formatBDT(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-neutral-400 line-through font-mono">
                  {formatBDT(product.originalPrice)}
                </span>
              )}
              {product.originalPrice && (
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Save {formatBDT(product.originalPrice - product.price)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              {product.description}
            </p>

            {/* Fabric and Key Features */}
            <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 space-y-2 text-xs text-neutral-700">
              <div className="flex items-center gap-1.5 font-semibold text-neutral-900">
                <Sparkles className="w-3.5 h-3.5 text-neutral-700" />
                <span>Fabric: {product.fabric}</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-neutral-600">
                {product.features.map((feat, idx) => (
                  <li key={idx} className="text-[11px] sm:text-xs leading-normal">
                    {feat}
                  </li>
                ))}
              </ul>
            </div>

            {/* Size Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-900">Select Size: <span className="text-neutral-600">{selectedSize}</span></span>
                <button
                  type="button"
                  onClick={onOpenSizeGuide}
                  className="text-xs text-neutral-600 hover:text-neutral-950 underline flex items-center gap-1"
                >
                  <Info className="w-3 h-3" /> Size Guide
                </button>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {product.sizes.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSelectedSize(sz)}
                    className={`py-2.5 text-xs font-bold rounded-lg border transition-all ${
                      selectedSize === sz
                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                        : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Swatches */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-neutral-900 block">
                Color: <span className="text-neutral-600 font-normal">{selectedColor.name}</span>
              </span>
              <div className="flex items-center gap-3">
                {product.colors.map((c) => {
                  const isSelected = selectedColor.name === c.name;
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                        isSelected
                          ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/10"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span>{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-3 pt-1">
              <span className="text-xs font-semibold text-neutral-900">Quantity:</span>
              <div className="flex items-center border border-neutral-300 rounded-lg overflow-hidden bg-neutral-50">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1.5 text-sm font-bold text-neutral-700 hover:bg-neutral-200"
                >
                  -
                </button>
                <span className="px-4 py-1.5 text-xs font-mono font-bold text-neutral-900 bg-white min-w-[36px] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-1.5 text-sm font-bold text-neutral-700 hover:bg-neutral-200"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-neutral-500">
                Total: <strong className="text-neutral-900 font-mono">{formatBDT(product.price * quantity)}</strong>
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-4 border-t border-neutral-200">
            {showAddedNotice && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-medium rounded-lg flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Added {quantity}x {product.name} ({selectedSize}, {selectedColor.name}) to your Bag!</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Buy Now (COD Checkout) */}
              <button
                id="modal-buynow-btn"
                type="button"
                onClick={handleBuyNow}
                className="w-full py-3 px-4 bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-all active:scale-98 shadow-sm flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Order with Cash on Delivery</span>
              </button>

              {/* Add to Bag */}
              <button
                id="modal-addtobag-btn"
                type="button"
                onClick={handleAddToCart}
                className={`w-full py-3 px-4 font-bold text-xs sm:text-sm rounded-xl transition-all active:scale-98 border flex items-center justify-center gap-2 cursor-pointer ${
                  isInCart
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-xs'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-900 border-neutral-300'
                }`}
              >
                {isInCart ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>✓ Added in Bag</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Shopping Bag</span>
                  </>
                )}
              </button>
            </div>

            {/* Order via WhatsApp Button -> Opens Checkout Modal to capture customer details first */}
            <button
              id="modal-whatsapp-direct-btn"
              type="button"
              onClick={handleBuyNow}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-all active:scale-98 shadow-sm flex items-center justify-center gap-2 text-center cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Order via WhatsApp (Free COD)</span>
            </button>

            {/* Delivery guarantee */}
            <div className="flex items-center justify-center gap-4 text-[11px] text-neutral-500 pt-1">
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-neutral-600" /> Fast Delivery
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-neutral-600" /> Pay when package arrives
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
