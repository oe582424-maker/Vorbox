import React, { useState } from 'react';
import { ShoppingBag, MessageCircle, Eye, Check } from 'lucide-react';
import { Product, StoreSettings } from '../types';
import { formatBDT, createProductWhatsAppUrl } from '../utils/helpers';

interface ProductCardProps {
  product: Product;
  settings: StoreSettings;
  onOpenProductModal: (product: Product) => void;
  onQuickAddToCart: (product: Product, size: 'S' | 'M' | 'L' | 'XL' | 'XXL', color: { name: string; hex: string }) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  settings,
  onOpenProductModal,
  onQuickAddToCart,
}) => {
  const [selectedSize, setSelectedSize] = useState<'S' | 'M' | 'L' | 'XL' | 'XXL'>(product.sizes[0] || 'M');
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || { name: 'Standard', hex: '#111' });
  const [addedToast, setAddedToast] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickAddToCart(product, selectedSize, selectedColor);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 1800);
  };

  const whatsappOrderUrl = createProductWhatsAppUrl(
    product,
    selectedSize,
    selectedColor.name,
    1,
    settings
  );

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={() => onOpenProductModal(product)}
      className="group bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer"
    >
      {/* Product Image Container */}
      <div className="relative aspect-[4/5] w-full bg-neutral-100 overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />

        {/* Badge */}
        {product.tag && (
          <div className="absolute top-3 left-3 px-2.5 py-1 bg-neutral-900/90 text-white text-[11px] font-semibold tracking-wider uppercase rounded-md shadow-xs backdrop-blur-xs">
            {product.tag}
          </div>
        )}

        {/* Quick View overlay button */}
        <div className="absolute inset-0 bg-neutral-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/95 text-neutral-900 rounded-full text-xs font-semibold shadow-md transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-3.5 h-3.5" /> View Details & Measurements
          </span>
        </div>
      </div>

      {/* Product Meta & Controls */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Category & GSM */}
          <div className="flex items-center justify-between text-[11px] text-neutral-500 font-medium mb-1">
            <span>{product.category}</span>
            {product.gsm && <span className="bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-600">{product.gsm}</span>}
          </div>

          {/* Title */}
          <h3 className="font-bold text-neutral-900 text-sm sm:text-base line-clamp-1 group-hover:text-neutral-700 transition-colors">
            {product.name}
          </h3>

          {/* Pricing */}
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-base sm:text-lg font-black text-neutral-950 font-mono">
              {formatBDT(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-neutral-400 line-through font-mono">
                {formatBDT(product.originalPrice)}
              </span>
            )}
            {product.originalPrice && (
              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                Save {formatBDT(product.originalPrice - product.price)}
              </span>
            )}
          </div>
        </div>

        {/* Size Selection Pills */}
        <div className="space-y-1.5 pt-1 border-t border-neutral-100" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between text-[11px] text-neutral-500">
            <span>Size: <strong className="text-neutral-800">{selectedSize}</strong></span>
            <span className="text-[10px] text-neutral-400">Standard Fit</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {product.sizes.map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => setSelectedSize(sz)}
                className={`w-7 h-7 text-xs font-semibold rounded-md border flex items-center justify-center transition-all ${
                  selectedSize === sz
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-neutral-400'
                }`}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>

        {/* Color Swatches */}
        <div className="space-y-1" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between text-[11px] text-neutral-500">
            <span>Color: <strong className="text-neutral-800">{selectedColor.name}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            {product.colors.map((c) => {
              const isSelected = selectedColor.name === c.name;
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  title={c.name}
                  className={`w-5 h-5 rounded-full border transition-all flex items-center justify-center ${
                    isSelected ? 'ring-2 ring-neutral-900 ring-offset-1 border-transparent scale-110' : 'border-neutral-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                >
                  {isSelected && (
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor: c.hex === '#f4f4f5' || c.hex === '#fafaf9' || c.hex === '#f8fafc' ? '#000' : '#fff',
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-100" onClick={(e) => e.stopPropagation()}>
          {/* Quick Add to Bag */}
          <button
            id={`quick-add-${product.id}`}
            type="button"
            onClick={handleQuickAdd}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
              addedToast
                ? 'bg-emerald-600 text-white'
                : 'bg-neutral-900 hover:bg-neutral-800 text-white'
            }`}
          >
            {addedToast ? (
              <>
                <Check className="w-3.5 h-3.5" /> Added
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" /> Add to Bag
              </>
            )}
          </button>

          {/* WhatsApp Direct 1-Click Order */}
          <a
            id={`whatsapp-order-${product.id}`}
            href={whatsappOrderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 px-2.5 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center gap-1 transition-all active:scale-95 text-center"
            title="Order directly via WhatsApp (Free)"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};
