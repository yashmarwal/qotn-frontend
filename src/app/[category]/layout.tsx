import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

const VALID_CATEGORIES = new Set(['men', 'women', 'kids']);

const categoryLabels: Record<string, string> = {
  men: "Men's",
  women: "Women's",
  kids: "Kids'",
};

const meta: Record<string, { title: string; description: string }> = {
  men: {
    title: "Men's Pure Cotton Clothing — Shirts, Kurtas, T-Shirts | QOTN",
    description:
      "Shop men's 100% pure cotton clothing. Cotton shirts, kurtas, t-shirts and more. No synthetic blends. Free shipping above ₹1499.",
  },
  women: {
    title: "Women's Pure Cotton Clothing — Kurtis, Dresses, Tops | QOTN",
    description:
      "Shop women's 100% pure cotton clothing. Cotton kurtis, dresses, tops and co-ord sets. Breathable, soft, pure. Free shipping above ₹1499.",
  },
  kids: {
    title: 'Kids Pure Cotton Clothing — Safe & Soft | QOTN',
    description:
      'Shop kids 100% pure cotton clothing. Soft, breathable, OEKO-TEX safe. Cotton t-shirts, frocks, pyjamas for boys and girls.',
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const m = meta[category] ?? {
    title: 'QOTN — Pure Cotton Clothing',
    description: 'Shop 100% pure cotton clothing. Made in India.',
  };
  return {
    title: m.title,
    description: m.description,
    alternates: { canonical: `https://qotn.in/${category}` },
    openGraph: { title: m.title, description: m.description, url: `https://qotn.in/${category}` },
  };
}

export default async function CategoryLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (!VALID_CATEGORIES.has(category)) {
    notFound();
  }

  const label = categoryLabels[category] || category;
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://qotn.in' },
      { '@type': 'ListItem', position: 2, name: label, item: `https://qotn.in/${category}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {children}
    </>
  );
}
