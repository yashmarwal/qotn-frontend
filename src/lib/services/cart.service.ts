import { api } from '../api';

export const cartService = {
  getCart: () => api.get<{ data: any }>('/cart'),
  addItem: (productId: string, variantId: string, quantity: number, customStitchingId?: string) =>
    api.post<{ data: any }>('/cart/items', { productId, variantId, quantity, ...(customStitchingId && { customStitchingId }) }),
  updateItem: (variantId: string, quantity: number) =>
    api.patch<{ data: any }>(`/cart/items/${variantId}`, { quantity }),
  removeItem: (variantId: string) => api.delete<{ data: any }>(`/cart/items/${variantId}`),
  clearCart: () => api.delete<{ data: any }>('/cart'),
};
