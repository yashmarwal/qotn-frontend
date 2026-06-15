import { api } from '../api';

export const wishlistService = {
  getWishlist: () => api.get<{ data: any[] }>('/wishlist'),
  addItem: (productId: string) => api.post<{ data: any }>(`/wishlist/${productId}`, {}),
  removeItem: (productId: string) => api.delete<{ data: any }>(`/wishlist/${productId}`),
  checkItem: (productId: string) => api.get<{ data: { isInWishlist: boolean } }>(`/wishlist/${productId}/check`),
};
