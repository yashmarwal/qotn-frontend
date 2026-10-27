import type { Metadata } from 'next';
import HomePageClient from './HomePageClient';
import { fetchPublic } from '@/lib/api';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'QOTN — Pure Cotton Clothing for Men, Women & Kids | Made in India',
  description:
    'Shop 100% pure cotton clothing online. No blends. Kurtas, dresses and shirts for men, women and kids. Free shipping above ₹1499. Made in India.',
  alternates: { canonical: 'https://www.qotn.in' },
  openGraph: {
    title: 'QOTN — Pure Cotton Clothing for Men, Women & Kids | Made in India',
    description: 'Shop 100% pure cotton clothing. No blends, no shortcuts. Free shipping above ₹1499. Made in India.',
    url: 'https://www.qotn.in',
    siteName: 'QOTN',
    type: 'website',
    locale: 'en_IN',
    images: [{ url: 'https://www.qotn.in/og-image.png', width: 1200, height: 630, alt: 'QOTN — Pure Cotton. Nothing Else.' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@shopqotn',
    creator: '@shopqotn',
    title: 'QOTN — Pure Cotton. Nothing Else.',
    description: 'Shop 100% pure cotton clothing for men, women and kids. Made in India.',
    images: [{ url: 'https://www.qotn.in/og-image.png', alt: 'QOTN — Pure Cotton. Nothing Else.' }],
  },
};

export default async function HomePage() {
  // Hero images come with the page, so the first photo needs no extra request after load
  const res = await fetchPublic<any>('/banners?position=HERO', 300);
  const heroImages: string[] = (res?.data ?? [])
    .filter((b: any) => b.isActive)
    .map((b: any) => b.mobileImage || b.image)
    .filter(Boolean);
  return <HomePageClient initialHeroImages={heroImages} />;
}
