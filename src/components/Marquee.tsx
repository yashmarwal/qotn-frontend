export default function Marquee() {
  const text = '100% COTTON · MADE IN INDIA · PURE COTTON · NOTHING ELSE · MEN · WOMEN · KIDS · ';
  const repeated = text.repeat(6);

  return (
    <div
      style={{
        backgroundColor: 'var(--black)',
        color: 'var(--cream)',
        height: 36,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        className="marquee-track"
        style={{
          display: 'flex',
          whiteSpace: 'nowrap',
          userSelect: 'none',
        }}
      >
        <span style={{ fontSize: 11, letterSpacing: '0.12em', fontWeight: 400 }}>
          {repeated}
        </span>
        <span style={{ fontSize: 11, letterSpacing: '0.12em', fontWeight: 400 }}>
          {repeated}
        </span>
      </div>
    </div>
  );
}
