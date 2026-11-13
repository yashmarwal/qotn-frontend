// Search-friendly product titles and image descriptions, built from the product name and category.
// The names in the shop's admin have a few typos ("co-ard", "stripped", "plazo", "Procien") and mixed capitals. This tidies
// them for page titles and image alt text only; the on-page product name is still whatever is saved in the admin, so fix
// it there too (see SEO-IMPLEMENTATION.md for the list).

const AUDIENCE: Record<string, string> = { women: 'Women', men: 'Men', kids: 'Kids' };

/** Old address -> new address, for products whose slug has a typo. Applied only when the old address no longer exists (see the product page). */
export const SLUG_REDIRECTS: Record<string, string> = {
  'rose-pure-cotton-co-ard-set': 'rose-pure-cotton-co-ord-set',
  'orange-stripped-cotton-shirt': 'orange-striped-cotton-shirt',
  'procien-geometric-flared-kurti': 'geometric-flared-kurti',
  'coral-red-cotton-kurta-set-of-kurta-plazo': 'coral-red-cotton-kurta-palazzo-set',
  'floral-daman-print-kurta-&-plazo': 'floral-daman-print-kurta-palazzo-set',
  'ajrakh-print-look-kurta-set-of-kurta-pajama-dupatta': 'ajrakh-print-look-kurta-set-with-dupatta',
};

const SMALL_WORDS = new Set(['of', 'for', 'and', 'with', 'in']);

/** Fixes known typos and tidies capitals: "orange stripped cotton shirt" -> "Orange Striped Cotton Shirt". */
export function cleanProductName(name: string): string {
  let n = (name || '').trim();
  n = n
    .replace(/kurta\s*set\s*of\s*kurta\s*[&/]\s*pl[ao]zo/gi, 'Kurta Palazzo Set')
    .replace(/kurta\s*[&/]\s*pl[ao]zo/gi, 'Kurta Palazzo Set')
    .replace(/kurta\s*set\s*of\s*kurta\/pajama\/dupatta/gi, 'Kurta Set with Dupatta')
    .replace(/\bpl[ao]zzo\b|\bpl[ao]zo\b/gi, 'Palazzo')
    .replace(/\bco-?[oa]rd\b/gi, 'Co-ord')
    .replace(/\bbluestriped\b/gi, 'Blue Striped')
    .replace(/\bstripped\b/gi, 'Striped')
    .replace(/\bprocien\b/gi, '')
    .replace(/\//g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const words = n.split(' ').map((w, i) => {
    const lower = w.toLowerCase();
    if (i > 0 && SMALL_WORDS.has(lower)) return lower;
    if (lower === 'co-ord') return 'Co-ord';
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  });
  return words.join(' ');
}

function withPureCotton(n: string): string {
  if (/pure cotton/i.test(n)) return n;
  if (/\bcotton\b/i.test(n)) return n.replace(/\bCotton\b/, 'Pure Cotton');
  const m = n.match(/\b(Maxi Dress|Dress|Spaghetti Top|Top|Kurta|Kurti|Shirt|Saree|Co-ord|Set)\b/);
  return m && m.index !== undefined ? `${n.slice(0, m.index)}Pure Cotton ${n.slice(m.index)}` : `${n} in Pure Cotton`;
}

/** "Pink Floral Pure Cotton Co-ord Set for Women". Page title without the " | QOTN" the layout adds; stays within 53 characters where it can. */
export function seoProductTitle(name: string, category: string): string {
  const who = AUDIENCE[category];
  const base = withPureCotton(cleanProductName(name).replace(/\b(Kids|Women|Men)\b/gi, '').replace(/\s+/g, ' ').trim());
  const full = who ? `${base} for ${who}` : base;
  if (full.length <= 53) return full;
  if (base.length <= 53) return base;
  return cleanProductName(name);
}

/** Image description: "Pink floral pure cotton co-ord set - QOTN". */
export function seoProductAlt(name: string): string {
  const base = withPureCotton(cleanProductName(name).replace(/\b(Kids|Women|Men)\b/gi, '').replace(/\s+/g, ' ').trim()).toLowerCase();
  return `${base.charAt(0).toUpperCase()}${base.slice(1)} - QOTN`;
}
