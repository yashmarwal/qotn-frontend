import { api } from '../api';

export const paymentsService = {
  createRazorpayOrder: (orderId: string) =>
    api.post<{ data: { razorpayOrderId: string; amount: number; currency: string; key: string; orderNumber: string } }>('/payments/create-order', { orderId }),

  verifyPayment: (data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    orderId: string;
  }) => api.post<{ data: any }>('/payments/verify', data),
};
