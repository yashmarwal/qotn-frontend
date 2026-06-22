import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

const API =
  process.env.NODE_ENV === 'production'
    ? 'https://qotn-backend-production.up.railway.app/api'
    : 'http://localhost:3001/api';

async function getCollection(slug: string) {
  try {
    const res = await fetch(`${API}/collections/${slug}?limit=48`, { next: { revalidate: 30 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const col = await getCollection(slug);
  if (!col) return { title: 'Collection Not Found — QOTN' };
  const title = `${col.name} — Pure Cotton Collection | QOTN`;
  const description = col.description || `Shop ${col.name} — 100% pure cotton apparel. Made in India. No blends.`;
  const url = `https://qotn.in/collections/${slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      images: col.thumbnail ? [{ url: col.thumbnail, alt: col.name }] : [],
    },
  };
}

function formatPrice(paise: number) {
  return `₹${(paise / 100).toLocaleString('en-IN')}`;
}

export default async function CollectionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const col = await getCollection(slug);

  if (!col) notFound();

  const products: any[] = col.products || [];

  return (
    <div style={{ backgroundColor: 'var(--cream)', minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{ backgroundColor: 'var(--black)', padding: '64px 40px', textAlign: 'center', minHeight: 260, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Link href="/collections"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'rgba(245,240,232,0.45)', letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 20, textDecoration: 'none' }}>
          ← All Collections
        </Link>
        <h1 style={{ fontSize: 'clamp(36px, 7vw, 80px)', fontWeight: 300, letterSpacing: '0.12em', color: 'var(--cream)', lineHeight: 1, textTransform: 'uppercase' }}>
          {col.name}
        </h1>
        {col.description && (
          <p style={{ fontSize: 14, color: 'rgba(245,240,232,0.5)', marginTop: 14, maxWidth: 480, lineHeight: 1.6, letterSpacing: '0.03em' }}>
            {col.description}
          </p>
        )}
        <p style={{ fontSize: 11, color: 'rgba(245,240,232,0.35)', marginTop: 12, letterSpacing: '0.08em' }}>
          {col._count?.products ?? products.length} products
        </p>
      </div>

      {/* Product grid */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 40px' }}>
        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontSize: 15, color: 'var(--dust)', marginBottom: 24 }}>No products in this collection yet.</p>
            <Link href="/" style={{ fontSize: 12, letterSpacing: '0.10em', textTransform: 'uppercase', borderBottom: '1px solid var(--black)', paddingBottom: 2 }}>
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
            {products.map((p: any) => (
              <CollectionProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CollectionProductCard({ product }: { product: any }) {
  const images: any[] = product.images || [];
  const img = typeof images[0] === 'string' ? images[0] : images[0]?.url || '';
  const variants: any[] = product.variants || [];
  const prices = variants.map((v: any) => v.price).filter(Boolean);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxOriginal = variants.map((v: any) => v.originalPrice).filter(Boolean);
  const originalPrice = maxOriginal.length > 0 ? Math.max(...maxOriginal) : null;
  const discount = originalPrice && minPrice ? Math.round(((originalPrice - minPrice) / originalPrice) * 100) : null;
  const categorySlug = product.category?.slug || product.categoryId || 'men';

  return (
    <Link href={`/${categorySlug}/${product.slug}`} className="collection-product-card" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
      <div style={{ overflow: 'hidden' }}>
        <div style={{ position: 'relative', aspectRatio: '3/4', backgroundColor: 'var(--raw-cotton)', overflow: 'hidden' }}>
          {img ? (
            <Image
              src={img}
              alt={product.name}
              fill
              className="collection-product-card-img"
              style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }}
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'var(--raw-cotton)' }} />
          )}
          {product.isNew && (
            <span style={{ position: 'absolute', top: 12, left: 12, background: 'var(--black)', color: 'var(--cream)', fontSize: 9, fontWeight: 500, letterSpacing: '0.10em', textTransform: 'uppercase', padding: '4px 8px' }}>
              NEW
            </span>
          )}
        </div>
        <div style={{ paddingTop: 12 }}>
          <p style={{ fontSize: 14, fontWeight: 400, color: 'var(--black)', marginBottom: 4 }}>{product.name}</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            {minPrice > 0 && (
              <span style={{ fontSize: 14, fontWeight: 500 }}>
                {formatPrice(minPrice)}
              </span>
            )}
            {originalPrice && (
              <span style={{ fontSize: 12, color: 'var(--dust)', textDecoration: 'line-through' }}>
                {formatPrice(originalPrice)}
              </span>
            )}
            {discount && (
              <span style={{ fontSize: 11, color: '#2E7D32', fontWeight: 500 }}>{discount}% off</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
