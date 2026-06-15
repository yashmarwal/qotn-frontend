export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;           // paise
  originalPrice: number | null; // paise
  category: 'men' | 'women' | 'kids';
  subcategory: string;
  sizes: string[];
  colors: string[];
  images: string[];
  description: string;
  fabric: string;
  care: string;
  isNew: boolean;
  isBestseller: boolean;
  rating: number;
  reviews: number;
  stock: Record<string, number>;
  // Populated by adaptApiProduct — used to resolve variantId for cart/checkout
  _variants?: Array<{ id: string; size: string; color: string; price: number; stock: number }>;
}

export interface CartItem {
  product: Product;
  size: string;
  color: string;
  quantity: number;
  variantId?: string; // backend variant ID — present when product came from API
  customStitchingId?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  count: number;
  productCount?: number;
}

export interface Order {
  id: string;
  customer: string;
  items: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  payment: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  joinedDate: string;
}
