import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Shipping Policy | QOTN',
  description: 'QOTN shipping policy — free shipping above ₹1499, standard and express delivery across India.',
};

const deliveryCards = [
  {
    name: 'Standard Delivery',
    price: 'FREE above ₹1499',
    priceAlt: '₹99 below ₹1499',
    time: '5–7 business days',
    area: 'Pan India',
    highlight: true,
  },
  {
    name: 'Cash on Delivery',
    price: '+₹50 extra charge',
    priceAlt: null,
    time: '5–7 business days',
    area: 'Select pincodes',
    highlight: false,
  },
];

const sections = [
  {
    heading: 'Order Processing',
    body: `All orders are processed within 24 hours of placement (excluding Sundays and public holidays). You will receive a confirmation email with tracking details once your order is shipped.`,
  },
  {
    heading: 'Tracking Your Order',
    body: `Once shipped, you will receive a tracking number via email and WhatsApp. You can track your order at the shipping partner's website or through your QOTN account under My Orders.`,
  },
  {
    heading: 'Delivery Attempts',
    body: `Our delivery partner will attempt delivery up to 3 times. If all 3 attempts fail, the order will be returned to us. In such cases, reshipping charges will apply.`,
  },
  {
    heading: 'Damaged in Transit',
    body: `If your order arrives damaged due to transit, please contact us within 24 hours at Helloqotn@gmail.com with photos. We will arrange a replacement at no extra cost.`,
  },
  {
    heading: 'Custom Stitching Orders',
    body: `Custom stitched orders require an additional 3–5 business days for production before shipping. Total delivery time for custom orders: 8–12 business days.`,
  },
];

export default function ShippingPolicyPage() {
  return (
    <div style={{ background: '#F5F0E8', minHeight: '100vh', fontFamily: 'DM Sans, sans-serif', color: '#1A1A1A' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: 'clamp(48px,8vw,80px) 24px' }}>
        <Link href="/" style={{ fontSize: 13, color: '#9E9987', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 40 }}>
          ← Back
        </Link>

        <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9E9987', marginBottom: 12 }}>Policies</p>
        <h1 style={{ fontSize: 32, fontWeight: 300, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>Shipping Policy</h1>
        <p style={{ fontSize: 14, color: '#9E9987', marginBottom: 8 }}>We deliver across India.</p>
        <p style={{ fontSize: 11, color: '#9E9987', marginBottom: 48 }}>Last updated: June 2025</p>

        {/* Delivery options */}
        <h2 style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 20 }}>Delivery Options</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 48 }}>
          {deliveryCards.map((card) => (
            <div key={card.name} style={{ border: card.highlight ? '1px solid #1A1A1A' : '1px solid rgba(26,26,26,0.15)', padding: '24px 20px' }}>
              {card.highlight && (
                <span style={{ fontSize: 9, letterSpacing: '0.10em', textTransform: 'uppercase', background: '#1A1A1A', color: '#F5F0E8', padding: '3px 8px', display: 'inline-block', marginBottom: 14 }}>
                  Most Popular
                </span>
              )}
              <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 12 }}>{card.name}</p>
              <p style={{ fontSize: 18, fontWeight: 300, color: '#1A1A1A', marginBottom: 2 }}>{card.price}</p>
              {card.priceAlt && <p style={{ fontSize: 12, color: '#9E9987', marginBottom: 12 }}>{card.priceAlt}</p>}
              <div style={{ height: 1, background: 'rgba(26,26,26,0.1)', margin: '14px 0' }} />
              <p style={{ fontSize: 12, color: '#9E9987', marginBottom: 4 }}>{card.time}</p>
              <p style={{ fontSize: 12, color: '#9E9987' }}>{card.area}</p>
            </div>
          ))}
        </div>

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
