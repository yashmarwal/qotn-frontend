import Link from 'next/link';
import { safeJsonLd } from '@/lib/jsonld';
import type { Faq, Related, Section } from '@/lib/seoPages';

/**
 * The readable SEO text under a category page: headed sections, an optional FAQ, and links to related pages.
 * Plain server-rendered HTML, so crawlers see all of it. Adds FAQPage structured data when there is a FAQ.
 */
export default function SeoSections({
  sections,
  faqTitle,
  faqs,
  related,
}: {
  sections: Section[];
  faqTitle?: string;
  faqs?: Faq[];
  related: Related[];
}) {
  const faqJsonLd = faqs?.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      }
    : null;

  return (
    <section style={{ backgroundColor: 'var(--cream)', borderTop: '1px solid var(--border)', padding: '40px 24px 56px' }}>
      {faqJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }} />}
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        {sections.map((s) => (
          <div key={s.h2} style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 400, letterSpacing: '0.04em', marginBottom: 10 }}>{s.h2}</h2>
            {s.body.map((para, i) => (
              <p key={i} style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--dust)', marginBottom: 10 }}>{para}</p>
            ))}
          </div>
        ))}

        {faqs && faqs.length > 0 && faqTitle && (
          <div style={{ marginTop: 32, marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 400, letterSpacing: '0.04em', marginBottom: 14 }}>{faqTitle}</h2>
            {faqs.map((f) => (
              <div key={f.q} style={{ marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{f.q}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--dust)' }}>{f.a}</p>
              </div>
            ))}
          </div>
        )}

        {related.length > 0 && (
          <p style={{ fontSize: 13, color: 'var(--dust)', marginTop: 8 }}>
            Also see{' '}
            {related.map((r, i) => (
              <span key={r.href}>
                {i > 0 && ', '}
                <Link href={r.href} style={{ color: 'var(--black)', textDecoration: 'underline' }}>{r.label}</Link>
              </span>
            ))}
            , our <Link href="/collections" style={{ color: 'var(--black)', textDecoration: 'underline' }}>collections</Link> and the{' '}
            <Link href="/size-guide" style={{ color: 'var(--black)', textDecoration: 'underline' }}>size guide</Link>.
          </p>
        )}
      </div>
    </section>
  );
}
