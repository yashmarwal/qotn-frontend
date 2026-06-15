import { api } from '../api';

export const customStitchingService = {
  save: (data: { productId: string; garmentType: string; measurements: Record<string, number>; specialInstructions?: string }) =>
    api.post<{ data: any }>('/custom-stitching/save', data),

  getById: (id: string) =>
    api.get<{ data: any }>(`/custom-stitching/${id}`),

  getUserAll: () =>
    api.get<{ data: any[] }>('/custom-stitching/user/all'),

  sendOwnerEmail: (data: any) =>
    api.post<{ data: any }>('/custom-stitching/send-owner-email', data),
};
