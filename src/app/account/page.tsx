'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/lib/services/auth.service';

type Step = 'identify' | 'otp' | 'email';

const fadeSlide = {
  initial: { opacity: 0, x: 32 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, x: -24, transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const fieldAnim = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

export default function AccountPage() {
  const { user, isLoading, isAuthenticated, phoneVerify, saveEmail } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>('identify');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [resendSecs, setResendSecs] = useState(0);
  const [done, setDone] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace('/');
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (resendSecs <= 0) return;
    const t = setTimeout(() => setResendSecs(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendSecs]);

  const clean = useCallback(() => setError(''), []);

  // ── Step 1: Request OTP ───────────────────────────────────────────────────
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawPhone = phone.replace(/\D/g, '');
    if (!firstName.trim() || !lastName.trim() || rawPhone.length !== 10) return;
    clean();
    setBusy(true);
    try {
      await authService.requestOtp({ firstName: firstName.trim(), lastName: lastName.trim(), phone: rawPhone });
      setStep('otp');
      setResendSecs(30);
      setTimeout(() => otpRefs.current[0]?.focus(), 120);
    } catch (err: any) {
      setError(err.message || 'Could not send OTP. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  // ── Step 2: Verify OTP ────────────────────────────────────────────────────
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
    clean();
    setBusy(true);
    try {
      const { requiresEmail } = await phoneVerify(phone.replace(/\D/g, ''), otp);
      if (requiresEmail) {
        setStep('email');
        setTimeout(() => emailRef.current?.focus(), 120);
      } else {
        setDone(true);
        setTimeout(() => router.replace('/'), 1400);
      }
    } catch (err: any) {
      setError(err.message || 'Incorrect OTP. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async () => {
    if (resendSecs > 0 || busy) return;
    clean();
    setBusy(true);
    try {
      await authService.resendOtp({ phone: phone.replace(/\D/g, '') });
      setDigits(['', '', '', '', '', '']);
      setResendSecs(30);
      otpRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || 'Failed to resend. Try again.');
    } finally {
      setBusy(false);
    }
  };

  // ── Step 3: Email (optional) ──────────────────────────────────────────────
  const handleSaveEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || busy) return;
    clean();
    setBusy(true);
    try {
      await saveEmail(email.trim());
      setDone(true);
      setTimeout(() => router.replace('/'), 1400);
    } catch (err: any) {
      setError(err.message || 'Could not save email. Try again.');
    } finally {
      setBusy(false);
    }
  };

  // ── Shared styles ─────────────────────────────────────────────────────────
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 0',
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid rgba(26,26,26,0.22)',
    fontSize: 15,
    color: '#1A1A1A',
    outline: 'none',
    fontFamily: 'DM Sans, sans-serif',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 9,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: '#9E9987',
    fontWeight: 500,
    display: 'block',
    marginBottom: 4,
  };

  const primaryBtn = (disabled: boolean): React.CSSProperties => ({
    width: '100%',
    padding: '15px',
    background: disabled ? '#C8C3BA' : '#1A1A1A',
    color: '#F5F0E8',
    border: 'none',
    fontSize: 11,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'DM Sans, sans-serif',
    fontWeight: 500,
    transition: 'background 0.22s',
    marginTop: 28,
    display: 'block',
  });

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F5F0E8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.4, repeat: Infinity }}>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, letterSpacing: '0.14em', color: '#9E9987', textTransform: 'uppercase' }}>Loading</p>
        </motion.div>
      </div>
    );
  }

  // ── Success screen ────────────────────────────────────────────────────────
  if (done) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{ minHeight: '100vh', background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none" style={{ display: 'block', margin: '0 auto 20px' }}>
            <circle cx="28" cy="28" r="27" stroke="rgba(245,240,232,0.25)" strokeWidth="1" />
            <motion.path d="M18 28l7 7 13-13" stroke="#F5F0E8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.55, delay: 0.1, ease: 'easeOut' }} />
          </svg>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, letterSpacing: '0.16em', color: 'rgba(245,240,232,0.5)', textTransform: 'uppercase' }}>
            Welcome to QOTN
          </p>
        </div>
      </motion.div>
    );
  }

  // ── Main layout ───────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'DM Sans, sans-serif' }}>

      {/* ── Left panel (desktop only) ───────────────────────────────────── */}
      <div className="auth-panel-left">
        <div>
          <p style={{ fontSize: 18, fontWeight: 200, letterSpacing: '0.22em', color: '#F5F0E8', textTransform: 'uppercase' }}>QOTN</p>
          <p style={{ fontSize: 9, letterSpacing: '0.13em', color: 'rgba(245,240,232,0.35)', textTransform: 'uppercase', marginTop: 5 }}>Pure Cotton. Nothing Else.</p>
        </div>

        <div>
          <div style={{ width: 28, height: 1, background: 'rgba(245,240,232,0.18)', marginBottom: 28 }} />
          <p style={{ fontSize: 30, fontWeight: 200, color: '#F5F0E8', lineHeight: 1.4, letterSpacing: '-0.01em' }}>
            Crafted in India.<br />Worn everywhere.
          </p>
          <p style={{ fontSize: 12, color: 'rgba(245,240,232,0.38)', marginTop: 14, lineHeight: 1.75 }}>
            100% cotton, zero blends.<br />Verified every batch.
          </p>
        </div>

        {/* Step progress indicator */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {(['identify', 'otp', 'email'] as Step[]).map(s => (
            <motion.div key={s}
              animate={{ width: step === s ? 22 : 5, opacity: step === s ? 1 : 0.25 }}
              transition={{ duration: 0.32 }}
              style={{ height: 2, background: '#F5F0E8', borderRadius: 1 }}
            />
          ))}
        </div>
      </div>

      {/* ── Right panel (form) ──────────────────────────────────────────── */}
      <div style={{ flex: 1, background: '#F5F0E8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', minHeight: '100vh' }}>

        {/* Mobile-only QOTN header */}
        <div className="auth-mobile-header">
          <p style={{ fontSize: 16, fontWeight: 200, letterSpacing: '0.22em', color: '#1A1A1A', textTransform: 'uppercase', textAlign: 'center' }}>QOTN</p>
          <p style={{ fontSize: 9, letterSpacing: '0.12em', color: '#9E9987', textTransform: 'uppercase', textAlign: 'center', marginTop: 4, marginBottom: 44 }}>Pure Cotton. Nothing Else.</p>
        </div>

        <div style={{ width: '100%', maxWidth: 360 }}>

          {/* Mobile step dots */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 36 }}>
            {(['identify', 'otp', 'email'] as Step[]).map(s => (
              <motion.div key={s}
                animate={{ width: step === s ? 20 : 5, opacity: step === s ? 1 : 0.18 }}
                transition={{ duration: 0.32 }}
                style={{ height: 2, background: '#1A1A1A', borderRadius: 1 }}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">

            {/* ── STEP 1: Name + Phone ─────────────────────────────────── */}
            {step === 'identify' && (
              <motion.div key="identify" variants={fadeSlide} initial="initial" animate="animate" exit="exit">
                <motion.p variants={fieldAnim} initial="initial" animate="animate"
                  style={{ fontSize: 23, fontWeight: 300, color: '#1A1A1A', marginBottom: 6, letterSpacing: '-0.01em' }}>
                  Who are you?
                </motion.p>
                <motion.p variants={fieldAnim} initial="initial" animate="animate"
                  style={{ fontSize: 13, color: '#9E9987', marginBottom: 38, lineHeight: 1.65 }}>
                  Enter your name and mobile — we'll send a verification code.
                </motion.p>

                <form onSubmit={handleRequestOtp}>
                  <motion.div variants={stagger} initial="initial" animate="animate" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

                    <motion.div variants={fieldAnim} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      <div>
                        <label style={labelStyle}>First Name</label>
                        <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                          placeholder="Yash" autoComplete="given-name" autoFocus style={inputStyle}
                          onFocus={e => (e.target.style.borderBottomColor = '#1A1A1A')}
                          onBlur={e => (e.target.style.borderBottomColor = 'rgba(26,26,26,0.22)')} />
                      </div>
                      <div>
                        <label style={labelStyle}>Last Name</label>
                        <input type="text" value={lastName} onChange={e => setLastName(e.target.value)}
                          placeholder="Marwal" autoComplete="family-name" style={inputStyle}
                          onFocus={e => (e.target.style.borderBottomColor = '#1A1A1A')}
                          onBlur={e => (e.target.style.borderBottomColor = 'rgba(26,26,26,0.22)')} />
                      </div>
                    </motion.div>

                    <motion.div variants={fieldAnim}>
                      <label style={labelStyle}>Mobile Number</label>
                      <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(26,26,26,0.22)', transition: 'border-color 0.2s' }}
                        onFocusCapture={e => ((e.currentTarget as HTMLElement).style.borderBottomColor = '#1A1A1A')}
                        onBlurCapture={e => ((e.currentTarget as HTMLElement).style.borderBottomColor = 'rgba(26,26,26,0.22)')}>
                        <span style={{ fontSize: 14, color: '#9E9987', paddingBottom: 14, paddingRight: 10, borderRight: '1px solid rgba(26,26,26,0.12)', marginRight: 12, flexShrink: 0 }}>+91</span>
                        <input type="tel" value={phone} inputMode="numeric"
                          onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="98765 43210" autoComplete="tel"
                          style={{ ...inputStyle, borderBottom: 'none', flex: 1 }} />
                      </div>
                    </motion.div>

                    {error && (
                      <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                        style={{ fontSize: 12, color: '#991B1B' }}>{error}</motion.p>
                    )}

                    <motion.button variants={fieldAnim} type="submit"
                      disabled={!firstName.trim() || !lastName.trim() || phone.replace(/\D/g, '').length !== 10 || busy}
                      style={primaryBtn(!firstName.trim() || !lastName.trim() || phone.replace(/\D/g, '').length !== 10 || busy)}>
                      {busy ? 'Sending OTP…' : 'Send OTP →'}
                    </motion.button>
                  </motion.div>
                </form>
              </motion.div>
            )}

            {/* ── STEP 2: OTP ──────────────────────────────────────────── */}
            {step === 'otp' && (
              <motion.div key="otp" variants={fadeSlide} initial="initial" animate="animate" exit="exit">
                <motion.p variants={fieldAnim} initial="initial" animate="animate"
                  style={{ fontSize: 23, fontWeight: 300, color: '#1A1A1A', marginBottom: 6, letterSpacing: '-0.01em' }}>
                  Enter your code
                </motion.p>
                <motion.p variants={fieldAnim} initial="initial" animate="animate"
                  style={{ fontSize: 13, color: '#9E9987', marginBottom: 6, lineHeight: 1.65 }}>
                  Sent to +91 {phone.replace(/(\d{5})(\d{5})/, '$1 $2')}
                </motion.p>
                <motion.button variants={fieldAnim} initial="initial" animate="animate"
                  onClick={() => { setStep('identify'); setDigits(['', '', '', '', '', '']); setError(''); }}
                  style={{ background: 'none', border: 'none', padding: 0, fontSize: 11, letterSpacing: '0.08em', color: '#9E9987', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'DM Sans, sans-serif', marginBottom: 36, textUnderlineOffset: 3 }}>
                  Change number
                </motion.button>

                {/* 6 OTP boxes — grouped 3+3 */}
                <motion.div variants={fieldAnim} initial="initial" animate="animate"
                  style={{ display: 'flex', gap: 8, marginBottom: 28 }} onPaste={handlePaste}>
                  {digits.map((d, i) => (
                    <motion.input key={i}
                      ref={el => { otpRefs.current[i] = el; }}
                      type="text" inputMode="numeric" maxLength={1} value={d}
                      onChange={e => handleDigitChange(i, e.target.value)}
                      onKeyDown={e => handleDigitKey(i, e)}
                      whileFocus={{ scale: 1.06 }}
                      style={{
                        width: 46, height: 56,
                        textAlign: 'center', fontSize: 20, fontWeight: 400,
                        border: `1.5px solid ${d ? '#1A1A1A' : 'rgba(26,26,26,0.18)'}`,
                        background: d ? '#1A1A1A' : 'transparent',
                        color: d ? '#F5F0E8' : '#1A1A1A',
                        outline: 'none',
                        fontFamily: 'DM Sans, sans-serif',
                        transition: 'all 0.15s',
                        ...(i === 2 ? { marginRight: 10 } : {}),
                      }}
                    />
                  ))}
                </motion.div>

                {error && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                    style={{ fontSize: 12, color: '#991B1B', marginBottom: 12, textAlign: 'center' }}>{error}</motion.p>
                )}

                <button onClick={handleVerify} disabled={otp.length !== 6 || busy}
                  style={primaryBtn(otp.length !== 6 || busy)}>
                  {busy ? 'Verifying…' : 'Verify →'}
                </button>

                <div style={{ marginTop: 22, textAlign: 'center' }}>
                  {resendSecs > 0 ? (
                    <p style={{ fontSize: 12, color: '#9E9987' }}>
                      Resend in <span style={{ color: '#1A1A1A', fontWeight: 500 }}>{resendSecs}s</span>
                    </p>
                  ) : (
                    <button onClick={handleResend} disabled={busy}
                      style={{ background: 'none', border: 'none', fontSize: 12, color: '#1A1A1A', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'DM Sans, sans-serif', textUnderlineOffset: 3, opacity: busy ? 0.5 : 1 }}>
                      Resend code
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: Email (optional) ──────────────────────────────── */}
            {step === 'email' && (
              <motion.div key="email" variants={fadeSlide} initial="initial" animate="animate" exit="exit">
                <motion.p variants={fieldAnim} initial="initial" animate="animate"
                  style={{ fontSize: 23, fontWeight: 300, color: '#1A1A1A', marginBottom: 6, letterSpacing: '-0.01em' }}>
                  Stay in the loop
                </motion.p>
                <motion.p variants={fieldAnim} initial="initial" animate="animate"
                  style={{ fontSize: 13, color: '#9E9987', marginBottom: 38, lineHeight: 1.65 }}>
                  Add your email for order updates and early drops. Completely optional.
                </motion.p>

                <form onSubmit={handleSaveEmail}>
                  <motion.div variants={stagger} initial="initial" animate="animate" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                    <motion.div variants={fieldAnim}>
                      <label style={labelStyle}>Email Address</label>
                      <input ref={emailRef} type="email" value={email} onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com" autoComplete="email" style={inputStyle}
                        onFocus={e => (e.target.style.borderBottomColor = '#1A1A1A')}
                        onBlur={e => (e.target.style.borderBottomColor = 'rgba(26,26,26,0.22)')} />
                    </motion.div>

                    {error && (
                      <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                        style={{ fontSize: 12, color: '#991B1B' }}>{error}</motion.p>
                    )}

                    <motion.div variants={fieldAnim}>
                      <button type="submit" disabled={!email || busy} style={primaryBtn(!email || busy)}>
                        {busy ? 'Saving…' : 'Save & Continue →'}
                      </button>
                      <button type="button" onClick={() => { setDone(true); setTimeout(() => router.replace('/'), 1400); }}
                        style={{ width: '100%', marginTop: 10, padding: '12px', background: 'transparent', color: '#9E9987', border: '1px solid rgba(26,26,26,0.12)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                        Skip for now
                      </button>
                    </motion.div>
                  </motion.div>
                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      <style>{`
        .auth-panel-left {
          display: none;
          width: 40%;
          background: #1A1A1A;
          flex-direction: column;
          justify-content: space-between;
          padding: 60px 52px;
          position: sticky;
          top: 0;
          height: 100vh;
          flex-shrink: 0;
        }
        .auth-mobile-header { display: block; }
        @media (min-width: 768px) {
          .auth-panel-left { display: flex; }
          .auth-mobile-header { display: none; }
        }
      `}</style>
    </div>
  );
}
