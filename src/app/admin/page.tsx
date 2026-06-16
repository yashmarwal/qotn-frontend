'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { isAdmin, isLoading } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [adminId, setAdminId] = useState('');
  const [pass, setPass] = useState('');

  useEffect(() => {
    if (isLoading) return;
    // Any non-admin (guest or customer) is silently sent home
    if (!isAdmin) {
      router.replace('/');
    }
  }, [isAdmin, isLoading, router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminId === 'Admin#qotN@qotn.in' && pass === 'Qotn#pun2006it') {
      router.push('/admin/dashboard');
    } else {
      setError('Invalid credentials.');
    }
  };

  // Show nothing while auth is resolving or while redirecting non-admins
  if (isLoading || !isAdmin) {
    return <div style={{ backgroundColor: 'var(--black)', minHeight: '100vh' }} />;
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--black)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: 400 }}
      >
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 className="brand-wordmark" style={{ fontSize: 22, color: 'var(--cream)', marginBottom: 8 }}>
            QOTN
          </h1>
          <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.4)' }}>
            Admin Panel
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 11, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.5)', display: 'block', marginBottom: 8, fontWeight: 500 }}>
              Admin ID
            </label>
            <input
              type="text"
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1px solid rgba(245,240,232,0.2)',
                background: 'rgba(245,240,232,0.05)',
                fontSize: 13,
                outline: 'none',
                color: 'var(--cream)',
                fontFamily: 'DM Sans, sans-serif',
              }}
              required
              autoComplete="username"
            />
          </div>

          <div>
            <label style={{ fontSize: 11, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.5)', display: 'block', marginBottom: 8, fontWeight: 500 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '12px 44px 12px 14px',
                  border: '1px solid rgba(245,240,232,0.2)',
                  background: 'rgba(245,240,232,0.05)',
                  fontSize: 13,
                  outline: 'none',
                  color: 'var(--cream)',
                  fontFamily: 'DM Sans, sans-serif',
                }}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(245,240,232,0.4)' }}
              >
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {error && (
            <p style={{ fontSize: 12, color: '#F87171', letterSpacing: '0.04em' }}>{error}</p>
          )}

          <button
            type="submit"
            style={{
              marginTop: 8,
              padding: '14px',
              background: 'var(--cream)',
              color: 'var(--black)',
              border: 'none',
              fontSize: 12,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Sign In
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 11, color: 'rgba(245,240,232,0.3)' }}>
          QOTN Admin · Restricted Access
        </p>
      </motion.div>
    </div>
  );
}
