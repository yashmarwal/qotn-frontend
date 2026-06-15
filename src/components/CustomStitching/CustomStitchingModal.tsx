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

const DARK = '#1A1A1A';
const DARKER = '#111';
const PANEL = '#2A2A2A';
const CREAM = '#F5F0E8';
const AMBER = '#F5A623';
const BORDER_DARK = '#333';
const BORDER_MID = '#444';
const DUST = '#888';

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
    color: CREAM, fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif',
    borderRadius: 2, width: '100%',
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
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 32 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            style={{ background: DARK, border: `1px solid ${BORDER_DARK}`, width: '100%', maxWidth: 600, maxHeight: '90vh', borderRadius: 4, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
          >
            {/* Header */}
            <div style={{ background: '#000', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, borderBottom: `1px solid ${BORDER_DARK}` }}>
              <div>
                <p style={{ color: CREAM, fontSize: 14, letterSpacing: '0.12em', fontWeight: 500, textTransform: 'uppercase', margin: 0 }}>✂ Custom Stitching</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ color: AMBER, fontSize: 13, fontWeight: 500 }}>₹249 added to order</span>
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: CREAM, display: 'flex', alignItems: 'center' }}>
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Step indicator */}
            <div style={{ display: 'flex', gap: 8, padding: '16px 24px', flexShrink: 0, borderBottom: `1px solid ${BORDER_DARK}`, background: DARKER }}>
              {[1, 2, 3].map(s => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: step > s ? 'transparent' : step === s ? CREAM : PANEL,
                    border: step > s ? `1px solid ${BORDER_MID}` : step === s ? 'none' : `1px solid ${BORDER_MID}`,
                    fontSize: 12, fontWeight: 600, color: step > s ? '#4CAF50' : step === s ? DARK : DUST,
                    flexShrink: 0, transition: 'all 0.2s',
                  }}>
                    {step > s ? '✓' : s}
                  </div>
                  <span style={{ fontSize: 11, color: step >= s ? CREAM : DUST, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: step === s ? 500 : 400 }}>
                    {s === 1 ? 'Garment' : s === 2 ? 'Measurements' : 'Instructions'}
                  </span>
                  {s < 3 && <div style={{ flex: 1, height: 1, background: step > s ? '#4CAF50' : BORDER_MID }} />}
                </div>
              ))}
            </div>

            {/* Content */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '24px' }}>

              {/* Step 1 */}
              {step === 1 && (
                <div>
                  <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: DUST, marginBottom: 16, fontWeight: 500 }}>Select Garment Type</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {availableGarments.map(type => {
                      const cfg = GARMENT_MEASUREMENTS[type];
                      const sel = garmentType === type;
                      return (
                        <button key={type} onClick={() => setGarmentType(type)}
                          style={{
                            padding: '18px 12px', border: `1px solid ${sel ? CREAM : BORDER_MID}`,
                            background: sel ? CREAM : PANEL, color: sel ? DARK : CREAM,
                            cursor: 'pointer', fontSize: 13, fontWeight: sel ? 500 : 400,
                            fontFamily: 'DM Sans, sans-serif', textAlign: 'center', minHeight: 72,
                            transition: 'all 0.15s', borderRadius: 2,
                          }}>
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
                  <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: DUST, marginBottom: 4, fontWeight: 500 }}>{config.label} Measurements</p>
                  <p style={{ color: DUST, fontSize: 12, marginBottom: 24 }}>All measurements in inches. <span style={{ color: AMBER }}>*</span> Required</p>

                  {/* How to measure accordion */}
                  <div style={{ background: DARKER, border: `1px solid ${BORDER_DARK}`, marginBottom: 20, borderRadius: 2 }}>
                    <button onClick={() => setHowToOpen(o => !o)}
                      style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: CREAM, fontSize: 12, letterSpacing: '0.08em', fontFamily: 'DM Sans, sans-serif' }}>
                      HOW TO MEASURE
                      <span style={{ transition: 'transform 0.2s', display: 'inline-block', transform: howToOpen ? 'rotate(180deg)' : 'none' }}>↓</span>
                    </button>
                    {howToOpen && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden' }}>
                        <div style={{ padding: '0 16px 16px' }}>
                          <p style={{ color: CREAM, fontSize: 12, lineHeight: 1.7, opacity: 0.8 }}>
                            Stand upright and relaxed. Use a soft measuring tape close to the body but not tight. Have someone help you for back measurements. All measurements should be in inches.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {config.fields.map(field => (
                      <div key={field.key}>
                        <label style={{ display: 'block', fontSize: 13, letterSpacing: '0.04em', fontWeight: 500, marginBottom: 8, color: CREAM }}>
                          {field.label} {field.required && <span style={{ color: AMBER }}>*</span>}
                        </label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <input
                            type="number" step="0.25" min="10" max="80"
                            placeholder="e.g. 40"
                            value={measurements[field.key] || ''}
                            onChange={e => setMeasurements(m => ({ ...m, [field.key]: e.target.value }))}
                            onFocus={e => { (e.target as HTMLInputElement).style.borderColor = CREAM; }}
                            onBlur={e => { (e.target as HTMLInputElement).style.borderColor = errors[field.key] ? '#EF4444' : BORDER_MID; }}
                            style={{ ...inputCls, borderColor: errors[field.key] ? '#EF4444' : BORDER_MID, paddingRight: 40 }}
                          />
                          <span style={{ position: 'absolute', right: 12, color: DUST, fontSize: 11, pointerEvents: 'none', fontWeight: 500 }}>in</span>
                        </div>
                        {errors[field.key] && <p style={{ color: '#EF4444', fontSize: 11, marginTop: 4 }}>{errors[field.key]}</p>}
                        {field.hint && !errors[field.key] && (
                          <p style={{ color: DUST, fontSize: 11, marginTop: 4, lineHeight: 1.5 }}>{field.hint}</p>
                        )}
                        {measurementGuides[field.key] && (
                          <button onClick={() => setGuideOpen(guideOpen === field.key ? null : field.key)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: DUST, fontSize: 11, marginTop: 4, padding: 0, fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 4 }}>
                            {guideOpen === field.key ? <ChevronUp size={11} /> : <ChevronDown size={11} />} How to measure
                          </button>
                        )}
                        {guideOpen === field.key && measurementGuides[field.key] && (
                          <div style={{ background: PANEL, border: `1px solid ${BORDER_MID}`, padding: 10, marginTop: 6, borderRadius: 2 }}>
                            <p style={{ fontSize: 11, color: CREAM, margin: 0, lineHeight: 1.6, opacity: 0.85 }}>{measurementGuides[field.key]}</p>
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
                  <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: DUST, marginBottom: 4, fontWeight: 500 }}>Special Instructions</p>
                  <p style={{ color: DUST, fontSize: 12, marginBottom: 20 }}>Any special requests? Fit preference, pocket placement, collar style... (Optional)</p>
                  <textarea
                    value={specialInstructions}
                    onChange={e => setSpecialInstructions(e.target.value)}
                    placeholder="E.g. slim fit, extra pocket, collar style..."
                    rows={5}
                    onFocus={e => { e.target.style.borderColor = CREAM; }}
                    onBlur={e => { e.target.style.borderColor = BORDER_MID; }}
                    style={{ width: '100%', padding: '12px 14px', background: PANEL, border: `1px solid ${BORDER_MID}`, color: CREAM, fontSize: 14, fontFamily: 'DM Sans, sans-serif', resize: 'vertical', outline: 'none', height: 120, borderRadius: 2, boxSizing: 'border-box' }}
                  />
                  <div style={{ background: DARKER, border: `1px solid ${BORDER_DARK}`, padding: 16, marginTop: 20, borderRadius: 2 }}>
                    <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 10, color: DUST }}>Order Summary</p>
                    <p style={{ fontSize: 13, margin: '0 0 4px', color: CREAM }}>{GARMENT_MEASUREMENTS[garmentType]?.label}</p>
                    <p style={{ fontSize: 12, color: DUST, margin: '0 0 10px' }}>{Object.keys(measurements).filter(k => measurements[k]).length} measurements provided</p>
                    <p style={{ fontSize: 15, fontWeight: 500, margin: 0, color: AMBER }}>Custom Stitching: ₹249</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 24px', borderTop: `1px solid ${BORDER_DARK}`, flexShrink: 0, background: DARKER }}>
              {saveError && (
                <p style={{ fontSize: 12, color: '#EF4444', marginBottom: 10, background: 'rgba(239,68,68,0.1)', padding: '8px 12px', borderRadius: 2 }}>{saveError}</p>
              )}
            <div style={{ display: 'flex', gap: 10 }}>
              {step > 1 && (
                <button onClick={() => setStep(s => s - 1)}
                  style={{ flex: 1, height: 52, border: `1px solid ${BORDER_MID}`, background: 'transparent', color: CREAM, cursor: 'pointer', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'DM Sans, sans-serif', borderRadius: 2 }}>
                  Back
                </button>
              )}
              {step < 3 ? (
                <button onClick={handleNext} disabled={step === 1 && !garmentType}
                  style={{ flex: 2, height: 52, background: step === 1 && !garmentType ? PANEL : CREAM, color: step === 1 && !garmentType ? DUST : DARK, border: 'none', cursor: step === 1 && !garmentType ? 'not-allowed' : 'pointer', fontSize: 12, letterSpacing: '0.10em', textTransform: 'uppercase', fontWeight: 500, fontFamily: 'DM Sans, sans-serif', borderRadius: 2, transition: 'all 0.15s' }}>
                  Continue →
                </button>
              ) : (
                <button onClick={handleSave} disabled={saving}
                  style={{ flex: 2, height: 52, background: CREAM, color: DARK, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontSize: 12, letterSpacing: '0.10em', textTransform: 'uppercase', fontWeight: 500, fontFamily: 'DM Sans, sans-serif', borderRadius: 2, opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Saving...' : 'SAVE & ADD TO CART ✓'}
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
