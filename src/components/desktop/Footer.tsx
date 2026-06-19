import Link from 'next/link';

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
          <a href="https://www.instagram.com/qotn.in?igsh=MWcyaTl2bjRqenppNg==" target="_blank" rel="noopener noreferrer"
            style={{ ...linkStyle, display: 'flex', alignItems: 'center', gap: 8 }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.8')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
            @qotn.in
          </a>
          <span style={{ fontSize: 14, opacity: 0.8 }}>qotn.in</span>
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
