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
}

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

// Height upper bounds (cm) for each size
const HEIGHT_UPPER: Record<string, number> = {
  XS: 156, S: 162, M: 168, L: 174, XL: 181, XXL: 999,
};

// Typical weight range (kg) for each size
const WEIGHT_RANGE: Record<string, [number, number]> = {
  XS: [38, 52], S: [52, 62], M: [62, 73], L: [73, 85], XL: [85, 98], XXL: [98, 140],
};

function getBaseSize(heightCm: number): string {
  for (const size of SIZE_ORDER) {
    if (heightCm <= HEIGHT_UPPER[size]) return size;
  }
  return 'XXL';
}

function shiftSize(size: string, delta: number): string {
  const idx = Math.max(0, Math.min(SIZE_ORDER.length - 1, SIZE_ORDER.indexOf(size) + delta));
  return SIZE_ORDER[idx];
}

function recommend(heightCm: number, weightKg: number, fit: string) {
  const base = getBaseSize(heightCm);
  const [wLo, wHi] = WEIGHT_RANGE[base];
  let adjusted = base;
  if (weightKg > wHi + 5) adjusted = shiftSize(base, 1);
  else if (weightKg < wLo - 5) adjusted = shiftSize(base, -1);
  const finalSize = fit === 'loose' ? shiftSize(adjusted, 1) : adjusted;
  return { size: finalSize, secondary: shiftSize(finalSize, 1) };
}

function ftInToCm(ft: number, inches: number): number {
  return ft * 30.48 + inches * 2.54;
}

export default function FindMySize({ isOpen, onClose, availableSizes, onSelect }: Props) {
  const [unit, setUnit] = useState<'cm' | 'ft'>('cm');
  const [heightCm, setHeightCm] = useState('');
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');
  const [weight, setWeight] = useState('');
  const [fit, setFit] = useState<'slim' | 'regular' | 'loose'>('regular');
  const [result, setResult] = useState<{ size: string; secondary: string } | null>(null);
  const [error, setError] = useState('');

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
    if (!w || w < 25 || w > 200) { setError('Please enter a valid weight.'); return; }
    setResult(recommend(h, w, fit));
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => { setResult(null); setError(''); setHeightCm(''); setHeightFt(''); setHeightIn(''); setWeight(''); }, 320);
  };

  const sizeUnavailable = result && availableSizes && availableSizes.length > 0 && !availableSizes.includes(result.size);

  const sheet = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.52)', zIndex: 500 }}
          />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 280 }}
            style={{
              position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 501,
              backgroundColor: 'var(--cream)', borderRadius: '16px 16px 0 0',
              maxHeight: '92vh', overflowY: 'auto',
              paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 0px))',
            }}
          >
            {/* Handle */}
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4 }}>
              <div style={{ width: 36, height: 4, background: 'var(--border)', borderRadius: 2 }} />
            </div>

            <div style={{ padding: '0 20px 8px' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <p style={{ fontSize: 13, letterSpacing: '0.10em', textTransform: 'uppercase', fontWeight: 600 }}>Find My Size</p>
                  <p style={{ fontSize: 11, color: 'var(--dust)', marginTop: 3, lineHeight: 1.4 }}>
                    Indian sizing · Cotton shrinks ~3–5% on first wash
                  </p>
                </div>
                <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--dust)', marginTop: 2 }}>
                  <X size={18} strokeWidth={1.5} />
                </button>
              </div>

              {/* Height row */}
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
                  <input type="number" placeholder="e.g. 168"
                    value={heightCm} onChange={e => setHeightCm(e.target.value)}
                    style={{ width: '100%', padding: '13px 14px', border: '1px solid var(--border)', background: 'transparent', fontSize: 15, outline: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box', color: 'var(--black)' }} />
                ) : (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input type="number" placeholder="Feet (e.g. 5)"
                      value={heightFt} onChange={e => setHeightFt(e.target.value)}
                      style={{ flex: 1, padding: '13px 14px', border: '1px solid var(--border)', background: 'transparent', fontSize: 15, outline: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box', color: 'var(--black)' }} />
                    <input type="number" placeholder="Inches (e.g. 7)"
                      value={heightIn} onChange={e => setHeightIn(e.target.value)}
                      style={{ flex: 1, padding: '13px 14px', border: '1px solid var(--border)', background: 'transparent', fontSize: 15, outline: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box', color: 'var(--black)' }} />
                  </div>
                )}
              </div>

              {/* Weight */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 10, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--dust)', fontWeight: 500, display: 'block', marginBottom: 8 }}>Weight (kg)</label>
                <input type="number" placeholder="e.g. 65"
                  value={weight} onChange={e => setWeight(e.target.value)}
                  style={{ width: '100%', padding: '13px 14px', border: '1px solid var(--border)', background: 'transparent', fontSize: 15, outline: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box', color: 'var(--black)' }} />
              </div>

              {/* Fit preference */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 10, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--dust)', fontWeight: 500, display: 'block', marginBottom: 8 }}>Preferred Fit</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {([
                    { id: 'slim', label: 'Slim', desc: 'Close to body' },
                    { id: 'regular', label: 'Regular', desc: 'Classic fit' },
                    { id: 'loose', label: 'Loose', desc: 'Relaxed fit' },
                  ] as const).map(f => (
                    <button key={f.id} onClick={() => setFit(f.id)}
                      style={{ padding: '12px 8px', border: fit === f.id ? '1.5px solid var(--black)' : '1px solid var(--border)', background: fit === f.id ? 'rgba(26,26,26,0.05)' : 'transparent', cursor: 'pointer', textAlign: 'center', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s', borderRadius: 4 }}>
                      <p style={{ fontSize: 13, fontWeight: fit === f.id ? 600 : 400, color: 'var(--black)', marginBottom: 2 }}>{f.label}</p>
                      <p style={{ fontSize: 10, color: 'var(--dust)' }}>{f.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {error && <p style={{ fontSize: 12, color: '#DC2626', marginBottom: 12 }}>{error}</p>}

              {!result && (
                <motion.button onClick={handleFind}
                  whileTap={{ scale: 0.97 }}
                  style={{ width: '100%', height: 52, background: 'var(--black)', color: 'var(--cream)', border: 'none', fontSize: 12, letterSpacing: '0.10em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>
                  Find My Size
                </motion.button>
              )}

              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.28 }}
                    style={{ border: '1px solid var(--border)', padding: 20 }}
                  >
                    <p style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dust)', marginBottom: 6, textAlign: 'center' }}>Your Recommended Size</p>
                    <p style={{ fontSize: 56, fontWeight: 300, lineHeight: 1, textAlign: 'center', marginBottom: 4 }}>{result.size}</p>

                    {sizeUnavailable && (
                      <p style={{ fontSize: 11, color: '#D97706', marginBottom: 12, textAlign: 'center', fontWeight: 500 }}>
                        {result.size} is currently unavailable — try {result.secondary} for a roomier fit.
                      </p>
                    )}

                    <div style={{ background: 'rgba(26,26,26,0.04)', padding: '10px 14px', marginBottom: 16, borderRadius: 4 }}>
                      <p style={{ fontSize: 11, color: 'var(--dust)', lineHeight: 1.6 }}>
                        <strong style={{ color: 'var(--black)', fontWeight: 600 }}>Cotton shrinks ~3–5%</strong> on the first wash.
                        If you&apos;re between sizes, go one size up.
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      {onSelect && (
                        <motion.button whileTap={{ scale: 0.97 }}
                          onClick={() => { onSelect(sizeUnavailable ? result.secondary : result.size); handleClose(); }}
                          style={{ flex: 2, height: 48, background: 'var(--black)', color: 'var(--cream)', border: 'none', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>
                          Select {sizeUnavailable ? result.secondary : result.size}
                        </motion.button>
                      )}
                      <motion.button whileTap={{ scale: 0.97 }}
                        onClick={() => setResult(null)}
                        style={{ flex: 1, height: 48, background: 'transparent', color: 'var(--black)', border: '1px solid var(--border)', fontSize: 12, letterSpacing: '0.06em', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
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
