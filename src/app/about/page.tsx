'use client';

import { motion } from 'framer-motion';
import { Leaf, Droplets, MapPin, Award, Heart } from 'lucide-react';
import Marquee from '@/components/shared/Marquee';
import { useIsMobile } from '@/hooks/useIsMobile';

export default function AboutPage() {
  const isMobile = useIsMobile();

  const cottonPromise = [
    { icon: Leaf, title: 'Pure Cotton', desc: 'We use only 100% cotton — BCI certified, sustainably sourced from Indian farms.' },
    { icon: Droplets, title: 'Zero Blends', desc: 'Not a single synthetic fibre. No polyester. No nylon. No shortcuts.' },
    { icon: MapPin, title: 'Made in India', desc: 'Every Qotn piece is made in India. We support local weavers and artisans.' },
  ];

  const numbers = [{ num: '100%', label: 'Cotton' }, { num: '0', label: 'Blends' }, { num: '3', label: 'Categories' }, { num: 'India', label: 'Made Here' }];

  const values = [
    { icon: Leaf, title: 'Purity', desc: 'Pure cotton, pure intentions. No shortcuts in our fabric or our business.' },
    { icon: Award, title: 'Honesty', desc: "The label says cotton — that's all you'll find inside. Always." },
    { icon: Heart, title: 'India', desc: 'Proudly made in India. We celebrate our artisans and textile heritage.' },
  ];

  return (
    <div style={{ backgroundColor: 'var(--cream)' }}>
      {/* Hero */}
      <section style={{ backgroundColor: 'var(--black)', padding: isMobile ? '80px 24px' : '120px 40px', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
          <h1 className="brand-wordmark" style={{ fontSize: isMobile ? 'clamp(56px, 18vw, 96px)' : 'clamp(56px, 10vw, 120px)', color: 'var(--cream)', marginBottom: 20 }}>QOTN</h1>
          <p style={{ fontSize: 13, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.5)' }}>Pure Cotton. Nothing Else.</p>
        </motion.div>
      </section>

      <Marquee />

      {/* Our Story */}
      <section style={{ padding: isMobile ? '56px 20px' : '100px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 40 : 80, alignItems: 'center' }}>
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <blockquote style={{ fontSize: isMobile ? 'clamp(22px, 6vw, 32px)' : 'clamp(28px, 3.5vw, 44px)', fontWeight: 300, lineHeight: 1.3, borderLeft: '2px solid var(--black)', paddingLeft: 24 }}>
              &ldquo;We only make one thing.&rdquo;
            </blockquote>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1 }} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {['Qotn was born from a simple belief — that the best clothing is made from the best natural material, crafted with care, and sold without pretense.', 'We source 100% pure cotton from the finest farms across India — Rajasthan, Gujarat, and Maharashtra. No blends. No synthetics. No compromise.', 'Every piece is woven, cut, and stitched in India. We work with small family-run facilities, pay fair wages, and build relationships that last decades.'].map((p, i) => (
              <p key={i} style={{ fontSize: 14, lineHeight: 1.9, color: 'var(--dust)' }}>{p}</p>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Cotton Promise */}
      <section style={{ padding: isMobile ? '48px 20px' : '80px 40px', backgroundColor: 'var(--raw-cotton)' }}>
        <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
          style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--dust)', textAlign: 'center', marginBottom: 48 }}>
          The Cotton Promise
        </motion.p>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 36 : 48, maxWidth: 1000, margin: '0 auto' }}>
          {cottonPromise.map(({ icon: Icon, title, desc }, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
              style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
              <Icon size={26} strokeWidth={1.5} color="var(--dust)" />
              <p style={{ fontSize: 15, fontWeight: 500 }}>{title}</p>
              <p style={{ fontSize: 13, color: 'var(--dust)', lineHeight: 1.8, maxWidth: 260 }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Numbers */}
      <section style={{ padding: isMobile ? '48px 20px' : '80px 40px', backgroundColor: 'var(--black)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 32, textAlign: 'center' }}>
          {numbers.map(({ num, label }, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}>
              <p style={{ fontSize: isMobile ? 36 : 'clamp(32px, 4vw, 52px)', fontWeight: 300, color: 'var(--cream)', marginBottom: 8 }}>{num}</p>
              <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.4)' }}>{label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section style={{ padding: isMobile ? '56px 20px' : '100px 40px' }}>
        <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
          style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--dust)', textAlign: 'center', marginBottom: 52 }}>
          What We Stand For
        </motion.p>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 36 : 48, maxWidth: 1000, margin: '0 auto' }}>
          {values.map(({ icon: Icon, title, desc }, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 18 }}>
              <div style={{ width: 52, height: 52, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={20} strokeWidth={1.5} color="var(--black)" />
              </div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 400, letterSpacing: '0.06em', marginBottom: 10 }}>{title}</p>
                <p style={{ fontSize: 13, color: 'var(--dust)', lineHeight: 1.8, maxWidth: 260 }}>{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
