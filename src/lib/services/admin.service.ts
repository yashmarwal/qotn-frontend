import { api } from '../api';

export const adminService = {
  getDashboard: () => api.get<{ data: any }>('/admin/dashboard'),

  getOrders: (params?: Record<string, any>) => {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params || {}).filter(([, v]) => v != null).map(([k, v]) => [k, String(v)]))
    ).toString();
    return api.get<{ data: any[]; meta: any }>(`/admin/orders?${query}`);
  },

  updateOrderStatus: (id: string, data: any) =>
    api.patch<{ data: any }>(`/admin/orders/${id}/status`, data),

  getCustomers: (page = 1) => api.get<{ data: any[]; meta: any }>(`/admin/customers?page=${page}`),

  getInventory: (page = 1) => api.get<{ data: any[]; meta: any }>(`/admin/inventory?page=${page}`),

  updateStock: (variantId: string, stock: number) =>
    api.patch<{ data: any }>(`/admin/inventory/${variantId}`, { stock }),

  // Products
  createProduct: (data: any) => api.post<{ data: any }>('/products', data),
  updateProduct: (id: string, data: any) => api.patch<{ data: any }>(`/products/${id}`, data),
  deleteProduct: (id: string) => api.delete<{ data: any }>(`/products/${id}`),

  // Categories
  getCategories: () => api.get<{ data: any[] }>('/categories'),
  createCategory: (data: any) => api.post<{ data: any }>('/categories', data),

  // Banners (admin routes — return all banners regardless of active/dates)
  getBanners: () => api.get<{ data: any[] }>('/admin/banners'),
  createBanner: (data: any) => api.post<{ data: any }>('/admin/banners', data),
  updateBanner: (id: string, data: any) => api.patch<{ data: any }>(`/admin/banners/${id}`, data),
  deleteBanner: (id: string) => api.delete<{ data: any }>(`/admin/banners/${id}`),

  // Coupons
  getCoupons: () => api.get<{ data: any[] }>('/coupons'),
  createCoupon: (data: any) => api.post<{ data: any }>('/coupons', data),
  updateCoupon: (id: string, data: any) => api.patch<{ data: any }>(`/coupons/${id}`, data),

  // Custom stitching
  getCustomStitching: (status?: string) => {
    const q = status ? `?status=${status}` : '';
    return api.get<{ data: any[] }>(`/admin/custom-stitching${q}`);
  },
  updateStitchingStatus: (id: string, status: string) =>
    api.patch<{ data: any }>(`/admin/custom-stitching/${id}/status`, { status }),

  // Analytics
  getAnalytics: () => api.get<{ data: any }>('/admin/analytics'),

  // Waitlist
  getWaitlist: () => api.get<{ data: any[] }>('/admin/waitlist'),
  notifyWaitlist: (variantId: string) =>
    api.post<{ data: any }>(`/waitlist/notify/${variantId}`, {}),

  // Look Videos
  getLookVideos: () => api.get<{ data: any[] }>('/look-videos?all=true'),
  createLookVideo: (data: any) => api.post<{ data: any }>('/look-videos', data),
  updateLookVideo: (id: string, data: any) => api.patch<{ data: any }>(`/look-videos/${id}`, data),
  deleteLookVideo: (id: string) => api.delete<{ data: any }>(`/look-videos/${id}`),

  // Collections
  getCollections: () => api.get<{ data: any[] }>('/collections/admin'),
  createCollection: (data: any) => api.post<{ data: any }>('/collections', data),
  updateCollection: (id: string, data: any) => api.patch<{ data: any }>(`/collections/${id}`, data),
  deleteCollection: (id: string) => api.delete<{ data: any }>(`/collections/${id}`),
  addProductToCollection: (collectionId: string, productId: string) =>
    api.post<{ data: any }>(`/collections/${collectionId}/products`, { productId }),
  removeProductFromCollection: (collectionId: string, productId: string) =>
    api.delete<{ data: any }>(`/collections/${collectionId}/products/${productId}`),
};
