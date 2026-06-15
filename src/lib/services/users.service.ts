import { api } from '../api';

export const usersService = {
  getProfile: () => api.get<{ data: any }>('/users/profile'),
  updateProfile: (data: { firstName?: string; lastName?: string; phone?: string }) =>
    api.patch<{ data: any }>('/users/profile', data),
  getAddresses: () => api.get<{ data: any[] }>('/users/addresses'),
  createAddress: (data: any) => api.post<{ data: any }>('/users/addresses', data),
  updateAddress: (id: string, data: any) => api.patch<{ data: any }>(`/users/addresses/${id}`, data),
  deleteAddress: (id: string) => api.delete<{ data: any }>(`/users/addresses/${id}`),
  setDefaultAddress: (id: string) => api.patch<{ data: any }>(`/users/addresses/${id}/default`, {}),
};
