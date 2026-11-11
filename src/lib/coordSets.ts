// The shop has no "co-ord" tag, so a co-ord set is a product whose own name says so.
// "co-ard" is a typo that exists in one product name today; it still counts.
export const MIN_COORD_SETS = 3;

export function coordSets<T extends { name?: string }>(products: T[]): T[] {
  return products.filter((p) => /\bco-?(ord|ard)\b/i.test(p.name || ''));
}
