import { api } from '../api';

export const authService = {
  register: (data: { firstName: string; lastName: string; email: string; phone: string; password: string }) =>
    api.post<{ data: { token: string; user: any; requiresVerification: boolean } }>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<{ data: { token: string; user: any } }>('/auth/login', data),

  me: () => api.get<{ data: any }>('/auth/me'),

  logout: () => api.post<{ data: any }>('/auth/logout', {}),

  verifyOtp: (otp: string) =>
    api.post<{ data: any }>('/auth/verify-otp', { otp }),

  resendOtp: () => api.post<{ data: any }>('/auth/resend-otp', {}),

  forgotPassword: (email: string) =>
    api.post<{ data: any }>('/auth/forgot-password', { email }),

  resetPassword: (token: string, newPassword: string) =>
    api.post<{ data: any }>('/auth/reset-password', { token, newPassword }),
};
