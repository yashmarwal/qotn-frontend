import { api } from '../api';

export const paymentsService = {
  prepareCheckout: (data: { addressId: string; deliveryMethod: string; couponCode?: string }) =>
    api.post<{ data: { razorpayOrderId: string; amount: number; currency: string; key: string } }>(
      '/payments/prepare-checkout',
      data,
    ),

  confirmOrder: (data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    addressId: string;
    deliveryMethod: string;
    couponCode?: string;
  }) => api.post<{ data: { order: any } }>('/payments/confirm-order', data),

  // Legacy endpoints (kept for backward compatibility)
  createRazorpayOrder: (orderId: string) =>
    api.post<{ data: { razorpayOrderId: string; amount: number; currency: string; key: string; orderNumber: string } }>('/payments/create-order', { orderId }),

  verifyPayment: (data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    orderId: string;
  }) => api.post<{ data: any }>('/payments/verify', data),
};
