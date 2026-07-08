'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/services/auth.service';

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '14px 0', background: 'transparent', border: 'none',
  borderBottom: '1px solid rgba(26,26,26,0.2)', fontSize: 15, color: '#1A1A1A',
  outline: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box',
};
const labelStyle: React.CSSProperties = {
  fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9E9987',
  fontWeight: 500, display: 'block', marginBottom: 4,
};

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail]   = useState('');
  const [busy, setBusy]     = useState(false);
  const [sent, setSent]     = useState(false);
  const [error, setError]   = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || busy) return;
    setError('');
    setBusy(true);
    try {
      await authService.forgotPassword(email.trim());
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{
      background: '#F5F0E8', minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, fontFamily: 'DM Sans, sans-serif',
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Brand header */}
        <h1 style={{ fontSize: 13, letterSpacing: '0.16em', textTransform: 'uppercase', textAlign: 'center', marginBottom: 6, color: '#1A1A1A' }}>
          QOTN
        </h1>
        <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', textAlign: 'center', color: '#9E9987', marginBottom: 48 }}>
          Pure Cotton. Nothing Else.
        </p>

        {sent ? (
          /* ── Success state ── */
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%', background: '#D1FAE5',
              border: '2px solid #059669', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 20px', fontSize: 22, color: '#059669',
            }}>
              ✓
            </div>
            <p style={{ fontSize: 16, fontWeight: 500, color: '#1A1A1A', marginBottom: 10 }}>Check your inbox</p>
            <p style={{ fontSize: 13, color: '#9E9987', lineHeight: 1.6, marginBottom: 32 }}>
              We sent a reset link to <strong style={{ color: '#1A1A1A' }}>{email}</strong>.<br />
              It expires in 15 minutes.
            </p>
            <button
              onClick={() => router.push('/account')}
              style={{
                width: '100%', padding: '16px', background: '#1A1A1A', color: '#F5F0E8',
                border: 'none', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
                cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 500,
              }}
            >
              Back to Login
            </button>
          </div>
        ) : (
          /* ── Form state ── */
          <>
            <h2 style={{ fontSize: 22, fontWeight: 300, color: '#1A1A1A', marginBottom: 8 }}>
              Forgot password?
            </h2>
            <p style={{ fontSize: 13, color: '#9E9987', marginBottom: 36, lineHeight: 1.6 }}>
              Enter your email and we&apos;ll send you a link to reset it.
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 32 }}>
                <label style={labelStyle}>Email address</label>
                <input
                  type="email"
                  style={inputStyle}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoFocus
                />
              </div>

              {error && (
                <p style={{
                  fontSize: 12, color: '#991B1B', background: '#FEE2E2',
                  padding: '10px 14px', borderLeft: '3px solid #991B1B', marginBottom: 20,
                }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={busy || !email.trim()}
                style={{
                  width: '100%', padding: '16px',
                  background: busy || !email.trim() ? '#C8C3BA' : '#1A1A1A',
                  color: '#F5F0E8', border: 'none', fontSize: 11, letterSpacing: '0.14em',
                  textTransform: 'uppercase', cursor: busy || !email.trim() ? 'not-allowed' : 'pointer',
                  fontFamily: 'DM Sans, sans-serif', fontWeight: 500,
                }}
              >
                {busy ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <button
                onClick={() => router.push('/account')}
                style={{
                  background: 'none', border: 'none', fontSize: 12, color: '#9E9987',
                  cursor: 'pointer', textDecoration: 'underline', fontFamily: 'DM Sans, sans-serif',
                  textUnderlineOffset: 3,
                }}
              >
                Back to Login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
