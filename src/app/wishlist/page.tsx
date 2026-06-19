'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useWishlist } from '@/context/WishlistContext';
import { formatPrice } from '@/lib/utils';
import { Heart, ChevronLeft, X } from 'lucide-react';

export default function WishlistPage() {
  const router = useRouter();
  const { items, removeItem } = useWishlist();

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: 'easeOut' }}
      style={{ minHeight: '100vh', background: '#F5F0E8', fontFamily: 'DM Sans, sans-serif', padding: 'clamp(48px,8vw,80px) 24px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>

        <button onClick={() => router.back()}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', padding: 0, cursor: 'pointer', marginBottom: 36, color: '#9E9987', fontSize: 12, letterSpacing: '0.08em', fontFamily: 'DM Sans, sans-serif' }}>
          <ChevronLeft size={14} strokeWidth={1.5} /> Back
        </button>

        <p style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9E9987', marginBottom: 12 }}>My Account</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 44 }}>
          <h1 style={{ fontSize: 28, fontWeight: 300, color: '#1A1A1A', letterSpacing: '-0.01em' }}>Wishlist</h1>
          {items.length > 0 && (
            <span style={{ fontSize: 12, color: '#9E9987' }}>{items.length} {items.length === 1 ? 'piece' : 'pieces'}</span>
          )}
        </div>

        {items.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
            style={{ textAlign: 'center', padding: '80px 0' }}>
            <Heart size={36} strokeWidth={1} color="#C8C3BA" style={{ display: 'block', margin: '0 auto 24px' }} />
            <p style={{ fontSize: 18, fontWeight: 300, color: '#1A1A1A', marginBottom: 8, letterSpacing: '-0.01em' }}>Your wishlist is empty.</p>
            <p style={{ fontSize: 13, color: '#9E9987', marginBottom: 36, lineHeight: 1.7 }}>Save pieces you love for later.<br />Pure cotton finds worth keeping.</p>
            <Link href="/men" style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1A1A1A', textDecoration: 'none', borderBottom: '1px solid #1A1A1A', paddingBottom: 2 }}>
              Explore Collection →
            </Link>
          </motion.div>
        ) : (
          <div style={{ borderTop: '1px solid rgba(26,26,26,0.1)' }}>
            {items.map((product, idx) => (
              <motion.div key={product.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: idx * 0.06 }}
                layout exit={{ opacity: 0, x: -20 }}
                style={{ display: 'flex', gap: 20, padding: '20px 0', borderBottom: '1px solid rgba(26,26,26,0.1)', alignItems: 'center' }}>

                <Link href={`/${product.category}/${product.slug}`} style={{ flexShrink: 0, textDecoration: 'none' }}>
                  <div style={{ position: 'relative', width: 80, height: 100, background: 'rgba(26,26,26,0.04)', overflow: 'hidden' }}>
                    <Image src={product.images[0]} alt={product.name} fill style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }}
                      sizes="80px"
                      onMouseEnter={e => ((e.target as HTMLImageElement).style.transform = 'scale(1.04)')}
                      onMouseLeave={e => ((e.target as HTMLImageElement).style.transform = 'scale(1)')} />
                  </div>
                </Link>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link href={`/${product.category}/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <p style={{ fontSize: 14, color: '#1A1A1A', marginBottom: 4, fontWeight: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {product.name}
                    </p>
                    <p style={{ fontSize: 13, color: '#9E9987', marginBottom: 14 }}>{formatPrice(product.price)}</p>
                  </Link>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <Link href={`/${product.category}/${product.slug}`}
                      style={{ fontSize: 10, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1A1A1A', textDecoration: 'none', borderBottom: '1px solid rgba(26,26,26,0.3)', paddingBottom: 2 }}>
                      View →
                    </Link>
                  </div>
                </div>

                <button onClick={() => removeItem(product.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C8C3BA', padding: 4, flexShrink: 0, transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#1A1A1A')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#C8C3BA')}
                  aria-label="Remove from wishlist">
                  <X size={16} strokeWidth={1.5} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
