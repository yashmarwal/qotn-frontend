'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Tag } from 'lucide-react';

const DISMISS_KEY = 'qotn_coupon_dismissed';
const DISMISS_HOURS = 12;

function formatDiscount(coupon: any): string {
  if (coupon.discountType === 'PERCENTAGE') return `${coupon.discountValue}% OFF`;
  return `₹${Math.round(coupon.discountValue / 100).toLocaleString('en-IN')} OFF`;
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
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={dismiss}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 90 }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'fixed', top: '50%', left: '50%',
              marginTop: 0, marginLeft: 0,
              translate: '-50% -50%',
              zIndex: 91,
              width: 'min(340px, calc(100vw - 32px))', background: '#1A1A1A',
              boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)',
            }}
          >
          {/* Top accent line */}
          <div style={{ height: 3, background: 'linear-gradient(90deg, #F5F0E8 0%, rgba(245,240,232,0.3) 100%)' }} />

          <div style={{ padding: '18px 18px 16px' }}>
            {/* Dismiss */}
            <button onClick={dismiss} aria-label="Close"
              style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(245,240,232,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(245,240,232,0.7)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(245,240,232,0.35)')}>
              <X size={14} strokeWidth={2} />
            </button>

            {/* Label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <Tag size={11} strokeWidth={2} color="rgba(245,240,232,0.45)" />
              <span style={{ fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.45)', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>
                EXCLUSIVE OFFER
              </span>
            </div>

            {/* Discount headline */}
            <p style={{ fontSize: 28, fontWeight: 300, color: '#F5F0E8', letterSpacing: '-0.01em', lineHeight: 1, marginBottom: coupon.description ? 8 : 14, fontFamily: 'DM Sans, sans-serif' }}>
              {formatDiscount(coupon)}
            </p>

            {coupon.description && (
              <p style={{ fontSize: 12, color: 'rgba(245,240,232,0.5)', marginBottom: 14, lineHeight: 1.55, fontFamily: 'DM Sans, sans-serif' }}>
                {coupon.description}
              </p>
            )}

            {hasMin && (
              <p style={{ fontSize: 11, color: 'rgba(245,240,232,0.35)', marginBottom: 14, fontFamily: 'DM Sans, sans-serif' }}>
                Min. order ₹{Math.round(coupon.minOrderValue / 100).toLocaleString('en-IN')}
              </p>
            )}

            {/* Code row */}
            <div style={{ display: 'flex', alignItems: 'center', border: '1px dashed rgba(245,240,232,0.2)', background: 'rgba(245,240,232,0.06)', padding: '10px 14px', marginBottom: hasExpiry ? 10 : 0 }}>
              <span style={{ flex: 1, fontFamily: 'monospace', fontSize: 17, fontWeight: 700, letterSpacing: '0.14em', color: '#F5F0E8' }}>
                {coupon.code}
              </span>
              <button onClick={copy}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, color: copied ? '#4ADE80' : 'rgba(245,240,232,0.55)', fontSize: 11, letterSpacing: '0.06em', fontFamily: 'DM Sans, sans-serif', padding: 0, transition: 'color 0.2s', flexShrink: 0 }}>
                {copied ? <Check size={13} strokeWidth={2.5} /> : <Copy size={13} strokeWidth={1.5} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            {hasExpiry && (
              <p style={{ fontSize: 10, color: 'rgba(245,240,232,0.28)', marginTop: 10, fontFamily: 'DM Sans, sans-serif' }}>
                Valid until {new Date(coupon.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            )}
          </div>
        </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
