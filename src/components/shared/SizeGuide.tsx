'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface SizeGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const menSizes = [
  { size: 'XS', chest: '34–36', shoulder: '16.5', length: '27' },
  { size: 'S', chest: '36–38', shoulder: '17', length: '27.5' },
  { size: 'M', chest: '38–40', shoulder: '17.5', length: '28' },
  { size: 'L', chest: '40–42', shoulder: '18', length: '28.5' },
  { size: 'XL', chest: '42–44', shoulder: '18.5', length: '29' },
  { size: 'XXL', chest: '44–46', shoulder: '19', length: '29.5' },
];

const womenSizes = [
  { size: 'XS', bust: '32–34', waist: '26–28', hip: '34–36' },
  { size: 'S', bust: '34–36', waist: '28–30', hip: '36–38' },
  { size: 'M', bust: '36–38', waist: '30–32', hip: '38–40' },
  { size: 'L', bust: '38–40', waist: '32–34', hip: '40–42' },
  { size: 'XL', bust: '40–42', waist: '34–36', hip: '42–44' },
];

const kidsSizes = [
  { size: '2-3Y', age: '2–3 yrs', height: '92–98cm', chest: '54cm' },
  { size: '3-4Y', age: '3–4 yrs', height: '98–104cm', chest: '56cm' },
  { size: '4-5Y', age: '4–5 yrs', height: '104–110cm', chest: '58cm' },
  { size: '5-6Y', age: '5–6 yrs', height: '110–116cm', chest: '60cm' },
  { size: '6-7Y', age: '6–7 yrs', height: '116–122cm', chest: '62cm' },
  { size: '7-8Y', age: '7–8 yrs', height: '122–128cm', chest: '64cm' },
];

const tabs = ['Men', 'Women', 'Kids'];

export default function SizeGuide({ isOpen, onClose }: SizeGuideProps) {
  const [activeTab, setActiveTab] = useState('Men');

  if (!isOpen) return null;

  const thStyle: React.CSSProperties = {
    textAlign: 'left', padding: '8px 12px 12px 0',
    fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
    color: 'var(--dust)', fontWeight: 500,
  };
  const tdStyle: React.CSSProperties = { padding: '12px 0' };

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={onClose}
    >
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(26,26,26,0.4)' }} />
      <div
        style={{ position: 'relative', background: 'var(--cream)', width: '100%', maxWidth: 640, padding: '40px 48px', zIndex: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h2 style={{ fontSize: 14, letterSpacing: '0.12em', fontWeight: 500, textTransform: 'uppercase' }}>Size Guide</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer' }}>
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 28 }}>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: 'none', border: 'none', padding: '10px 24px',
                fontSize: 12, letterSpacing: '0.08em', fontWeight: 500, cursor: 'pointer',
                borderBottom: activeTab === tab ? '2px solid var(--black)' : '2px solid transparent',
                color: activeTab === tab ? 'var(--black)' : 'var(--dust)',
                marginBottom: -1,
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <p style={{ fontSize: 11, color: 'var(--dust)', marginBottom: 20 }}>All measurements in inches unless noted.</p>

        {activeTab === 'Men' && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead><tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Size', 'Chest', 'Shoulder', 'Length'].map((h) => <th key={h} style={thStyle}>{h}</th>)}
            </tr></thead>
            <tbody>
              {menSizes.map((r) => (
                <tr key={r.size} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ ...tdStyle, fontWeight: 500 }}>{r.size}</td>
                  <td style={tdStyle}>{r.chest}&quot;</td>
                  <td style={tdStyle}>{r.shoulder}&quot;</td>
                  <td style={tdStyle}>{r.length}&quot;</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {activeTab === 'Women' && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead><tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Size', 'Bust', 'Waist', 'Hip'].map((h) => <th key={h} style={thStyle}>{h}</th>)}
            </tr></thead>
            <tbody>
              {womenSizes.map((r) => (
                <tr key={r.size} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ ...tdStyle, fontWeight: 500 }}>{r.size}</td>
                  <td style={tdStyle}>{r.bust}&quot;</td>
                  <td style={tdStyle}>{r.waist}&quot;</td>
                  <td style={tdStyle}>{r.hip}&quot;</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {activeTab === 'Kids' && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead><tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Size', 'Age', 'Height', 'Chest'].map((h) => <th key={h} style={thStyle}>{h}</th>)}
            </tr></thead>
            <tbody>
              {kidsSizes.map((r) => (
                <tr key={r.size} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ ...tdStyle, fontWeight: 500 }}>{r.size}</td>
                  <td style={tdStyle}>{r.age}</td>
                  <td style={tdStyle}>{r.height}</td>
                  <td style={tdStyle}>{r.chest}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
