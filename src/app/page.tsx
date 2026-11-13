import type { Metadata } from 'next';
import HomePageClient from './HomePageClient';
import HomeSeoSection from '@/components/seo/HomeSeoSection';
import { fetchPublic } from '@/lib/api';
import { cutoutUrl, pickHeroTiles } from '@/lib/heroTiles';
import { readyHeroTiles } from '@/lib/heroTiles.server';

export const revalidate = 300;

const HOME_TITLE = 'Pure Cotton Clothing for Men, Women & Kids';
const HOME_DESCRIPTION =
  'Shop 100% pure cotton kurta sets, kurtis, sarees, shirts and kids’ wear. No blends, made in India. Free shipping above ₹1,499. COD available.';

export const metadata: Metadata = {
  // absolute: the root layout's " | QOTN" template does not apply to the page in the same folder as the layout
  title: { absolute: `${HOME_TITLE} | QOTN` },
  description: HOME_DESCRIPTION,
  alternates: { canonical: 'https://www.qotn.in' },
  openGraph: {
    title: `${HOME_TITLE} | QOTN`,
    description: HOME_DESCRIPTION,
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
    title: `${HOME_TITLE} | QOTN`,
    description: HOME_DESCRIPTION,
    images: [{ url: 'https://www.qotn.in/twitter-card.png', alt: 'QOTN — Pure Cotton. Nothing Else.' }],
  },
};

export default async function HomePage() {
  // Hero images come with the page, so the first photo needs no extra request after load
  const res = await fetchPublic<any>('/banners?position=HERO', 300);
  const heroImages: string[] = (res?.data ?? [])
    .filter((b: any) => b.isActive)
    .map((b: any) => b.mobileImage || b.image)
    .filter(Boolean);
  // The desktop hero strip shows real, current products (newest first, mixed across men, women and kids)
  const products = await fetchPublic<any>('/products?limit=48&sortBy=newest', 300);
  // Only products whose cut-out is already made are sent, so a visitor never waits on one. Asking is also what gets a
  // brand-new product's cut-out started; it joins the strip the next time this page refreshes (every 5 minutes).
  const heroTiles = await readyHeroTiles(pickHeroTiles(products?.data ?? []));
  return (
    <>
      {/* Start fetching the first cut-outs while the page loads. Desktop widths only: phones never show the strip. */}
      {heroTiles.slice(0, 6).map((t) => (
        <link key={t.slug} rel="preload" as="image" href={cutoutUrl(t.photo)} media="(min-width: 768px)" />
      ))}
      <HomePageClient initialHeroImages={heroImages} heroTiles={heroTiles} />
      <HomeSeoSection />
    </>
  );
}
