// Runs in the admin's browser before an image is uploaded, so phone photos of several MB
// leave as a ~100-220 KB WebP at the same on-screen sharpness.
const MAX_SIDE = 1600;            // longest edge in px; storefront never shows a product photo larger
const TARGET_BYTES = 220 * 1024;  // stop lowering quality once the file fits
const START_QUALITY = 0.92;       // start near-lossless and only step down if the file is still too big
const MIN_QUALITY = 0.7;          // floor: below this banding starts to show on fabric textures

export interface CompressResult {
  file: File;
  before: number;
  after: number;
}

export async function compressImage(file: File): Promise<CompressResult> {
  const unchanged = { file, before: file.size, after: file.size };
  // GIFs would lose their animation; anything that isn't an image is not ours to touch
  if (!file.type.startsWith('image/') || file.type === 'image/gif') return unchanged;

  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return unchanged;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    let blob: Blob | null = null;
    for (let q = START_QUALITY; q >= MIN_QUALITY - 1e-6; q -= 0.05) {
      blob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/webp', q));
      if (!blob || blob.size <= TARGET_BYTES) break;
    }

    // Browser can't encode WebP, or the original was already smaller: keep the original
    if (!blob || blob.type !== 'image/webp' || blob.size >= file.size) return unchanged;

    const name = file.name.replace(/\.[^.]+$/, '') + '.webp';
    return { file: new File([blob], name, { type: 'image/webp' }), before: file.size, after: blob.size };
  } catch {
    return unchanged;
  }
}

export const formatBytes = (n: number) =>
  n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;
