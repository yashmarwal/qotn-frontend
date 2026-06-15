export default function Marquee() {
  const text = '100% COTTON   ·   MADE IN INDIA   ·   PURE COTTON   ·   NOTHING ELSE   ·   FREE SHIPPING ABOVE ₹999   ·   CUSTOM STITCHING AVAILABLE   ·   ';
  const repeated = text.repeat(4);

  return (
    <div
      style={{
        backgroundColor: 'var(--black)',
        color: 'var(--cream)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
      }}
      className="marquee-outer"
    >
      <div className="marquee-track" style={{ display: 'flex', whiteSpace: 'nowrap', userSelect: 'none', height: 36, alignItems: 'center' }}>
        <span style={{ fontSize: 11, letterSpacing: '0.12em', fontWeight: 400 }}>{repeated}</span>
        <span style={{ fontSize: 11, letterSpacing: '0.12em', fontWeight: 400 }}>{repeated}</span>
      </div>
    </div>
  );
}
