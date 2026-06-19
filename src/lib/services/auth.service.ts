import { api } from '../api';

export const authService = {
  // Phone OTP auth (primary customer flow)
  requestOtp: (data: { firstName: string; lastName: string; phone: string }) =>
    api.post<{ data: { message: string } }>('/auth/request-otp', data),

  verifyOtp: (data: { phone: string; otp: string }) =>
    api.post<{ data: { token: string; refreshToken: string; user: any; requiresEmail: boolean } }>('/auth/verify-otp', data),

  resendOtp: (data: { phone: string }) =>
    api.post<{ data: { message: string } }>('/auth/resend-otp', data),

  setEmail: (data: { email: string }) =>
    api.post<{ data: { user: any } }>('/auth/set-email', data),

  // Admin email+password login
  login: (data: { email: string; password: string }) =>
    api.post<{ data: { token: string; user: any } }>('/auth/login', data),

  me: () => api.get<{ data: any }>('/auth/me'),
  logout: () => api.post<{ data: any }>('/auth/logout', {}),
};
