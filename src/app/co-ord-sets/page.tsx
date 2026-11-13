import type { Metadata } from 'next';
import CategoryLanding from '@/components/seo/CategoryLanding';
import { fetchAllProducts } from '@/lib/api';
import { coordSets, MIN_COORD_SETS } from '@/lib/coordSets';
import { COORD_SETS, landingMetadata } from '@/lib/seoPages';

// Same refresh rhythm as the category pages
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const all = await fetchAllProducts(300);
  // noindex only when the live list was read and is too short; a failed read must never decide this
  return landingMetadata(COORD_SETS, all !== null && coordSets(all).length < MIN_COORD_SETS);
}

export default async function CoordSetsPage() {
  const all = await fetchAllProducts(300);
  return <CategoryLanding cfg={COORD_SETS} rawProducts={coordSets(all ?? [])} />;
}
