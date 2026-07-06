'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Article } from './articles';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function BlogCard({ article }: { article: Article }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/blog/${article.slug}`}
      style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column' }}
    >
      <article
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          border: `1px solid ${hovered ? 'var(--black)' : 'var(--border)'}`,
          padding: 28,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          height: '100%',
          transition: 'border-color 0.2s',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dust)', border: '1px solid var(--border)', padding: '3px 8px', borderRadius: 2 }}>
            {article.category}
          </span>
          <span style={{ fontSize: 11, color: 'var(--dust)' }}>{article.readTime} min read</span>
        </div>
        <h2 style={{ fontSize: 17, fontWeight: 400, lineHeight: 1.45, color: 'var(--black)', margin: 0 }}>
          {article.title}
        </h2>
        <p style={{ fontSize: 13, color: 'var(--dust)', lineHeight: 1.7, flex: 1, margin: 0 }}>
          {article.description}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
          <span style={{ fontSize: 11, color: 'var(--dust)' }}>{formatDate(article.publishedAt)}</span>
          <span style={{ fontSize: 11, letterSpacing: '0.08em', color: 'var(--black)' }}>Read →</span>
        </div>
      </article>
    </Link>
  );
}
