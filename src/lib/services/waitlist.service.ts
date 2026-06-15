import { api } from '../api';

export const waitlistService = {
  join: (data: { email: string; productId: string; variantId: string }) =>
    api.post<{ data: any }>('/waitlist', data),
};
