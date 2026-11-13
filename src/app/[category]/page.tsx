import type { Metadata } from 'next';
import { Suspense } from 'react';
import CategoryPageClient from './CategoryPageClient';
import SeoSections from '@/components/seo/SeoSections';
import { fetchPublic } from '@/lib/api';
import { adaptApiProductList } from '@/lib/adapters';
import { safeJsonLd } from '@/lib/jsonld';
import { CATEGORY_PAGES, SITE, landingMetadata } from '@/lib/seoPages';

// Must match LIMIT in CategoryPageClient so the server-rendered page is exactly page 1 of the client's list
const PAGE_LIMIT = 24;

// Static page, rebuilt in the background at most every 5 minutes: fast from the CDN, and the
// product grid is in the HTML. Filters from a shared link are applied by the browser after load.
export const revalidate = 300;
export const dynamicParams = false;
export function generateStaticParams() {
  return [{ category: 'men' }, { category: 'women' }, { category: 'kids' }];
}

// Links shown under the banner so each type page is one click from its category
const TYPE_LINKS: Record<string, { href: string; label: string }[]> = {
  women: [
    { href: '/kurta-sets', label: 'Kurta Sets' },
    { href: '/kurtis', label: 'Kurtis' },
    { href: '/cotton-sarees', label: 'Cotton Sarees' },
    { href: '/co-ord-sets', label: 'Co-ord Sets' },
  ],
  men: [{ href: '/men/striped-shirts', label: 'Striped Shirts' }],
  kids: [{ href: '/co-ord-sets', label: 'Co-ord Sets' }],
};

const categoryLabels: Record<string, string> = { men: "Men's", women: "Women's", kids: "Kids'" };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const page = CATEGORY_PAGES[category as keyof typeof CATEGORY_PAGES];
  const cap = category.charAt(0).toUpperCase() + category.slice(1);
  return landingMetadata(
    {
      path: `/${category}`,
      title: page?.title ?? `${cap} — Pure Cotton Clothing`,
      description: page?.description ?? `Shop pure cotton ${category} clothing online. Made in India.`,
    },
    false,
  );
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const page = CATEGORY_PAGES[category as keyof typeof CATEGORY_PAGES];

  // Page 1 of the list is rendered into the HTML so crawlers see real product links without
  // running JavaScript. If the API is unreachable the client simply fetches it as before.
  const res = await fetchPublic<any>(`/products?category=${category}&page=1&limit=${PAGE_LIMIT}`, 300);
  const initialProducts = res?.data ? adaptApiProductList(res.data) : undefined;
  const initialTotal: number = res?.meta?.total ?? initialProducts?.length ?? 0;
  const pageUrl = `${SITE}/${category}`;

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: categoryLabels[category] || category, item: pageUrl },
    ],
  };
  const collectionJsonLd =
    page && res?.data?.length
      ? {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: page.h1,
          url: pageUrl,
          description: page.description,
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: (res.data as any[]).map((p, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              url: `${SITE}/${p.category?.slug ?? category}/${encodeURIComponent(p.slug)}`,
              name: p.name,
            })),
          },
        }
      : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }} />
      {collectionJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(collectionJsonLd) }} />}
      <Suspense fallback={<div style={{ minHeight: '60vh', backgroundColor: 'var(--cream)' }} />}>
        <CategoryPageClient
          params={params}
          initialProducts={initialProducts}
          initialTotal={initialTotal}
          h1Text={page?.h1}
          typeLinks={TYPE_LINKS[category]}
        />
      </Suspense>

      {page && <SeoSections sections={page.sections} faqTitle={page.faqTitle} faqs={page.faqs} related={page.related} />}
    </>
  );
}
