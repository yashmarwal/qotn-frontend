import Link from 'next/link';
import { AtSign } from 'lucide-react';

const shopLinks = [
  { href: '/men', label: 'Men' },
  { href: '/women', label: 'Women' },
  { href: '/kids', label: 'Kids' },
  { href: '/men?isNew=true', label: 'New Arrivals' },
];

const helpLinks = [
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/size-guide', label: 'Size Guide' },
  { href: '/return-policy', label: 'Return Policy' },
  { href: '/shipping-policy', label: 'Shipping Policy' },
  { href: '/terms-and-conditions', label: 'Terms & Conditions' },
  { href: '/privacy-policy', label: 'Privacy Policy' },
];

const linkStyle = {
  fontSize: 14, color: 'var(--cream)', textDecoration: 'none',
  opacity: 0.8, transition: 'opacity 0.2s',
} as const;

export default function DesktopFooter() {
  return (
    <footer style={{ backgroundColor: 'var(--black)', color: 'var(--cream)' }}>
      <div
        style={{ maxWidth: 1400, margin: '0 auto', padding: '80px 40px 48px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 48 }}
        className="desktop-footer-grid"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <span className="brand-wordmark" style={{ fontSize: 20 }}>QOTN</span>
          <p style={{ fontSize: 11, letterSpacing: '0.12em', color: 'rgba(245,240,232,0.5)', textTransform: 'uppercase' }}>
            Pure Cotton. Nothing Else.
          </p>
          <p style={{ fontSize: 12, color: 'rgba(245,240,232,0.4)', marginTop: 'auto' }}>© 2025 Qotn. All rights reserved.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <span style={{ fontSize: 11, letterSpacing: '0.12em', fontWeight: 500, textTransform: 'uppercase', color: 'rgba(245,240,232,0.5)' }}>Shop</span>
          {shopLinks.map((link) => (
            <Link key={link.label} href={link.href} style={linkStyle}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.8')}>
              {link.label}
            </Link>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <span style={{ fontSize: 11, letterSpacing: '0.12em', fontWeight: 500, textTransform: 'uppercase', color: 'rgba(245,240,232,0.5)' }}>Help</span>
          {helpLinks.map((link) => (
            <Link key={link.label} href={link.href} style={linkStyle}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.8')}>
              {link.label}
            </Link>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <span style={{ fontSize: 11, letterSpacing: '0.12em', fontWeight: 500, textTransform: 'uppercase', color: 'rgba(245,240,232,0.5)' }}>Follow</span>
          <a href="https://www.instagram.com/shopqotn" target="_blank" rel="noopener noreferrer"
            style={{ ...linkStyle, display: 'flex', alignItems: 'center', gap: 8 }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.8')}>
            <AtSign size={14} strokeWidth={1.5} /> @shopqotn
          </a>
          <span style={{ fontSize: 14, opacity: 0.8 }}>qotn.in</span>
          <div style={{ marginTop: 16 }}>
            <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.5)', marginBottom: 10 }}>Newsletter</p>
            <div style={{ display: 'flex' }}>
              <input type="email" placeholder="your@email.com"
                style={{ flex: 1, padding: '10px 14px', background: 'rgba(245,240,232,0.1)', border: '1px solid rgba(245,240,232,0.2)', borderRight: 'none', color: 'var(--cream)', fontSize: 12, outline: 'none' }} />
              <button style={{ padding: '10px 14px', background: 'var(--cream)', color: 'var(--black)', border: 'none', fontSize: 11, letterSpacing: '0.08em', fontWeight: 500, cursor: 'pointer' }}>
                JOIN
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(245,240,232,0.15)', padding: '20px 40px', textAlign: 'center' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.4)' }}>
          Made in India · 100% Cotton · Nothing Else.
        </p>
      </div>
    </footer>
  );
}
