import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import RootLayoutClient from '@/components/RootLayoutClient';

export const metadata: Metadata = {
  metadataBase: new URL('https://qotn.in'),

  title: {
    default: 'QOTN — Pure Cotton Clothing for Men, Women & Kids | Made in India',
    template: '%s | QOTN',
  },
  description:
    'Shop 100% pure cotton clothing online. No blends, no shortcuts. Premium cotton kurtas, dresses, shirts and more for men, women and kids. Free shipping above ₹1499. Made in India.',
  keywords:
    'pure cotton clothing india, cotton kurta online, cotton dress women, cotton shirt men, D2C cotton brand, buy cotton clothes online india, handblock print cotton, QOTN',

  applicationName: 'QOTN',
  authors: [{ name: 'QOTN', url: 'https://qotn.in' }],
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  creator: 'QOTN',
  publisher: 'QOTN',

  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },

  alternates: {
    canonical: 'https://qotn.in',
  },

  openGraph: {
    title: 'QOTN — Pure Cotton Clothing for Men, Women & Kids | Made in India',
    description:
      'Shop 100% pure cotton clothing. No blends, no shortcuts. Free shipping above ₹1499. Made in India.',
    url: 'https://qotn.in',
    siteName: 'QOTN',
    type: 'website',
    locale: 'en_IN',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'QOTN — Pure Cotton. Nothing Else.',
        type: 'image/png',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    site: '@shopqotn',
    creator: '@shopqotn',
    title: 'QOTN — Pure Cotton. Nothing Else.',
    description: 'Shop 100% pure cotton clothing for men, women and kids. Made in India.',
    images: [{ url: '/twitter-card.png', alt: 'QOTN — Pure Cotton. Nothing Else.' }],
  },

  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: { url: '/apple-touch-icon.png' },
    shortcut: '/favicon.ico',
  },

  manifest: '/site.webmanifest',

  other: {
    'msapplication-TileColor': '#F5F0E8',
    'msapplication-TileImage': '/mstile-144x144.png',
    'msapplication-config': '/browserconfig.xml',
    'theme-color': '#1A1A1A',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ClothingStore',
  name: 'QOTN',
  description: 'Pure cotton clothing for men, women and kids. Made in India.',
  url: 'https://qotn.in',
  logo: 'https://qotn.in/logo-square-512.png',
  image: 'https://qotn.in/og-image.png',
  email: 'Helloqotn@gmail.com',
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'Helloqotn@gmail.com',
    contactType: 'customer service',
  },
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Ward No. 36, Saipura, Behind Homeopathic University',
    addressLocality: 'Sanganer, Jaipur',
    addressRegion: 'Rajasthan',
    postalCode: '302029',
    addressCountry: 'IN',
  },
  sameAs: ['https://www.instagram.com/shopqotn'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#1A1A1A" />
        <meta name="msapplication-TileColor" content="#F5F0E8" />
        <meta name="msapplication-TileImage" content="/mstile-144x144.png" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <link rel="mask-icon" href="/logo-cream-on-black.png" color="#1A1A1A" />
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
