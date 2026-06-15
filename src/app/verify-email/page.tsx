'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/lib/services/auth.service';

export default function VerifyEmailPage() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [resendMsg, setResendMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) router.replace('/account');
    if (!isLoading && user?.isVerified) router.replace('/');
  }, [isLoading, user, router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResendMsg('');
    setIsVerifying(true);
    try {
      await authService.verifyOtp(otp);
      setSuccess(true);
      setTimeout(() => router.push('/'), 2000);
    } catch (err: any) {
      setError(err.message || 'Invalid code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setResendMsg('');
    setIsResending(true);
    try {
      await authService.resendOtp();
      setResendMsg('A new code has been sent to your email.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ background: '#F5F0E8', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#9E9987' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ background: '#F5F0E8', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
        <h1 style={{ fontSize: 28, fontWeight: 200, letterSpacing: '0.1em', color: '#1A1A1A', marginBottom: 8 }}>QOTN</h1>
        <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9E9987', marginBottom: 40 }}>Pure Cotton. Nothing Else.</p>

        {success ? (
          <div>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#D1FAE5', border: '2px solid #059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 28 }}>
              ✓
            </div>
            <p style={{ color: '#065F46', fontSize: 15, fontWeight: 500, marginBottom: 6 }}>Email verified!</p>
            <p style={{ color: '#9E9987', fontSize: 13 }}>Redirecting you home...</p>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: 20, fontWeight: 400, color: '#1A1A1A', marginBottom: 8 }}>Verify Your Email</h2>
            <p style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>We sent a 6-digit code to</p>
            <p style={{ fontSize: 14, fontWeight: 500, color: '#1A1A1A', marginBottom: 36 }}>
              {user?.email || 'your email address'}
            </p>

            <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                autoFocus
                style={{
                  fontSize: 34,
                  letterSpacing: '0.45em',
                  textAlign: 'center',
                  padding: '18px 20px',
                  border: '1px solid #1A1A1A',
                  background: '#F5F0E8',
                  width: '100%',
                  outline: 'none',
                  color: '#1A1A1A',
                  fontFamily: 'DM Sans, sans-serif',
                  boxSizing: 'border-box' as const,
                }}
              />

              {error && (
                <p style={{ fontSize: 12, color: '#991B1B', margin: 0, textAlign: 'left' }}>{error}</p>
              )}
              {resendMsg && (
                <p style={{ fontSize: 12, color: '#065F46', margin: 0, textAlign: 'left' }}>{resendMsg}</p>
              )}

              <button
                type="submit"
                disabled={otp.length !== 6 || isVerifying}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: otp.length === 6 ? '#1A1A1A' : '#C8C3BA',
                  color: '#F5F0E8',
                  border: 'none',
                  fontSize: 12,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase' as const,
                  cursor: otp.length === 6 && !isVerifying ? 'pointer' : 'not-allowed',
                  fontFamily: 'DM Sans, sans-serif',
                  fontWeight: 500,
                  transition: 'background 0.2s',
                }}
              >
                {isVerifying ? 'Verifying...' : 'Verify Email'}
              </button>
            </form>

            <div style={{ marginTop: 28, paddingTop: 28, borderTop: '1px solid rgba(26,26,26,0.12)' }}>
              <p style={{ fontSize: 13, color: '#9E9987', marginBottom: 8 }}>
                Didn&apos;t receive the code?
              </p>
              <button
                onClick={handleResend}
                disabled={isResending}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 13,
                  color: '#1A1A1A',
                  cursor: isResending ? 'not-allowed' : 'pointer',
                  textDecoration: 'underline',
                  fontFamily: 'DM Sans, sans-serif',
                  opacity: isResending ? 0.5 : 1,
                }}
              >
                {isResending ? 'Sending...' : 'Resend code'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
