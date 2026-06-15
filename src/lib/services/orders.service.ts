import { api } from '../api';

export const ordersService = {
  createOrder: (data: {
    addressId: string;
    deliveryMethod: string;
    paymentMethod: string;
    couponCode?: string;
    customerNotes?: string;
  }) => api.post<{ data: any }>('/orders', data),

  getOrders: (page = 1) => api.get<{ data: any[]; meta: any }>(`/orders?page=${page}`),

  getOrder: (orderNumber: string) => api.get<{ data: any }>(`/orders/${orderNumber}`),

  cancelOrder: (orderNumber: string) =>
    api.post<{ data: any }>(`/orders/${orderNumber}/cancel`, {}),
};
