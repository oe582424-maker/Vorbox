export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  description: string;
  features: string[];
  fabric?: string;
  gsm?: string;
  images: string[];
  sizes: string[];
  colors: {
    name: string;
    hex: string;
    image?: string;
  }[];
  inStock: boolean;
  featured?: boolean;
  tag?: string;
}

export interface CartItem {
  id: string; // unique item combo id
  productId: string;
  product: Product;
  selectedSize: string;
  selectedColor: {
    name: string;
    hex: string;
    image?: string;
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
  orderChannel: 'Website COD' | 'WhatsApp Direct' | 'WhatsApp & Website COD';
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

export interface HeroSettings {
  enabled: boolean;
  badgeText?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  showDropCard?: boolean;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  city: string;
  whatsappNumber: string; // E.g. '8801866068916'
  whatsappDisplayNumber: string; // E.g. '+880 1866-068916'
  insideCityDeliveryFee: number;
  outsideCityDeliveryFee: number;
  freeDeliveryThreshold: number;
  bannerNotice: string;
  storeAddress: string;
  adminPassword?: string;
  featuredDrop?: FeaturedDrop | null;
  categories?: string[];
  showHeroBanner?: boolean;
  heroSettings?: HeroSettings;
}
