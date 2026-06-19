'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/lib/services/auth.service';

type Mode = 'login' | 'register';
type Step = 'form' | 'verify';

const BRAND_PHRASES = [
  'Thread by thread.',
  'Cotton as nature intended.',
  'No blends. No shortcuts.',
  'Breathes with you.',
  'Born in Jaipur.',
  'Made for the everyday.',
];

const THREAD_LINES = [12, 28, 44, 62, 80];

export default function AccountPage() {
  const { user, isLoading, isAuthenticated, login, register, logout } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<Mode>('login');
  const [step, setStep] = useState<Step>('form');
  const [phraseIdx, setPhraseIdx] = useState(0);

  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP verify
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resendSecs, setResendSecs] = useState(0);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  // Rotate brand phrases
  useEffect(() => {
    const t = setInterval(() => setPhraseIdx(i => (i + 1) % BRAND_PHRASES.length), 3500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (resendSecs <= 0) return;
    const t = setTimeout(() => setResendSecs(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendSecs]);

  const clear = useCallback(() => setError(''), []);

  const switchMode = (m: Mode) => {
    setMode(m);
    setStep('form');
    setError('');
    setDigits(['', '', '', '', '', '']);
  };

  // ── Login ─────────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    clear();
    setBusy(true);
    try {
      await login(email, password);
      setDone(true);
      setTimeout(() => setDone(false), 1400); // reveal dashboard, no router navigation
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setBusy(false);
    }
  };

  // ── Register ──────────────────────────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !regEmail || !regPassword) return;
    clear();
    setBusy(true);
    try {
      const { requiresVerification } = await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: regEmail,
        phone: '',
        password: regPassword,
      });
      if (requiresVerification) {
        setStep('verify');
        setResendSecs(30);
        setTimeout(() => otpRefs.current[0]?.focus(), 120);
      } else {
        setDone(true);
        setTimeout(() => setDone(false), 1400);
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  // ── OTP verify ────────────────────────────────────────────────────────────
  const otp = digits.join('');

  const handleDigitChange = (i: number, val: string) => {
    const d = val.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = d;
    setDigits(next);
    if (d && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleDigitKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      const next = [...digits];
      next[i - 1] = '';
      setDigits(next);
      otpRefs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(''));
      otpRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    if (otp.length !== 6 || busy) return;
    clear();
    setBusy(true);
    try {
      await authService.verifyOtp(otp);
      setDone(true);
      setTimeout(() => setDone(false), 1400);
    } catch (err: any) {
      setError(err.message || 'Incorrect code. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async () => {
    if (resendSecs > 0 || busy) return;
    clear();
    setBusy(true);
    try {
      await authService.resendOtp();
      setDigits(['', '', '', '', '', '']);
      setResendSecs(30);
      otpRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || 'Failed to resend. Try again.');
    } finally {
      setBusy(false);
    }
  };

  // ── Shared styles ─────────────────────────────────────────────────────────
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '14px 0', background: 'transparent', border: 'none',
    borderBottom: '1px solid rgba(26,26,26,0.2)', fontSize: 15, color: '#1A1A1A',
    outline: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9E9987',
    fontWeight: 500, display: 'block', marginBottom: 4,
  };
  const primaryBtn = (disabled: boolean): React.CSSProperties => ({
    width: '100%', padding: '16px',
    background: disabled ? '#C8C3BA' : '#1A1A1A',
    color: '#F5F0E8', border: 'none', fontSize: 11, letterSpacing: '0.14em',
    textTransform: 'uppercase', cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'DM Sans, sans-serif', fontWeight: 500, transition: 'background 0.22s',
    marginTop: 32, display: 'block',
  });
  const linkBtn: React.CSSProperties = {
    background: 'none', border: 'none', padding: 0, fontSize: 12, color: '#1A1A1A',
    cursor: 'pointer', textDecoration: 'underline', fontFamily: 'DM Sans, sans-serif',
    textUnderlineOffset: 3,
  };

  const leftContent = {
    login:    { heading: 'Welcome\nback.',            sub: 'Your cart is waiting.' },
    register: { heading: "Let's get\nyou set up.",    sub: 'Pure cotton. Nothing else.' },
    verify:   { heading: 'Check your\ninbox.',         sub: `Code sent to ${regEmail}` },
  };
  const panel = step === 'verify' ? leftContent.verify : leftContent[mode];

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F5F0E8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.4, repeat: Infinity }}>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, letterSpacing: '0.14em', color: '#9E9987', textTransform: 'uppercase' }}>Loading</p>
        </motion.div>
      </div>
    );
  }

  // ── Success animation (checked before isAuthenticated so it shows) ────────
  if (done) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
        style={{ minHeight: '100vh', background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ display: 'block', margin: '0 auto 24px' }}>
            <circle cx="32" cy="32" r="31" stroke="rgba(245,240,232,0.12)" strokeWidth="1" />
            <motion.path d="M20 32l8 8 16-16" stroke="#F5F0E8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.55, delay: 0.1, ease: 'easeOut' }} />
          </svg>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, letterSpacing: '0.18em', color: 'rgba(245,240,232,0.4)', textTransform: 'uppercase' }}>
            {mode === 'login' ? 'Welcome back' : 'Welcome to QOTN'}
          </p>
        </div>
      </motion.div>
    );
  }

  // ── Authenticated dashboard ───────────────────────────────────────────────
  if (isAuthenticated && user) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}
        style={{ minHeight: '100vh', background: '#F5F0E8', fontFamily: 'DM Sans, sans-serif', padding: 'clamp(48px,8vw,80px) 24px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>

          <p style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9E9987', marginBottom: 36 }}>My Account</p>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: 'easeOut' }}
            style={{ marginBottom: 48 }}>
            <h1 style={{ fontSize: 32, fontWeight: 300, color: '#1A1A1A', letterSpacing: '-0.02em', marginBottom: 8 }}>
              {user.firstName} {user.lastName}
            </h1>
            <p style={{ fontSize: 13, color: '#9E9987' }}>{user.email}</p>
            {!user.isVerified && (
              <p style={{ fontSize: 11, color: '#B45309', marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                ● Email not verified —{' '}
                <button onClick={() => router.push('/verify-email')}
                  style={{ background: 'none', border: 'none', padding: 0, fontSize: 11, color: '#B45309', textDecoration: 'underline', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', textUnderlineOffset: 3 }}>
                  verify now
                </button>
              </p>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.08, ease: 'easeOut' }}
            style={{ display: 'flex', flexDirection: 'column', gap: 0, borderTop: '1px solid rgba(26,26,26,0.1)' }}>
            {[
              { label: 'My Orders', href: '/orders', desc: 'Track and view your orders' },
              { label: 'Saved Addresses', href: '/addresses', desc: 'Manage delivery addresses' },
              { label: 'Wishlist', href: '/wishlist', desc: 'Pieces you\'ve saved' },
            ].map((link, i) => (
              <motion.button key={link.href}
                onClick={() => router.push(link.href)}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.12 + i * 0.07 }}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', borderBottom: '1px solid rgba(26,26,26,0.1)', background: 'none', border: 'none', borderTop: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', width: '100%', transition: 'padding-left 0.2s' }}
                onMouseEnter={e => { (e.currentTarget.style.paddingLeft = '6px'); }}
                onMouseLeave={e => { (e.currentTarget.style.paddingLeft = '0'); }}>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: 14, color: '#1A1A1A' }}>{link.label}</p>
                  <p style={{ fontSize: 11, color: '#C8C3BA', marginTop: 2 }}>{link.desc}</p>
                </div>
                <span style={{ fontSize: 18, color: '#C8C3BA', marginLeft: 12 }}>›</span>
              </motion.button>
            ))}
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.36 }}
            onClick={() => logout()}
            style={{ marginTop: 44, background: 'none', border: '1px solid rgba(26,26,26,0.15)', padding: '13px 32px', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9E9987', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'border-color 0.2s, color 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#1A1A1A'; e.currentTarget.style.color = '#1A1A1A'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(26,26,26,0.15)'; e.currentTarget.style.color = '#9E9987'; }}>
            Log out
          </motion.button>

        </div>
      </motion.div>
    );
  }

  // ── Auth form ─────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'DM Sans, sans-serif' }}>

      {/* ── Left panel (desktop) ──────────────────────────────────────────── */}
      <div className="auth-left-panel" style={{ position: 'relative', overflow: 'hidden' }}>

        {/* Animated thread lines */}
        {THREAD_LINES.map((y, i) => (
          <motion.div key={i}
            style={{ position: 'absolute', top: `${y}%`, left: '-5%', right: '-5%', height: 1, background: 'rgba(245,240,232,0.05)', pointerEvents: 'none' }}
            animate={{ y: [0, 10, -5, 0], opacity: [0.05, 0.10, 0.05] }}
            transition={{ duration: 9 + i * 2.2, repeat: Infinity, ease: 'easeInOut', delay: i * 1.1 }}
          />
        ))}

        {/* Watermark letter */}
        <div style={{ position: 'absolute', bottom: -20, right: -24, fontSize: 220, fontWeight: 200, color: 'rgba(245,240,232,0.03)', lineHeight: 1, userSelect: 'none', pointerEvents: 'none', fontFamily: 'DM Sans, sans-serif' }}>Q</div>

        {/* Top */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: 17, fontWeight: 200, letterSpacing: '0.28em', color: '#F5F0E8', textTransform: 'uppercase' }}>QOTN</p>
          <p style={{ fontSize: 9, letterSpacing: '0.14em', color: 'rgba(245,240,232,0.25)', textTransform: 'uppercase', marginTop: 6 }}>Pure Cotton. Nothing Else.</p>
        </div>

        {/* Middle – animated heading */}
        <AnimatePresence mode="wait">
          <motion.div key={step === 'verify' ? 'verify' : mode}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ width: 28, height: 1, background: 'rgba(245,240,232,0.2)', marginBottom: 28 }} />

            {/* Clip-path text reveal */}
            <div style={{ overflow: 'hidden', marginBottom: 20 }}>
              <motion.p
                initial={{ y: 52 }} animate={{ y: 0 }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                style={{ fontSize: 36, fontWeight: 200, color: '#F5F0E8', lineHeight: 1.25, letterSpacing: '-0.02em', whiteSpace: 'pre-line' }}>
                {panel.heading}
              </motion.p>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15, ease: 'easeOut' }}
              style={{ fontSize: 12, color: 'rgba(245,240,232,0.32)', lineHeight: 1.85, wordBreak: 'break-word' }}>
              {panel.sub}
            </motion.p>
          </motion.div>
        </AnimatePresence>

        {/* Rotating brand phrase */}
        <div style={{ position: 'relative', zIndex: 1, minHeight: 22 }}>
          <AnimatePresence mode="wait">
            <motion.p key={phraseIdx}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              style={{ fontSize: 12, color: 'rgba(245,240,232,0.18)', letterSpacing: '0.06em', fontStyle: 'italic' }}>
              {BRAND_PHRASES[phraseIdx]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Bottom – step dots + origin */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {mode === 'register' && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14 }}>
              <motion.div animate={{ width: 22 }} style={{ height: 2, background: '#F5F0E8', borderRadius: 1 }} />
              <motion.div
                animate={{ width: step === 'verify' ? 22 : 5, opacity: step === 'verify' ? 1 : 0.25 }}
                transition={{ duration: 0.3 }}
                style={{ height: 2, background: '#F5F0E8', borderRadius: 1 }} />
            </div>
          )}
          <p style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.18)' }}>Made in India</p>
        </div>
      </div>

      {/* ── Right panel (form) ────────────────────────────────────────────── */}
      <div style={{ flex: 1, background: '#F5F0E8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', minHeight: '100vh', position: 'relative' }}>

        {/* Mobile header */}
        <div className="auth-mobile-header">
          <p style={{ fontSize: 15, fontWeight: 200, letterSpacing: '0.28em', color: '#1A1A1A', textTransform: 'uppercase', textAlign: 'center' }}>QOTN</p>
          <div style={{ height: 18, display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 6 }}>
            <AnimatePresence mode="wait">
              <motion.p key={phraseIdx}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                style={{ fontSize: 10, letterSpacing: '0.10em', color: '#C8C3BA', textTransform: 'uppercase', textAlign: 'center', fontStyle: 'italic' }}>
                {BRAND_PHRASES[phraseIdx]}
              </motion.p>
            </AnimatePresence>
          </div>
          <div style={{ height: 1, width: 28, background: 'rgba(26,26,26,0.12)', margin: '18px auto 40px' }} />
        </div>

        <div style={{ width: '100%', maxWidth: 360 }}>
          <AnimatePresence mode="wait">

            {/* ── LOGIN ── */}
            {step === 'form' && mode === 'login' && (
              <motion.div key="login"
                initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.38, ease: 'easeOut' }}>

                <div style={{ overflow: 'hidden', marginBottom: 6 }}>
                  <motion.p initial={{ y: 40 }} animate={{ y: 0 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    style={{ fontSize: 26, fontWeight: 300, color: '#1A1A1A', letterSpacing: '-0.01em' }}>
                    Welcome back.
                  </motion.p>
                </div>
                <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.12, ease: 'easeOut' }}
                  style={{ fontSize: 13, color: '#9E9987', marginBottom: 40, lineHeight: 1.65 }}>
                  Log in to your QOTN account.
                </motion.p>

                <form onSubmit={handleLogin}>
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.16, ease: 'easeOut' }}
                    style={{ marginBottom: 22 }}>
                    <label style={labelStyle}>Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      autoComplete="email" autoFocus style={inputStyle}
                      onFocus={e => (e.target.style.borderBottomColor = '#1A1A1A')}
                      onBlur={e => (e.target.style.borderBottomColor = 'rgba(26,26,26,0.2)')} />
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.22, ease: 'easeOut' }}
                    style={{ marginBottom: 8, position: 'relative' }}>
                    <label style={labelStyle}>Password</label>
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                      autoComplete="current-password" style={{ ...inputStyle, paddingRight: 40 }}
                      onFocus={e => (e.target.style.borderBottomColor = '#1A1A1A')}
                      onBlur={e => (e.target.style.borderBottomColor = 'rgba(26,26,26,0.2)')} />
                    <button type="button" onClick={() => setShowPassword(p => !p)}
                      style={{ position: 'absolute', right: 0, bottom: 14, background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#9E9987', fontSize: 11, letterSpacing: '0.06em', fontFamily: 'DM Sans, sans-serif' }}>
                      {showPassword ? 'hide' : 'show'}
                    </button>
                  </motion.div>

                  <AnimatePresence>
                    {error && (
                      <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ fontSize: 12, color: '#991B1B', marginBottom: 8 }}>{error}</motion.p>
                    )}
                  </AnimatePresence>

                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.28, ease: 'easeOut' }}>
                    <button type="submit" disabled={!email || !password || busy} style={primaryBtn(!email || !password || busy)}>
                      {busy ? 'Logging in…' : 'Login →'}
                    </button>
                  </motion.div>
                </form>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.36 }}
                  style={{ marginTop: 26, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button style={linkBtn} onClick={() => switchMode('register')}>
                    New here? Create account
                  </button>
                  <button style={{ ...linkBtn, color: '#9E9987', fontSize: 11 }} onClick={() => router.push('/forgot-password')}>
                    Forgot password?
                  </button>
                </motion.div>
              </motion.div>
            )}

            {/* ── REGISTER ── */}
            {step === 'form' && mode === 'register' && (
              <motion.div key="register"
                initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.38, ease: 'easeOut' }}>

                <div style={{ overflow: 'hidden', marginBottom: 6 }}>
                  <motion.p initial={{ y: 40 }} animate={{ y: 0 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    style={{ fontSize: 26, fontWeight: 300, color: '#1A1A1A', letterSpacing: '-0.01em' }}>
                    Create account.
                  </motion.p>
                </div>
                <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.12, ease: 'easeOut' }}
                  style={{ fontSize: 13, color: '#9E9987', marginBottom: 40, lineHeight: 1.65 }}>
                  We&apos;ll send a 6-digit code to verify your email.
                </motion.p>

                <form onSubmit={handleRegister}>
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.14, ease: 'easeOut' }}
                    style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 22 }}>
                    <div>
                      <label style={labelStyle}>First Name</label>
                      <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                        autoComplete="given-name" autoFocus style={inputStyle}
                        onFocus={e => (e.target.style.borderBottomColor = '#1A1A1A')}
                        onBlur={e => (e.target.style.borderBottomColor = 'rgba(26,26,26,0.2)')} />
                    </div>
                    <div>
                      <label style={labelStyle}>Last Name</label>
                      <input type="text" value={lastName} onChange={e => setLastName(e.target.value)}
                        autoComplete="family-name" style={inputStyle}
                        onFocus={e => (e.target.style.borderBottomColor = '#1A1A1A')}
                        onBlur={e => (e.target.style.borderBottomColor = 'rgba(26,26,26,0.2)')} />
                    </div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.18, ease: 'easeOut' }}
                    style={{ marginBottom: 22 }}>
                    <label style={labelStyle}>Email</label>
                    <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)}
                      autoComplete="email" style={inputStyle}
                      onFocus={e => (e.target.style.borderBottomColor = '#1A1A1A')}
                      onBlur={e => (e.target.style.borderBottomColor = 'rgba(26,26,26,0.2)')} />
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.22, ease: 'easeOut' }}
                    style={{ marginBottom: 8, position: 'relative' }}>
                    <label style={labelStyle}>Password</label>
                    <input type={showPassword ? 'text' : 'password'} value={regPassword} onChange={e => setRegPassword(e.target.value)}
                      autoComplete="new-password" style={{ ...inputStyle, paddingRight: 40 }}
                      onFocus={e => (e.target.style.borderBottomColor = '#1A1A1A')}
                      onBlur={e => (e.target.style.borderBottomColor = 'rgba(26,26,26,0.2)')} />
                    <button type="button" onClick={() => setShowPassword(p => !p)}
                      style={{ position: 'absolute', right: 0, bottom: 14, background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#9E9987', fontSize: 11, letterSpacing: '0.06em', fontFamily: 'DM Sans, sans-serif' }}>
                      {showPassword ? 'hide' : 'show'}
                    </button>
                    <p style={{ fontSize: 10, color: '#C8C3BA', marginTop: 7 }}>Min 8 characters, at least one letter and one number</p>
                  </motion.div>

                  <AnimatePresence>
                    {error && (
                      <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ fontSize: 12, color: '#991B1B', marginBottom: 8 }}>{error}</motion.p>
                    )}
                  </AnimatePresence>

                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.28, ease: 'easeOut' }}>
                    <button type="submit"
                      disabled={!firstName.trim() || !lastName.trim() || !regEmail || regPassword.length < 8 || busy}
                      style={primaryBtn(!firstName.trim() || !lastName.trim() || !regEmail || regPassword.length < 8 || busy)}>
                      {busy ? 'Creating…' : 'Create Account →'}
                    </button>
                  </motion.div>
                </form>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.36 }}
                  style={{ marginTop: 26 }}>
                  <button style={linkBtn} onClick={() => switchMode('login')}>
                    Already have an account? Login
                  </button>
                </motion.div>
              </motion.div>
            )}

            {/* ── VERIFY OTP ── */}
            {step === 'verify' && (
              <motion.div key="verify"
                initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.38, ease: 'easeOut' }}>

                <div style={{ overflow: 'hidden', marginBottom: 6 }}>
                  <motion.p initial={{ y: 40 }} animate={{ y: 0 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    style={{ fontSize: 26, fontWeight: 300, color: '#1A1A1A', letterSpacing: '-0.01em' }}>
                    Check your inbox.
                  </motion.p>
                </div>
                <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}
                  style={{ fontSize: 13, color: '#9E9987', marginBottom: 4, lineHeight: 1.65 }}>
                  We sent a 6-digit code to
                </motion.p>
                <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.14 }}
                  style={{ fontSize: 13, color: '#1A1A1A', fontWeight: 500, marginBottom: 40, wordBreak: 'break-word' }}>
                  {regEmail}
                </motion.p>

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}
                  style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 28 }}
                  onPaste={handlePaste}>
                  {digits.map((d, i) => (
                    <motion.input key={i}
                      ref={el => { otpRefs.current[i] = el; }}
                      type="text" inputMode="numeric" maxLength={1} value={d}
                      onChange={e => handleDigitChange(i, e.target.value)}
                      onKeyDown={e => handleDigitKey(i, e)}
                      whileFocus={{ scale: 1.06 }}
                      transition={{ duration: 0.12 }}
                      style={{
                        width: 48, height: 58,
                        textAlign: 'center', fontSize: 22, fontWeight: 300,
                        border: `1.5px solid ${d ? '#1A1A1A' : 'rgba(26,26,26,0.18)'}`,
                        background: d ? '#1A1A1A' : 'transparent',
                        color: d ? '#F5F0E8' : '#1A1A1A',
                        outline: 'none', fontFamily: 'DM Sans, sans-serif',
                        transition: 'border-color 0.15s, background 0.15s, color 0.15s',
                      }}
                    />
                  ))}
                </motion.div>

                <AnimatePresence>
                  {error && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      style={{ fontSize: 12, color: '#991B1B', marginBottom: 12, textAlign: 'center' }}>{error}</motion.p>
                  )}
                </AnimatePresence>

                <button onClick={handleVerify} disabled={otp.length !== 6 || busy}
                  style={{ ...primaryBtn(otp.length !== 6 || busy), marginTop: 0 }}>
                  {busy ? 'Verifying…' : 'Verify Email →'}
                </button>

                <div style={{ marginTop: 24, textAlign: 'center' }}>
                  {resendSecs > 0 ? (
                    <p style={{ fontSize: 12, color: '#9E9987' }}>
                      Resend in <span style={{ color: '#1A1A1A', fontWeight: 500 }}>{resendSecs}s</span>
                    </p>
                  ) : (
                    <button onClick={handleResend} disabled={busy}
                      style={{ ...linkBtn, fontSize: 12, opacity: busy ? 0.5 : 1 }}>
                      Resend code
                    </button>
                  )}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      <style>{`
        .auth-left-panel {
          display: none;
          width: 40%;
          min-width: 300px;
          background: #1A1A1A;
          flex-direction: column;
          justify-content: space-between;
          padding: 56px 52px;
          position: sticky;
          top: 0;
          height: 100vh;
          flex-shrink: 0;
        }
        .auth-mobile-header { display: block; }
        @media (min-width: 768px) {
          .auth-left-panel { display: flex; }
          .auth-mobile-header { display: none; }
        }
      `}</style>
    </div>
  );
}
