// Picks the real products shown in the desktop hero strip, and builds the image address for each.
// Photos live on Cloudinary, which can cut the background out on the fly (its AI background-removal add-on).

export interface HeroTile {
  slug: string;
  name: string;
  /** The product's main photo, as stored. */
  photo: string;
}

const UPLOAD = '/image/upload/';

/**
 * Same photo with the background removed, the empty margin trimmed, and the garment fitted (with a small margin) into one
 * 3:4 transparent frame, so every piece shows at a similar size. The first request for a photo takes a few seconds while
 * Cloudinary works; after that it is cached.
 */
export function cutoutUrl(photo: string): string {
  return photo.includes(UPLOAD)
    ? photo.replace(UPLOAD, `${UPLOAD}e_background_removal/e_trim/c_fit,w_640,h_880/c_pad,w_720,h_960,b_transparent/f_webp,q_80/`)
    : photo;
}

/**
 * Takes the live catalogue (newest first) and returns up to `count` products with a photo, taking turns between
 * men, women and kids so the strip is mixed. Fewer than `count` products simply gives fewer tiles.
 */
export function pickHeroTiles(products: any[], count = 12): HeroTile[] {
  const groups: Record<string, HeroTile[]> = { MEN: [], WOMEN: [], KIDS: [] };
  const rest: HeroTile[] = [];
  for (const p of products ?? []) {
    const images: any[] = p?.images ?? [];
    const photo: string | undefined = (images.find((i) => i.isPrimary) ?? images[0])?.url;
    if (!photo || !p.slug) continue;
    const tile = { slug: p.slug as string, name: (p.name as string) ?? '', photo };
    (groups[p.gender] ?? rest).push(tile);
  }
  const out: HeroTile[] = [];
  const lanes = [groups.MEN, groups.WOMEN, groups.KIDS];
  for (let i = 0; out.length < count && lanes.some((l) => i < l.length); i++) {
    for (const lane of lanes) if (i < lane.length && out.length < count) out.push(lane[i]);
  }
  for (const t of rest) if (out.length < count) out.push(t);
  return out;
}
