'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const taglines = [
  'Pure Cotton. Nothing Else.',
  'Crafted for comfort.',
  'Made in India.',
  'No blends. Ever.',
  'Your skin deserves better.',
  '100% cotton. 100% honest.',
];

export function QotnSkeleton() {
  const [currentTagline, setCurrentTagline] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setCurrentTagline(prev => (prev + 1) % taglines.length),
      1200,
    );
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0,
      width: '100%', height: '100%',
      background: '#F5F0E8',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 9999,
      gap: 16,
    }}>
      {/* QOTN wordmark — pulsing */}
      <motion.div
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 300,
          fontSize: 'clamp(48px, 10vw, 80px)',
          letterSpacing: '0.22em',
          color: '#1A1A1A',
          textTransform: 'uppercase',
        }}
      >
        QOTN
      </motion.div>

      {/* Rotating tagline */}
      <div style={{ height: 24, overflow: 'hidden', position: 'relative', width: 280, textAlign: 'center' }}>
        <AnimatePresence mode="wait">
          <motion.p
            key={currentTagline}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
              letterSpacing: '0.12em',
              color: '#6B6560',
              textTransform: 'uppercase',
              position: 'absolute',
              width: '100%',
              left: 0,
            }}
          >
            {taglines[currentTagline]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Thin loading bar at bottom */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0,
        width: '100%', height: 2,
        background: '#E8E2D8',
        overflow: 'hidden',
      }}>
        <motion.div
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ width: '40%', height: '100%', background: '#1A1A1A' }}
        />
      </div>
    </div>
  );
}
