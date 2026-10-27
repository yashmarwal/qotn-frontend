import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchPublic } from '@/lib/api';
import { adaptApiProduct } from '@/lib/adapters';
import ProductDetailClient from './ProductDetailClient';
import { cleanText } from '@/lib/seo';
import { safeJsonLd } from '@/lib/jsonld';

// Mirrors /shipping-policy and /return-policy. Update both places together.
const FREE_SHIPPING_FROM_RUPEES = 1499;
const STANDARD_SHIPPING_RUPEES = 99;

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

  const title = `${product.name} — 100% Pure Cotton`;
  const description = cleanText(`${cleanText(product.description || '', 95)} 100% pure cotton, made in India.`, 155);
  const url = `https://www.qotn.in/${category}/${slug}`;
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
      images: imageUrl
        ? [{ url: imageUrl, width: 800, height: 1000, alt: product.name }]
        : [{ url: 'https://www.qotn.in/og-image.png', width: 1200, height: 630, alt: 'QOTN — Pure Cotton. Nothing Else.' }],
    },
    twitter: {
      card: 'summary_large_image' as const,
      site: '@shopqotn',
      title,
      description: (product.description || '').slice(0, 200),
      images: imageUrl ? [imageUrl] : ['https://www.qotn.in/og-image.png'],
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
  const productUrl = `https://www.qotn.in/${category}/${slug}`;

  const singlePrice = minPrice === maxPrice;
  const availability = inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock';
  const imageUrls: string[] = (raw?.images || [])
    .map((i: any) => (typeof i === 'string' ? i : i?.url))
    .filter(Boolean)
    .slice(0, 6);
  // Merchant details Google uses for product listings, taken from the real policy pages
  const merchantDetails = {
    shippingDetails: {
      '@type': 'OfferShippingDetails',
      shippingRate: {
        '@type': 'MonetaryAmount',
        value: minPrice >= FREE_SHIPPING_FROM_RUPEES ? 0 : STANDARD_SHIPPING_RUPEES,
        currency: 'INR',
      },
      shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'IN' },
      deliveryTime: {
        '@type': 'ShippingDeliveryTime',
        handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 1, unitCode: 'DAY' },
        transitTime: { '@type': 'QuantitativeValue', minValue: 5, maxValue: 7, unitCode: 'DAY' },
      },
    },
    hasMerchantReturnPolicy: {
      '@type': 'MerchantReturnPolicy',
      applicableCountry: 'IN',
      returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
      merchantReturnDays: 1,
      url: 'https://www.qotn.in/return-policy',
    },
  };

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: raw?.name || '',
    description: raw?.description || '',
    image: imageUrls.length ? imageUrls : imageUrl,
    sku: raw?.slug || '',
    url: productUrl,
    brand: { '@type': 'Brand', name: 'QOTN', '@id': 'https://www.qotn.in/#organization' },
    material: '100% Cotton',
    itemCondition: 'https://schema.org/NewCondition',
    offers: singlePrice
      ? {
          '@type': 'Offer',
          priceCurrency: 'INR',
          price: minPrice,
          availability,
          url: productUrl,
          seller: { '@type': 'Organization', name: 'QOTN', url: 'https://www.qotn.in' },
          ...merchantDetails,
        }
      : {
          '@type': 'AggregateOffer',
          priceCurrency: 'INR',
          lowPrice: minPrice,
          highPrice: maxPrice,
          offerCount: variants.length || 1,
          availability,
          seller: { '@type': 'Organization', name: 'QOTN', url: 'https://www.qotn.in' },
          ...merchantDetails,
        },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.qotn.in' },
      { '@type': 'ListItem', position: 2, name: categoryLabel, item: `https://www.qotn.in/${category}` },
      { '@type': 'ListItem', position: 3, name: raw?.name || '', item: productUrl },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }}
      />
      <ProductDetailClient product={product} />
    </>
  );
}
