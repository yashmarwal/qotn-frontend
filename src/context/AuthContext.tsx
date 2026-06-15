'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/services/auth.service';
import { ApiError } from '@/lib/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  isVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<{ requiresVerification?: boolean }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('qotn_token') : null;
    if (!token) {
      setIsLoading(false);
      return;
    }

    // Check JWT expiry before hitting the network
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
        const status = err instanceof ApiError ? err.status : 0;
        if (process.env.NODE_ENV === 'development') {
          console.warn('[Auth] /auth/me failed — status:', status);
        }
        localStorage.removeItem('qotn_token');
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res: any = await authService.login({ email, password });
    const { token, user: newUser } = res.data;
    if (token) localStorage.setItem('qotn_token', token);
    setUser(newUser);
  };

  const register = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<{ requiresVerification?: boolean }> => {
    const res: any = await authService.register(data);
    const { token, user: newUser, requiresVerification } = res.data;
    if (token) localStorage.setItem('qotn_token', token);
    setUser(newUser);
    return { requiresVerification };
  };

  const logout = async () => {
    localStorage.removeItem('qotn_token');
    setUser(null);
    authService.logout().catch(() => {});
    router.push('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
