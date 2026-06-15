import { api } from '../api';

export const recommendationsService = {
  getForProduct: (productId: string) =>
    api.get<{ data: any[] }>(`/recommendations/product/${productId}`),

  getForUser: () =>
    api.get<{ data: any[] }>('/recommendations/user'),

  getTrending: () =>
    api.get<{ data: any[] }>('/recommendations/trending'),

  getCompleteTheLook: (productId: string) =>
    api.get<{ data: any[] }>(`/recommendations/complete-the-look/${productId}`),

  trackView: (productId: string, sessionId: string) =>
    api.post<{ data: any }>('/recommendations/track-view', { productId, sessionId }),

  getRecentlyViewed: (sessionId: string) =>
    api.get<{ data: any[] }>(`/recommendations/recently-viewed?sessionId=${sessionId}`),
};
