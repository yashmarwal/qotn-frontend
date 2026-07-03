'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Tag, ChevronLeft, ChevronRight } from 'lucide-react';

let _shownThisLoad = false;

const NOTCH = 14;

function formatDiscount(coupon: any): string {
  if (coupon.discountType === 'PERCENTAGE') return `${coupon.discountValue}% OFF`;
  return `₹${Math.round(coupon.discountValue / 100).toLocaleString('en-IN')} OFF`;
}

function Barcode() {
  const bars = [0, 4, 7, 10, 14, 17, 20, 25, 28, 32, 36, 39, 42, 45, 49, 52, 55, 59, 62, 65, 68, 72];
  return (
    <div style={{ position: 'relative', height: 24, width: 80, margin: '0 auto' }}>
      {bars.map((x, i) => (
        <div key={i} style={{ position: 'absolute', left: x, top: 0, width: i % 3 === 0 ? 2 : 1, height: 24, background: 'rgba(0,0,0,0.40)' }} />
      ))}
    </div>
  );
}

function TicketCard({ coupon, copied, onCopy }: { coupon: any; copied: boolean; onCopy: () => void }) {
  const hasMin = coupon.minOrderValue && coupon.minOrderValue > 0;
  const hasExpiry = coupon.expiresAt;
  return (
    /* Each ticket is exactly the container width, does not shrink */
    <div style={{ position: 'relative', width: '100%', flexShrink: 0, overflow: 'hidden', scrollSnapAlign: 'start' }}>
      <div style={{ position: 'absolute', inset: 0, background: '#F5F0E8' }} />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'conic-gradient(at 65% 35%, rgba(255,107,254,0.14), rgba(0,249,248,0.14), rgba(238,240,188,0.18), rgba(0,129,253,0.14), rgba(204,204,204,0.10), rgba(255,107,254,0.10))', mixBlendMode: 'multiply' }} />

      <div style={{ position: 'relative', padding: '26px 28px 20px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginBottom: 10 }}>
          <Tag size={9} strokeWidth={2} color="rgba(0,0,0,0.32)" />
          <span style={{ fontSize: 8, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.32)', fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>EXCLUSIVE OFFER</span>
        </div>
        <p style={{ fontFamily: '"Impact","DM Sans",sans-serif', fontSize: '2.75rem', letterSpacing: '2px', lineHeight: 1, color: '#1A1A1A', marginBottom: 10 }}>
          {formatDiscount(coupon)}
        </p>
        {coupon.description && (
          <p style={{ fontSize: 12, color: 'rgba(0,0,0,0.42)', lineHeight: 1.55, fontFamily: 'DM Sans, sans-serif', marginBottom: hasMin ? 5 : 0 }}>
            {coupon.description}
          </p>
        )}
        {hasMin && (
          <p style={{ fontSize: 10, color: 'rgba(0,0,0,0.30)', fontFamily: 'DM Sans, sans-serif' }}>
            Min. order ₹{Math.round(coupon.minOrderValue / 100).toLocaleString('en-IN')}
          </p>
        )}
      </div>

      <div style={{ position: 'relative', height: NOTCH * 2 }}>
        <div style={{ position: 'absolute', left: -NOTCH, top: 0, width: NOTCH * 2, height: NOTCH * 2, borderRadius: '50%', background: 'rgba(0,0,0,0.72)', zIndex: 1 }} />
        <div style={{ position: 'absolute', right: -NOTCH, top: 0, width: NOTCH * 2, height: NOTCH * 2, borderRadius: '50%', background: 'rgba(0,0,0,0.72)', zIndex: 1 }} />
        <div style={{ position: 'absolute', top: '50%', left: NOTCH + 6, right: NOTCH + 6, height: 0, borderTop: '1.5px dashed rgba(0,0,0,0.16)' }} />
      </div>

      <div style={{ position: 'relative', padding: '14px 28px 26px', textAlign: 'center' }}>
        <p style={{ fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.28)', fontFamily: 'DM Sans, sans-serif', marginBottom: 10 }}>
          Use code at checkout
        </p>
        <div style={{ display: 'flex', alignItems: 'center', border: '1.5px dashed rgba(0,0,0,0.18)', background: 'rgba(0,0,0,0.04)', padding: '10px 14px', marginBottom: 16 }}>
          <span style={{ flex: 1, fontFamily: 'monospace', fontSize: 17, fontWeight: 700, letterSpacing: '0.12em', color: '#1A1A1A' }}>
            {coupon.code}
          </span>
          <button onClick={onCopy}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: copied ? '#15803D' : 'rgba(0,0,0,0.38)', fontSize: 10, letterSpacing: '0.06em', fontFamily: 'DM Sans, sans-serif', padding: 0, transition: 'color 0.2s', flexShrink: 0 }}>
            {copied ? <Check size={12} strokeWidth={2.5} /> : <Copy size={12} strokeWidth={1.5} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <Barcode />
        {hasExpiry && (
          <p style={{ fontSize: 9, color: 'rgba(0,0,0,0.22)', fontFamily: 'DM Sans, sans-serif', marginTop: 10 }}>
            Valid until {new Date(coupon.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        )}
      </div>
    </div>
  );
}

export default function CouponPopup() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [visible, setVisible] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = 'qotn-popup-kf';
    if (!document.getElementById(id)) {
      const s = document.createElement('style');
      s.id = id;
      s.textContent = `
        @keyframes qotn-float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-7px); } }
        .qotn-scroll::-webkit-scrollbar { display: none; }
      `;
      document.head.appendChild(s);
    }
  }, []);

  useEffect(() => {
    fetch('/api/coupons/active')
      .then(r => r.json())
      .then(data => {
        const list: any[] = Array.isArray(data) ? data : (data.data || []);
        if (list.length) setCoupons(list);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!coupons.length || _shownThisLoad) return;
    const onScroll = () => {
      if (_shownThisLoad) return;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0 && window.scrollY / total > 0.25) {
        _shownThisLoad = true;
        setVisible(true);
        window.removeEventListener('scroll', onScroll);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [coupons.length]);

  const dismiss = () => setVisible(false);

  const copy = (idx: number) => {
    navigator.clipboard.writeText(coupons[idx].code).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2200);
    }).catch(() => {});
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const idx = Math.round(scrollRef.current.scrollLeft / scrollRef.current.offsetWidth);
    setActiveIdx(idx);
  };

  const goTo = (idx: number) => {
    if (!scrollRef.current) return;
    const clamped = Math.max(0, Math.min(idx, coupons.length - 1));
    scrollRef.current.scrollTo({ left: clamped * scrollRef.current.offsetWidth, behavior: 'smooth' });
    setActiveIdx(clamped);
  };

  if (!coupons.length) return null;

  const multi = coupons.length > 1;

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={dismiss}
            style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(0,0,0,0.70)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
          />

          {/* Fixed centering wrapper — explicit width is the source of truth */}
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 91, width: 'min(300px, calc(100vw - 40px))' }}>

            {/* Close */}
            <button onClick={dismiss} aria-label="Close"
              style={{ position: 'absolute', top: -36, right: 0, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.65)', display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, letterSpacing: '0.1em', fontFamily: 'DM Sans, sans-serif' }}>
              <X size={13} strokeWidth={2} /> CLOSE
            </button>

            {/* Arrow prev — desktop only (hidden on narrow) */}
            {multi && (
              <button onClick={() => goTo(activeIdx - 1)} aria-label="Previous coupon"
                style={{ position: 'absolute', left: -44, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', opacity: activeIdx === 0 ? 0.25 : 0.85, transition: 'opacity 0.2s' }}>
                <ChevronLeft size={16} strokeWidth={2} />
              </button>
            )}

            {/* Arrow next */}
            {multi && (
              <button onClick={() => goTo(activeIdx + 1)} aria-label="Next coupon"
                style={{ position: 'absolute', right: -44, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', opacity: activeIdx === coupons.length - 1 ? 0.25 : 0.85, transition: 'opacity 0.2s' }}>
                <ChevronRight size={16} strokeWidth={2} />
              </button>
            )}

            <motion.div
              initial={{ opacity: 0, scale: 0.86, y: 28 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.90, y: 16 }}
              transition={{ duration: 0.46, ease: [0.22, 1, 0.36, 1] }}
              style={{ width: '100%' }}
            >
              <div style={{ animation: 'qotn-float 3s ease-in-out infinite', willChange: 'transform', width: '100%' }}>
                <div style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.22)) drop-shadow(0 8px 16px rgba(0,0,0,0.24)) drop-shadow(0 24px 40px rgba(0,0,0,0.18))', width: '100%' }}>

                  {/* Horizontal snap scroll — clips to exactly one ticket at a time */}
                  <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="qotn-scroll"
                    style={{ display: 'flex', width: '100%', overflowX: multi ? 'auto' : 'visible', scrollSnapType: 'x mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
                  >
                    {coupons.map((c, i) => (
                      <TicketCard key={c.code} coupon={c} copied={copiedIdx === i} onCopy={() => copy(i)} />
                    ))}
                  </div>

                  {/* Dots — small and compact */}
                  {multi && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 5, padding: '8px 0 2px' }}>
                      {coupons.map((_, i) => (
                        <button key={i} onClick={() => goTo(i)} aria-label={`Coupon ${i + 1}`}
                          style={{ width: activeIdx === i ? 14 : 5, height: 5, borderRadius: 3, background: activeIdx === i ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.28)', border: 'none', cursor: 'pointer', padding: 0, transition: 'width 0.25s ease, background 0.25s ease' }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
