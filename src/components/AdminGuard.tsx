'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function AdminGuard({ children }: { children: ReactNode }) {
  const { user, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9F8F6' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 32, height: 32, border: '2px solid #1A1A1A', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#9E9987', fontSize: 13, letterSpacing: '0.08em' }}>LOADING</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9F8F6' }}>
        <div style={{ textAlign: 'center', maxWidth: 360 }}>
          <p style={{ fontSize: 40, marginBottom: 16 }}>🔒</p>
          <h2 style={{ fontSize: 18, fontWeight: 500, letterSpacing: '0.06em', marginBottom: 8 }}>Admin Access Only</h2>
          <p style={{ color: '#9E9987', fontSize: 14, marginBottom: 24 }}>
            {user ? `Signed in as ${user.email} — not an admin.` : 'Please sign in as an admin to continue.'}
          </p>
          <a href="/account" style={{ display: 'inline-block', padding: '12px 28px', background: '#1A1A1A', color: '#F5F0E8', textDecoration: 'none', borderRadius: 8, fontSize: 13, letterSpacing: '0.06em' }}>
            Go to Login →
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
