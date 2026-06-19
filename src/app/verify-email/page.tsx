'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/lib/services/auth.service';

export default function VerifyEmailPage() {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);
  const [resendSecs, setResendSecs] = useState(0);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) router.replace('/account');
    if (!isLoading && user?.isVerified) router.replace('/');
  }, [isLoading, user, router]);

  useEffect(() => {
    if (resendSecs <= 0) return;
    const t = setTimeout(() => setResendSecs(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendSecs]);

  const otp = digits.join('');

  const handleChange = (i: number, val: string) => {
    const d = val.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = d;
    setDigits(next);
    if (d && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      const next = [...digits];
      next[i - 1] = '';
      setDigits(next);
      refs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const p = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (p.length === 6) {
      setDigits(p.split(''));
      refs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    if (otp.length !== 6 || busy) return;
    setError('');
    setBusy(true);
    try {
      await authService.verifyOtp(otp);
      setSuccess(true);
      setTimeout(() => router.push('/'), 1400);
    } catch (err: any) {
      setError(err.message || 'Incorrect code. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async () => {
    if (resendSecs > 0 || busy) return;
    setError('');
    setBusy(true);
    try {
      await authService.resendOtp();
      setDigits(['', '', '', '', '', '']);
      setResendSecs(30);
      refs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || 'Failed to resend. Try again.');
    } finally {
      setBusy(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F5F0E8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.4, repeat: Infinity }}>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, letterSpacing: '0.14em', color: '#9E9987', textTransform: 'uppercase' }}>Loading</p>
        </motion.div>
      </div>
    );
  }

  if (success) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
        style={{ minHeight: '100vh', background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none" style={{ display: 'block', margin: '0 auto 20px' }}>
            <circle cx="28" cy="28" r="27" stroke="rgba(245,240,232,0.2)" strokeWidth="1" />
            <motion.path d="M18 28l7 7 13-13" stroke="#F5F0E8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }} />
          </svg>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, letterSpacing: '0.16em', color: 'rgba(245,240,232,0.45)', textTransform: 'uppercase' }}>Email verified</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F0E8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <p style={{ fontSize: 15, fontWeight: 200, letterSpacing: '0.24em', color: '#1A1A1A', textTransform: 'uppercase', textAlign: 'center', marginBottom: 4 }}>QOTN</p>
        <p style={{ fontSize: 9, letterSpacing: '0.12em', color: '#9E9987', textTransform: 'uppercase', textAlign: 'center', marginBottom: 52 }}>Pure Cotton. Nothing Else.</p>

        <p style={{ fontSize: 22, fontWeight: 300, color: '#1A1A1A', marginBottom: 6 }}>Check your inbox.</p>
        <p style={{ fontSize: 13, color: '#9E9987', marginBottom: 4, lineHeight: 1.65 }}>We sent a 6-digit code to</p>
        <p style={{ fontSize: 13, color: '#1A1A1A', fontWeight: 500, marginBottom: 36, wordBreak: 'break-word' }}>
          {user?.email || 'your email address'}
        </p>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 28 }} onPaste={handlePaste}>
          {digits.map((d, i) => (
            <motion.input key={i}
              ref={el => { refs.current[i] = el; }}
              type="text" inputMode="numeric" maxLength={1} value={d}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKey(i, e)}
              autoFocus={i === 0}
              whileFocus={{ scale: 1.05 }}
              transition={{ duration: 0.12 }}
              style={{
                width: 48, height: 56,
                textAlign: 'center', fontSize: 22, fontWeight: 300,
                border: `1.5px solid ${d ? '#1A1A1A' : 'rgba(26,26,26,0.18)'}`,
                background: d ? '#1A1A1A' : 'transparent',
                color: d ? '#F5F0E8' : '#1A1A1A',
                outline: 'none',
                fontFamily: 'DM Sans, sans-serif',
                transition: 'border-color 0.15s, background 0.15s, color 0.15s',
              }}
            />
          ))}
        </div>

        <AnimatePresence>
          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              style={{ fontSize: 12, color: '#991B1B', marginBottom: 12, textAlign: 'center' }}>{error}</motion.p>
          )}
        </AnimatePresence>

        <button onClick={handleVerify} disabled={otp.length !== 6 || busy}
          style={{
            width: '100%', padding: '15px',
            background: otp.length === 6 && !busy ? '#1A1A1A' : '#C8C3BA',
            color: '#F5F0E8', border: 'none',
            fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
            cursor: otp.length === 6 && !busy ? 'pointer' : 'not-allowed',
            fontFamily: 'DM Sans, sans-serif', fontWeight: 500, transition: 'background 0.22s',
          }}>
          {busy ? 'Verifying…' : 'Verify Email →'}
        </button>

        <div style={{ marginTop: 22, textAlign: 'center' }}>
          {resendSecs > 0 ? (
            <p style={{ fontSize: 12, color: '#9E9987' }}>
              Resend in <span style={{ color: '#1A1A1A', fontWeight: 500 }}>{resendSecs}s</span>
            </p>
          ) : (
            <button onClick={handleResend} disabled={busy}
              style={{ background: 'none', border: 'none', fontSize: 12, color: '#1A1A1A', cursor: busy ? 'not-allowed' : 'pointer', textDecoration: 'underline', fontFamily: 'DM Sans, sans-serif', textUnderlineOffset: 3, opacity: busy ? 0.5 : 1 }}>
              Resend code
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
