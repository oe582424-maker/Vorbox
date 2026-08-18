export interface Product {
  id: string;
  name: string;
  category: 'T-Shirts' | 'Polos' | 'Hoodies & Sweats' | 'Panjabis' | 'Pants & Bottoms';
  price: number;
  originalPrice?: number;
  description: string;
  features: string[];
  fabric: string;
  gsm?: string;
  images: string[];
  sizes: ('S' | 'M' | 'L' | 'XL' | 'XXL')[];
  colors: {
    name: string;
    hex: string;
  }[];
  inStock: boolean;
  featured?: boolean;
  tag?: string;
}

export interface CartItem {
  id: string; // unique item combo id
  productId: string;
  product: Product;
  selectedSize: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  selectedColor: {
    name: string;
    hex: string;
  };
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: {
    productId: string;
    productName: string;
    size: string;
    color: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  customerName: string;
  customerPhone: string;
  deliveryArea: string;
  deliveryAddress: string;
  deliveryNotes?: string;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  paymentMethod: 'Cash on Delivery (COD)';
  orderChannel: 'Website COD' | 'WhatsApp Direct';
  status: 'Pending' | 'Confirmed' | 'Dispatched' | 'Delivered' | 'Cancelled';
  createdAt: string;
}

export interface FeaturedDrop {
  enabled: boolean;
  badgeText: string;
  title: string;
  subtitle: string;
  price: number;
  originalPrice?: number;
  image: string;
  productId?: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  city: string;
  whatsappNumber: string; // E.g. '8801700000000'
  whatsappDisplayNumber: string; // E.g. '+880 1700-000000'
  insideCityDeliveryFee: number;
  outsideCityDeliveryFee: number;
  freeDeliveryThreshold: number;
  bannerNotice: string;
  storeAddress: string;
  adminPassword?: string;
  featuredDrop?: FeaturedDrop | null;
}
