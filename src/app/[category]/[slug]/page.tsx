import type { Metadata } from 'next';
import { fetchPublic } from '@/lib/api';
import { adaptApiProduct } from '@/lib/adapters';
import ProductDetailClient from './ProductDetailClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const res = await fetchPublic<any>(`/products/${slug}`, 30);
  const product = res?.data;
  if (!product) return { title: 'QOTN — Product' };
  return {
    title: `${product.name} — 100% Pure Cotton | QOTN`,
    description: `${(product.description || '').slice(0, 155)} Shop at QOTN — pure cotton, nothing else.`,
    openGraph: {
      title: `${product.name} — 100% Pure Cotton | QOTN`,
      description: product.description || '',
      images: product.images?.[0]?.url ? [{ url: product.images[0].url }] : [],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { slug } = await params;
  const res = await fetchPublic<any>(`/products/${slug}`, 30);
  const product = res?.data ? adaptApiProduct(res.data) : null;
  return <ProductDetailClient product={product} />;
}
