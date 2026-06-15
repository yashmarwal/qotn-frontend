'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Banner {
  id: string;
  title: string;
  subtitle?: string | null;
  image: string;
  mobileImage?: string | null;
  link?: string | null;
  position: string;
}

interface Props {
  isMobile?: boolean;
}

export default function PromoBanner({ isMobile = false }: Props) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/banners?position=HERO`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        const list: Banner[] = d?.data ?? [];
        setBanners(list);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const next = useCallback(() => setCurrent(c => (c + 1) % banners.length), [banners.length]);
  const prev = useCallback(() => setCurrent(c => (c - 1 + banners.length) % banners.length), [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [banners.length, next]);

  // Not loaded yet or no banners — render nothing (homepage fallback shows)
  if (!loaded || banners.length === 0) return null;

  const banner = banners[current];
  const imgSrc = isMobile && banner.mobileImage ? banner.mobileImage : banner.image;
  const height = isMobile ? 360 : 520;

  const inner = (
    <div style={{ position: 'relative', width: '100%', height, overflow: 'hidden' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={banner.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          style={{ position: 'absolute', inset: 0 }}
        >
          {/* Background image */}
          <img
            src={imgSrc}
            alt={banner.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          {/* Dark overlay */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />

          {/* Text */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: isMobile ? '0 24px' : '0 48px' }}>
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              style={{ fontSize: isMobile ? 28 : 48, fontWeight: 300, letterSpacing: '0.08em', color: '#F5F0E8', margin: '0 0 12px', lineHeight: 1.2 }}
            >
              {banner.title}
            </motion.h2>
            {banner.subtitle && (
              <motion.p
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                style={{ fontSize: isMobile ? 14 : 18, color: 'rgba(245,240,232,0.8)', margin: '0 0 28px', letterSpacing: '0.04em', maxWidth: 560 }}
              >
                {banner.subtitle}
              </motion.p>
            )}
            {banner.link && (
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <Link href={banner.link}>
                  <button style={{
                    padding: isMobile ? '12px 28px' : '14px 36px',
                    background: 'rgba(245,240,232,0.15)',
                    backdropFilter: 'blur(8px)',
                    border: '1.5px solid rgba(245,240,232,0.7)',
                    color: '#F5F0E8',
                    fontSize: isMobile ? 12 : 13,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    borderRadius: 4,
                    transition: 'background 0.2s',
                  }}>
                    Shop Now
                  </button>
                </Link>
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Prev / Next arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prev}
            style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.35)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}
            aria-label="Previous"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={next}
            style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.35)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}
            aria-label="Next"
          >
            <ChevronRight size={18} />
          </button>

          {/* Dot navigation */}
          <div style={{ position: 'absolute', bottom: 20, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 8 }}>
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                style={{
                  width: i === current ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: i === current ? '#F5F0E8' : 'rgba(245,240,232,0.4)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  padding: 0,
                }}
                aria-label={`Go to banner ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );

  return inner;
}
