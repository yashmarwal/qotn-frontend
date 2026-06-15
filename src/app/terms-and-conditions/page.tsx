import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms & Conditions | QOTN',
  description: 'Terms and conditions for using qotn.in — QOTN pure cotton clothing.',
};

const sections = [
  {
    heading: '1. Acceptance of Terms',
    body: `By accessing and using qotn.in, you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our website.`,
  },
  {
    heading: '2. About QOTN',
    body: `QOTN is an Indian D2C pure cotton apparel brand selling 100% pure cotton clothing for men, women and kids through our website qotn.in. We are based in India and all our products are made in India.`,
  },
  {
    heading: '3. Products',
    body: `3.1 All our products are made from 100% pure cotton. We do not use synthetic blends in any of our products.\n\n3.2 Product colors may slightly vary from what is displayed on screen due to photography lighting and monitor settings.\n\n3.3 We reserve the right to discontinue any product at any time.\n\n3.4 Prices are subject to change without notice.`,
  },
  {
    heading: '4. Orders & Payment',
    body: `4.1 All orders are subject to availability and confirmation.\n\n4.2 We accept UPI, Credit/Debit Cards, Net Banking, and Cash on Delivery.\n\n4.3 COD orders carry an additional charge of ₹50.\n\n4.4 We reserve the right to cancel any order at our discretion with a full refund.\n\n4.5 In case of payment failure, please do not place a duplicate order before confirming with us at hello@qotn.in.`,
  },
  {
    heading: '5. Custom Stitching',
    body: `5.1 Custom stitching is available for an additional charge of ₹249 per garment.\n\n5.2 Custom stitched orders are made exclusively based on your measurements and cannot be returned or exchanged.\n\n5.3 Please ensure your measurements are accurate before placing a custom stitching order. QOTN is not responsible for incorrect measurements provided by the customer.\n\n5.4 Custom stitching orders require 3–5 additional business days for production.`,
  },
  {
    heading: '6. Returns & Refunds',
    body: `6.1 We accept returns only on damaged or defective items within 24 hours of delivery.\n\n6.2 Custom stitched orders are non-returnable.\n\n6.3 Refunds are processed within 5–7 business days.\n\n6.4 Please refer to our Return Policy for complete details.`,
  },
  {
    heading: '7. Shipping',
    body: `Please refer to our Shipping Policy for complete details on delivery timelines, charges, and tracking.`,
  },
  {
    heading: '8. User Accounts',
    body: `8.1 You are responsible for maintaining the confidentiality of your account credentials.\n\n8.2 You agree to provide accurate and complete information when creating an account.\n\n8.3 We reserve the right to terminate accounts that violate these terms.`,
  },
  {
    heading: '9. Intellectual Property',
    body: `All content on qotn.in including text, images, logos, and brand elements are the intellectual property of QOTN and may not be used without written permission.`,
  },
  {
    heading: '10. Privacy',
    body: `We respect your privacy and handle your personal data in accordance with our Privacy Policy. We do not sell your personal information to third parties.`,
  },
  {
    heading: '11. Limitation of Liability',
    body: `QOTN shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or website. Our maximum liability shall not exceed the value of the order in question.`,
  },
  {
    heading: '12. Governing Law',
    body: `These terms are governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts in India.`,
  },
  {
    heading: '13. Contact',
    body: `For any questions regarding these terms:\nEmail: hello@qotn.in\nWebsite: qotn.in`,
  },
];

export default function TermsPage() {
  return (
    <div style={{ background: '#F5F0E8', minHeight: '100vh', fontFamily: 'DM Sans, sans-serif', color: '#1A1A1A' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: 'clamp(48px,8vw,80px) 24px' }}>
        <Link href="/" style={{ fontSize: 13, color: '#9E9987', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 40 }}>
          ← Back
        </Link>

        <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9E9987', marginBottom: 12 }}>Legal</p>
        <h1 style={{ fontSize: 32, fontWeight: 300, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>Terms & Conditions</h1>
        <p style={{ fontSize: 14, color: '#9E9987', marginBottom: 8 }}>Please read these terms carefully before using qotn.in</p>
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
          <Link href="/return-policy" style={{ fontSize: 13, color: '#1A1A1A', textDecoration: 'underline' }}>Return Policy</Link>
          <Link href="/shipping-policy" style={{ fontSize: 13, color: '#1A1A1A', textDecoration: 'underline' }}>Shipping Policy</Link>
          <Link href="/privacy-policy" style={{ fontSize: 13, color: '#1A1A1A', textDecoration: 'underline' }}>Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
}
