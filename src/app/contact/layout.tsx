import type { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Contact Us — QOTN',
  description:
    'Get in touch with QOTN. We are here to help with orders, custom stitching, returns and all things cotton. Email: Helloqotn@gmail.com | Instagram: @qotn.in',
  alternates: { canonical: 'https://qotn.in/contact' },
  openGraph: {
    title: 'Contact Us — QOTN',
    description: 'Reach QOTN for order support, custom stitching enquiries, and all things cotton.',
    url: 'https://qotn.in/contact',
    images: [{ url: 'https://qotn.in/og-image.png', width: 1200, height: 630, alt: 'Contact QOTN' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@shopqotn',
    title: 'Contact Us — QOTN',
    description: 'Reach QOTN for order support, custom stitching enquiries, and all things cotton.',
    images: ['https://qotn.in/og-image.png'],
  },
};

const contactPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Contact QOTN',
  url: 'https://qotn.in/contact',
  description: 'Get in touch with QOTN for orders, returns, and support.',
  mainEntity: { '@id': 'https://qotn.in/#organization' },
};

const localBusinessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ClothingStore',
  '@id': 'https://qotn.in/#organization',
  name: 'QOTN',
  email: 'Helloqotn@gmail.com',
  url: 'https://qotn.in',
  sameAs: ['https://www.instagram.com/qotn.in'],
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Ward No. 64, Jain Nasiya Road, Near Manohar Palace',
    addressLocality: 'Sanganer, Jaipur',
    addressRegion: 'Rajasthan',
    postalCode: '302033',
    addressCountry: 'IN',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'Helloqotn@gmail.com',
    contactType: 'customer service',
    availableLanguage: ['English', 'Hindi'],
  },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://qotn.in' },
    { '@type': 'ListItem', position: 2, name: 'Contact', item: 'https://qotn.in/contact' },
  ],
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script id="contact-page-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageJsonLd) }} />
      <Script id="contact-local-business" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }} />
      <Script id="contact-breadcrumb" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {children}
    </>
  );
}
