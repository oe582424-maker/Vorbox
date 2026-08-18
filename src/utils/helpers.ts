import { CartItem, Order, Product, StoreSettings } from '../types';

export function formatBDT(amount: number): string {
  return `৳${amount.toLocaleString('en-BD')}`;
}

export function cleanPhoneForWhatsApp(phone: string): string {
  const digitsOnly = phone.replace(/[^0-9]/g, '');
  if (digitsOnly.startsWith('01') && digitsOnly.length === 11) {
    return `88${digitsOnly}`;
  }
  if (digitsOnly.startsWith('880')) {
    return digitsOnly;
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
    `👋 Hello *${settings.storeName}* (${settings.city})!`,
    `I would like to order this item:`,
    ``,
    `🛍️ *Product:* ${product.name}`,
    `📏 *Size:* ${size}`,
    `🎨 *Color:* ${color}`,
    `🔢 *Quantity:* ${quantity}`,
    `💵 *Item Total:* ৳${subtotal}`,
    `🚚 *Payment Method:* Cash on Delivery (COD)`,
    ``,
    `📍 *Delivery City:* ${settings.city}`,
    `Please confirm if this is available for delivery. My address & details are ready!`,
  ].join('\n');

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
}

export function createCartWhatsAppUrl(
  items: CartItem[],
  customerInfo: {
    name?: string;
    phone?: string;
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

  const customerBlock = [
    `👤 *Customer Name:* ${customerInfo.name || 'Not specified'}`,
    `📱 *Phone:* ${customerInfo.phone || 'Not specified'}`,
    `📍 *Area:* ${customerInfo.area || settings.city}`,
    `🏠 *Address:* ${customerInfo.address || 'Cash on delivery address'}`,
    customerInfo.notes ? `📝 *Note:* ${customerInfo.notes}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const message = [
    `👋 Hello *${settings.storeName}*! I would like to place a Cash on Delivery order:`,
    ``,
    `📦 *ORDER ITEMS:*`,
    itemsList,
    ``,
    `━━━━━━━━━━━━━━━━━━`,
    `🏷️ *Subtotal:* ৳${subtotal}`,
    `🚚 *Delivery Fee (${customerInfo.area || settings.city}):* ৳${deliveryFee}`,
    `💰 *Total to Pay on Delivery:* ৳${total}`,
    `━━━━━━━━━━━━━━━━━━`,
    ``,
    `📍 *CUSTOMER & DELIVERY DETAILS:*`,
    customerBlock,
    ``,
    `Please confirm my order for dispatch!`,
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
    `👋 Hello *${settings.storeName}*!`,
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
