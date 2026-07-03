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
    <div style={{ position: 'relative', height: 22, width: 80, margin: '0 auto' }}>
      {bars.map((x, i) => (
        <div key={i} style={{ position: 'absolute', left: x, top: 0, width: i % 3 === 0 ? 2 : 1, height: 22, background: 'rgba(0,0,0,0.38)' }} />
      ))}
    </div>
  );
}

function TicketCard({ coupon, copied, onCopy }: { coupon: any; copied: boolean; onCopy: () => void }) {
  const hasMin = coupon.minOrderValue && coupon.minOrderValue > 0;
  const hasExpiry = coupon.expiresAt;
  return (
    <div style={{ position: 'relative', overflow: 'hidden', width: '100%' }}>
      <div style={{ position: 'absolute', inset: 0, background: '#F5F0E8' }} />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'conic-gradient(at 65% 35%, rgba(255,107,254,0.14), rgba(0,249,248,0.14), rgba(238,240,188,0.18), rgba(0,129,253,0.14), rgba(204,204,204,0.10))', mixBlendMode: 'multiply' }} />

      <div style={{ position: 'relative', padding: '22px 22px 18px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginBottom: 8 }}>
          <Tag size={9} strokeWidth={2} color="rgba(0,0,0,0.32)" />
          <span style={{ fontSize: 8, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.32)', fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>EXCLUSIVE OFFER</span>
        </div>
        <p style={{ fontFamily: '"Impact","DM Sans",sans-serif', fontSize: '2.6rem', letterSpacing: '2px', lineHeight: 1, color: '#1A1A1A', marginBottom: 8 }}>
          {formatDiscount(coupon)}
        </p>
        {coupon.description && (
          <p style={{ fontSize: 11, color: 'rgba(0,0,0,0.42)', lineHeight: 1.5, fontFamily: 'DM Sans, sans-serif', marginBottom: hasMin ? 4 : 0 }}>
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
        <div style={{ position: 'absolute', top: '50%', left: NOTCH + 6, right: NOTCH + 6, height: 0, borderTop: '1.5px dashed rgba(0,0,0,0.15)' }} />
      </div>

      <div style={{ position: 'relative', padding: '12px 22px 22px', textAlign: 'center' }}>
        <p style={{ fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.28)', fontFamily: 'DM Sans, sans-serif', marginBottom: 10 }}>
          Use code at checkout
        </p>
        <div style={{ display: 'flex', alignItems: 'center', border: '1.5px dashed rgba(0,0,0,0.18)', background: 'rgba(0,0,0,0.04)', padding: '9px 12px', marginBottom: 14 }}>
          <span style={{ flex: 1, fontFamily: 'monospace', fontSize: 15, fontWeight: 700, letterSpacing: '0.12em', color: '#1A1A1A' }}>
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
  const [isMobile, setIsMobile] = useState(false);
  const mobileRef = useRef<HTMLDivElement>(null);
  const desktopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = 'qotn-popup-kf';
    if (!document.getElementById(id)) {
      const s = document.createElement('style');
      s.id = id;
      s.textContent = `
        @keyframes qotn-float { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-7px)} }
        .qotn-scroll::-webkit-scrollbar{display:none}
      `;
      document.head.appendChild(s);
    }
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
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

  const handleScroll = (el: HTMLDivElement) => {
    const maxScroll = el.scrollWidth - el.offsetWidth;
    if (maxScroll <= 0) return;
    const idx = Math.round((el.scrollLeft / maxScroll) * (coupons.length - 1));
    setActiveIdx(Math.max(0, Math.min(idx, coupons.length - 1)));
  };

  const goTo = (ref: React.RefObject<HTMLDivElement | null>, idx: number) => {
    if (!ref.current || coupons.length <= 1) return;
    const clamped = Math.max(0, Math.min(idx, coupons.length - 1));
    const el = ref.current;
    const maxScroll = el.scrollWidth - el.offsetWidth;
    el.scrollTo({ left: (clamped / (coupons.length - 1)) * maxScroll, behavior: 'smooth' });
    setActiveIdx(clamped);
  };

  if (!coupons.length) return null;

  const multi = coupons.length > 1;

  const Dots = () => !multi ? null : (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 5, paddingTop: 10 }}>
      {coupons.map((_, i) => (
        <button key={i}
          onClick={() => goTo(isMobile ? mobileRef : desktopRef, i)}
          aria-label={`Coupon ${i + 1}`}
          style={{ width: activeIdx === i ? 14 : 5, height: 5, borderRadius: 3, background: activeIdx === i ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.28)', border: 'none', cursor: 'pointer', padding: 0, transition: 'width 0.25s ease, background 0.25s ease' }}
        />
      ))}
    </div>
  );

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={dismiss}
            style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
          />

          {isMobile ? (
            /* ── MOBILE: peek carousel slides up from bottom ── */
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 91, paddingBottom: 'calc(28px + env(safe-area-inset-bottom,0px))' }}
            >
              {/* Close row */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '6vw', marginBottom: 14 }}>
                <button onClick={dismiss}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, letterSpacing: '0.10em', fontFamily: 'DM Sans, sans-serif' }}>
                  <X size={13} strokeWidth={2} /> CLOSE
                </button>
              </div>

              {/*
                Peek carousel — cards are 70vw wide, 15vw padding on each side so adjacent cards
                show 15vw on each edge. Active card: full opacity + drop-shadow. Others: dimmed + smaller.
              */}
              <div
                ref={mobileRef}
                onScroll={e => handleScroll(e.currentTarget)}
                className="qotn-scroll"
                style={{
                  display: 'flex',
                  overflowX: 'auto',
                  scrollSnapType: 'x mandatory',
                  scrollbarWidth: 'none',
                  paddingLeft: '15vw',
                  paddingRight: '15vw',
                  gap: '3vw',
                  WebkitOverflowScrolling: 'touch',
                } as React.CSSProperties}
              >
                {coupons.map((c, i) => {
                  const isActive = activeIdx === i;
                  return (
                    <div key={c.code} style={{
                      width: '70vw',
                      flexShrink: 0,
                      scrollSnapAlign: 'center',
                      opacity: isActive ? 1 : 0.42,
                      transform: `scale(${isActive ? 1 : 0.90})`,
                      transition: 'opacity 0.32s ease, transform 0.32s ease',
                      transformOrigin: 'center top',
                      filter: isActive
                        ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.28)) drop-shadow(0 14px 28px rgba(0,0,0,0.22))'
                        : 'none',
                    }}>
                      <TicketCard coupon={c} copied={copiedIdx === i} onCopy={() => copy(i)} />
                    </div>
                  );
                })}
              </div>

              <Dots />
            </motion.div>
          ) : (
            /* ── DESKTOP: centered modal with left/right arrows ── */
            <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 91, width: 'min(300px, calc(100vw - 40px))' }}>
              <button onClick={dismiss} aria-label="Close"
                style={{ position: 'absolute', top: -36, right: 0, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.65)', display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, letterSpacing: '0.1em', fontFamily: 'DM Sans, sans-serif' }}>
                <X size={13} strokeWidth={2} /> CLOSE
              </button>

              {multi && (
                <button onClick={() => goTo(desktopRef, activeIdx - 1)} aria-label="Previous"
                  style={{ position: 'absolute', left: -44, top: '42%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', opacity: activeIdx === 0 ? 0.22 : 0.80, transition: 'opacity 0.2s' }}>
                  <ChevronLeft size={16} strokeWidth={2} />
                </button>
              )}
              {multi && (
                <button onClick={() => goTo(desktopRef, activeIdx + 1)} aria-label="Next"
                  style={{ position: 'absolute', right: -44, top: '42%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', opacity: activeIdx === coupons.length - 1 ? 0.22 : 0.80, transition: 'opacity 0.2s' }}>
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
                    <div
                      ref={desktopRef}
                      onScroll={e => handleScroll(e.currentTarget)}
                      className="qotn-scroll"
                      style={{ display: 'flex', width: '100%', overflowX: multi ? 'auto' : 'visible', scrollSnapType: 'x mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
                    >
                      {coupons.map((c, i) => (
                        <div key={c.code} style={{ width: '100%', flexShrink: 0, scrollSnapAlign: 'start' }}>
                          <TicketCard coupon={c} copied={copiedIdx === i} onCopy={() => copy(i)} />
                        </div>
                      ))}
                    </div>
                    <Dots />
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}
