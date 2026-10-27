'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/services/auth.service';
import { ApiError, markSignedIn, markSignedOut, wasSignedIn } from '@/lib/api';

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
    // Guests (never signed in on this browser) skip the check. The login itself is in httpOnly cookies.
    if (!wasSignedIn()) {
      setIsLoading(false);
      return;
    }

    authService
      .me()
      .then((res: any) => {
        setUser(res.data ?? null);
        markSignedIn(); // also upgrades a browser that still had the old stored token
      })
      .catch((err: unknown) => {
        const status = err instanceof ApiError ? err.status : 0;
        if (process.env.NODE_ENV === 'development') {
          console.warn('[Auth] /auth/me failed — status:', status);
        }
        // Only a refused session ends the sign-in; a network hiccup should not sign anyone out
        if (status === 401 || status === 403) markSignedOut();
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res: any = await authService.login({ email, password });
    markSignedIn();
    setUser(res.data.user);
  };

  const register = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<{ requiresVerification?: boolean }> => {
    const res: any = await authService.register(data);
    markSignedIn();
    setUser(res.data.user);
    return { requiresVerification: res.data.requiresVerification };
  };

  const logout = async () => {
    markSignedOut();
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
