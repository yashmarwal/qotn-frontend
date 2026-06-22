import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Return Policy | QOTN',
  description: 'QOTN return policy — 24 hour return window on damaged items only. No returns on custom stitched orders.',
  alternates: { canonical: 'https://qotn.in/return-policy' },
};

const sections = [
  {
    heading: '24-Hour Return Window',
    body: `We offer a 24-hour return window from the time of delivery. If you wish to return an item, you must contact us within 24 hours of receiving your order. Returns requested after 24 hours will not be accepted under any circumstances.`,
  },
  {
    heading: 'Damaged Items Only',
    body: `We only accept returns for items that arrive damaged or defective. If your item arrives in a damaged condition, please email us at Helloqotn@gmail.com within 24 hours with:\n\n• Your order number\n• Clear photos of the damaged item\n• A brief description of the damage\n\nWe will review your request and respond within 24 hours.`,
  },
  {
    heading: 'No Returns on Custom Stitched Orders',
    body: `All custom stitched orders are made exclusively for you based on your measurements. These are non-returnable and non-refundable under any circumstances. Please double-check your measurements before placing a custom stitching order.`,
  },
  {
    heading: 'Non-Returnable Items',
    body: `The following cannot be returned:\n\n• Custom stitched garments\n• Items returned after 24 hours of delivery\n• Items that have been worn, washed, or altered\n• Items without original tags and packaging\n• Sale or discounted items`,
  },
  {
    heading: 'Refund Process',
    body: `Once your return is approved, we will process your refund within 5–7 business days to your original payment method. COD orders will be refunded via bank transfer — please provide your bank details when requesting a return.`,
  },
  {
    heading: 'Contact Us',
    body: `For return requests: Helloqotn@gmail.com\nPlease mention your order number in the subject line.`,
  },
];

export default function ReturnPolicyPage() {
  return (
    <div style={{ background: '#F5F0E8', minHeight: '100vh', fontFamily: 'DM Sans, sans-serif', color: '#1A1A1A' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: 'clamp(48px,8vw,80px) 24px' }}>
        <Link href="/" style={{ fontSize: 13, color: '#9E9987', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 40 }}>
          ← Back
        </Link>

        <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9E9987', marginBottom: 12 }}>Policies</p>
        <h1 style={{ fontSize: 32, fontWeight: 300, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>Return Policy</h1>
        <p style={{ fontSize: 14, color: '#9E9987', marginBottom: 8 }}>Simple. Honest. Fair.</p>
        <p style={{ fontSize: 11, color: '#9E9987', marginBottom: 48 }}>Last updated: June 2025</p>

        {sections.map((s, i) => (
          <div key={i} style={{ borderTop: '1px solid rgba(26,26,26,0.12)', paddingTop: 32, marginTop: 32 }}>
            <h2 style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 16, color: '#1A1A1A' }}>
              {s.heading}
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: '#1A1A1A', whiteSpace: 'pre-line' }}>{s.body}</p>
          </div>
        ))}

        <div style={{ borderTop: '1px solid rgba(26,26,26,0.12)', marginTop: 40, paddingTop: 32 }}>
          <p style={{ fontSize: 13, color: '#9E9987' }}>
            Questions?{' '}
            <a href="mailto:Helloqotn@gmail.com" style={{ color: '#1A1A1A', textDecoration: 'underline' }}>Helloqotn@gmail.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
