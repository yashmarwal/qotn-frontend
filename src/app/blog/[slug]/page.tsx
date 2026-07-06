import type { Metadata } from 'next';
import Script from 'next/script';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { articles, getArticle } from '../articles';

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return { title: 'QOTN' };

  const url = `https://qotn.in/blog/${slug}`;
  return {
    title: `${article.title} | QOTN`,
    description: article.description,
    alternates: { canonical: url },
    openGraph: {
      title: article.title,
      description: article.description,
      url,
      type: 'article',
      publishedTime: article.publishedAt,
      authors: ['QOTN'],
    },
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
    author: { '@type': 'Organization', name: 'QOTN', url: 'https://qotn.in' },
    publisher: {
      '@type': 'Organization',
      name: 'QOTN',
      url: 'https://qotn.in',
      logo: { '@type': 'ImageObject', url: 'https://qotn.in/logo-square-512.png' },
    },
    url: `https://qotn.in/blog/${slug}`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://qotn.in/blog/${slug}` },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://qotn.in' },
      { '@type': 'ListItem', position: 2, name: 'Cotton Journal', item: 'https://qotn.in/blog' },
      { '@type': 'ListItem', position: 3, name: article.title, item: `https://qotn.in/blog/${slug}` },
    ],
  };

  // Related articles (exclude current)
  const related = articles.filter((a) => a.slug !== slug).slice(0, 3);

  return (
    <>
      <Script id="article-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <Script id="article-breadcrumb" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div style={{ backgroundColor: 'var(--cream)', minHeight: '100vh' }}>
        {/* Hero */}
        <div style={{ backgroundColor: 'var(--black)', padding: '56px 24px 48px', textAlign: 'center' }}>
          <span style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.45)', border: '1px solid rgba(245,240,232,0.2)', padding: '3px 10px', borderRadius: 2 }}>
            {article.category}
          </span>
          <h1 style={{ fontSize: 'clamp(22px, 4vw, 40px)', fontWeight: 300, letterSpacing: '0.06em', color: 'var(--cream)', lineHeight: 1.35, maxWidth: 680, margin: '16px auto 12px' }}>
            {article.title}
          </h1>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, color: 'rgba(245,240,232,0.45)', letterSpacing: '0.04em' }}>QOTN · {formatDate(article.publishedAt)}</span>
            <span style={{ fontSize: 11, color: 'rgba(245,240,232,0.45)' }}>{article.readTime} min read</span>
          </div>
        </div>

        {/* Body */}
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 24px 80px' }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 40, fontSize: 11, color: 'var(--dust)', letterSpacing: '0.06em', flexWrap: 'wrap' }}>
            <Link href="/" style={{ color: 'var(--dust)', textDecoration: 'none' }}>Home</Link>
            <span>/</span>
            <Link href="/blog" style={{ color: 'var(--dust)', textDecoration: 'none' }}>Cotton Journal</Link>
            <span>/</span>
            <span style={{ color: 'var(--black)' }}>{article.title}</span>
          </div>

          {/* Lead */}
          <p style={{ fontSize: 16, lineHeight: 1.8, color: 'var(--dust)', marginBottom: 32 }}>
            {article.description}
          </p>

          {/* Sections */}
          {article.body.map((section, i) => (
            <div key={i} style={{ marginBottom: 28 }}>
              {section.heading && (
                <h2 style={{ fontSize: 14, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--black)', marginBottom: 10 }}>
                  {section.heading}
                </h2>
              )}
              <p style={{ fontSize: 15, lineHeight: 1.85, color: 'rgba(26,26,26,0.8)' }}>
                {section.text}
              </p>
            </div>
          ))}

          {/* Divider + CTA */}
          <div style={{ borderTop: '1px solid var(--border)', marginTop: 48, paddingTop: 36, textAlign: 'center' }}>
            <p style={{ fontSize: 12, color: 'var(--dust)', letterSpacing: '0.08em', marginBottom: 16, textTransform: 'uppercase' }}>
              Shop Pure Cotton at QOTN
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              {[{ href: '/men', label: 'Men' }, { href: '/women', label: 'Women' }, { href: '/kids', label: 'Kids' }].map((c) => (
                <Link key={c.href} href={c.href}>
                  <button style={{ padding: '10px 24px', background: 'var(--black)', color: 'var(--cream)', border: 'none', fontSize: 11, letterSpacing: '0.10em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                    {c.label}
                  </button>
                </Link>
              ))}
            </div>
          </div>

          {/* Related */}
          {related.length > 0 && (
            <div style={{ marginTop: 56 }}>
              <h2 style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dust)', marginBottom: 20 }}>
                More from Cotton Journal
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {related.map((r) => (
                  <Link key={r.slug} href={`/blog/${r.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ padding: '18px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                      <div>
                        <p style={{ fontSize: 13, color: 'var(--dust)', marginBottom: 4, letterSpacing: '0.04em' }}>{r.category}</p>
                        <p style={{ fontSize: 15, fontWeight: 400, color: 'var(--black)' }}>{r.title}</p>
                      </div>
                      <span style={{ fontSize: 13, color: 'var(--dust)', flexShrink: 0 }}>→</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
