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
  { size: '2Y', age: '1–2 yrs', height: '86–92cm', chest: '52cm' },
  { size: '4Y', age: '3–4 yrs', height: '98–104cm', chest: '56cm' },
  { size: '6Y', age: '5–6 yrs', height: '110–116cm', chest: '60cm' },
  { size: '8Y', age: '7–8 yrs', height: '122–128cm', chest: '64cm' },
  { size: '10Y', age: '9–10 yrs', height: '134–140cm', chest: '68cm' },
  { size: '12Y', age: '11–12 yrs', height: '146–152cm', chest: '72cm' },
];

const tabs = ['Men', 'Women', 'Kids'];

export default function SizeGuide({ isOpen, onClose }: SizeGuideProps) {
  const [activeTab, setActiveTab] = useState('Men');

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
      onClick={onClose}
    >
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(26,26,26,0.4)' }} />
      <div
        style={{
          position: 'relative',
          background: 'var(--cream)',
          width: '100%',
          maxWidth: 640,
          padding: 48,
          zIndex: 1,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h2 style={{ fontSize: 14, letterSpacing: '0.12em', fontWeight: 500, textTransform: 'uppercase' }}>
            Size Guide
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', padding: 4 }}>
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 32 }}>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: 'none',
                border: 'none',
                padding: '10px 24px',
                fontSize: 12,
                letterSpacing: '0.08em',
                fontWeight: 500,
                cursor: 'pointer',
                borderBottom: activeTab === tab ? '2px solid var(--black)' : '2px solid transparent',
                color: activeTab === tab ? 'var(--black)' : 'var(--dust)',
                marginBottom: -1,
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <p style={{ fontSize: 11, color: 'var(--dust)', marginBottom: 20 }}>
          All measurements in inches unless noted.
        </p>

        {/* Men Table */}
        {activeTab === 'Men' && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Size', 'Chest', 'Shoulder', 'Length'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px 12px 0', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--dust)', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {menSizes.map((row) => (
                <tr key={row.size} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 0', fontWeight: 500 }}>{row.size}</td>
                  <td style={{ padding: '12px 0' }}>{row.chest}"</td>
                  <td style={{ padding: '12px 0' }}>{row.shoulder}"</td>
                  <td style={{ padding: '12px 0' }}>{row.length}"</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Women Table */}
        {activeTab === 'Women' && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Size', 'Bust', 'Waist', 'Hip'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px 12px 0', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--dust)', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {womenSizes.map((row) => (
                <tr key={row.size} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 0', fontWeight: 500 }}>{row.size}</td>
                  <td style={{ padding: '12px 0' }}>{row.bust}"</td>
                  <td style={{ padding: '12px 0' }}>{row.waist}"</td>
                  <td style={{ padding: '12px 0' }}>{row.hip}"</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Kids Table */}
        {activeTab === 'Kids' && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Size', 'Age', 'Height', 'Chest'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px 12px 0', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--dust)', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {kidsSizes.map((row) => (
                <tr key={row.size} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 0', fontWeight: 500 }}>{row.size}</td>
                  <td style={{ padding: '12px 0' }}>{row.age}</td>
                  <td style={{ padding: '12px 0' }}>{row.height}</td>
                  <td style={{ padding: '12px 0' }}>{row.chest}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
