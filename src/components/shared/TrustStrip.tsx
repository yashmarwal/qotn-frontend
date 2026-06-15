import { Lock, RotateCcw, Leaf, MapPin } from 'lucide-react';

const items = [
  { icon: Lock, title: '100% Secure Payments', sub: 'UPI, Cards, NetBanking, COD' },
  { icon: RotateCcw, title: 'Easy Returns', sub: '7-day hassle-free return policy' },
  { icon: Leaf, title: 'Pure Cotton Certified', sub: 'No blends, ever. Our promise.' },
  { icon: MapPin, title: 'Made in India', sub: 'Proudly crafted in India' },
];

export default function TrustStrip() {
  return (
    <section style={{ background: 'var(--black)', padding: '56px 24px', borderTop: '1px solid rgba(245,240,232,0.08)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 40 }}>
        {items.map((item) => (
          <div key={item.title} style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
            <item.icon size={32} strokeWidth={1.5} color="var(--cream)" style={{ flexShrink: 0, marginTop: 2, opacity: 0.9 }} />
            <div>
              <p style={{ color: 'var(--cream)', fontSize: 15, fontWeight: 500, margin: '0 0 5px', letterSpacing: '0.02em' }}>{item.title}</p>
              <p style={{ color: 'var(--dust)', fontSize: 12, margin: 0, lineHeight: 1.5 }}>{item.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
