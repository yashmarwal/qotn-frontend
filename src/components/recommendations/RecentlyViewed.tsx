'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { adaptApiProductList } from '@/lib/adapters';
import { formatPrice } from '@/lib/utils';
import { Product } from '@/types';

export default function RecentlyViewed({ currentProductId }: { currentProductId?: string }) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const sessionId = localStorage.getItem('qotn_session') || Math.random().toString(36).slice(2);
    localStorage.setItem('qotn_session', sessionId);

    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/recommendations/recently-viewed?sessionId=${sessionId}`)
      .then(r => r.json())
      .then(d => {
        const adapted = adaptApiProductList(d.data || []);
        setProducts(adapted.filter(p => p.id !== currentProductId).slice(0, 6));
      })
      .catch(() => {});
  }, [currentProductId]);

  if (products.length < 2) return null;

  return (
    <div style={{ padding: '40px 0', borderTop: '1px solid var(--border)' }}>
      <h3 style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500, marginBottom: 20 }}>Recently Viewed</h3>
      <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }}>
        {products.map(p => (
          <Link key={p.id} href={`/${p.category}/${p.slug}`} style={{ flexShrink: 0, width: 160, textDecoration: 'none', color: 'inherit' }}>
            <div style={{ aspectRatio: '3/4', position: 'relative', background: '#f5f5f5', borderRadius: 8, overflow: 'hidden' }}>
              {p.images[0] && <Image src={p.images[0]} alt={p.name} fill style={{ objectFit: 'cover' }} />}
            </div>
            <p style={{ fontSize: 13, margin: '8px 0 4px', fontWeight: 500 }}>{p.name}</p>
            <p style={{ fontSize: 12, margin: 0, color: 'var(--dust)' }}>{formatPrice(p.price)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
