import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchPublic } from '@/lib/api';
import { adaptApiProduct } from '@/lib/adapters';
import ProductDetailClient from './ProductDetailClient';

const categoryLabels: Record<string, string> = {
  men: "Men's",
  women: "Women's",
  kids: "Kids'",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { slug, category } = await params;
  const res = await fetchPublic<any>(`/products/${slug}`, 30);
  const product = res?.data;
  if (!product) return { title: 'QOTN — Product' };

  const title = `${product.name} — 100% Pure Cotton | QOTN`;
  const description = `${(product.description || '').slice(0, 140)} Shop 100% pure cotton at QOTN. Made in India.`;
  const url = `https://qotn.in/${category}/${slug}`;
  const imageUrl = product.images?.[0]?.url || (typeof product.images?.[0] === 'string' ? product.images[0] : '');

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: product.description || '',
      url,
      type: 'website',
      images: imageUrl ? [{ url: imageUrl, alt: product.name }] : [],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { slug, category } = await params;
  const res = await fetchPublic<any>(`/products/${slug}`, 30);
  const raw = res?.data;
  const product = raw ? adaptApiProduct(raw) : null;
  if (!product) notFound();

  const variants: any[] = raw?.variants || [];
  const prices = variants.map((v: any) => v.price).filter(Boolean);
  const minPrice = prices.length > 0 ? Math.min(...prices) / 100 : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) / 100 : 0;
  const imageUrl = raw?.images?.[0]?.url || (typeof raw?.images?.[0] === 'string' ? raw.images[0] : '');
  const inStock = variants.some((v: any) => (v.stock ?? 0) > 0);
  const categoryLabel = categoryLabels[category] || category;
  const productUrl = `https://qotn.in/${category}/${slug}`;

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: raw?.name || '',
    description: raw?.description || '',
    image: imageUrl,
    sku: raw?.slug || '',
    url: productUrl,
    brand: { '@type': 'Brand', name: 'QOTN' },
    material: '100% Cotton',
    itemCondition: 'https://schema.org/NewCondition',
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'INR',
      lowPrice: minPrice,
      highPrice: maxPrice > minPrice ? maxPrice : minPrice,
      offerCount: variants.length || 1,
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'QOTN', url: 'https://qotn.in' },
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://qotn.in' },
      { '@type': 'ListItem', position: 2, name: categoryLabel, item: `https://qotn.in/${category}` },
      { '@type': 'ListItem', position: 3, name: raw?.name || '', item: productUrl },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductDetailClient product={product} />
    </>
  );
}
