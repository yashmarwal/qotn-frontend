'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';

const VIDEO_SRC = '/videos/VID_20260706_060213_779_bsl.mp4';
const FOUNDER_NAME = 'Punit Dhanopia';
const FOUNDER_ROLE = 'Founder, QOTN';

export default function FounderVideo() {
  const isMobile = useIsMobile();
  const [visible, setVisible]   = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Appear after a short delay so it doesn't distract on load
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 3200);
    return () => clearTimeout(t);
  }, []);

  const bottom = isMobile ? 86 : 24;
  const right  = isMobile ? 14 : 28;

  return (
    <>
      {/* ── Floating bubble ───────────────────────────────────── */}
      <AnimatePresence>
        {visible && !expanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', damping: 18, stiffness: 220 }}
            onClick={() => setExpanded(true)}
            style={{
              position: 'fixed', bottom, right, zIndex: 250,
              cursor: 'pointer', userSelect: 'none',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
            }}
          >
            {/* Pulse rings */}
            {[0, 0.75, 1.5].map((delay, i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 2.5], opacity: [0.38, 0] }}
                transition={{ duration: 2.4, delay, repeat: Infinity, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  top: '50%', left: '50%',
                  width: 72, height: 72,
                  marginTop: -36, marginLeft: -36,
                  borderRadius: '50%',
                  border: '1.5px solid rgba(26,26,26,0.28)',
                  pointerEvents: 'none',
                }}
              />
            ))}

            {/* Circle */}
            <div style={{
              width: 72, height: 72, borderRadius: '50%', overflow: 'hidden',
              border: '2.5px solid var(--black)', position: 'relative',
              boxShadow: '0 6px 24px rgba(0,0,0,0.2)',
              flexShrink: 0,
            }}>
              <video
                src={VIDEO_SRC}
                autoPlay muted loop playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>

            {/* Name below bubble */}
            <div style={{ textAlign: 'center', marginTop: 7 }}>
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

      {/* ── Expanded modal ────────────────────────────────────── */}
      <AnimatePresence>
        {expanded && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={() => setExpanded(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 600 }}
            />

            {/* 9:16 card */}
            <motion.div
              initial={{ scale: 0.06, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.06, opacity: 0 }}
              transition={{ type: 'spring', damping: 22, stiffness: 180 }}
              style={{
                position: 'fixed',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 'min(88vw, 380px)',
                aspectRatio: '9 / 16',
                zIndex: 601,
                borderRadius: 18,
                overflow: 'hidden',
                background: '#000',
                boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
              }}
            >
              {/* Full video with controls */}
              <video
                src={VIDEO_SRC}
                autoPlay playsInline controls
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />

              {/* Bottom gradient + name */}
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
                onClick={() => setExpanded(false)}
                style={{
                  position: 'absolute', top: 14, right: 14,
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.52)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', zIndex: 1,
                }}
              >
                <X size={15} strokeWidth={1.5} />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
