/**
 * Text for a <script type="application/ld+json"> block.
 * JSON.stringify leaves "<" untouched, so a product or article name containing "</script><script>..." could
 * close the block early and run as a real script. Writing "<" (and the two line-separator characters) as
 * JSON unicode escapes makes that impossible, while search engines still read exactly the same data.
 */
const BACKSLASH = String.fromCharCode(92);
const LINE_SEPARATOR = String.fromCharCode(0x2028);
const PARAGRAPH_SEPARATOR = String.fromCharCode(0x2029);

export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .split('<').join(BACKSLASH + 'u003c')
    .split(LINE_SEPARATOR).join(BACKSLASH + 'u2028')
    .split(PARAGRAPH_SEPARATOR).join(BACKSLASH + 'u2029');
}
