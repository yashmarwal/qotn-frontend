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

  // Cash on Delivery email check. The API verifies the code itself and hands back a single-use token that the
  // order request must carry, so the check cannot be skipped by calling the order API directly.
  sendCodOtp: (email: string) =>
    api.post<{ data: { message: string } }>('/auth/cod-otp/send', { email }),

  verifyCodOtp: (email: string, otp: string) =>
    api.post<{ data: { message: string; codToken: string } }>('/auth/cod-otp/verify', { email, otp }),

  resetPassword: (token: string, newPassword: string) =>
    api.post<{ data: any }>('/auth/reset-password', { token, newPassword }),
};
