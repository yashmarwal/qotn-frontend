import type { MetadataRoute } from 'next';
import { fetchPublic } from '@/lib/api';
import { articles } from './blog/articles';

const SITE = 'https://qotn.in';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [productsRes, collectionsRes] = await Promise.all([
    fetchPublic<any>('/products?limit=500&page=1', 3600),
    fetchPublic<any>('/collections?limit=100', 3600),
  ]);

  const products: any[] = productsRes?.data || [];
  const collections: any[] = collectionsRes?.data || [];

  // priority and changeFrequency are ignored by Google — omitted intentionally
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE,                            lastModified: new Date('2025-01-01') },
    { url: `${SITE}/men`,                   lastModified: new Date('2025-01-01') },
    { url: `${SITE}/women`,                 lastModified: new Date('2025-01-01') },
    { url: `${SITE}/kids`,                  lastModified: new Date('2025-01-01') },
    { url: `${SITE}/collections`,           lastModified: new Date('2025-01-01') },
    { url: `${SITE}/about`,                 lastModified: new Date('2025-01-01') },
    { url: `${SITE}/contact`,               lastModified: new Date('2025-01-01') },
    { url: `${SITE}/size-guide`,            lastModified: new Date('2025-01-01') },
    { url: `${SITE}/faq`,                   lastModified: new Date('2025-01-01') },
    { url: `${SITE}/blog`,                  lastModified: new Date('2025-01-01') },
    { url: `${SITE}/shipping-policy`,       lastModified: new Date('2025-01-01') },
    { url: `${SITE}/return-policy`,         lastModified: new Date('2025-01-01') },
    { url: `${SITE}/terms-and-conditions`,  lastModified: new Date('2025-01-01') },
    { url: `${SITE}/privacy-policy`,        lastModified: new Date('2025-01-01') },
  ];

  const productPages: MetadataRoute.Sitemap = products
    .filter((p) => p.slug && p.category?.slug)
    .map((p) => ({
      url: `${SITE}/${p.category.slug}/${p.slug}`,
      lastModified: new Date(p.updatedAt || p.createdAt || Date.now()),
    }));

  const collectionPages: MetadataRoute.Sitemap = collections
    .filter((c) => c.slug)
    .map((c) => ({
      url: `${SITE}/collections/${c.slug}`,
      lastModified: new Date(c.updatedAt || c.createdAt || Date.now()),
    }));

  const blogPages: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE}/blog/${a.slug}`,
    lastModified: new Date(a.publishedAt),
  }));

  return [...staticPages, ...blogPages, ...productPages, ...collectionPages];
}
