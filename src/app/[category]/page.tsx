import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import CategoryPageClient from './CategoryPageClient';
import { fetchPublic } from '@/lib/api';
import { adaptApiProductList } from '@/lib/adapters';
import { safeJsonLd } from '@/lib/jsonld';

const SITE = 'https://www.qotn.in';
// Must match LIMIT in CategoryPageClient so the server-rendered page is exactly page 1 of the client's list
const PAGE_LIMIT = 24;

// Static page, rebuilt in the background at most every 5 minutes: fast from the CDN, and the
// product grid is in the HTML. Filters from a shared link are applied by the browser after load.
export const revalidate = 300;
export const dynamicParams = false;
export function generateStaticParams() {
  return [{ category: 'men' }, { category: 'women' }, { category: 'kids' }];
}

const OG_IMAGE = { url: `${SITE}/og-image.png`, width: 1200, height: 630, alt: 'QOTN — Pure Cotton. Nothing Else.' };

// No "| QOTN" here: the root layout's title template adds it
const categoryMeta: Record<string, { title: string; description: string }> = {
  men: {
    title: "Men's Pure Cotton Clothing — Kurtas, Shirts & More",
    description: "Shop men's 100% pure cotton clothing online: kurtas, shirts, pyjamas and more. No blends. Made in India. Free shipping above ₹1499.",
  },
  women: {
    title: "Women's Pure Cotton Clothing — Dresses, Kurtas & More",
    description: "Shop women's 100% pure cotton clothing online: dresses, kurtas, tops and co-ord sets. No blends. Made in India. Free shipping above ₹1499.",
  },
  kids: {
    title: "Kids' Pure Cotton Clothing — Soft & Breathable",
    description: "Shop kids' 100% pure cotton clothing online: t-shirts, frocks, pyjamas and more. Breathable and soft, no blends. Made in India. Free shipping above ₹1499.",
  },
};

// Short copy under the grid. Only facts already stated elsewhere on the site.
const categoryIntro: Record<string, { heading: string; body: string; others: [string, string][] }> = {
  men: {
    heading: "About QOTN men's cotton clothing",
    body: "Every men's piece here is made from 100% cotton, with no polyester or other blends. Kurtas, shirts and pyjamas are stitched in Jaipur, Rajasthan. Orders above ₹1499 ship free across India, cash on delivery is available, and custom stitching is offered on select products.",
    others: [['/women', "Women's clothing"], ['/kids', "Kids' clothing"]],
  },
  women: {
    heading: "About QOTN women's cotton clothing",
    body: "Every women's piece here is made from 100% cotton, with no polyester or other blends. Dresses, kurtas, tops and co-ord sets are stitched in Jaipur, Rajasthan. Orders above ₹1499 ship free across India, cash on delivery is available, and custom stitching is offered on select products.",
    others: [['/men', "Men's clothing"], ['/kids', "Kids' clothing"]],
  },
  kids: {
    heading: "About QOTN kids' cotton clothing",
    body: "Every kids' piece here is made from 100% cotton, with no polyester or other blends, so it stays soft and breathable against young skin. Orders above ₹1499 ship free across India and cash on delivery is available.",
    others: [['/men', "Men's clothing"], ['/women', "Women's clothing"]],
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const cap = category.charAt(0).toUpperCase() + category.slice(1);
  const meta = categoryMeta[category] ?? {
    title: `${cap} — Pure Cotton Clothing`,
    description: `Shop pure cotton ${category} clothing online. Made in India.`,
  };
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: `${SITE}/${category}` },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `${SITE}/${category}`,
      images: [OG_IMAGE],
    },
  };
}

const categoryLabels: Record<string, string> = { men: "Men's", women: "Women's", kids: "Kids'" };

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;

  // Page 1 of the list is rendered into the HTML so crawlers see real product links without
  // running JavaScript. If the API is unreachable the client simply fetches it as before.
  const res = await fetchPublic<any>(`/products?category=${category}&page=1&limit=${PAGE_LIMIT}`, 300);
  const initialProducts = res?.data ? adaptApiProductList(res.data) : undefined;
  const initialTotal: number = res?.meta?.total ?? initialProducts?.length ?? 0;

  const intro = categoryIntro[category];

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: categoryLabels[category] || category, item: `${SITE}/${category}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }} />
      <Suspense fallback={<div style={{ minHeight: '60vh', backgroundColor: 'var(--cream)' }} />}>
        <CategoryPageClient
          params={params}
          initialProducts={initialProducts}
          initialTotal={initialTotal}
        />
      </Suspense>

      {intro && (
        <section style={{ backgroundColor: 'var(--cream)', borderTop: '1px solid var(--border)', padding: '40px 24px 56px' }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <h2 style={{ fontSize: 18, fontWeight: 400, letterSpacing: '0.04em', marginBottom: 12 }}>{intro.heading}</h2>
            <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--dust)', marginBottom: 16 }}>{intro.body}</p>
            <p style={{ fontSize: 13, color: 'var(--dust)' }}>
              Also see{' '}
              {intro.others.map(([href, label], i) => (
                <span key={href}>
                  {i > 0 && ', '}
                  <Link href={href} style={{ color: 'var(--black)', textDecoration: 'underline' }}>{label}</Link>
                </span>
              ))}
              , our <Link href="/collections" style={{ color: 'var(--black)', textDecoration: 'underline' }}>collections</Link> and the{' '}
              <Link href="/size-guide" style={{ color: 'var(--black)', textDecoration: 'underline' }}>size guide</Link>.
            </p>
          </div>
        </section>
      )}
    </>
  );
}
