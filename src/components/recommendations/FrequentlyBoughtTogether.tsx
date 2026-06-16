'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { adaptApiProductList } from '@/lib/adapters';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types';

interface Props { productId: string }

export default function FrequentlyBoughtTogether({ productId }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const { addItem } = useCart();

  useEffect(() => {
    fetch(`${typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:3001/api' : '/api'}/recommendations/product/${productId}`)
      .then(r => r.json())
      .then(d => setProducts(adaptApiProductList(d.data || [])))
      .catch(() => {});
  }, [productId]);

  if (products.length === 0) return null;

  return (
    <div style={{ padding: '32px 0', borderTop: '1px solid var(--border)' }}>
      <h3 style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500, marginBottom: 20 }}>Frequently Bought Together</h3>
      <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }}>
        {products.slice(0, 3).map(p => (
          <div key={p.id} style={{ flexShrink: 0, width: 140, border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
            <Link href={`/${p.category}/${p.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ aspectRatio: '3/4', position: 'relative', background: '#f5f5f5' }}>
                {p.images[0] && <Image src={p.images[0]} alt={p.name} fill style={{ objectFit: 'cover' }} />}
              </div>
              <div style={{ padding: '10px 10px 4px' }}>
                <p style={{ fontSize: 11, margin: '0 0 4px', fontWeight: 500, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>{p.name}</p>
                <p style={{ fontSize: 12, margin: 0, fontWeight: 600 }}>{formatPrice(p.price)}</p>
              </div>
            </Link>
            <button
              onClick={() => addItem(p, p.sizes[0] || 'M', p.colors[0] || 'Default')}
              style={{ width: '100%', padding: '8px', background: 'var(--ink)', color: 'var(--cream)', border: 'none', cursor: 'pointer', fontSize: 11, letterSpacing: '0.06em', fontFamily: 'inherit' }}
            >
              Add +
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
