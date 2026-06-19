import type { Metadata } from 'next';

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
    openGraph: { title: m.title, description: m.description, url: `https://qotn.in/${category}` },
  };
}

export default function CategoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
