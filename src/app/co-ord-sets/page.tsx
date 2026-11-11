import type { Metadata } from 'next';
import Link from 'next/link';
import ProductCard from '@/components/shared/ProductCard';
import { fetchAllProducts } from '@/lib/api';
import { adaptApiProductList } from '@/lib/adapters';
import { coordSets, MIN_COORD_SETS } from '@/lib/coordSets';
import { safeJsonLd } from '@/lib/jsonld';

const SITE = 'https://www.qotn.in';
const PAGE_URL = `${SITE}/co-ord-sets`;
const TITLE = 'Cotton Co-Ord Sets for Women & Kids'; // layout template adds " | QOTN"
const DESCRIPTION =
  'Shop 100% pure cotton co-ord sets for women and kids online. No blends. Made in India. Free shipping above ₹1499.';

// Same refresh rhythm as the category pages
export const revalidate = 300;

const CATEGORY_LABEL: Record<string, string> = { women: 'women', men: 'men', kids: 'kids' };

export async function generateMetadata(): Promise<Metadata> {
  const all = await fetchAllProducts(300);
  // noindex only when the live list was read and is too short; a failed read must never decide this
  const tooFew = all !== null && coordSets(all).length < MIN_COORD_SETS;
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: PAGE_URL },
    ...(tooFew ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      url: PAGE_URL,
      images: [{ url: `${SITE}/og-image.png`, width: 1200, height: 630, alt: 'QOTN — Pure Cotton. Nothing Else.' }],
    },
  };
}

export default async function CoordSetsPage() {
  const all = await fetchAllProducts(300);
  const raw = coordSets(all ?? []);
  const products = adaptApiProductList(raw);

  const categories = Array.from(new Set(raw.map((p) => CATEGORY_LABEL[p.category?.slug]).filter(Boolean)));
  const audience = categories.length ? categories.join(' and ') : 'women and kids';

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Cotton Co-Ord Sets', item: PAGE_URL },
    ],
  };
  const listJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Cotton Co-Ord Sets',
    url: PAGE_URL,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: raw.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${SITE}/${p.category?.slug}/${encodeURIComponent(p.slug)}`,
        name: p.name,
      })),
    },
  };

  return (
    <div style={{ backgroundColor: 'var(--cream)', minHeight: '100vh' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }} />
      {products.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(listJsonLd) }} />
      )}

      <div style={{ minHeight: 220, backgroundColor: 'var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '72px 24px 32px', textAlign: 'center' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(32px, 7vw, 72px)', fontWeight: 300, letterSpacing: '0.12em', color: 'var(--cream)', textTransform: 'uppercase' }}>
            Cotton Co-Ord Sets
          </h1>
          <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.5)', marginTop: 8 }}>
            Pure Cotton. Nothing Else.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 16px 24px' }}>
        {products.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, alignItems: 'start' }}>
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} variant="desktop" priority={i < 4} />
            ))}
          </div>
        ) : (
          <p style={{ fontSize: 14, color: 'var(--dust)', textAlign: 'center', padding: '40px 0' }}>
            Browse our <Link href="/women" style={{ textDecoration: 'underline' }}>women&apos;s</Link> and{' '}
            <Link href="/kids" style={{ textDecoration: 'underline' }}>kids&apos;</Link> cotton clothing.
          </p>
        )}
      </div>

      <section style={{ borderTop: '1px solid var(--border)', padding: '40px 24px 56px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <h2 style={{ fontSize: 18, fontWeight: 400, letterSpacing: '0.04em', marginBottom: 12 }}>About QOTN cotton co-ord sets</h2>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--dust)', marginBottom: 16 }}>
            Every co-ord set for {audience} here is made from 100% cotton, with no polyester or other blends.
            Orders above ₹1499 ship free across India and cash on delivery is available.
          </p>
          <p style={{ fontSize: 13, color: 'var(--dust)' }}>
            Also see{' '}
            <Link href="/women" style={{ color: 'var(--black)', textDecoration: 'underline' }}>Women&apos;s clothing</Link>,{' '}
            <Link href="/kids" style={{ color: 'var(--black)', textDecoration: 'underline' }}>Kids&apos; clothing</Link> and the{' '}
            <Link href="/size-guide" style={{ color: 'var(--black)', textDecoration: 'underline' }}>size guide</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}
