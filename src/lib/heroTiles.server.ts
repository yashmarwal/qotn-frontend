// Server only (uses Node's https). Kept apart from heroTiles.ts so it never ends up in the browser bundle.
import https from 'node:https';
import { cutoutUrl, type HeroTile } from './heroTiles';

/**
 * Is this cut-out finished? Asks Cloudinary directly. A finished one answers 200 at once; one that has never been asked
 * for answers "423, still processing" and starts being made, so this check is also what sets new products going.
 * (Node's https rather than fetch: Next would cache a "not ready" answer, and a fetch with no caching makes the page dynamic.)
 */
function isReady(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const req = https.get(url, { timeout: 8000 }, (res) => {
      const ok = res.statusCode === 200 && String(res.headers['content-type'] ?? '').startsWith('image/');
      res.destroy();
      resolve(ok);
    });
    req.on('timeout', () => { req.destroy(); resolve(false); });
    req.on('error', () => resolve(false));
  });
}

/**
 * Keeps only the products whose cut-out is ready, in their original order, so the page never waits on one that is still
 * being made: it joins the next time this runs. Fewer than `min` ready gives none (the hero then shows without the strip).
 */
export async function readyHeroTiles(tiles: HeroTile[], min = 4): Promise<HeroTile[]> {
  const flags = await Promise.all(tiles.map((t) => isReady(cutoutUrl(t.photo))));
  const ready = tiles.filter((_, i) => flags[i]);
  return ready.length >= min ? ready : [];
}
