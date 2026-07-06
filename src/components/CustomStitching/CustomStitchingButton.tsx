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

const CSS = `
/* ── text cycle ─────────────────────────────────── */
@keyframes cs-fade {
  0%,4%   { opacity:0; transform:translateY(7px);  }
  9%,22%  { opacity:1; transform:translateY(0);    }
  27%,100%{ opacity:0; transform:translateY(-7px); }
}

/* ── shimmer sweep ───────────────────────────────── */
@keyframes cs-shimmer {
  0%   { transform:translateX(-140%) skewX(-14deg); }
  100% { transform:translateX(320%)  skewX(-14deg); }
}

/* ── marching stitches on all 4 sides ────────────── */
@keyframes cs-march {
  from { background-position: 0 0,      100% 0,    0 100%,    0 0;    }
  to   { background-position: 14px 0,   100% 14px, 14px 100%, 0 14px; }
}

/* ── scissors snip ───────────────────────────────── */
@keyframes cs-snip {
  0%,55%,100% { transform:translateY(-50%) rotate(0deg)   scale(1);    }
  60%         { transform:translateY(-50%) rotate(-24deg) scale(1.15); }
  68%         { transform:translateY(-50%) rotate(5deg)   scale(1);    }
  74%         { transform:translateY(-50%) rotate(-16deg) scale(1.08); }
  82%         { transform:translateY(-50%) rotate(0deg)   scale(1);    }
}

/* ── badge pulse ─────────────────────────────────── */
@keyframes cs-badge {
  0%,100%{ opacity:.78; transform:translateY(-50%) scale(1);    }
  50%    { opacity:1;   transform:translateY(-50%) scale(1.07); }
}

/* ────────────────────────────────────────────────── */
.cs-btn {
  --speed: 0.52s;
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 64px;
  min-height: unset;
  border: none;
  border-radius: 2px;
  cursor: pointer;
  margin-top: 8px;
  padding: 0;
  /* base fill */
  background-color: var(--cream);
  /* four dashed sides — top / right / bottom / left */
  background-image:
    repeating-linear-gradient(90deg,rgba(26,26,26,.32) 0px,rgba(26,26,26,.32) 6px,transparent 6px,transparent 14px),
    repeating-linear-gradient(0deg, rgba(26,26,26,.32) 0px,rgba(26,26,26,.32) 6px,transparent 6px,transparent 14px),
    repeating-linear-gradient(90deg,rgba(26,26,26,.32) 0px,rgba(26,26,26,.32) 6px,transparent 6px,transparent 14px),
    repeating-linear-gradient(0deg, rgba(26,26,26,.32) 0px,rgba(26,26,26,.32) 6px,transparent 6px,transparent 14px);
  background-size:   14px 2px, 2px 14px, 14px 2px, 2px 14px;
  background-position: 0 0, 100% 0, 0 100%, 0 0;
  background-repeat:   repeat-x, repeat-y, repeat-x, repeat-y;
  animation: cs-march var(--speed) linear infinite;
  transition: transform .18s cubic-bezier(.34,1.56,.64,1);
}
/* speed up on hover */
.cs-btn:hover  { --speed:.16s; transform:scaleX(1.004) scaleY(1.018); }
.cs-btn:active { transform:scale(.997); }

/* saved state — dark bg, cream stitches */
.cs-btn-saved {
  background-color: var(--black);
  background-image:
    repeating-linear-gradient(90deg,rgba(245,240,232,.28) 0px,rgba(245,240,232,.28) 6px,transparent 6px,transparent 14px),
    repeating-linear-gradient(0deg, rgba(245,240,232,.28) 0px,rgba(245,240,232,.28) 6px,transparent 6px,transparent 14px),
    repeating-linear-gradient(90deg,rgba(245,240,232,.28) 0px,rgba(245,240,232,.28) 6px,transparent 6px,transparent 14px),
    repeating-linear-gradient(0deg, rgba(245,240,232,.28) 0px,rgba(245,240,232,.28) 6px,transparent 6px,transparent 14px);
}

/* ── shimmer layer ──────────────────────────────── */
.cs-shimmer {
  position:absolute; inset:0; pointer-events:none; z-index:1; overflow:hidden;
}
.cs-shimmer::after {
  content:'';
  position:absolute; top:-20%; left:0;
  width:28%; height:140%;
  background:linear-gradient(108deg,transparent 10%,rgba(255,255,255,.46) 50%,transparent 90%);
  animation:cs-shimmer 5.2s ease-in-out infinite;
  animation-delay:1.8s;
}
.cs-shimmer-saved::after {
  background:linear-gradient(108deg,transparent 10%,rgba(255,255,255,.08) 50%,transparent 90%);
}

/* ── scissors ───────────────────────────────────── */
.cs-scissors {
  position:absolute; top:50%; left:16px;
  z-index:2; pointer-events:none;
  font-size:16px; line-height:1;
  animation:cs-snip 5.4s ease-in-out infinite;
  animation-delay:2.4s;
}

/* ── price badge ────────────────────────────────── */
.cs-price {
  position:absolute; top:50%; right:14px;
  z-index:2; pointer-events:none;
  font-size:10px; letter-spacing:.10em;
  font-family:'DM Sans',sans-serif; font-weight:700;
  color:var(--black);
  background:rgba(26,26,26,.07);
  border:1px solid rgba(26,26,26,.12);
  padding:3px 9px; border-radius:20px;
  text-transform:uppercase;
  animation:cs-badge 3.2s ease-in-out infinite;
  animation-delay:.7s;
}

/* ── text layer ─────────────────────────────────── */
.cs-text {
  position:absolute; inset:0;
  display:flex; align-items:center; justify-content:center;
  z-index:2; pointer-events:none;
}
.cs-msg {
  position:absolute;
  font-size:11px; letter-spacing:.10em; text-transform:uppercase;
  font-weight:500; font-family:'DM Sans',sans-serif;
  color:var(--black); opacity:0;
  animation:cs-fade 10s ease-in-out infinite;
}

/* ── reduced motion ─────────────────────────────── */
@media (prefers-reduced-motion:reduce) {
  .cs-btn            { animation:none !important; }
  .cs-shimmer::after { animation:none !important; }
  .cs-scissors       { animation:none !important; }
  .cs-price          { animation:none !important; opacity:1 !important; }
  .cs-msg            { animation:none !important; opacity:0 !important; }
  .cs-msg:first-child{ opacity:1 !important; transform:none !important; }
  .cs-btn            { transition:none !important; }
}
`;

export default function CustomStitchingButton({
  productId, productCategory, onStitchingAdded, savedStitchingId,
}: Props) {
  const [open, setOpen] = useState(false);
  const saved = !!savedStitchingId;

  return (
    <>
      <style>{CSS}</style>
      <button
        onClick={() => setOpen(true)}
        aria-label={saved
          ? 'Measurements saved. Click to edit your custom stitching.'
          : 'Custom stitch this garment for ₹249'}
        className={`cs-btn${saved ? ' cs-btn-saved' : ''}`}
      >
        {/* shimmer sweep */}
        <span aria-hidden="true" className={`cs-shimmer${saved ? ' cs-shimmer-saved' : ''}`} />

        {/* scissors — snips every few seconds */}
        <span
          aria-hidden="true"
          className="cs-scissors"
          style={{ filter: saved ? 'invert(1) brightness(.75)' : 'none' }}
        >✂</span>

        {/* price badge (hidden when saved) */}
        {!saved && (
          <span aria-hidden="true" className="cs-price">₹249</span>
        )}

        {/* text */}
        {saved ? (
          <span aria-hidden="true" className="cs-text" style={{ color: 'var(--cream)' }}>
            <span style={{ fontSize: 11, letterSpacing: '.10em', textTransform: 'uppercase', fontWeight: 500, fontFamily: 'DM Sans,sans-serif' }}>
              ✓ Measurements Saved — Edit
            </span>
          </span>
        ) : (
          <span aria-hidden="true" className="cs-text">
            {MESSAGES.map((msg, i) => (
              <span
                key={i}
                className="cs-msg"
                style={{ animationDelay: `${i * 2.5}s` }}
              >{msg}</span>
            ))}
          </span>
        )}
      </button>

      <CustomStitchingModal
        isOpen={open}
        onClose={() => setOpen(false)}
        productId={productId}
        productCategory={productCategory}
        onSaved={(id) => { onStitchingAdded(id); setOpen(false); }}
      />
    </>
  );
}
