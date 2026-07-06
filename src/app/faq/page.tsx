import type { Metadata } from 'next';
import Script from 'next/script';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | QOTN',
  description:
    'Answers to common questions about QOTN — shipping, returns, sizing, cotton quality, custom stitching, and more.',
  alternates: { canonical: 'https://qotn.in/faq' },
  openGraph: {
    title: 'FAQs | QOTN',
    description: 'Everything you need to know about ordering, shipping, and returns at QOTN.',
    url: 'https://qotn.in/faq',
  },
};

const faqs = [
  {
    question: 'What does QOTN stand for?',
    answer:
      'QOTN stands for "Queen of the Night" — inspired by the rare cotton flower that blooms only at night, symbolising the understated luxury of pure cotton.',
  },
  {
    question: 'Is all your clothing 100% pure cotton?',
    answer:
      'Yes, without exception. Every fabric we use is 100% pure cotton — no polyester, no elastane, no blends. We test every batch before it enters our supply chain.',
  },
  {
    question: 'What types of cotton do you use?',
    answer:
      'We primarily use BCI (Better Cotton Initiative) certified cotton, including Poplin, Voile, Cambric, and Mul cotton depending on the garment. Each product page lists the specific fabric used.',
  },
  {
    question: 'How long does delivery take?',
    answer:
      'Standard delivery takes 5–7 business days across India. Cash on Delivery (COD) orders also take 5–7 business days. We currently ship only within India.',
  },
  {
    question: 'Is there free shipping?',
    answer:
      'Yes! Orders above ₹1,499 qualify for free standard delivery. Orders below ₹1,499 carry a flat ₹99 shipping fee. COD orders have an additional handling charge of ₹50.',
  },
  {
    question: 'Do you offer Cash on Delivery (COD)?',
    answer:
      'Yes. Select "Cash on Delivery" at checkout. A small OTP verification is sent to your email to confirm the order — this helps us ensure genuine deliveries and reduce failed attempts.',
  },
  {
    question: 'What is your return and exchange policy?',
    answer:
      'We accept returns within 24 hours of delivery for items that arrive damaged or with a manufacturing defect. No returns are accepted for correctly delivered items or custom stitched orders. Contact us at Helloqotn@gmail.com with your order number and photos.',
  },
  {
    question: 'How do I find the right size?',
    answer:
      'Visit our Size Guide page for detailed measurements. As a general rule, QOTN garments are cut slightly relaxed — if you are between sizes, size down for a fitted look or size up for a relaxed fit. Cotton also softens and relaxes slightly after the first wash.',
  },
  {
    question: 'What is custom stitching?',
    answer:
      'Custom stitching means we tailor the garment to your measurements before shipping. On eligible products you will see a "Custom Stitch" button on the product page. It adds ₹249 per piece and takes an extra 2–3 business days.',
  },
  {
    question: 'How should I wash and care for cotton clothing?',
    answer:
      'Machine wash in cold water (30°C) on a gentle cycle. Avoid hot water as it can shrink cotton. Dry in shade — direct sunlight can fade colours. Iron on medium heat while slightly damp for best results. Do not tumble dry on high heat.',
  },
  {
    question: 'Will the colour fade after washing?',
    answer:
      'Natural cotton dyes are inherently less saturated than synthetic dyes, and slight softening of colour is normal after a few washes. This is a sign of authentic pure cotton. Washing in cold water and avoiding harsh detergents will preserve the colour longer.',
  },
  {
    question: 'Can I track my order?',
    answer:
      'Yes. Once your order is dispatched, you will receive a shipping confirmation email with the tracking number. You can also view your orders at qotn.in/orders after logging in.',
  },
  {
    question: 'Do you ship outside India?',
    answer:
      'Not currently. We ship only within India. International shipping is something we are actively working towards — follow us on Instagram @qotn.in for updates.',
  },
  {
    question: 'How do I contact customer support?',
    answer:
      'Email us at Helloqotn@gmail.com. We aim to respond within 24 hours on business days.',
  },
];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: f.answer,
    },
  })),
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://qotn.in' },
    { '@type': 'ListItem', position: 2, name: 'FAQ', item: 'https://qotn.in/faq' },
  ],
};

export default function FAQPage() {
  return (
    <>
      <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Script id="faq-breadcrumb" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div style={{ backgroundColor: 'var(--cream)', minHeight: '100vh' }}>
        {/* Hero */}
        <div style={{ backgroundColor: 'var(--black)', padding: '60px 24px', textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(28px, 6vw, 48px)', fontWeight: 300, letterSpacing: '0.10em', color: 'var(--cream)', textTransform: 'uppercase', marginBottom: 12 }}>
            Frequently Asked Questions
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(245,240,232,0.55)', letterSpacing: '0.06em', maxWidth: 480, margin: '0 auto' }}>
            Everything you need to know about QOTN, cotton, and your order.
          </p>
        </div>

        {/* Content */}
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px 80px' }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 40, fontSize: 11, color: 'var(--dust)', letterSpacing: '0.06em' }}>
            <Link href="/" style={{ color: 'var(--dust)', textDecoration: 'none' }}>Home</Link>
            <span>/</span>
            <span style={{ color: 'var(--black)' }}>FAQ</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{ borderBottom: '1px solid var(--border)', padding: '24px 0' }}>
                <h2 style={{ fontSize: 15, fontWeight: 500, marginBottom: 10, lineHeight: 1.5, color: 'var(--black)' }}>
                  {faq.question}
                </h2>
                <p style={{ fontSize: 14, color: 'var(--dust)', lineHeight: 1.75 }}>
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 48, padding: '28px 24px', border: '1px solid var(--border)', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: 'var(--dust)', marginBottom: 16, lineHeight: 1.6 }}>
              Still have a question? We&rsquo;re happy to help.
            </p>
            <Link href="/contact">
              <button style={{ padding: '12px 32px', background: 'var(--black)', color: 'var(--cream)', border: 'none', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                Contact Us
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
