'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp } from 'lucide-react';

const sections = [
  {
    title: 'SHOP',
    links: [
      { href: '/men', label: 'Men' },
      { href: '/women', label: 'Women' },
      { href: '/kids', label: 'Kids' },
      { href: '/men?isNew=true', label: 'New Arrivals' },
    ],
  },
  {
    title: 'HELP',
    links: [
      { href: '/about', label: 'About Us' },
      { href: '/contact', label: 'Contact' },
      { href: '/size-guide', label: 'Size Guide' },
      { href: '/return-policy', label: 'Return Policy' },
      { href: '/shipping-policy', label: 'Shipping Policy' },
    ],
  },
  {
    title: 'LEGAL',
    links: [
      { href: '/terms-and-conditions', label: 'Terms & Conditions' },
      { href: '/privacy-policy', label: 'Privacy Policy' },
    ],
  },
];

function AccordionSection({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid #2A2A2A' }}>
      <button onClick={() => setOpen(!open)}
        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0', height: 48, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', minHeight: 'unset' }}>
        <span style={{ fontSize: 11, letterSpacing: '0.12em', fontWeight: 500, textTransform: 'uppercase', color: 'rgba(245,240,232,0.5)' }}>{title}</span>
        {open ? <ChevronUp size={14} color="rgba(245,240,232,0.4)" /> : <ChevronDown size={14} color="rgba(245,240,232,0.4)" />}
      </button>
      {open && (
        <div style={{ paddingBottom: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {links.map((link) => (
            <Link key={link.label} href={link.href}
              style={{ fontSize: 13, color: 'rgba(245,240,232,0.7)', textDecoration: 'none', minHeight: 'unset', paddingLeft: 0 }}>
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MobileFooter() {
  return (
    <footer style={{ backgroundColor: '#1A1A1A', color: 'var(--cream)', padding: '32px 16px', paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 16px))' }}>
      <div style={{ marginBottom: 20 }}>
        <p className="brand-wordmark" style={{ fontSize: 24, marginBottom: 4, color: '#F5F0E8' }}>QOTN</p>
        <p style={{ fontSize: 12, color: 'rgba(245,240,232,0.5)', letterSpacing: '0.06em' }}>Pure Cotton. Nothing Else.</p>
      </div>

      <a href="https://www.instagram.com/qotn.in?igsh=MWcyaTl2bjRqenppNg==" target="_blank" rel="noreferrer"
        style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(245,240,232,0.75)', fontSize: 13, textDecoration: 'none', marginBottom: 24, minHeight: 'unset' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
        @qotn.in
      </a>

      <div style={{ height: 1, background: '#2A2A2A', marginBottom: 4 }} />

      {sections.map((s) => (
        <AccordionSection key={s.title} title={s.title} links={s.links} />
      ))}

      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <p style={{ fontSize: 11, color: 'rgba(245,240,232,0.3)', marginBottom: 4 }}>© 2025 Qotn. All rights reserved.</p>
        <p style={{ fontSize: 11, color: 'rgba(245,240,232,0.3)' }}>Made in India 🇮🇳</p>
      </div>
    </footer>
  );
}
