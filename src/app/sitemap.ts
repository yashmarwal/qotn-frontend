import type { MetadataRoute } from 'next';
import { fetchPublic } from '@/lib/api';
import { articles } from './blog/articles';

const SITE = 'https://www.qotn.in';
// The products API rejects limit > 48, so the catalogue is read page by page
const PAGE_SIZE = 48;
const MAX_PAGES = 20;

async function fetchAllProducts(): Promise<any[]> {
  const all: any[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const res = await fetchPublic<any>(`/products?limit=${PAGE_SIZE}&page=${page}`, 3600);
    const batch: any[] = res?.data || [];
    all.push(...batch);
    const totalPages = res?.meta?.totalPages ?? 1;
    if (batch.length === 0 || page >= totalPages) break;
  }
  return all;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, collectionsRes] = await Promise.all([
    fetchAllProducts(),
    fetchPublic<any>('/collections?limit=100', 3600),
  ]);
  const collections: any[] = collectionsRes?.data || [];

  // No lastModified on static pages: a made-up date is worse than none, because Google
  // stops trusting lastmod once it is wrong. priority/changeFrequency are ignored by Google.
  const staticPaths = [
    '', '/men', '/women', '/kids', '/collections', '/about', '/contact', '/size-guide',
    '/faq', '/blog', '/shipping-policy', '/return-policy', '/terms-and-conditions', '/privacy-policy',
  ];
  const staticPages: MetadataRoute.Sitemap = staticPaths.map((path) => ({ url: `${SITE}${path}` }));

  const productPages: MetadataRoute.Sitemap = products
    .filter((p) => p.slug && p.category?.slug)
    .map((p) => ({
      url: `${SITE}/${p.category.slug}/${p.slug}`,
      lastModified: new Date(p.updatedAt || p.createdAt),
    }));

  const collectionPages: MetadataRoute.Sitemap = collections
    .filter((c) => c.slug)
    .map((c) => ({
      url: `${SITE}/collections/${c.slug}`,
      lastModified: new Date(c.updatedAt || c.createdAt),
    }));

  const blogPages: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE}/blog/${a.slug}`,
    lastModified: new Date(a.publishedAt),
  }));

  return [...staticPages, ...blogPages, ...productPages, ...collectionPages];
}
