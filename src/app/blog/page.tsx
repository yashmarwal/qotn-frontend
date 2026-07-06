import type { Metadata } from 'next';
import Script from 'next/script';
import Link from 'next/link';
import { articles } from './articles';
import BlogCard from './BlogCard';

export const metadata: Metadata = {
  title: 'Cotton Journal — Care, Fabric & Sustainability | QOTN',
  description:
    'Guides on caring for cotton, understanding fabric weaves, BCI cotton, and why pure cotton outperforms blends. Written by QOTN.',
  alternates: { canonical: 'https://qotn.in/blog' },
  openGraph: {
    title: 'Cotton Journal | QOTN',
    description: 'In-depth guides on cotton — fabric, care, and sustainability.',
    url: 'https://qotn.in/blog',
  },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://qotn.in' },
    { '@type': 'ListItem', position: 2, name: 'Cotton Journal', item: 'https://qotn.in/blog' },
  ],
};

export default function BlogPage() {
  return (
    <>
      <Script id="blog-breadcrumb" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div style={{ backgroundColor: 'var(--cream)', minHeight: '100vh' }}>
        {/* Hero */}
        <div style={{ backgroundColor: 'var(--black)', padding: '60px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 10, letterSpacing: '0.16em', color: 'rgba(245,240,232,0.45)', textTransform: 'uppercase', marginBottom: 14 }}>
            QOTN
          </p>
          <h1 style={{ fontSize: 'clamp(28px, 6vw, 52px)', fontWeight: 300, letterSpacing: '0.10em', color: 'var(--cream)', textTransform: 'uppercase', marginBottom: 12 }}>
            Cotton Journal
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(245,240,232,0.55)', letterSpacing: '0.04em', maxWidth: 440, margin: '0 auto', lineHeight: 1.7 }}>
            Guides on fabric, care, and sustainability — because knowing your cotton makes wearing it better.
          </p>
        </div>

        {/* Article grid */}
        <div style={{ maxWidth: 880, margin: '0 auto', padding: '48px 24px 80px' }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 40, fontSize: 11, color: 'var(--dust)', letterSpacing: '0.06em' }}>
            <Link href="/" style={{ color: 'var(--dust)', textDecoration: 'none' }}>Home</Link>
            <span>/</span>
            <span style={{ color: 'var(--black)' }}>Cotton Journal</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 32 }}>
            {articles.map((article) => (
              <BlogCard key={article.slug} article={article} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
