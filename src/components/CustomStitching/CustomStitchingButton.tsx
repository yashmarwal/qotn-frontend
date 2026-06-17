'use client';
import { useState } from 'react';
import CustomStitchingModal from './CustomStitchingModal';

interface Props {
  productId: string;
  productCategory: string;
  onStitchingAdded: (stitchingId: string) => void;
  savedStitchingId?: string;
  selectedSize?: string;
}

const MESSAGES = [
  'Custom stitch this · ₹249',
  'Made to fit your exact size',
  'Every measurement, made for you',
  'No size charts. Just your fit.',
];

const ANIM_CSS = `
@keyframes cs-drift1 {
  0%, 100% { transform: translate(0px, 0px); }
  33% { transform: translate(12px, -15px); }
  66% { transform: translate(-8px, 10px); }
}
@keyframes cs-drift2 {
  0%, 100% { transform: translate(0px, 0px); }
  33% { transform: translate(-15px, 8px); }
  66% { transform: translate(20px, -12px); }
}
@keyframes cs-drift3 {
  0%, 100% { transform: translate(0px, 0px); }
  33% { transform: translate(10px, 20px); }
  66% { transform: translate(-18px, -8px); }
}
@keyframes fadeCycle4 {
  0%, 4%   { opacity: 0; transform: translateY(8px); }
  8%, 21%  { opacity: 1; transform: translateY(0); }
  25%, 100% { opacity: 0; transform: translateY(-8px); }
}
.cs-btn {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 64px;
  min-height: unset;
  border-radius: 2px;
  cursor: pointer;
  margin-top: 8px;
  transition: background-color 200ms ease, color 200ms ease;
}
.cs-circle {
  position: absolute;
  width: 70px;
  height: 70px;
  border-radius: 50%;
}
.cs-c1 {
  background: #C4A882;
  filter: blur(20px);
  opacity: 0.35;
  left: 5%;
  top: calc(50% - 35px);
  animation: cs-drift1 var(--cs-dur, 6s) ease-in-out infinite;
}
.cs-c2 {
  background: #E8E2D8;
  filter: blur(22px);
  opacity: 0.3;
  left: calc(55% - 35px);
  top: calc(50% - 35px);
  animation: cs-drift2 var(--cs-dur, 6s) ease-in-out infinite;
}
.cs-c3 {
  background: #6B6560;
  filter: blur(18px);
  opacity: 0.15;
  left: calc(80% - 35px);
  top: calc(50% - 35px);
  animation: cs-drift3 var(--cs-dur, 6s) ease-in-out infinite;
}
.cs-text-layer {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  pointer-events: none;
}
.cs-msg {
  position: absolute;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-weight: 500;
  font-family: 'DM Sans', sans-serif;
  opacity: 0;
  animation: fadeCycle4 10s ease-in-out infinite;
}
@media (prefers-reduced-motion: reduce) {
  .cs-circle { animation-play-state: paused !important; }
  .cs-msg { animation: none !important; opacity: 0 !important; }
  .cs-msg-first { opacity: 1 !important; transform: none !important; }
}
`;

export default function CustomStitchingButton({
  productId, productCategory, onStitchingAdded, savedStitchingId,
}: Props) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  const active = hovered && !savedStitchingId;

  return (
    <>
      <style>{ANIM_CSS}</style>
      <button
        onClick={() => setOpen(true)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label="Custom stitch this garment for ₹249"
        className="cs-btn"
        style={{
          border: '1px solid var(--black)',
          background: (savedStitchingId || active) ? 'var(--black)' : 'var(--cream)',
          color: (savedStitchingId || active) ? 'var(--cream)' : 'var(--black)',
          '--cs-dur': active ? '2400ms' : '6s',
        } as React.CSSProperties}
      >
        {savedStitchingId ? (
          <span style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, position: 'relative', zIndex: 1 }}>
            ✓ Measurements Saved — Edit
          </span>
        ) : (
          <>
            {/* Ambient blur circles */}
            <span aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              <span className="cs-circle cs-c1" />
              <span className="cs-circle cs-c2" />
              <span className="cs-circle cs-c3" />
            </span>
            {/* Rotating text messages */}
            <span aria-hidden="true" className="cs-text-layer">
              {MESSAGES.map((msg, i) => (
                <span
                  key={i}
                  className={`cs-msg${i === 0 ? ' cs-msg-first' : ''}`}
                  style={{ animationDelay: `${i * 2.5}s` }}
                >
                  {msg}
                </span>
              ))}
            </span>
          </>
        )}
      </button>

      <CustomStitchingModal
        isOpen={open}
        onClose={() => setOpen(false)}
        productId={productId}
        productCategory={productCategory}
        onSaved={(id) => {
          onStitchingAdded(id);
          setOpen(false);
        }}
      />
    </>
  );
}
