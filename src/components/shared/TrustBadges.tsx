const badges = [
  { emoji: '🔒', label: 'Secure Payments' },
  { emoji: '↩', label: '7-Day Returns' },
  { emoji: '🌿', label: '100% Cotton' },
  { emoji: '🇮🇳', label: 'Made in India' },
  { emoji: '✂', label: 'Custom Stitching' },
];

export default function TrustBadges() {
  return (
    <section style={{ background: 'var(--cream)', padding: '32px 24px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: 16, overflowX: 'auto', justifyContent: 'center', flexWrap: 'wrap' }}>
        {badges.map((b) => (
          <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', border: '1px solid var(--border)', borderRadius: 24, whiteSpace: 'nowrap', flexShrink: 0 }}>
            <span style={{ fontSize: 16 }}>{b.emoji}</span>
            <span style={{ fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 500, color: 'var(--ink)' }}>{b.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
