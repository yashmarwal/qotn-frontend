'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { X } from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useBackClose } from '@/hooks/useBackClose';

// Swipe-down closes the video once it is pulled this far, or flicked this fast
const SWIPE_CLOSE_DISTANCE = 110;
const SWIPE_CLOSE_VELOCITY = 600;

const cardVariants = {
  enter: { scale: 1, opacity: 1, y: 0 },
  hidden: { scale: 0.08, opacity: 0 },
  exit: (swiped: boolean) =>
    swiped
      ? { y: '110vh', opacity: 0, transition: { duration: 0.32, ease: [0.4, 0, 1, 1] as const } }
      : { scale: 0.08, opacity: 0 },
};

const VIDEO_SRC    = '/videos/VID_20260706_060213_779_bsl.mp4';
const FOUNDER_NAME = 'Punit Dhanopia';
const FOUNDER_ROLE = 'Founder, QOTN';

export default function FounderVideo() {
  const isMobile  = useIsMobile();
  const [visible,  setVisible]  = useState(false);
  const [expanded, setExpanded] = useState(false);
  const bubbleVideoRef = useRef<HTMLVideoElement>(null);
  // Decides which exit animation plays: slide down after a swipe, shrink otherwise
  const [swiped, setSwiped] = useState(false);

  useBackClose(expanded, () => setExpanded(false));

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 3200);
    return () => clearTimeout(t);
  }, []);

  // Freeze the page behind the open video so scrolling can't move it
  useEffect(() => {
    if (!expanded) return;
    const html = document.documentElement;
    const prev = { html: html.style.overflow, body: document.body.style.overflow };
    html.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      html.style.overflow = prev.html;
      document.body.style.overflow = prev.body;
    };
  }, [expanded]);

  const openVideo = () => { setSwiped(false); setExpanded(true); };
  const closeVideo = () => { setSwiped(false); setExpanded(false); };
  const onCardDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > SWIPE_CLOSE_DISTANCE || info.velocity.y > SWIPE_CLOSE_VELOCITY) {
      setSwiped(true);
      setExpanded(false);
    }
  };

  // Ensure bubble video plays whenever bubble is shown (browsers may pause after modal closes)
  useEffect(() => {
    if (visible && !expanded && bubbleVideoRef.current) {
      bubbleVideoRef.current.play().catch(() => {/* autoplay policy — silent fail */});
    }
  }, [visible, expanded]);

  const bottom = isMobile ? 86 : 24;
  const right  = isMobile ? 14 : 28;

  return (
    <>
      {/* ── Floating bubble ─────────────────────────────── */}
      <AnimatePresence>
        {visible && !expanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.18 } }}
            transition={{ type: 'spring', damping: 18, stiffness: 240 }}
            style={{
              position: 'fixed', bottom, right, zIndex: 250,
              cursor: 'pointer', userSelect: 'none',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
            }}
          >
            {/* Relative wrapper holds circle + X + dot so positioning is from circle edge */}
            <div style={{ position: 'relative', width: 72, height: 72 }}>
              {/* Dismiss X — top-left of wrapper, outside overflow:hidden */}
              <button
                onClick={(e) => { e.stopPropagation(); setVisible(false); }}
                style={{
                  position: 'absolute', top: -5, left: -5, zIndex: 3,
                  width: 18, height: 18, minHeight: 'unset', borderRadius: '50%',
                  background: 'var(--black)', border: '1.5px solid var(--cream)',
                  color: 'var(--cream)', fontSize: 10, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', lineHeight: 1, padding: 0,
                }}
                aria-label="Dismiss"
              >
                ×
              </button>

              {/* Notification dot — top-right of wrapper, outside overflow:hidden */}
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.55, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  position: 'absolute', top: 0, right: 0, zIndex: 3,
                  width: 10, height: 10, borderRadius: '50%',
                  background: '#C1440E',
                  border: '1.5px solid var(--cream)',
                }}
              />

              {/* Circle — click to expand */}
              <div
                onClick={openVideo}
                style={{
                  width: 72, height: 72, borderRadius: '50%', overflow: 'hidden',
                  border: '2.5px solid var(--black)',
                  boxShadow: '0 6px 24px rgba(0,0,0,0.18)',
                }}
              >
                <video
                  ref={bubbleVideoRef}
                  src={VIDEO_SRC}
                  autoPlay muted loop playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
            </div>

            {/* Name + role */}
            <div
              onClick={openVideo}
              style={{ textAlign: 'center', marginTop: 7 }}
            >
              <p style={{ fontSize: 9.5, fontWeight: 600, color: 'var(--black)', letterSpacing: '0.03em', lineHeight: 1.3 }}>
                {FOUNDER_NAME}
              </p>
              <p style={{ fontSize: 8.5, color: 'var(--dust)', letterSpacing: '0.05em', marginTop: 1 }}>
                {FOUNDER_ROLE}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Expanded modal ──────────────────────────────── */}
      <AnimatePresence custom={swiped}>
        {expanded && (
          <>
            {/* Backdrop: touch-action/overscroll stop touches from scrolling the page behind */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={closeVideo}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 600, touchAction: 'none', overscrollBehavior: 'contain' }}
            />

            {/* 9:16 card — flex wrapper avoids CSS transform conflict with framer-motion */}
            <div style={{
              position: 'fixed', inset: 0, zIndex: 601,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              pointerEvents: 'none',
            }}>
              <motion.div
                custom={swiped}
                variants={cardVariants}
                initial="hidden"
                animate="enter"
                exit="exit"
                transition={{ type: 'spring', damping: 24, stiffness: 200 }}
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.6 }}
                onDragEnd={onCardDragEnd}
                style={{
                  width: 'min(88vw, 360px)',
                  aspectRatio: '9 / 16',
                  borderRadius: 18, overflow: 'hidden',
                  background: '#000',
                  boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
                  position: 'relative',
                  pointerEvents: 'auto',
                }}
              >
                <video
                  src={VIDEO_SRC}
                  autoPlay playsInline controls
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />

                {/* Bottom gradient + founder info */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  padding: '48px 20px 28px',
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.78))',
                  pointerEvents: 'none',
                }}>
                  <p style={{ fontSize: 16, fontWeight: 600, color: '#fff', letterSpacing: '0.04em', marginBottom: 3 }}>
                    {FOUNDER_NAME}
                  </p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.10em', textTransform: 'uppercase' }}>
                    {FOUNDER_ROLE}
                  </p>
                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.38)', letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 6 }}>
                    Pure Cotton. Nothing Else.
                  </p>
                </div>

                {/* Close */}
                <button
                  onClick={closeVideo}
                  aria-label="Close video"
                  style={{
                    position: 'absolute', top: 14, right: 14,
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'rgba(0,0,0,0.52)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', zIndex: 1,
                  }}
                >
                  <X size={15} strokeWidth={1.5} />
                </button>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
