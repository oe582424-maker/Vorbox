import { CartItem, Order, Product, StoreSettings } from '../types';

export function formatBDT(amount: number): string {
  return `৳${amount.toLocaleString('en-BD')}`;
}

// Fallback business numbers for Vorbox (Bangladesh format)
export const DEFAULT_BUSINESS_WHATSAPP = '8801866068916';
export const SECONDARY_BUSINESS_WHATSAPP = '8801982135000';

export function cleanPhoneForWhatsApp(phone?: string | null): string {
  // 1. Check environment variable override or provided phone
  const raw = phone?.trim() || (import.meta.env?.VITE_WHATSAPP_NUMBER as string)?.trim() || DEFAULT_BUSINESS_WHATSAPP;
  
  // 2. Strip all non-digit characters (+, -, spaces, parentheses)
  let digitsOnly = raw.replace(/\D/g, '');

  // 3. Normalize international and Bangladesh regional dialing codes
  if (digitsOnly.startsWith('0088')) {
    digitsOnly = digitsOnly.slice(2);
  }
  
  // If Bangladesh local number e.g. 018XXXXXXXX or 019XXXXXXXX or 017XXXXXXXX (11 digits)
  if (digitsOnly.startsWith('01') && digitsOnly.length === 11) {
    return `88${digitsOnly}`;
  }

  // If 10 digits without leading 0 e.g. 18XXXXXXXX or 19XXXXXXXX
  if (digitsOnly.length === 10 && (digitsOnly.startsWith('18') || digitsOnly.startsWith('19') || digitsOnly.startsWith('17') || digitsOnly.startsWith('13') || digitsOnly.startsWith('14') || digitsOnly.startsWith('15') || digitsOnly.startsWith('16'))) {
    return `880${digitsOnly}`;
  }

  // If already prefixed with 880
  if (digitsOnly.startsWith('880') && digitsOnly.length >= 13) {
    return digitsOnly;
  }

  // If already starts with 88
  if (digitsOnly.startsWith('88') && digitsOnly.length >= 13) {
    return digitsOnly;
  }

  // If empty or invalid length, fallback to default valid business WhatsApp
  if (!digitsOnly || digitsOnly.length < 9) {
    return DEFAULT_BUSINESS_WHATSAPP;
  }

  return digitsOnly;
}

export function generateOrderNumber(): string {
  const prefix = 'VB';
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${timestamp}${random}`;
}

export function createProductWhatsAppUrl(
  product: Product,
  size: string,
  color: string,
  quantity: number,
  settings: StoreSettings
): string {
  const unitPrice = product.price;
  const subtotal = unitPrice * quantity;
  const targetPhone = cleanPhoneForWhatsApp(settings.whatsappNumber);

  const message = [
    `👋 Hello *${settings.storeName || 'VORBOX'}* (${settings.city || 'Sundarganj'})!`,
    `I would like to order this item:`,
    ``,
    `🛍️ *Product:* ${product.name}`,
    `📏 *Size:* ${size}`,
    `🎨 *Color:* ${color}`,
    `🔢 *Quantity:* ${quantity}`,
    `💵 *Item Total:* ৳${subtotal}`,
    `🚚 *Payment Method:* Cash on Delivery (COD)`,
    ``,
    `📍 *Delivery City:* ${settings.city || 'Sundarganj'}`,
    `Please confirm availability & dispatch schedule. Thank you!`,
  ].join('\n');

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
}

export function createCartWhatsAppUrl(
  items: CartItem[],
  customerInfo: {
    name?: string;
    phone?: string;
    district?: string;
    area?: string;
    address?: string;
    notes?: string;
  },
  deliveryFee: number,
  settings: StoreSettings
): string {
  const targetPhone = cleanPhoneForWhatsApp(settings.whatsappNumber);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const total = subtotal + deliveryFee;

  const itemsList = items
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.product.name}*\n   - Size: ${item.selectedSize} | Color: ${item.selectedColor.name}\n   - Qty: ${item.quantity} x ৳${item.product.price} = ৳${item.product.price * item.quantity}`
    )
    .join('\n\n');

  const locationText = [customerInfo.area, customerInfo.district].filter(Boolean).join(', ');

  const customerBlock = [
    `👤 *Customer Name:* ${customerInfo.name || 'Not provided'}`,
    `📱 *Phone Number:* ${customerInfo.phone || 'Not provided'}`,
    locationText ? `📍 *City / Area:* ${locationText}` : '',
    `🏠 *Delivery Address:* ${customerInfo.address || 'Cash on delivery address'}`,
    customerInfo.notes ? `📝 *Special Note:* ${customerInfo.notes}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const message = [
    `👋 Hello *${settings.storeName || 'VORBOX'}*!`,
    `I would like to place a Cash on Delivery order:`,
    ``,
    `📦 *ORDERED ITEMS:*`,
    itemsList,
    ``,
    `━━━━━━━━━━━━━━━━━━`,
    `🏷️ *Items Subtotal:* ৳${subtotal}`,
    `🚚 *Delivery Fee:* ৳${deliveryFee}`,
    `💰 *Grand Total (Pay on Delivery):* ৳${total}`,
    `━━━━━━━━━━━━━━━━━━`,
    ``,
    `📍 *DELIVERY & CUSTOMER DETAILS:*`,
    customerBlock,
    ``,
    `Please confirm my order and share dispatch details. Thank you!`,
  ].join('\n');

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
}

export function createOrderReceiptWhatsAppUrl(
  order: Order,
  settings: StoreSettings
): string {
  const targetPhone = cleanPhoneForWhatsApp(settings.whatsappNumber);

  const itemsSummary = order.items
    .map(
      (i) => `• ${i.productName} (${i.size}, ${i.color}) x${i.quantity} = ৳${i.price * i.quantity}`
    )
    .join('\n');

  const message = [
    `👋 Hello *${settings.storeName || 'VORBOX'}*!`,
    `I placed an order on the website:`,
    ``,
    `🔖 *Order ID:* ${order.orderNumber}`,
    `👤 *Name:* ${order.customerName}`,
    `📱 *Phone:* ${order.customerPhone}`,
    `📍 *Address:* ${order.deliveryAddress}, ${order.deliveryArea}`,
    ``,
    `📦 *Items:*`,
    itemsSummary,
    ``,
    `💰 *Total Amount:* ৳${order.totalAmount} (Cash on Delivery)`,
    ``,
    `Please confirm the order and dispatch to my delivery address. Thank you!`,
  ].join('\n');

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
}

