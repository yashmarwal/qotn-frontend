import { Product } from '@/types';
import { sortSizes } from './sizeOrder';

// Raw shape from the backend API
export interface ApiVariant {
  id: string;
  size: string;
  color: string;
  colorHex?: string;
  price: number;
  originalPrice: number | null;
  sku: string;
  stock: number;
  isActive: boolean;
}

export interface ApiImage {
  id: string;
  url: string;
  altText?: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  gender: string;
}

export interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  fabric: string;
  care: string;
  category: ApiCategory;
  isNew: boolean;
  isBestseller: boolean;
  isFeatured: boolean;
  isActive: boolean;
  variants: ApiVariant[];
  images: ApiImage[];
  avgRating?: number;
  reviewCount?: number;
  relatedProducts?: ApiProduct[];
}

export function adaptApiProduct(p: ApiProduct): Product {
  const variants = p.variants?.filter(v => v.isActive !== false) ?? [];
  const images = p.images ?? [];

  // Sort images: primary first
  const sortedImages = [...images].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0) || a.sortOrder - b.sortOrder);

  // Get cheapest variant for display price
  const cheapest = variants.length > 0
    ? variants.reduce((min, v) => v.price < min.price ? v : min, variants[0])
    : null;

  // Stock per size (sum across all colors)
  const uniqueSizes = sortSizes([...new Set(variants.map(v => v.size))]);
  const stockBySize: Record<string, number> = {};
  for (const size of uniqueSizes) {
    stockBySize[size] = variants
      .filter(v => v.size === size)
      .reduce((sum, v) => sum + (v.stock ?? 0), 0);
  }

  const categorySlug = p.category?.slug ?? 'men';

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: cheapest?.price ?? 0,
    originalPrice: cheapest?.originalPrice ?? null,
    category: categorySlug as 'men' | 'women' | 'kids',
    subcategory: '',
    sizes: uniqueSizes,
    colors: [...new Set(variants.map(v => v.color))],
    images: sortedImages.map(i => i.url),
    description: p.description ?? '',
    fabric: p.fabric ?? '',
    care: p.care ?? '',
    isNew: p.isNew ?? false,
    isBestseller: p.isBestseller ?? false,
    rating: p.avgRating ?? 0,
    reviews: p.reviewCount ?? 0,
    stock: stockBySize,
    // Hidden fields used by cart/checkout to find the right variantId
    _variants: variants.map(v => ({
      id: v.id,
      size: v.size,
      color: v.color,
      price: v.price,
      stock: v.stock,
    })),
  };
}

export function adaptApiProductList(products: ApiProduct[]): Product[] {
  return products.map(adaptApiProduct);
}

// Find the variantId for a specific size+color combo
export function findVariantId(product: Product, size: string, color: string): string | null {
  if (!product._variants) return null;
  const variant = product._variants.find(v => v.size === size && v.color === color)
    ?? product._variants.find(v => v.size === size);
  return variant?.id ?? null;
}
