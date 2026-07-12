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

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': ['Organization', 'ClothingStore'],
  '@id': 'https://qotn.in/#organization',
  name: 'QOTN',
  alternateName: 'Quality Of The Nation',
  description: '100% pure cotton clothing for men, women and kids. No blends, no shortcuts. Made in India.',
  url: 'https://qotn.in',
  logo: {
    '@type': 'ImageObject',
    url: 'https://qotn.in/logo-square-512.png',
    width: 512,
    height: 512,
  },
  image: 'https://qotn.in/og-image.png',
  email: 'Helloqotn@gmail.com',
  foundingDate: '2024',
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'Helloqotn@gmail.com',
    contactType: 'customer service',
    availableLanguage: ['English', 'Hindi'],
  },
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Ward No. 64, Jain Nasiya Road, Near Manohar Palace',
    addressLocality: 'Sanganer, Jaipur',
    addressRegion: 'Rajasthan',
    postalCode: '302033',
    addressCountry: 'IN',
  },
  sameAs: [
    'https://www.instagram.com/qotn.in',
  ],
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://qotn.in/#website',
  name: 'QOTN',
  url: 'https://qotn.in',
  publisher: { '@id': 'https://qotn.in/#organization' },
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: 'https://qotn.in/men?search={search_term_string}' },
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <head>
        <meta name="theme-color" content="#1A1A1A" />
        <meta name="msapplication-TileColor" content="#F5F0E8" />
        <meta name="msapplication-TileImage" content="/mstile-144x144.png" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="geo.region" content="IN-RJ" />
        <meta name="geo.placename" content="Jaipur, Rajasthan, India" />
        <meta name="geo.position" content="26.8467;75.8020" />
        <meta name="ICBM" content="26.8467, 75.8020" />
        <link rel="mask-icon" href="/logo-cream-on-black.png" color="#1A1A1A" />
        <link rel="alternate" hrefLang="en-IN" href="https://qotn.in" />
        <link rel="alternate" hrefLang="x-default" href="https://qotn.in" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="alternate" type="application/rss+xml" title="QOTN Cotton Journal" href="https://qotn.in/rss.xml" />
        <Script
          id="schema-org-organization"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Script
          id="schema-org-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body>
        <a href="#main-content" style={{ position: 'absolute', left: '-9999px', top: 'auto', width: 1, height: 1, overflow: 'hidden' }} tabIndex={0} onFocus={(e) => { (e.target as HTMLAnchorElement).style.left = '0'; (e.target as HTMLAnchorElement).style.width = 'auto'; (e.target as HTMLAnchorElement).style.height = 'auto'; }}>
          Skip to main content
        </a>
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
