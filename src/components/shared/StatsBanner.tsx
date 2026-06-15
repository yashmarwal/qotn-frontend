'use client';
import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

function AnimatedStat({
  value, label, prefix = '', suffix = '', duration = 1500,
}: {
  value: number; label: string; prefix?: string; suffix?: string; duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  useEffect(() => {
    if (!isInView) return;
    let startTime: number | null = null;
    const animate = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(animate);
      else setCount(value);
    };
    requestAnimationFrame(animate);
  }, [isInView, value, duration]);

  return (
    <div ref={ref} style={{ textAlign: 'center', padding: '0 24px' }}>
      <div style={{
        fontSize: 'clamp(32px, 4.5vw, 52px)',
        fontWeight: 300,
        color: '#1A1A1A',
        fontFamily: 'DM Sans, sans-serif',
        letterSpacing: '-0.02em',
        lineHeight: 1,
      }}>
        {prefix}{count.toLocaleString('en-IN')}{suffix}
      </div>
      <div style={{
        fontSize: 11,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: '#6B6560',
        marginTop: 10,
        fontFamily: 'DM Sans, sans-serif',
      }}>
        {label}
      </div>
    </div>
  );
}

const stats = [
  { value: 24, suffix: ' Hr', label: 'EASY RETURNS' },
  { value: 100, suffix: '%', label: 'PURE COTTON' },
  { value: 249, prefix: '₹', label: 'CUSTOM STITCHING' },
  { value: 999, prefix: '₹', suffix: '+', label: 'FREE SHIPPING' },
];

export default function StatsBanner() {
  return (
    <section style={{
      borderTop: '1px solid #D4CFC6',
      borderBottom: '1px solid #D4CFC6',
      background: '#F5F0E8',
    }}>
      {/* Desktop — 4 columns */}
      <div className="stats-desktop" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        maxWidth: 1200,
        margin: '0 auto',
        padding: '48px 0',
      }}>
        {stats.map((s, i) => (
          <div key={i} style={{ borderRight: i < 3 ? '1px solid #D4CFC6' : 'none' }}>
            <AnimatedStat value={s.value} label={s.label} prefix={s.prefix} suffix={s.suffix} />
          </div>
        ))}
      </div>

      {/* Mobile — 2×2 grid */}
      <div className="stats-mobile" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        padding: '32px 0',
      }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            borderRight: i % 2 === 0 ? '1px solid #D4CFC6' : 'none',
            borderBottom: i < 2 ? '1px solid #D4CFC6' : 'none',
            paddingTop: i >= 2 ? 32 : 0,
            paddingBottom: i < 2 ? 32 : 0,
          }}>
            <AnimatedStat value={s.value} label={s.label} prefix={s.prefix} suffix={s.suffix} duration={1200} />
          </div>
        ))}
      </div>

      <style jsx>{`
        .stats-desktop { display: grid !important; }
        .stats-mobile { display: none !important; }
        @media (max-width: 640px) {
          .stats-desktop { display: none !important; }
          .stats-mobile { display: grid !important; }
        }
      `}</style>
    </section>
  );
}
