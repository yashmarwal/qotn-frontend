import type { Metadata } from 'next';
import Script from 'next/script';
import { safeJsonLd } from '@/lib/jsonld';

export const metadata: Metadata = {
  title: 'About QOTN — Pure Cotton. Nothing Else. | Made in India',
  description:
    'QOTN is an Indian D2C pure cotton brand. We make 100% cotton clothing for men, women and kids. No blends. No shortcuts. Just pure fabric.',
  alternates: { canonical: 'https://www.qotn.in/about' },
  openGraph: {
    title: 'About QOTN — Pure Cotton. Nothing Else.',
    description: 'QOTN is an Indian D2C pure cotton brand. No blends. No shortcuts.',
    url: 'https://www.qotn.in/about',
    images: [{ url: 'https://www.qotn.in/og-image.png', width: 1200, height: 630, alt: 'About QOTN' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@shopqotn',
    title: 'About QOTN — Pure Cotton. Nothing Else.',
    description: 'QOTN is an Indian D2C pure cotton brand. No blends. No shortcuts.',
    images: ['https://www.qotn.in/og-image.png'],
  },
};

const aboutJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'About QOTN',
  url: 'https://www.qotn.in/about',
  description: 'QOTN is an Indian D2C pure cotton clothing brand. 100% cotton, no blends. Made in Jaipur, India.',
  mainEntity: { '@id': 'https://www.qotn.in/#organization' },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.qotn.in' },
    { '@type': 'ListItem', position: 2, name: 'About', item: 'https://www.qotn.in/about' },
  ],
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script id="about-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(aboutJsonLd) }} />
      <Script id="about-breadcrumb" type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }} />
      {children}
    </>
  );
}
