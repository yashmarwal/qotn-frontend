'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { GARMENT_MEASUREMENTS, GARMENTS_BY_CATEGORY, measurementGuides, GarmentConfig } from './garment-measurements';
import { customStitchingService } from '@/lib/services/custom-stitching.service';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productCategory: string;
  onSaved: (stitchingId: string) => void;
}

const BLACK  = '#000000';
const DARK   = '#0D0D0D';
const PANEL  = '#181818';
const CREAM  = '#F5F0E8';
const DUST   = '#6B6560';
const BORDER = '#2A2A2A';
const BORDER_MID = '#333';

export default function CustomStitchingModal({ isOpen, onClose, productId, productCategory, onSaved }: Props) {
  const [step, setStep] = useState(1);
  const [garmentType, setGarmentType] = useState('');
  const [measurements, setMeasurements] = useState<Record<string, string>>({});
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [guideOpen, setGuideOpen] = useState<string | null>(null);
  const [howToOpen, setHowToOpen] = useState(false);

  const availableGarments = GARMENTS_BY_CATEGORY[productCategory] || GARMENTS_BY_CATEGORY['men'];
  const config: GarmentConfig | null = garmentType ? GARMENT_MEASUREMENTS[garmentType] : null;

  const validateMeasurements = () => {
    if (!config) return false;
    const newErrors: Record<string, string> = {};
    for (const field of config.fields) {
      if (field.required) {
        const val = parseFloat(measurements[field.key] || '');
        if (isNaN(val) || val < 10 || val > 80) {
          newErrors[field.key] = 'Required (10–80 in)';
        }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && !garmentType) return;
    if (step === 2 && !validateMeasurements()) return;
    setStep(s => s + 1);
  };

  const [saveError, setSaveError] = useState('');

  const handleSave = async () => {
    if (!validateMeasurements()) return;
    setSaving(true);
    setSaveError('');
    try {
      const measurementsNum: Record<string, number> = {};
      for (const [k, v] of Object.entries(measurements)) {
        if (v) measurementsNum[k] = parseFloat(v);
      }
      const res: any = await customStitchingService.save({
        productId, garmentType,
        measurements: measurementsNum,
        specialInstructions: specialInstructions || undefined,
      });
      const stitchingId = res?.data?.id;
      if (!stitchingId) throw new Error('No stitching ID returned — please try again.');
      onSaved(stitchingId);
      onClose();
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save measurements. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const inputCls: React.CSSProperties = {
    flex: 1, padding: '0 12px', height: 48, background: PANEL, border: `1px solid ${BORDER_MID}`,
    color: CREAM, fontSize: 13, outline: 'none', fontFamily: 'DM Sans, sans-serif',
    borderRadius: 0, width: '100%', letterSpacing: '0.02em',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{ background: DARK, border: `1px solid ${BORDER}`, width: '100%', maxWidth: 560, maxHeight: '90vh', borderRadius: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
          >
            {/* Header */}
            <div style={{ background: BLACK, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, borderBottom: `1px solid ${BORDER}` }}>
              <div>
                <p style={{ color: CREAM, fontSize: 11, letterSpacing: '0.20em', fontWeight: 400, textTransform: 'uppercase', margin: 0 }}>Custom Stitching</p>
                <p style={{ color: DUST, fontSize: 11, letterSpacing: '0.06em', margin: '3px 0 0', fontWeight: 400 }}>+₹249 · Tailored to your measurements</p>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: `1px solid ${BORDER_MID}`, cursor: 'pointer', padding: '6px 8px', color: DUST, display: 'flex', alignItems: 'center', transition: 'border-color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = CREAM)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = BORDER_MID)}>
                <X size={14} />
              </button>
            </div>

            {/* Step indicator — minimal bar */}
            <div style={{ display: 'flex', padding: '0 24px', flexShrink: 0, borderBottom: `1px solid ${BORDER}`, background: BLACK, gap: 0 }}>
              {(['Garment', 'Measurements', 'Instructions'] as const).map((label, i) => {
                const s = i + 1;
                const active = step === s;
                const done = step > s;
                return (
                  <div key={s} style={{ flex: 1, padding: '14px 0', borderBottom: active ? `2px solid ${CREAM}` : '2px solid transparent', transition: 'border-color 0.2s' }}>
                    <span style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: done ? DUST : active ? CREAM : DUST, fontWeight: 400 }}>
                      {done ? '✓ ' : ''}{label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Content */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '28px 24px' }}>

              {/* Step 1 */}
              {step === 1 && (
                <div>
                  <p style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: DUST, marginBottom: 20, fontWeight: 400 }}>Select Garment Type</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {availableGarments.map(type => {
                      const cfg = GARMENT_MEASUREMENTS[type];
                      const sel = garmentType === type;
                      return (
                        <button key={type} onClick={() => setGarmentType(type)}
                          style={{
                            padding: '20px 12px', border: `1px solid ${sel ? CREAM : BORDER_MID}`,
                            background: sel ? CREAM : 'transparent', color: sel ? '#0D0D0D' : DUST,
                            cursor: 'pointer', fontSize: 11, fontWeight: 400,
                            fontFamily: 'DM Sans, sans-serif', textAlign: 'center',
                            letterSpacing: '0.10em', textTransform: 'uppercase',
                            transition: 'all 0.15s', borderRadius: 0,
                          }}
                          onMouseEnter={e => { if (!sel) { e.currentTarget.style.borderColor = DUST; e.currentTarget.style.color = CREAM; } }}
                          onMouseLeave={e => { if (!sel) { e.currentTarget.style.borderColor = BORDER_MID; e.currentTarget.style.color = DUST; } }}>
                          {cfg?.label || type}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 2 */}
              {step === 2 && config && (
                <div>
                  <p style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: DUST, marginBottom: 4, fontWeight: 400 }}>{config.label}</p>
                  <p style={{ color: DUST, fontSize: 12, marginBottom: 24, lineHeight: 1.6 }}>All measurements in inches. Fields marked <span style={{ color: CREAM }}>*</span> are required.</p>

                  {/* How to measure accordion */}
                  <div style={{ border: `1px solid ${BORDER}`, marginBottom: 24 }}>
                    <button onClick={() => setHowToOpen(o => !o)}
                      style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: DUST, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: 'DM Sans, sans-serif' }}>
                      How to Measure
                      <span style={{ fontSize: 10, transition: 'transform 0.2s', display: 'inline-block', transform: howToOpen ? 'rotate(180deg)' : 'none' }}>↓</span>
                    </button>
                    {howToOpen && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden' }}>
                        <div style={{ padding: '0 16px 16px', borderTop: `1px solid ${BORDER}` }}>
                          <p style={{ color: DUST, fontSize: 12, lineHeight: 1.8, marginTop: 12 }}>
                            Stand upright and relaxed. Use a soft measuring tape close to the body but not tight. Have someone help you for back measurements. All measurements should be in inches.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    {config.fields.map(field => (
                      <div key={field.key}>
                        <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 400, marginBottom: 8, color: field.required ? CREAM : DUST }}>
                          {field.label}{field.required && <span style={{ color: CREAM }}> *</span>}
                        </label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <input
                            type="number" step="0.25" min="10" max="80"
                            placeholder="—"
                            value={measurements[field.key] || ''}
                            onChange={e => setMeasurements(m => ({ ...m, [field.key]: e.target.value }))}
                            onFocus={e => { (e.target as HTMLInputElement).style.borderColor = CREAM; }}
                            onBlur={e => { (e.target as HTMLInputElement).style.borderColor = errors[field.key] ? '#C0392B' : BORDER_MID; }}
                            style={{ ...inputCls, borderColor: errors[field.key] ? '#C0392B' : BORDER_MID, paddingRight: 36 }}
                          />
                          <span style={{ position: 'absolute', right: 12, color: DUST, fontSize: 10, pointerEvents: 'none', letterSpacing: '0.06em' }}>in</span>
                        </div>
                        {errors[field.key] && <p style={{ color: '#C0392B', fontSize: 10, marginTop: 5, letterSpacing: '0.04em' }}>{errors[field.key]}</p>}
                        {field.hint && !errors[field.key] && (
                          <p style={{ color: DUST, fontSize: 10, marginTop: 5, lineHeight: 1.6, letterSpacing: '0.02em' }}>{field.hint}</p>
                        )}
                        {measurementGuides[field.key] && (
                          <button onClick={() => setGuideOpen(guideOpen === field.key ? null : field.key)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: DUST, fontSize: 10, letterSpacing: '0.08em', marginTop: 5, padding: 0, fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 4, textTransform: 'uppercase' }}>
                            {guideOpen === field.key ? <ChevronUp size={10} /> : <ChevronDown size={10} />} Guide
                          </button>
                        )}
                        {guideOpen === field.key && measurementGuides[field.key] && (
                          <div style={{ background: 'transparent', border: `1px solid ${BORDER}`, padding: '10px 12px', marginTop: 6 }}>
                            <p style={{ fontSize: 11, color: DUST, margin: 0, lineHeight: 1.7 }}>{measurementGuides[field.key]}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <div>
                  <p style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: DUST, marginBottom: 4, fontWeight: 400 }}>Special Instructions</p>
                  <p style={{ color: DUST, fontSize: 12, marginBottom: 20, lineHeight: 1.7 }}>Fit preference, pocket placement, collar style — optional.</p>
                  <textarea
                    value={specialInstructions}
                    onChange={e => setSpecialInstructions(e.target.value)}
                    placeholder="E.g. slim fit, extra pocket on left..."
                    rows={5}
                    onFocus={e => { e.target.style.borderColor = CREAM; }}
                    onBlur={e => { e.target.style.borderColor = BORDER_MID; }}
                    style={{ width: '100%', padding: '12px 14px', background: PANEL, border: `1px solid ${BORDER_MID}`, color: CREAM, fontSize: 13, fontFamily: 'DM Sans, sans-serif', resize: 'vertical', outline: 'none', height: 120, borderRadius: 0, boxSizing: 'border-box', letterSpacing: '0.02em', lineHeight: 1.7 }}
                  />

                  {/* Summary */}
                  <div style={{ border: `1px solid ${BORDER}`, padding: '20px 20px', marginTop: 24 }}>
                    <p style={{ fontSize: 10, fontWeight: 400, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 16, color: DUST }}>Summary</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: CREAM, letterSpacing: '0.04em' }}>{GARMENT_MEASUREMENTS[garmentType]?.label}</span>
                      <span style={{ fontSize: 12, color: DUST }}>{Object.keys(measurements).filter(k => measurements[k]).length} fields</span>
                    </div>
                    <div style={{ height: 1, background: BORDER, marginBottom: 16 }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: DUST }}>Custom Stitching</span>
                      <span style={{ fontSize: 14, fontWeight: 400, color: CREAM, letterSpacing: '0.04em' }}>₹249</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 24px', borderTop: `1px solid ${BORDER}`, flexShrink: 0, background: BLACK }}>
              {saveError && (
                <p style={{ fontSize: 11, color: '#C0392B', marginBottom: 12, letterSpacing: '0.02em', lineHeight: 1.6 }}>{saveError}</p>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                {step > 1 && (
                  <button onClick={() => setStep(s => s - 1)}
                    style={{ flex: 1, height: 50, border: `1px solid ${BORDER_MID}`, background: 'transparent', color: DUST, cursor: 'pointer', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: 'DM Sans, sans-serif', borderRadius: 0, transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = CREAM; e.currentTarget.style.color = CREAM; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER_MID; e.currentTarget.style.color = DUST; }}>
                    ← Back
                  </button>
                )}
                {step < 3 ? (
                  <button onClick={handleNext} disabled={step === 1 && !garmentType}
                    style={{ flex: 2, height: 50, background: step === 1 && !garmentType ? PANEL : CREAM, color: step === 1 && !garmentType ? DUST : '#0D0D0D', border: 'none', cursor: step === 1 && !garmentType ? 'not-allowed' : 'pointer', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 400, fontFamily: 'DM Sans, sans-serif', borderRadius: 0, transition: 'all 0.15s' }}>
                    Continue →
                  </button>
                ) : (
                  <button onClick={handleSave} disabled={saving}
                    style={{ flex: 2, height: 50, background: saving ? PANEL : CREAM, color: saving ? DUST : '#0D0D0D', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 400, fontFamily: 'DM Sans, sans-serif', borderRadius: 0, transition: 'all 0.15s' }}>
                    {saving ? 'Saving...' : 'Save & Add to Cart'}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
