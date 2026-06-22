import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | QOTN',
  description: 'QOTN privacy policy — how we collect, use and protect your personal information.',
  alternates: { canonical: 'https://qotn.in/privacy-policy' },
};

const sections = [
  {
    heading: '1. Information We Collect',
    body: `We collect the following information when you use qotn.in:\n\n• Name, email address, phone number when you create an account\n• Delivery address when you place an order\n• Payment information (processed securely — we do not store card details)\n• Order history and preferences\n• Device and browser information for analytics`,
  },
  {
    heading: '2. How We Use Your Information',
    body: `We use your information to:\n\n• Process and deliver your orders\n• Send order confirmations and shipping updates\n• Provide customer support\n• Send promotional emails (you can unsubscribe anytime)\n• Improve our website and products`,
  },
  {
    heading: '3. Information Sharing',
    body: `We do not sell your personal information. We share data only with:\n\n• Shipping partners to deliver your orders\n• Payment gateways to process payments (Razorpay)\n• Email service providers to send transactional emails`,
  },
  {
    heading: '4. Data Security',
    body: `We use industry-standard encryption and security measures to protect your personal information. Passwords are stored as encrypted hashes and never in plain text.`,
  },
  {
    heading: '5. Cookies',
    body: `We use cookies to improve your browsing experience and remember your preferences. You can disable cookies in your browser settings but some features may not work correctly.`,
  },
  {
    heading: '6. Your Rights',
    body: `You have the right to:\n\n• Access your personal data\n• Request correction of incorrect data\n• Request deletion of your account and data\n• Unsubscribe from marketing emails\n\nTo exercise these rights, email us at Helloqotn@gmail.com`,
  },
  {
    heading: '7. Contact',
    body: `For privacy related queries: Helloqotn@gmail.com`,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div style={{ background: '#F5F0E8', minHeight: '100vh', fontFamily: 'DM Sans, sans-serif', color: '#1A1A1A' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: 'clamp(48px,8vw,80px) 24px' }}>
        <Link href="/" style={{ fontSize: 13, color: '#9E9987', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 40 }}>
          ← Back
        </Link>

        <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9E9987', marginBottom: 12 }}>Legal</p>
        <h1 style={{ fontSize: 32, fontWeight: 300, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>Privacy Policy</h1>
        <p style={{ fontSize: 14, color: '#9E9987', marginBottom: 8 }}>Your privacy matters to us.</p>
        <p style={{ fontSize: 11, color: '#9E9987', marginBottom: 48 }}>Last updated: June 2025</p>

        {sections.map((s, i) => (
          <div key={i} style={{ borderTop: '1px solid rgba(26,26,26,0.12)', paddingTop: 32, marginTop: 32 }}>
            <h2 style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 16, color: '#1A1A1A' }}>
              {s.heading}
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: '#1A1A1A', whiteSpace: 'pre-line' }}>{s.body}</p>
          </div>
        ))}

        <div style={{ borderTop: '1px solid rgba(26,26,26,0.12)', marginTop: 40, paddingTop: 32, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <Link href="/terms-and-conditions" style={{ fontSize: 13, color: '#1A1A1A', textDecoration: 'underline' }}>Terms & Conditions</Link>
          <Link href="/return-policy" style={{ fontSize: 13, color: '#1A1A1A', textDecoration: 'underline' }}>Return Policy</Link>
          <Link href="/shipping-policy" style={{ fontSize: 13, color: '#1A1A1A', textDecoration: 'underline' }}>Shipping Policy</Link>
        </div>
      </div>
    </div>
  );
}
