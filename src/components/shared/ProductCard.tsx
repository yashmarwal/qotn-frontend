'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Star } from 'lucide-react';
import { Product } from '@/types';
import { useWishlist } from '@/context/WishlistContext';
import { formatPrice } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  variant?: 'desktop' | 'mobile';
}

export default function ProductCard({ product, variant = 'desktop' }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const { isInWishlist, toggleItem } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  if (variant === 'mobile') {
    return (
      <Link
        href={`/${product.category}/${product.slug}`}
        style={{ display: 'block', textDecoration: 'none', color: 'inherit', minWidth: 0, overflow: 'hidden' }}
      >
        <div style={{ overflow: 'hidden', backgroundColor: 'transparent', width: '100%' }}>
          {/* Image — paddingBottom maintains 3:4 ratio reliably across all mobile browsers */}
          <div style={{ position: 'relative', paddingBottom: '133.33%', backgroundColor: 'var(--raw-cotton)', overflow: 'hidden', borderRadius: 4 }}>
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              style={{ objectFit: 'cover' }}
              sizes="50vw"
              loading="lazy"
            />
            {/* Badge — NEW takes priority */}
            {(product.isNew || product.isBestseller) && (
              <span style={{
                position: 'absolute', top: 8, left: 8,
                background: 'var(--black)', color: 'var(--cream)',
                fontSize: 8, fontWeight: 600, letterSpacing: '0.10em',
                textTransform: 'uppercase', padding: '3px 6px',
              }}>
                {product.isNew ? 'NEW' : 'BESTSELLER'}
              </span>
            )}
            {/* Wishlist heart */}
            <button
              onClick={(e) => { e.preventDefault(); toggleItem(product); }}
              aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              style={{
                position: 'absolute', top: 8, right: 8,
                background: 'rgba(255,255,255,0.88)', border: 'none',
                width: 32, height: 32, minHeight: 'unset', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', padding: 0,
              }}
            >
              <Heart size={14} strokeWidth={1.5} fill={inWishlist ? '#1A1A1A' : 'none'} color="#1A1A1A" />
            </button>
          </div>

          {/* Info */}
          <div style={{ padding: '8px 2px 4px', minWidth: 0, width: '100%' }}>
            <p style={{ fontSize: 9, letterSpacing: '0.08em', color: 'var(--dust)', marginBottom: 2, textTransform: 'uppercase' }}>QOTN</p>
            <p style={{ fontSize: 12, fontWeight: 400, color: 'var(--black)', lineHeight: 1.3, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {product.name}
            </p>
            {product.reviews > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 4 }}>
                <div style={{ display: 'flex', gap: 1 }}>
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} size={9} strokeWidth={1} fill={s <= Math.round(product.rating) ? '#1A1A1A' : 'none'} color="#1A1A1A" />
                  ))}
                </div>
                <span style={{ fontSize: 9, color: 'var(--dust)' }}>({product.reviews})</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginBottom: 7, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--black)' }}>{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span style={{ fontSize: 10, color: 'var(--dust)', textDecoration: 'line-through' }}>{formatPrice(product.originalPrice)}</span>
              )}
              {discount && (
                <span style={{ fontSize: 10, color: '#2E7D32', fontWeight: 500 }}>{discount}% off</span>
              )}
            </div>
            <button style={{
              width: '100%', height: 32, minHeight: 'unset', background: '#1A1A1A', color: '#F5F0E8',
              border: 'none', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
              cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 500,
            }}>
              ADD
            </button>
          </div>
        </div>
      </Link>
    );
  }

  const hasSecondImage = product.images.length > 1;

  // Desktop variant
  return (
    <Link
      href={`/${product.category}/${product.slug}`}
      style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ position: 'relative', aspectRatio: '4/5', overflow: 'hidden', backgroundColor: 'var(--raw-cotton)' }}>
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          style={{
            objectFit: 'cover',
            transition: hasSecondImage ? 'opacity 0.45s ease' : 'transform 0.4s ease',
            opacity: hasSecondImage && hovered ? 0 : 1,
            transform: !hasSecondImage && hovered ? 'scale(1.03)' : 'scale(1)',
          }}
          sizes="(max-width: 1200px) 33vw, 25vw"
        />
        {hasSecondImage && (
          <Image
            src={product.images[1]}
            alt={product.name}
            fill
            style={{
              objectFit: 'cover',
              transition: 'opacity 0.45s ease',
              opacity: hovered ? 1 : 0,
            }}
            sizes="(max-width: 1200px) 33vw, 25vw"
          />
        )}
        {(product.isNew || product.isBestseller) && (
          <span
            style={{
              position: 'absolute', top: 12, left: 12,
              background: 'var(--black)', color: 'var(--cream)',
              fontSize: 9, fontWeight: 500, letterSpacing: '0.12em',
              textTransform: 'uppercase', padding: '4px 8px',
              zIndex: 1,
            }}
          >
            {product.isNew ? 'New' : 'Bestseller'}
          </span>
        )}
        <button
          onClick={(e) => { e.preventDefault(); toggleItem(product); }}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          style={{
            position: 'absolute', top: 12, right: 12,
            background: 'none', border: 'none', padding: 6,
            cursor: 'pointer', opacity: hovered ? 1 : 0, transition: 'opacity 0.3s',
            zIndex: 1,
          }}
        >
          <Heart size={18} strokeWidth={1.5} fill={inWishlist ? 'var(--black)' : 'none'} color="var(--black)" />
        </button>
      </div>
      <div style={{ paddingTop: 14, paddingBottom: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--black)' }}>{product.name}</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexShrink: 0 }}>
            {product.originalPrice && (
              <span style={{ fontSize: 12, color: 'var(--dust)', textDecoration: 'line-through' }}>
                {formatPrice(product.originalPrice)}
              </span>
            )}
            <span style={{ fontSize: 14, fontWeight: 500 }}>{formatPrice(product.price)}</span>
          </div>
        </div>
        <p style={{ fontSize: 11, color: 'var(--dust)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 4 }}>
          {product.subcategory}{discount && <span style={{ marginLeft: 8 }}>— {discount}% off</span>}
        </p>
      </div>
    </Link>
  );
}
