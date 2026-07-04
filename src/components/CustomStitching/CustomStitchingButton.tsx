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
/* ── existing (unchanged) ──────────────────────────────────────── */
@keyframes cs-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes fadeCycle4 {
  0%, 4%    { opacity: 0; transform: translateY(8px); }
  8%, 21%   { opacity: 1; transform: translateY(0); }
  25%, 100% { opacity: 0; transform: translateY(-8px); }
}

/* ── new additions ─────────────────────────────────────────────── */

/* diagonal shimmer sweeps left-to-right */
@keyframes cs-shimmer {
  0%   { transform: translateX(-130%) skewX(-15deg); }
  100% { transform: translateX(300%) skewX(-15deg); }
}

/* dashes march left-to-right like a sewing machine */
@keyframes cs-march {
  from { background-position: 0 0; }
  to   { background-position: 14px 0; }
}

/* scissors snip: two quick bites then rest */
@keyframes cs-snip {
  0%, 60%, 100% { transform: rotate(0deg)  scale(1); }
  65%           { transform: rotate(-22deg) scale(1.12); }
  72%           { transform: rotate(4deg)  scale(1); }
  77%           { transform: rotate(-14deg) scale(1.06); }
  84%           { transform: rotate(0deg)  scale(1); }
}

/* price badge gentle pulse */
@keyframes cs-badge-pulse {
  0%, 100% { opacity: 0.75; transform: translateY(-50%) scale(1); }
  50%       { opacity: 1;    transform: translateY(-50%) scale(1.06); }
}

/* ── base button ───────────────────────────────────────────────── */
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
  transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.cs-btn:hover  { transform: scaleX(1.003) scaleY(1.014); }
.cs-btn:active { transform: scale(0.998); }

/* ── existing glow ring ────────────────────────────────────────── */
.cs-glow {
  position: absolute;
  inset: -50%;
  background: conic-gradient(from 0deg, #E8E2D8, #F5F0E8, #C4A882, #6B6560, #E8E2D8);
  opacity: 0.55;
  filter: blur(20px);
  animation: cs-spin 8s linear infinite;
  transition: opacity 0.32s ease;
}
.cs-btn:hover .cs-glow {
  animation-duration: 2.2s;
  opacity: 0.88;
}
.cs-inner {
  position: absolute;
  inset: 3px;
  background: var(--cream);
  border-radius: 1px;
  z-index: 1;
}
.cs-inner-saved { background: var(--black); }

/* ── shimmer sweep ─────────────────────────────────────────────── */
.cs-shimmer {
  position: absolute;
  inset: 3px;
  border-radius: 1px;
  overflow: hidden;
  z-index: 2;
  pointer-events: none;
}
.cs-shimmer::after {
  content: '';
  position: absolute;
  top: -20%;
  left: 0;
  width: 32%;
  height: 140%;
  background: linear-gradient(
    108deg,
    transparent 10%,
    rgba(255,255,255,0.52) 50%,
    transparent 90%
  );
  animation: cs-shimmer 4.8s ease-in-out infinite;
  animation-delay: 1.2s;
}
.cs-shimmer-saved::after {
  background: linear-gradient(
    108deg,
    transparent 10%,
    rgba(255,255,255,0.10) 50%,
    transparent 90%
  );
}

/* ── marching stitch line ──────────────────────────────────────── */
.cs-stitch {
  position: absolute;
  bottom: 7px;
  left: 20px;
  right: 20px;
  height: 2px;
  z-index: 3;
  pointer-events: none;
  background-image: repeating-linear-gradient(
    90deg,
    rgba(0,0,0,0.20) 0px,
    rgba(0,0,0,0.20) 6px,
    transparent      6px,
    transparent      14px
  );
  background-size: 14px 2px;
  animation: cs-march 0.55s linear infinite;
}
.cs-stitch-saved {
  background-image: repeating-linear-gradient(
    90deg,
    rgba(245,240,232,0.32) 0px,
    rgba(245,240,232,0.32) 6px,
    transparent            6px,
    transparent            14px
  );
}

/* ── scissors icon (left anchor) ──────────────────────────────── */
.cs-scissors-wrap {
  position: absolute;
  top: 50%;
  left: 16px;
  transform: translateY(-50%);
  z-index: 4;
  pointer-events: none;
  line-height: 1;
}
.cs-scissors-icon {
  font-size: 15px;
  display: block;
  animation: cs-snip 4.8s ease-in-out infinite;
  animation-delay: 2.2s;
}

/* ── price badge (right anchor) ────────────────────────────────── */
.cs-price-badge {
  position: absolute;
  top: 50%;
  right: 14px;
  transform: translateY(-50%);
  z-index: 4;
  pointer-events: none;
  font-size: 10px;
  letter-spacing: 0.10em;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  color: var(--black);
  background: rgba(0,0,0,0.07);
  border: 1px solid rgba(0,0,0,0.10);
  padding: 3px 9px;
  border-radius: 20px;
  text-transform: uppercase;
  animation: cs-badge-pulse 3s ease-in-out infinite;
  animation-delay: 0.6s;
}

/* ── existing text layer ───────────────────────────────────────── */
.cs-text-layer {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
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

/* ── reduced-motion overrides ──────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .cs-glow           { animation-play-state: paused !important; }
  .cs-msg            { animation: none !important; opacity: 0 !important; }
  .cs-msg-first      { opacity: 1 !important; transform: none !important; }
  .cs-shimmer::after { animation: none !important; }
  .cs-stitch         { animation: none !important; }
  .cs-scissors-icon  { animation: none !important; }
  .cs-price-badge    { animation: none !important; opacity: 1 !important; transform: translateY(-50%) !important; }
  .cs-btn            { transition: none !important; }
}
`;

export default function CustomStitchingButton({
  productId, productCategory, onStitchingAdded, savedStitchingId,
}: Props) {
  const [open, setOpen] = useState(false);
  const saved = !!savedStitchingId;

  return (
    <>
      <style>{ANIM_CSS}</style>
      <button
        onClick={() => setOpen(true)}
        aria-label={saved
          ? 'Measurements saved. Click to edit your custom stitching.'
          : 'Custom stitch this garment for ₹249'}
        className="cs-btn"
      >
        {/* ── existing: rotating gradient glow ring ── */}
        <span aria-hidden="true" className="cs-glow" />

        {/* ── existing: inner panel ── */}
        <span aria-hidden="true" className={`cs-inner${saved ? ' cs-inner-saved' : ''}`} />

        {/* ── new: shimmer sweep ── */}
        <span aria-hidden="true" className={`cs-shimmer${saved ? ' cs-shimmer-saved' : ''}`} />

        {/* ── new: marching stitch dashes along bottom ── */}
        <span aria-hidden="true" className={`cs-stitch${saved ? ' cs-stitch-saved' : ''}`} />

        {/* ── new: scissors icon pinned left ── */}
        <span aria-hidden="true" className="cs-scissors-wrap">
          <span
            className="cs-scissors-icon"
            style={{ filter: saved ? 'invert(1) brightness(0.7)' : 'none' }}
          >✂</span>
        </span>

        {/* ── new: price badge pinned right (only when not saved) ── */}
        {!saved && (
          <span aria-hidden="true" className="cs-price-badge">₹249</span>
        )}

        {/* ── existing: cycling text messages ── */}
        {saved ? (
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
