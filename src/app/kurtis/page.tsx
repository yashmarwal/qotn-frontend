import type { Metadata } from 'next';
import CategoryLanding from '@/components/seo/CategoryLanding';
import { fetchAllProducts } from '@/lib/api';
import { KURTIS as CFG, MIN_PAGE_PRODUCTS, landingMetadata } from '@/lib/seoPages';

// Same refresh rhythm as the category pages
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const all = await fetchAllProducts(300);
  // noindex only when the live list was read and is too short; a failed read must never decide this
  return landingMetadata(CFG, all !== null && all.filter(CFG.filter).length < MIN_PAGE_PRODUCTS);
}

export default async function Page() {
  const all = await fetchAllProducts(300);
  return <CategoryLanding cfg={CFG} rawProducts={(all ?? []).filter(CFG.filter)} />;
}
