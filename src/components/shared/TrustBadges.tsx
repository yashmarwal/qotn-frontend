const badges = [
  { emoji: '🔒', label: 'Secure Payments' },
  { emoji: '↩', label: '7-Day Returns' },
  { emoji: '🌿', label: '100% Cotton' },
  { emoji: '🇮🇳', label: 'Made in India' },
  { emoji: '✂', label: 'Custom Stitching' },
];

export default function TrustBadges() {
  return (
    <section
      className="trust-badges"
      style={{
        background: 'var(--cream)',
        padding: '14px 16px',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 10,
          overflowX: 'auto',
          flexWrap: 'nowrap',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          justifyContent: 'center',
        }}
      >
        {badges.map((b) => (
          <div
            key={b.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              border: '1px solid var(--border)',
              borderRadius: 24,
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 14 }}>{b.emoji}</span>
            <span style={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 500, color: 'var(--black)' }}>{b.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
