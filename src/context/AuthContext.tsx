'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/services/auth.service';
import { ApiError } from '@/lib/api';

interface User {
  id: string;
  phone?: string;
  email?: string;
  firstName: string;
  lastName: string;
  role: string;
  isVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  // Phone OTP flow
  phoneVerify: (phone: string, otp: string) => Promise<{ requiresEmail: boolean }>;
  saveEmail: (email: string) => Promise<void>;
  // Admin fallback
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const loadUser = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('qotn_token') : null;
    if (!token) { setIsLoading(false); return; }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('qotn_token');
        setIsLoading(false);
        return;
      }
    } catch {
      localStorage.removeItem('qotn_token');
      setIsLoading(false);
      return;
    }

    authService
      .me()
      .then((res: any) => setUser(res.data ?? null))
      .catch((err: unknown) => {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[Auth] /auth/me failed:', err instanceof ApiError ? err.status : err);
        }
        localStorage.removeItem('qotn_token');
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { loadUser(); }, []);

  const phoneVerify = async (phone: string, otp: string): Promise<{ requiresEmail: boolean }> => {
    const res: any = await authService.verifyOtp({ phone, otp });
    const { token, user: newUser, requiresEmail } = res.data;
    if (token) localStorage.setItem('qotn_token', token);
    setUser(newUser);
    return { requiresEmail };
  };

  const saveEmail = async (email: string) => {
    const res: any = await authService.setEmail({ email });
    if (res.data?.user) setUser(res.data.user);
  };

  const login = async (email: string, password: string) => {
    const res: any = await authService.login({ email, password });
    const { token, user: newUser } = res.data;
    if (token) localStorage.setItem('qotn_token', token);
    setUser(newUser);
  };

  const logout = async () => {
    localStorage.removeItem('qotn_token');
    setUser(null);
    authService.logout().catch(() => {});
    router.push('/');
  };

  const refreshUser = async () => {
    const res: any = await authService.me().catch(() => null);
    if (res?.data) setUser(res.data);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'ADMIN',
      phoneVerify,
      saveEmail,
      login,
      logout,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
