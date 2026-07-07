'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  availableSizes?: string[];
  onSelect?: (size: string) => void;
  category?: string;
}

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

// Height upper bounds (cm) → frame size. Based on Indian average stature.
// Women avg ~152–155 cm, men avg ~165 cm — sizes graded accordingly.
const FRAME_HEIGHT: Record<'men' | 'women', Record<string, number>> = {
  women: { XS: 152, S: 157, M: 163, L: 168, XL: 173, XXL: 999 },
  men:   { XS: 158, S: 164, M: 170, L: 176, XL: 182, XXL: 999 },
};

function getFrameSize(heightCm: number, isMen: boolean): string {
  const chart = FRAME_HEIGHT[isMen ? 'men' : 'women'];
  for (const size of SIZE_ORDER) {
    if (heightCm <= chart[size]) return size;
  }
  return 'XXL';
}

function shiftSize(size: string, delta: number): string {
  const idx = Math.max(0, Math.min(SIZE_ORDER.length - 1, SIZE_ORDER.indexOf(size) + delta));
  return SIZE_ORDER[idx];
}

function ftInToCm(ft: number, inches: number): number {
  return ft * 30.48 + inches * 2.54;
}

function bmi(heightCm: number, weightKg: number): number {
  const h = heightCm / 100;
  return weightKg / (h * h);
}

type BodyShape = 'slim' | 'average' | 'fuller';
type FitPref  = 'slim' | 'regular' | 'loose';

interface Result {
  size: string;
  frameSize: string;
  primaryNote: string;
  girthNote?: string;
  alt?: string;
}

function recommend(
  heightCm: number,
  weightKg: number,
  bodyShape: BodyShape,
  fit: FitPref,
  category: string
): Result {
  const isMen = category === 'men';
  const b = bmi(heightCm, weightKg);
  const frame = getFrameSize(heightCm, isMen);

  // Step 1 — BMI cross-check (independent of body shape)
  let bmiShift = 0;
  if (b < 17) bmiShift = -1;
  else if (b > 32) bmiShift = 2;
  else if (b > 28) bmiShift = 1;

  const afterBMI = shiftSize(frame, bmiShift);

  // Step 2 — Body shape: the Indian "thin-fat" correction
  // Many Indian bodies carry more central girth than the frame suggests,
  // so a size that fits the chest/bust can be tight at the waist.
  let girthShift = 0;
  let girthNote: string | undefined;

  if (bodyShape === 'fuller') {
    if (b > 21) {
      girthShift = 1;
      girthNote = `Your shoulders & chest fit ${afterBMI} — sized up to ${shiftSize(afterBMI, 1)} for waist comfort. This is the classic Indian fit challenge: the frame fits one size while the waist needs the next.`;
    }
    if (b > 28) girthShift = 2;
  } else if (bodyShape === 'slim' && b < 19) {
    girthShift = -1;
  }

  const afterGirth = shiftSize(afterBMI, girthShift);

  // Step 3 — Fit preference
  let fitShift = 0;
  if (fit === 'loose') fitShift = 1;
  if (fit === 'slim' && bodyShape !== 'fuller') fitShift = -1;

  const finalSize = shiftSize(afterGirth, fitShift);

  // Build note
  let primaryNote = '';
  if (bodyShape === 'fuller' && girthShift > 0) {
    primaryNote = girthNote!;
  } else if (fit === 'loose') {
    primaryNote = 'Sized up for a relaxed, breathable kurta fit. Great for layering or longer wear.';
  } else if (fit === 'slim') {
    primaryNote = 'Close-to-body cut. Cotton is structured fresh and softens after a few washes.';
  } else {
    primaryNote = 'Classic Indian fit — relaxed through the chest, room at the waist. Works for most builds.';
  }

  return {
    size: finalSize,
    frameSize: afterBMI,
    primaryNote,
    girthNote: bodyShape === 'fuller' && girthShift > 0 ? girthNote : undefined,
    alt: shiftSize(finalSize, 1),
  };
}

export default function FindMySize({ isOpen, onClose, availableSizes, onSelect, category = 'women' }: Props) {
  const [unit, setUnit]         = useState<'cm' | 'ft'>('cm');
  const [heightCm, setHeightCm] = useState('');
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');
  const [weight, setWeight]     = useState('');
  const [bodyShape, setBodyShape] = useState<BodyShape>('average');
  const [fit, setFit]           = useState<FitPref>('regular');
  const [result, setResult]     = useState<Result | null>(null);
  const [error, setError]       = useState('');

  const handleFind = () => {
    setError('');
    let h = 0;
    if (unit === 'cm') {
      h = parseFloat(heightCm);
    } else {
      h = ftInToCm(parseFloat(heightFt) || 0, parseFloat(heightIn) || 0);
    }
    const w = parseFloat(weight);
    if (!h || h < 100 || h > 230) { setError('Please enter a valid height.'); return; }
    if (!w || w < 25 || w > 200)  { setError('Please enter a valid weight.'); return; }
    setResult(recommend(h, w, bodyShape, fit, category));
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => { setResult(null); setError(''); setHeightCm(''); setHeightFt(''); setHeightIn(''); setWeight(''); }, 320);
  };

  const sizeUnavail = result && availableSizes && availableSizes.length > 0 && !availableSizes.includes(result.size);
  const recommendedSize = sizeUnavail ? result!.alt! : result?.size;

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '13px 14px',
    border: '1px solid var(--border)', background: 'transparent',
    fontSize: 15, outline: 'none',
    fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box', color: 'var(--black)',
  };

  const sheet = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 500 }}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 280 }}
            style={{
              position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 501,
              backgroundColor: 'var(--cream)', borderRadius: '16px 16px 0 0',
              maxHeight: '94vh', overflowY: 'auto',
              paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 0px))',
            }}
          >
            {/* Handle */}
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4 }}>
              <div style={{ width: 36, height: 4, background: 'var(--border)', borderRadius: 2 }} />
            </div>

            <div style={{ padding: '0 20px 8px' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
                <div>
                  <p style={{ fontSize: 13, letterSpacing: '0.10em', textTransform: 'uppercase', fontWeight: 600 }}>Find My Size</p>
                  <p style={{ fontSize: 11, color: 'var(--dust)', marginTop: 3 }}>Indian sizing · built for Indian body types</p>
                </div>
                <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--dust)' }}>
                  <X size={18} strokeWidth={1.5} />
                </button>
              </div>

              {/* Height */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ fontSize: 10, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--dust)', fontWeight: 500 }}>Height</label>
                  <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden' }}>
                    {(['cm', 'ft'] as const).map(u => (
                      <button key={u} onClick={() => setUnit(u)}
                        style={{ padding: '4px 14px', fontSize: 11, border: 'none', background: unit === u ? 'var(--black)' : 'transparent', color: unit === u ? 'var(--cream)' : 'var(--dust)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s' }}>
                        {u}
                      </button>
                    ))}
                  </div>
                </div>
                {unit === 'cm' ? (
                  <input type="number" placeholder="e.g. 165" value={heightCm} onChange={e => setHeightCm(e.target.value)} style={inputStyle} />
                ) : (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input type="number" placeholder="Feet (e.g. 5)" value={heightFt} onChange={e => setHeightFt(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                    <input type="number" placeholder="Inches (e.g. 4)" value={heightIn} onChange={e => setHeightIn(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                  </div>
                )}
              </div>

              {/* Weight */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 10, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--dust)', fontWeight: 500, display: 'block', marginBottom: 8 }}>Weight (kg)</label>
                <input type="number" placeholder="e.g. 62" value={weight} onChange={e => setWeight(e.target.value)} style={inputStyle} />
              </div>

              {/* Body Shape — the key Indian fit input */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 10, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--dust)', fontWeight: 500, display: 'block', marginBottom: 8 }}>
                  Body Type
                  <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, marginLeft: 6, fontSize: 10 }}>— helps with the waist vs. frame issue</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {([
                    { id: 'slim',    label: 'Lean Frame',   desc: 'Slim throughout' },
                    { id: 'average', label: 'Average Build', desc: 'Proportionate' },
                    { id: 'fuller',  label: 'Fuller Middle', desc: 'Waist > Frame' },
                  ] as const).map(s => (
                    <button key={s.id} onClick={() => setBodyShape(s.id)}
                      style={{
                        padding: '11px 6px', textAlign: 'center',
                        border: bodyShape === s.id ? '1.5px solid var(--black)' : '1px solid var(--border)',
                        background: bodyShape === s.id ? 'rgba(26,26,26,0.05)' : 'transparent',
                        cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', borderRadius: 6, transition: 'all 0.15s',
                      }}>
                      <p style={{ fontSize: 12, fontWeight: bodyShape === s.id ? 600 : 400, color: 'var(--black)', marginBottom: 2, lineHeight: 1.2 }}>{s.label}</p>
                      <p style={{ fontSize: 10, color: 'var(--dust)' }}>{s.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Fit Preference */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 10, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--dust)', fontWeight: 500, display: 'block', marginBottom: 8 }}>Preferred Fit</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {([
                    { id: 'slim',    label: 'Slim',    sub: 'Close to body' },
                    { id: 'regular', label: 'Regular', sub: 'Classic Indian' },
                    { id: 'loose',   label: 'Relaxed', sub: 'Room to breathe' },
                  ] as const).map(f => (
                    <button key={f.id} onClick={() => setFit(f.id)}
                      style={{
                        flex: 1, padding: '11px 4px', textAlign: 'center',
                        border: fit === f.id ? '1.5px solid var(--black)' : '1px solid var(--border)',
                        background: fit === f.id ? 'rgba(26,26,26,0.05)' : 'transparent',
                        cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', borderRadius: 6, transition: 'all 0.15s',
                      }}>
                      <p style={{ fontSize: 12, fontWeight: fit === f.id ? 600 : 400, color: 'var(--black)', marginBottom: 2 }}>{f.label}</p>
                      <p style={{ fontSize: 10, color: 'var(--dust)' }}>{f.sub}</p>
                    </button>
                  ))}
                </div>
              </div>

              {error && <p style={{ fontSize: 12, color: '#DC2626', marginBottom: 14 }}>{error}</p>}

              {!result && (
                <motion.button onClick={handleFind} whileTap={{ scale: 0.97 }}
                  style={{ width: '100%', height: 52, background: 'var(--black)', color: 'var(--cream)', border: 'none', fontSize: 12, letterSpacing: '0.10em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>
                  Find My Size
                </motion.button>
              )}

              {/* Result */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {/* Size display */}
                    <div style={{ border: '1px solid var(--border)', padding: '20px 20px 16px', marginBottom: 12 }}>
                      <p style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dust)', textAlign: 'center', marginBottom: 6 }}>
                        {sizeUnavail ? 'Closest available size' : 'Your recommended size'}
                      </p>
                      <p style={{ fontSize: 64, fontWeight: 300, lineHeight: 1, textAlign: 'center', marginBottom: 4, letterSpacing: '-0.02em' }}>
                        {recommendedSize}
                      </p>
                      {sizeUnavail && (
                        <p style={{ fontSize: 11, color: '#D97706', textAlign: 'center', fontWeight: 500, marginBottom: 4 }}>
                          Your ideal size {result.size} is unavailable — {result.alt} is next best.
                        </p>
                      )}
                      <p style={{ fontSize: 12, color: 'var(--dust)', lineHeight: 1.6, marginTop: 10, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                        {result.primaryNote}
                      </p>
                    </div>

                    {/* Cotton shrinkage note */}
                    <div style={{ background: 'rgba(26,26,26,0.04)', padding: '10px 14px', marginBottom: 14, borderRadius: 4 }}>
                      <p style={{ fontSize: 11, color: 'var(--dust)', lineHeight: 1.65 }}>
                        <strong style={{ color: 'var(--black)', fontWeight: 600 }}>Cotton shrinks ~3–5%</strong> on the first wash.
                        {' '}If you are between two sizes, always go one size up.
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      {onSelect && (
                        <motion.button whileTap={{ scale: 0.97 }}
                          onClick={() => { onSelect(recommendedSize!); handleClose(); }}
                          style={{ flex: 2, height: 48, background: 'var(--black)', color: 'var(--cream)', border: 'none', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>
                          Select {recommendedSize}
                        </motion.button>
                      )}
                      <motion.button whileTap={{ scale: 0.97 }}
                        onClick={() => setResult(null)}
                        style={{ flex: 1, height: 48, background: 'transparent', color: 'var(--black)', border: '1px solid var(--border)', fontSize: 11, letterSpacing: '0.06em', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                        Try again
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(sheet, document.body);
}
