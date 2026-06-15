'use client';

import { useState } from 'react';

const tabs = ['Men', 'Women', 'Kids'] as const;
type Tab = (typeof tabs)[number];

const menSizes = [
  { size: 'XS', chest: '34–35', waist: '28–29', hips: '35–36', height: '5\'4"–5\'6"' },
  { size: 'S',  chest: '36–37', waist: '30–31', hips: '37–38', height: '5\'6"–5\'8"' },
  { size: 'M',  chest: '38–40', waist: '32–33', hips: '39–40', height: '5\'8"–5\'10"' },
  { size: 'L',  chest: '41–43', waist: '34–35', hips: '41–43', height: '5\'10"–6\'0"' },
  { size: 'XL', chest: '44–46', waist: '36–38', hips: '44–46', height: '6\'0"–6\'2"' },
  { size: 'XXL',chest: '47–49', waist: '39–41', hips: '47–49', height: '6\'2"–6\'4"' },
];

const womenSizes = [
  { size: 'XS', chest: '32–33', waist: '24–25', hips: '34–35', height: '4\'11"–5\'2"' },
  { size: 'S',  chest: '34–35', waist: '26–27', hips: '36–37', height: '5\'2"–5\'4"' },
  { size: 'M',  chest: '36–38', waist: '28–29', hips: '38–40', height: '5\'4"–5\'6"' },
  { size: 'L',  chest: '39–41', waist: '30–32', hips: '41–43', height: '5\'6"–5\'8"' },
  { size: 'XL', chest: '42–44', waist: '33–35', hips: '44–46', height: '5\'8"–5\'10"' },
  { size: 'XXL',chest: '45–48', waist: '36–39', hips: '47–50', height: '5\'10"–6\'0"' },
];

const kidsSizes = [
  { size: '2Y',  chest: '21', waist: '20', hips: '22', height: '33–35"' },
  { size: '3Y',  chest: '22', waist: '21', hips: '23', height: '36–38"' },
  { size: '4Y',  chest: '23', waist: '22', hips: '24', height: '39–41"' },
  { size: '5Y',  chest: '24', waist: '23', hips: '25', height: '42–44"' },
  { size: '6Y',  chest: '25', waist: '24', hips: '26', height: '45–47"' },
  { size: '8Y',  chest: '27', waist: '25', hips: '28', height: '50–52"' },
  { size: '10Y', chest: '29', waist: '26', hips: '30', height: '54–56"' },
];

const sizeData: Record<Tab, typeof menSizes> = { Men: menSizes, Women: womenSizes, Kids: kidsSizes };

export default function SizeGuidePage() {
  const [activeTab, setActiveTab] = useState<Tab>('Men');
  const rows = sizeData[activeTab];

  return (
    <div style={{ background: '#F5F0E8', minHeight: '100vh', padding: '80px 24px', fontFamily: 'DM Sans, sans-serif', color: '#1A1A1A' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9E9987', marginBottom: 12 }}>
          Fit Guide
        </p>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 300, marginBottom: 12 }}>Size Guide</h1>
        <p style={{ fontSize: 14, color: '#9E9987', marginBottom: 40, lineHeight: 1.7 }}>
          All measurements in inches. If you are between sizes, we recommend sizing up.
        </p>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(26,26,26,0.15)', marginBottom: 32 }}>
          {tabs.map((t) => (
            <button key={t} onClick={() => setActiveTab(t)}
              style={{
                padding: '10px 24px', background: 'none', border: 'none', borderBottom: activeTab === t ? '2px solid #1A1A1A' : '2px solid transparent',
                marginBottom: -1, fontSize: 13, letterSpacing: '0.06em', color: activeTab === t ? '#1A1A1A' : '#9E9987',
                cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: activeTab === t ? 500 : 400,
              }}>
              {t}
            </button>
          ))}
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#1A1A1A', color: '#F5F0E8' }}>
                {['Size', 'Chest', 'Waist', 'Hips', 'Height'].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.size} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(26,26,26,0.04)' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 500 }}>{row.size}</td>
                  <td style={{ padding: '14px 16px', color: '#555' }}>{row.chest}</td>
                  <td style={{ padding: '14px 16px', color: '#555' }}>{row.waist}</td>
                  <td style={{ padding: '14px 16px', color: '#555' }}>{row.hips}</td>
                  <td style={{ padding: '14px 16px', color: '#555' }}>{row.height}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 32, padding: '20px 24px', background: 'rgba(26,26,26,0.05)', borderLeft: '2px solid #1A1A1A' }}>
          <p style={{ fontSize: 13, color: '#555', lineHeight: 1.8 }}>
            All measurements in inches. For a perfect custom fit, use our{' '}
            <span style={{ color: '#1A1A1A', fontWeight: 500 }}>Custom Stitching</span> option available on every product page.
          </p>
        </div>
      </div>
    </div>
  );
}
