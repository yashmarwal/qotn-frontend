import Link from 'next/link';

const BLOCKS: { h2: string; body: string; links: { href: string; label: string }[] }[] = [
  {
    h2: 'Kurta Sets & Kurtis for Women',
    body: 'Kurta palazzo sets, kurta sets with dupatta, and halter, flared and side-tie kurtis, all in 100% cotton with no blends.',
    links: [{ href: '/kurta-sets', label: 'Kurta sets' }, { href: '/kurtis', label: 'Kurtis' }, { href: '/co-ord-sets', label: 'Co-ord sets' }],
  },
  {
    h2: 'Cotton Sarees',
    body: 'Light, breathable cotton sarees in bold batik-look prints, made in India.',
    links: [{ href: '/cotton-sarees', label: 'Shop cotton sarees' }],
  },
  {
    h2: 'Cotton Shirts for Men',
    body: 'Striped, printed and floral shirts in pure cotton, stitched in Jaipur.',
    links: [{ href: '/men', label: "Men's shirts" }, { href: '/men/striped-shirts', label: 'Striped shirts' }],
  },
  {
    h2: "Kids' Pure Cotton Wear",
    body: 'Soft co-ord sets, kurta pajama sets, short sets and dresses for children.',
    links: [{ href: '/kids', label: "Kids' clothing" }],
  },
  {
    h2: 'Why 100% Pure Cotton?',
    body: 'Every fabric is 100% cotton, with no polyester or other blends. We test and certify every batch, and every piece is made in India.',
    links: [{ href: '/about', label: 'About QOTN' }, { href: '/blog', label: 'Cotton Journal' }],
  },
];

/** Crawlable headings and links to every category, under the home page. */
export default function HomeSeoSection() {
  return (
    <section style={{ backgroundColor: 'var(--cream)', borderTop: '1px solid var(--border)', padding: '56px 24px 64px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 32 }}>
        {BLOCKS.map((b) => (
          <div key={b.h2}>
            <h2 style={{ fontSize: 16, fontWeight: 500, letterSpacing: '0.06em', marginBottom: 8 }}>{b.h2}</h2>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--dust)', marginBottom: 10 }}>{b.body}</p>
            <p style={{ fontSize: 13 }}>
              {b.links.map((l, i) => (
                <span key={l.href}>
                  {i > 0 && ' · '}
                  <Link href={l.href} style={{ color: 'var(--black)', textDecoration: 'underline' }}>{l.label}</Link>
                </span>
              ))}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
