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
@keyframes cs-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes fadeCycle4 {
  0%, 4%    { opacity: 0; transform: translateY(8px); }
  8%, 21%   { opacity: 1; transform: translateY(0); }
  25%, 100% { opacity: 0; transform: translateY(-8px); }
}
.cs-btn {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 64px;
  min-height: unset;
  border: none;
  border-radius: 2px;
  cursor: pointer;
  margin-top: 8px;
  background: transparent;
  padding: 0;
}
.cs-glow {
  position: absolute;
  inset: -50%;
  background: conic-gradient(from 0deg, #E8E2D8, #F5F0E8, #C4A882, #6B6560, #E8E2D8);
  opacity: 0.55;
  filter: blur(20px);
  animation: cs-spin 8s linear infinite;
}
.cs-btn:hover .cs-glow {
  animation-duration: 3s;
  opacity: 0.7;
}
.cs-inner {
  position: absolute;
  inset: 3px;
  background: var(--cream);
  border-radius: 1px;
  z-index: 1;
}
.cs-inner-saved {
  background: var(--black);
}
.cs-text-layer {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  pointer-events: none;
}
.cs-msg {
  position: absolute;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-weight: 500;
  font-family: 'DM Sans', sans-serif;
  color: var(--black);
  opacity: 0;
  animation: fadeCycle4 10s ease-in-out infinite;
}
@media (prefers-reduced-motion: reduce) {
  .cs-glow { animation-play-state: paused !important; }
  .cs-msg  { animation: none !important; opacity: 0 !important; }
  .cs-msg-first { opacity: 1 !important; transform: none !important; }
}
`;

export default function CustomStitchingButton({
  productId, productCategory, onStitchingAdded, savedStitchingId,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <style>{ANIM_CSS}</style>
      <button
        onClick={() => setOpen(true)}
        aria-label={savedStitchingId
          ? 'Measurements saved. Click to edit your custom stitching.'
          : 'Custom stitch this garment for ₹249'}
        className="cs-btn"
      >
        {/* Rotating gradient glow ring */}
        <span aria-hidden="true" className="cs-glow" />

        {/* Inner panel — cream for default, black for saved state */}
        <span aria-hidden="true" className={`cs-inner${savedStitchingId ? ' cs-inner-saved' : ''}`} />

        {/* Text layer */}
        {savedStitchingId ? (
          <span aria-hidden="true" className="cs-text-layer" style={{ color: 'var(--cream)' }}>
            <span style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, fontFamily: 'DM Sans, sans-serif' }}>
              ✓ Measurements Saved — Edit
            </span>
          </span>
        ) : (
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
