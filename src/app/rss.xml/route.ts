import { articles } from '../blog/articles';

export const dynamic = 'force-static';
export const revalidate = 86400;

export function GET() {
  const SITE = 'https://qotn.in';

  const items = articles
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .map(
      (a) => `
    <item>
      <title><![CDATA[${a.title}]]></title>
      <link>${SITE}/blog/${a.slug}</link>
      <guid isPermaLink="true">${SITE}/blog/${a.slug}</guid>
      <description><![CDATA[${a.description}]]></description>
      <pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>
      <category><![CDATA[${a.category}]]></category>
    </item>`
    )
    .join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>QOTN Cotton Journal</title>
    <link>${SITE}/blog</link>
    <description>Guides on cotton care, fabric, and sustainability by QOTN — Pure Cotton. Nothing Else.</description>
    <language>en-IN</language>
    <copyright>© ${new Date().getFullYear()} QOTN</copyright>
    <managingEditor>Helloqotn@gmail.com (QOTN)</managingEditor>
    <webMaster>Helloqotn@gmail.com (QOTN)</webMaster>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${SITE}/logo-square-512.png</url>
      <title>QOTN Cotton Journal</title>
      <link>${SITE}/blog</link>
    </image>
    ${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
    },
  });
}
