import type { MetadataRoute } from 'next';
import { fetchPublic } from '@/lib/api';

const SITE = 'https://qotn.in';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [productsRes, collectionsRes] = await Promise.all([
    fetchPublic<any>('/products?limit=500&page=1', 3600),
    fetchPublic<any>('/collections?limit=100', 3600),
  ]);

  const products: any[] = productsRes?.data || [];
  const collections: any[] = collectionsRes?.data || [];

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE}/men`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE}/women`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE}/kids`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE}/collections`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE}/size-guide`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE}/shipping-policy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE}/return-policy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE}/terms-and-conditions`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE}/privacy-policy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];

  const productPages: MetadataRoute.Sitemap = products
    .filter((p) => p.slug && p.category?.slug)
    .map((p) => ({
      url: `${SITE}/${p.category.slug}/${p.slug}`,
      lastModified: new Date(p.updatedAt || p.createdAt || Date.now()),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

  const collectionPages: MetadataRoute.Sitemap = collections
    .filter((c) => c.slug)
    .map((c) => ({
      url: `${SITE}/collections/${c.slug}`,
      lastModified: new Date(c.updatedAt || c.createdAt || Date.now()),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

  return [...staticPages, ...productPages, ...collectionPages];
}
