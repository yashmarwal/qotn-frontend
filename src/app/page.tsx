import type { Metadata } from 'next';
import HomePageClient from './HomePageClient';

export const metadata: Metadata = {
  title: 'QOTN — Pure Cotton Clothing for Men, Women & Kids | Made in India',
  description:
    'Shop 100% pure cotton clothing online. No blends, no shortcuts. Premium cotton kurtas, dresses, shirts and more for men, women and kids. Free shipping above ₹1499. COD available. Made in India.',
  alternates: { canonical: 'https://qotn.in' },
  openGraph: {
    title: 'QOTN — Pure Cotton Clothing for Men, Women & Kids | Made in India',
    description: 'Shop 100% pure cotton clothing. No blends, no shortcuts. Free shipping above ₹1499. Made in India.',
    url: 'https://qotn.in',
    siteName: 'QOTN',
    type: 'website',
    locale: 'en_IN',
    images: [{ url: 'https://qotn.in/og-image.png', width: 1200, height: 630, alt: 'QOTN — Pure Cotton. Nothing Else.' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@shopqotn',
    creator: '@shopqotn',
    title: 'QOTN — Pure Cotton. Nothing Else.',
    description: 'Shop 100% pure cotton clothing for men, women and kids. Made in India.',
    images: [{ url: 'https://qotn.in/og-image.png', alt: 'QOTN — Pure Cotton. Nothing Else.' }],
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
