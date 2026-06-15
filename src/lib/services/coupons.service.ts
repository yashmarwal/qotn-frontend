import { api } from '../api';

export const couponsService = {
  validate: (code: string, orderAmount: number) =>
    api.post<{ data: { valid: boolean; discount?: number; finalAmount?: number; message?: string; coupon?: any } }>('/coupons/validate', { code, orderAmount }),
};
