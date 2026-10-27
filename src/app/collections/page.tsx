import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Collections — Pure Cotton Curated Sets',
  description: 'Explore QOTN curated collections of 100% pure cotton apparel for men, women and kids. Each collection is thoughtfully put together — no blends, no shortcuts.',
  alternates: { canonical: 'https://www.qotn.in/collections' },
  openGraph: {
    title: 'Collections — Pure Cotton Curated Sets | QOTN',
    description: 'Explore QOTN curated collections of 100% pure cotton apparel for men, women and kids.',
    url: 'https://www.qotn.in/collections',
    images: [{ url: 'https://www.qotn.in/og-image.png', width: 1200, height: 630, alt: 'QOTN Collections' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@shopqotn',
    title: 'Collections — Pure Cotton Curated Sets | QOTN',
    description: 'Explore QOTN curated collections of 100% pure cotton apparel.',
    images: ['https://www.qotn.in/og-image.png'],
  },
};

const API =
  process.env.NODE_ENV === 'production'
    ? 'https://qotn-backend.onrender.com/api'
    : 'http://localhost:3001/api';

async function getCollections() {
  try {
    const res = await fetch(`${API}/collections`, { next: { revalidate: 60 } });
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

function Initials({ name }: { name: string }) {
  const words = name.trim().split(/\s+/);
  const letters = words.slice(0, 2).map((w: string) => w[0].toUpperCase()).join('');
  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--raw-cotton)',
    }}>
      <span style={{ fontSize: 40, fontWeight: 300, letterSpacing: '0.12em', color: 'var(--dust)' }}>{letters}</span>
    </div>
  );
}

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <div style={{ backgroundColor: 'var(--cream)', minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{ backgroundColor: 'var(--black)', padding: '64px 40px', textAlign: 'center' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.5)', marginBottom: 12 }}>
          QOTN
        </p>
        <h1 style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 300, letterSpacing: '0.12em', color: 'var(--cream)', lineHeight: 1 }}>
          COLLECTIONS
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(245,240,232,0.5)', marginTop: 12, letterSpacing: '0.04em' }}>
          Curated selections of pure cotton essentials
        </p>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 40px' }}>
        {collections.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontSize: 15, color: 'var(--dust)' }}>No collections yet. Check back soon.</p>
            <Link href="/" style={{ display: 'inline-block', marginTop: 24, fontSize: 12, letterSpacing: '0.10em', textTransform: 'uppercase', borderBottom: '1px solid var(--black)', paddingBottom: 2 }}>
              Back to Home
            </Link>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 12, color: 'var(--dust)', marginBottom: 40, letterSpacing: '0.06em' }}>
              {collections.length} {collections.length === 1 ? 'collection' : 'collections'}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
              {collections.map((col: any) => (
                <CollectionCard key={col.id} col={col} />
              ))}
            </div>
          </>
        )}
      </div>

      <section style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px 72px' }}>
        <h2 style={{ fontSize: 18, fontWeight: 400, letterSpacing: '0.04em', marginBottom: 12 }}>What is a QOTN collection?</h2>
        <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--dust)', marginBottom: 12 }}>
          A collection groups pieces made from 100% pure cotton around one idea, so you can browse a complete set in one place instead of piece by piece. Every item in every collection is cotton with no polyester or other blends, and every collection page lists its pieces with prices.
        </p>
        <p style={{ fontSize: 13, color: 'var(--dust)' }}>
          Prefer to shop by person? Go to <Link href="/men" style={{ color: 'var(--black)', textDecoration: 'underline' }}>men</Link>, <Link href="/women" style={{ color: 'var(--black)', textDecoration: 'underline' }}>women</Link> or <Link href="/kids" style={{ color: 'var(--black)', textDecoration: 'underline' }}>kids</Link>, or check the <Link href="/size-guide" style={{ color: 'var(--black)', textDecoration: 'underline' }}>size guide</Link>.
        </p>
      </section>
    </div>
  );
}

function CollectionCard({ col }: { col: any }) {
  return (
    <Link href={`/collections/${col.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
      <div style={{ overflow: 'hidden' }}>
        <div style={{
          position: 'relative', aspectRatio: '3/4', overflow: 'hidden',
          backgroundColor: 'var(--raw-cotton)',
        }}
          className="collection-card-img-wrap"
        >
          {col.thumbnail ? (
            <Image
              src={col.thumbnail}
              alt={col.name}
              fill
              style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }}
              className="collection-card-img"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          ) : (
            <Initials name={col.name} />
          )}
        </div>
        <div style={{ paddingTop: 14, textAlign: 'center' }}>
          <p style={{ fontSize: 14, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>
            {col.name}
          </p>
          {col._count?.products !== undefined && (
            <p style={{ fontSize: 11, color: 'var(--dust)' }}>
              {col._count.products} {col._count.products === 1 ? 'product' : 'products'}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
