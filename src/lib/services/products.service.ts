import { api } from '../api';
import { ApiProduct } from '../adapters';

export interface ProductFilters {
  category?: string;
  gender?: string;
  size?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  isNew?: boolean;
  isBestseller?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
  page?: number;
  limit?: number;
}

export const productsService = {
  getAll: (filters: ProductFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null) params.append(k, String(v));
    });
    return api.get<{ data: ApiProduct[]; meta: any }>(`/products?${params.toString()}`);
  },

  getFeatured: () => api.get<{ data: ApiProduct[] }>('/products/featured'),

  getNewArrivals: () => api.get<{ data: ApiProduct[] }>('/products/new-arrivals'),

  getBestsellers: () => api.get<{ data: ApiProduct[] }>('/products/bestsellers'),

  getBySlug: (slug: string) => api.get<{ data: ApiProduct & { relatedProducts?: ApiProduct[]; avgRating?: number; reviewCount?: number } }>(`/products/${slug}`),
};
