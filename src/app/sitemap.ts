import type { MetadataRoute } from 'next';
import { fetchPublic, fetchAllProducts } from '@/lib/api';
import { coordSets, MIN_COORD_SETS } from '@/lib/coordSets';
import { articles } from './blog/articles';

const SITE = 'https://www.qotn.in';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [allProducts, collectionsRes] = await Promise.all([
    fetchAllProducts(),
    fetchPublic<any>('/collections?limit=100', 3600),
  ]);
  const products = allProducts ?? [];
  const collections: any[] = collectionsRes?.data || [];

  // No lastModified on static pages: a made-up date is worse than none, because Google
  // stops trusting lastmod once it is wrong. priority/changeFrequency are ignored by Google.
  const staticPaths = [
    '', '/men', '/women', '/kids', '/collections', '/about', '/contact', '/size-guide',
    '/faq', '/blog', '/shipping-policy', '/return-policy', '/terms-and-conditions', '/privacy-policy',
  ];
  const staticPages: MetadataRoute.Sitemap = staticPaths.map((path) => ({ url: `${SITE}${path}` }));

  // Listed only when live data shows enough co-ord sets (the page itself is noindex below that)
  if (coordSets(products).length >= MIN_COORD_SETS) staticPages.push({ url: `${SITE}/co-ord-sets` });

  const productPages: MetadataRoute.Sitemap = products
    .filter((p) => p.slug && p.category?.slug)
    .map((p) => ({
      url: `${SITE}/${p.category.slug}/${encodeURIComponent(p.slug)}`,
      lastModified: new Date(p.updatedAt || p.createdAt),
    }));

  const collectionPages: MetadataRoute.Sitemap = collections
    .filter((c) => c.slug)
    .map((c) => ({
      url: `${SITE}/collections/${encodeURIComponent(c.slug)}`,
      lastModified: new Date(c.updatedAt || c.createdAt),
    }));

  const blogPages: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE}/blog/${a.slug}`,
    lastModified: new Date(a.publishedAt),
  }));

  return [...staticPages, ...blogPages, ...productPages, ...collectionPages];
}
