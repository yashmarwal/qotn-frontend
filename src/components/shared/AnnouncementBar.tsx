'use client';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const DEFAULT_MESSAGES = [
  'Free shipping on orders above ₹1499',
  'Pure Cotton. Nothing Else.',
  'Custom stitching available — ₹249 only',
  'Made in India · 100% Cotton',
];

export default function AnnouncementBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex(i => (i + 1) % DEFAULT_MESSAGES.length), 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ background: 'var(--black)', height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35 }}
          style={{ color: 'var(--cream)', fontSize: 10, letterSpacing: '0.10em', margin: 0, textAlign: 'center', whiteSpace: 'nowrap' }}
        >
          {DEFAULT_MESSAGES[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
