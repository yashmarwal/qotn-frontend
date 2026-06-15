import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import RootLayoutClient from '@/components/RootLayoutClient';

export const metadata: Metadata = {
  title: 'QOTN — Pure Cotton Clothing for Men, Women & Kids | Made in India',
  description:
    'Shop 100% pure cotton clothing online. No blends, no shortcuts. Premium cotton kurtas, dresses, shirts and more for men, women and kids. Free shipping above ₹999. Made in India.',
  keywords:
    'pure cotton clothing india, cotton kurta online, cotton dress women, cotton shirt men, D2C cotton brand, buy cotton clothes online india, handblock print cotton',
  openGraph: {
    title: 'QOTN — Pure Cotton Clothing for Men, Women & Kids | Made in India',
    description:
      'Shop 100% pure cotton clothing. No blends, no shortcuts. Free shipping above ₹999. Made in India.',
    url: 'https://qotn.in',
    siteName: 'QOTN',
    type: 'website',
    images: [{ url: 'https://qotn.in/og-image.jpg', width: 1200, height: 630, alt: 'QOTN — Pure Cotton' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QOTN — Pure Cotton. Nothing Else.',
    description: 'Shop 100% pure cotton clothing for men, women and kids. Made in India.',
    images: ['https://qotn.in/og-image.jpg'],
  },
  robots: { index: true, follow: true },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ClothingStore',
  name: 'QOTN',
  description: 'Pure cotton clothing for men, women and kids. Made in India.',
  url: 'https://qotn.in',
  logo: 'https://qotn.in/logo.png',
  contactPoint: { '@type': 'ContactPoint', email: 'hello@qotn.in', contactType: 'customer service' },
  address: { '@type': 'PostalAddress', addressCountry: 'IN' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script
          id="schema-org"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <RootLayoutClient>{children}</RootLayoutClient>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
