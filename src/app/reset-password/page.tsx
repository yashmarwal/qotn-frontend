'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';

function getPasswordStrength(pwd: string): 'weak' | 'good' | 'strong' {
  if (pwd.length < 8 || !/[A-Za-z]/.test(pwd) || !/\d/.test(pwd)) return 'weak';
  if (/[^A-Za-z0-9]/.test(pwd)) return 'strong';
  return 'good';
}

const strengthColors = { weak: '#DC2626', good: '#D97706', strong: '#059669' };
const strengthWidths = { weak: '33%', good: '66%', strong: '100%' };
const strengthLabels = { weak: 'WEAK', good: 'GOOD', strong: 'STRONG' };

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', border: '1px solid #1A1A1A',
  background: '#F5F0E8', fontSize: 13, outline: 'none', color: '#1A1A1A',
  fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box',
};
const labelStyle: React.CSSProperties = {
  fontSize: 11, letterSpacing: '0.10em', textTransform: 'uppercase',
  color: '#9E9987', display: 'block', marginBottom: 8, fontWeight: 500,
};

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') ?? '';
  const email = searchParams.get('email') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token || !email) {
      setError('Invalid reset link. Please request a new one.');
    }
  }, [token, email]);

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token || !email) {
      setError('Invalid reset link. Please request a new one.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (strength === 'weak') {
      setError('Password must be at least 8 characters and contain a letter and a number.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, email, newPassword: password });
      setSuccess(true);
      setTimeout(() => router.push('/account'), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#F5F0E8', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <h1 style={{ fontSize: 13, letterSpacing: '0.16em', textTransform: 'uppercase', textAlign: 'center', marginBottom: 8, color: '#1A1A1A' }}>
          QOTN
        </h1>
        <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', textAlign: 'center', color: '#9E9987', marginBottom: 40 }}>
          Pure Cotton. Nothing Else.
        </p>

        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#D1FAE5', border: '2px solid #059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 24 }}>
              ✓
            </div>
            <p style={{ fontSize: 16, fontWeight: 500, color: '#065F46', marginBottom: 8 }}>Password Reset!</p>
            <p style={{ fontSize: 13, color: '#9E9987' }}>Redirecting you to login...</p>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: 20, fontWeight: 300, textAlign: 'center', marginBottom: 8, color: '#1A1A1A' }}>
              Reset Password
            </h2>
            <p style={{ fontSize: 13, color: '#9E9987', textAlign: 'center', marginBottom: 32 }}>
              {email ? `For ${email}` : 'Enter your new password below.'}
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={labelStyle}>New Password</label>
                <input
                  type="password"
                  style={inputStyle}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoFocus
                />
                {password.length > 0 && (
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1, height: 3, background: '#E5E7EB', borderRadius: 2 }}>
                      <div style={{ height: '100%', width: strengthWidths[strength], background: strengthColors[strength], borderRadius: 2, transition: 'all 0.3s' }} />
                    </div>
                    <span style={{ fontSize: 10, letterSpacing: '0.1em', color: strengthColors[strength], fontWeight: 600, minWidth: 36 }}>
                      {strengthLabels[strength]}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label style={labelStyle}>Confirm Password</label>
                <input
                  type="password"
                  style={{
                    ...inputStyle,
                    borderColor: confirm && confirm !== password ? '#DC2626' : '#1A1A1A',
                  }}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                />
                {confirm && confirm !== password && (
                  <p style={{ fontSize: 11, color: '#DC2626', marginTop: 6 }}>Passwords do not match</p>
                )}
              </div>

              {error && (
                <p style={{ fontSize: 12, color: '#991B1B', background: '#FEE2E2', padding: '10px 14px', borderLeft: '3px solid #991B1B' }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !token}
                style={{
                  padding: '14px',
                  background: loading ? '#9E9987' : '#1A1A1A',
                  color: '#F5F0E8',
                  border: 'none',
                  fontSize: 12,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase' as const,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 500,
                  fontFamily: 'DM Sans, sans-serif',
                  marginTop: 8,
                }}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <a href="/account" style={{ fontSize: 12, color: '#9E9987', textDecoration: 'underline' }}>
                Back to Login
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div style={{ background: '#F5F0E8', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#9E9987' }}>Loading...</p>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
