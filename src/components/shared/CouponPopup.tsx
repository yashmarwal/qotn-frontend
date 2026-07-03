'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Tag } from 'lucide-react';

const DISMISS_KEY = 'qotn_coupon_dismissed';
const DISMISS_HOURS = 12;
const NOTCH = 14;

function formatDiscount(coupon: any): string {
  if (coupon.discountType === 'PERCENTAGE') return `${coupon.discountValue}% OFF`;
  return `₹${Math.round(coupon.discountValue / 100).toLocaleString('en-IN')} OFF`;
}

function Barcode() {
  const bars = [0, 4, 7, 10, 14, 17, 20, 25, 28, 32, 36, 39, 42, 45, 49, 52, 55, 59, 62, 65, 68, 72];
  return (
    <div style={{ position: 'relative', height: 28, width: 80, margin: '0 auto' }}>
      {bars.map((x, i) => (
        <div key={i} style={{
          position: 'absolute', left: x, top: 0,
          width: i % 3 === 0 ? 2 : 1,
          height: 28,
          background: 'rgba(0,0,0,0.45)',
        }} />
      ))}
    </div>
  );
}

export default function CouponPopup() {
  const [coupon, setCoupon] = useState<any>(null);
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/coupons/active')
      .then(r => r.json())
      .then(data => {
        const list: any[] = Array.isArray(data) ? data : (data.data || []);
        if (!list.length) return;
        try {
          const dismissed: Record<string, number> = JSON.parse(localStorage.getItem(DISMISS_KEY) || '{}');
          const now = Date.now();
          const pick = list.find(c => {
            const ts = dismissed[c.code];
            return !ts || now - ts >= DISMISS_HOURS * 3600 * 1000;
          });
          if (pick) setCoupon(pick);
        } catch {
          setCoupon(list[0]);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!coupon) return;
    let fired = false;
    const onScroll = () => {
      if (fired) return;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0 && window.scrollY / total > 0.25) {
        fired = true;
        setVisible(true);
        window.removeEventListener('scroll', onScroll);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [coupon]);

  const dismiss = () => {
    setVisible(false);
    if (!coupon) return;
    try {
      const prev: Record<string, number> = JSON.parse(localStorage.getItem(DISMISS_KEY) || '{}');
      localStorage.setItem(DISMISS_KEY, JSON.stringify({ ...prev, [coupon.code]: Date.now() }));
    } catch {}
  };

  const copy = () => {
    if (!coupon) return;
    navigator.clipboard.writeText(coupon.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }).catch(() => {});
  };

  if (!coupon) return null;

  const hasMin = coupon.minOrderValue && coupon.minOrderValue > 0;
  const hasExpiry = coupon.expiresAt;

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Dark blur backdrop — click to close */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={dismiss}
            style={{
              position: 'fixed', inset: 0, zIndex: 90,
              background: 'rgba(0,0,0,0.70)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
            }}
          />

          {/* Centering anchor (separate from motion so transform isn't overridden) */}
          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 91,
            width: 'min(300px, calc(100vw - 40px))',
          }}>
            {/* Entrance pop */}
            <motion.div
              initial={{ opacity: 0, scale: 0.86, y: 28 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.90, y: 16 }}
              transition={{ duration: 0.46, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Continuous float — inspired by the @keyframes hover in the source */}
              <motion.div
                animate={{ y: [0, -7, 0] }}
                transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity, delay: 0.6 }}
              >
                {/* drop-shadow on wrapper so shadow follows the ticket silhouette */}
                <div style={{
                  filter:
                    'drop-shadow(0 2px 1px rgba(0,0,0,0.22)) ' +
                    'drop-shadow(0 6px 8px rgba(0,0,0,0.24)) ' +
                    'drop-shadow(0 20px 32px rgba(0,0,0,0.20)) ' +
                    'drop-shadow(0 40px 56px rgba(0,0,0,0.14))',
                }}>

                  {/* TICKET CARD — overflow:hidden clips the notch semicircles */}
                  <div style={{ position: 'relative', overflow: 'hidden' }}>

                    {/* Cream base */}
                    <div style={{ position: 'absolute', inset: 0, background: '#F5F0E8' }} />

                    {/* Holographic conic shimmer (matches the .holographic layer in the source) */}
                    <div style={{
                      position: 'absolute', inset: 0, pointerEvents: 'none',
                      background: 'conic-gradient(at 65% 35%, rgba(255,107,254,0.14), rgba(0,249,248,0.14), rgba(238,240,188,0.18), rgba(0,129,253,0.14), rgba(204,204,204,0.10), rgba(255,107,254,0.10))',
                      mixBlendMode: 'multiply',
                    }} />

                    {/* ── UPPER SECTION ─────────────────────────── */}
                    <div style={{ position: 'relative', padding: '28px 28px 24px', textAlign: 'center' }}>
                      <button onClick={dismiss} aria-label="Close"
                        style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(0,0,0,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28 }}>
                        <X size={14} strokeWidth={2} />
                      </button>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginBottom: 12 }}>
                        <Tag size={9} strokeWidth={2} color="rgba(0,0,0,0.32)" />
                        <span style={{ fontSize: 8, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.32)', fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>
                          EXCLUSIVE OFFER
                        </span>
                      </div>

                      {/* Big headline — Impact font mirrors the .header in the inspiration */}
                      <p style={{
                        fontFamily: '"Impact", "DM Sans", sans-serif',
                        fontSize: '3rem', letterSpacing: '2px', lineHeight: 1,
                        color: '#1A1A1A', marginBottom: 10,
                      }}>
                        {formatDiscount(coupon)}
                      </p>

                      {coupon.description && (
                        <p style={{ fontSize: 12, color: 'rgba(0,0,0,0.42)', lineHeight: 1.55, fontFamily: 'DM Sans, sans-serif', marginBottom: hasMin ? 6 : 0 }}>
                          {coupon.description}
                        </p>
                      )}
                      {hasMin && (
                        <p style={{ fontSize: 10, color: 'rgba(0,0,0,0.30)', fontFamily: 'DM Sans, sans-serif' }}>
                          Min. order ₹{Math.round(coupon.minOrderValue / 100).toLocaleString('en-IN')}
                        </p>
                      )}
                    </div>

                    {/* ── TEAR LINE with notch cut-outs ─────────── */}
                    <div style={{ position: 'relative', height: NOTCH * 2 }}>
                      {/* Left semicircle notch — half hidden behind overflow:hidden */}
                      <div style={{
                        position: 'absolute', left: -NOTCH, top: 0,
                        width: NOTCH * 2, height: NOTCH * 2, borderRadius: '50%',
                        background: 'rgba(0,0,0,0.72)', zIndex: 1,
                      }} />
                      {/* Right semicircle notch */}
                      <div style={{
                        position: 'absolute', right: -NOTCH, top: 0,
                        width: NOTCH * 2, height: NOTCH * 2, borderRadius: '50%',
                        background: 'rgba(0,0,0,0.72)', zIndex: 1,
                      }} />
                      {/* Dashed cut-line (the perforation between ticket and stub) */}
                      <div style={{
                        position: 'absolute', top: '50%', left: NOTCH + 6, right: NOTCH + 6,
                        height: 0, borderTop: '1.5px dashed rgba(0,0,0,0.16)',
                      }} />
                    </div>

                    {/* ── STUB SECTION ──────────────────────────── */}
                    <div style={{ position: 'relative', padding: '16px 28px 28px', textAlign: 'center' }}>
                      <p style={{ fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.28)', fontFamily: 'DM Sans, sans-serif', marginBottom: 12 }}>
                        Use code at checkout
                      </p>

                      {/* Dashed code box — mirrors .number in the inspiration */}
                      <div style={{ display: 'flex', alignItems: 'center', border: '1.5px dashed rgba(0,0,0,0.18)', background: 'rgba(0,0,0,0.04)', padding: '10px 14px', marginBottom: 20 }}>
                        <span style={{ flex: 1, fontFamily: 'monospace', fontSize: 18, fontWeight: 700, letterSpacing: '0.12em', color: '#1A1A1A' }}>
                          {coupon.code}
                        </span>
                        <button onClick={copy}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: copied ? '#15803D' : 'rgba(0,0,0,0.38)', fontSize: 10, letterSpacing: '0.06em', fontFamily: 'DM Sans, sans-serif', padding: 0, transition: 'color 0.2s', flexShrink: 0 }}>
                          {copied ? <Check size={12} strokeWidth={2.5} /> : <Copy size={12} strokeWidth={1.5} />}
                          {copied ? 'Copied!' : 'Copy'}
                        </button>
                      </div>

                      {/* Barcode — mirrors .barcode in the inspiration */}
                      <Barcode />

                      {hasExpiry && (
                        <p style={{ fontSize: 9, color: 'rgba(0,0,0,0.22)', fontFamily: 'DM Sans, sans-serif', marginTop: 12 }}>
                          Valid until {new Date(coupon.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      )}
                    </div>

                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
