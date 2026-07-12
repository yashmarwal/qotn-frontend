import type { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Size Guide — Find Your Perfect Cotton Fit | QOTN',
  description:
    'Use our size guide to find the perfect fit for men, women and kids cotton clothing at QOTN. Detailed measurement tips and size charts for every garment.',
  alternates: { canonical: 'https://qotn.in/size-guide' },
  openGraph: {
    title: 'Size Guide — Find Your Perfect Cotton Fit | QOTN',
    description: 'Detailed size charts and measurement tips for QOTN pure cotton clothing — men, women and kids.',
    url: 'https://qotn.in/size-guide',
    images: [{ url: 'https://qotn.in/og-image.png', width: 1200, height: 630, alt: 'QOTN Size Guide' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@shopqotn',
    title: 'Size Guide — Find Your Perfect Cotton Fit | QOTN',
    description: 'Detailed size charts and measurement tips for QOTN pure cotton clothing.',
    images: ['https://qotn.in/og-image.png'],
  },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://qotn.in' },
    { '@type': 'ListItem', position: 2, name: 'Size Guide', item: 'https://qotn.in/size-guide' },
  ],
};

const webPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Size Guide — QOTN',
  url: 'https://qotn.in/size-guide',
  description: 'Size charts for men, women, and kids QOTN cotton clothing.',
  publisher: { '@id': 'https://qotn.in/#organization' },
  speakable: {
    '@type': 'SpeakableSpecification',
    cssSelector: ['h1', 'h2', 'table'],
  },
};

export default function SizeGuideLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script id="size-guide-breadcrumb" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <Script id="size-guide-page" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }} />
      {children}
    </>
  );
}
