'use client';
import { motion, useInView } from 'framer-motion';
import { ShieldCheck, Scissors, Truck } from 'lucide-react';
import { useRef } from 'react';

const items = [
  {
    icon: ShieldCheck,
    title: 'Purity Guaranteed',
    desc: 'Every fabric is tested. 100% cotton, zero blends. We certify every batch.',
  },
  {
    icon: Scissors,
    title: 'Custom Stitched',
    desc: 'Your measurements. Our craft. Perfect fit, every time. Just ₹249 extra.',
  },
  {
    icon: Truck,
    title: 'Free Delivery',
    desc: 'Free delivery on orders above ₹1499. COD available with small surcharge.',
  },
];

export default function WhyQotn() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <section ref={ref} style={{ background: 'var(--cream)', padding: '80px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          style={{ fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 300, letterSpacing: '0.12em', textAlign: 'center', marginBottom: 56, textTransform: 'uppercase' }}
        >
          Why QOTN
        </motion.h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 40 }}>
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              style={{ textAlign: 'center', padding: '32px 24px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                <item.icon size={40} strokeWidth={1} color="var(--ink)" />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 500, letterSpacing: '0.06em', marginBottom: 12, textTransform: 'uppercase' }}>{item.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--dust)', lineHeight: 1.7, margin: 0 }}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
