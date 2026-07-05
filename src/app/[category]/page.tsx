import type { Metadata } from 'next';
import CategoryPageClient from './CategoryPageClient';

const SITE = 'https://qotn.in';

const categoryMeta: Record<string, { title: string; description: string }> = {
  men: {
    title: "Men's Cotton Clothing — Kurtas, Shirts & More | QOTN",
    description: "Shop men's 100% pure cotton clothing online — kurtas, shirts, pyjamas and more. No blends. Made in India. Free shipping above ₹1499.",
  },
  women: {
    title: "Women's Cotton Clothing — Dresses, Kurtas & More | QOTN",
    description: "Shop women's 100% pure cotton clothing online — dresses, kurtas, tops and more. No blends. Made in India. Free shipping above ₹1499.",
  },
  kids: {
    title: "Kids' Cotton Clothing — Comfortable & Pure | QOTN",
    description: "Shop kids' 100% pure cotton clothing online. Breathable, soft, and safe. No blends. Made in India. Free shipping above ₹1499.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const cap = category.charAt(0).toUpperCase() + category.slice(1);
  const meta = categoryMeta[category] ?? {
    title: `${cap} — Pure Cotton Clothing | QOTN`,
    description: `Shop pure cotton ${category} clothing online. Made in India.`,
  };
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: `${SITE}/${category}` },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `${SITE}/${category}`,
    },
  };
}

export default function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  return <CategoryPageClient params={params} />;
}
