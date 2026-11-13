import Link from 'next/link';
import ProductCard from '@/components/shared/ProductCard';
import SeoSections from '@/components/seo/SeoSections';
import { adaptApiProductList } from '@/lib/adapters';
import { safeJsonLd } from '@/lib/jsonld';
import { SITE, type LandingConfig } from '@/lib/seoPages';

type PageConfig = Omit<LandingConfig, 'filter'>;

/**
 * A search-landing page: dark title banner, the matching live products, then headed SEO text and a FAQ.
 * Structured data: BreadcrumbList, CollectionPage with an ItemList of the products, and the FAQPage (from SeoSections).
 */
export default function CategoryLanding({ cfg, rawProducts }: { cfg: PageConfig; rawProducts: any[] }) {
  const products = adaptApiProductList(rawProducts);
  const pageUrl = `${SITE}${cfg.path}`;

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: cfg.breadcrumb, item: pageUrl },
    ],
  };
  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: cfg.h1,
    url: pageUrl,
    description: cfg.description,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: rawProducts.map((p, i) => ({
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
      {products.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(collectionJsonLd) }} />}

      <div style={{ minHeight: 220, backgroundColor: 'var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '72px 24px 32px', textAlign: 'center' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(28px, 6vw, 64px)', fontWeight: 300, letterSpacing: '0.12em', color: 'var(--cream)', textTransform: 'uppercase' }}>
            {cfg.h1}
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
            Browse our <Link href="/women" style={{ textDecoration: 'underline' }}>women&apos;s</Link>,{' '}
            <Link href="/men" style={{ textDecoration: 'underline' }}>men&apos;s</Link> and{' '}
            <Link href="/kids" style={{ textDecoration: 'underline' }}>kids&apos;</Link> cotton clothing.
          </p>
        )}
      </div>

      <SeoSections sections={cfg.sections({ products })} faqTitle={cfg.faqTitle} faqs={cfg.faqs} related={cfg.related} />
    </div>
  );
}
