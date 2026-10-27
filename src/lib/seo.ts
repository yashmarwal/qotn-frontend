export const SITE_URL = 'https://www.qotn.in';

export const OG_IMAGE = {
  url: `${SITE_URL}/og-image.png`,
  width: 1200,
  height: 630,
  alt: 'QOTN — Pure Cotton. Nothing Else.',
};

/**
 * Tidy text for a meta description: collapse line breaks and runs of spaces, drop stray
 * wrapping quotes, and cut at a word boundary so Google doesn't truncate mid-word.
 */
export function cleanText(text: string, max = 155): string {
  const t = text.replace(/\s+/g, ' ').replace(/^["'“”‘’\s]+|["'“”‘’\s]+$/g, '');
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  return cut.slice(0, Math.max(cut.lastIndexOf(' '), 0)).replace(/[,;:\-–—\s]+$/, '') + '…';
}
