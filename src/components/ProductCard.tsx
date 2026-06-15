'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Product } from '@/types';
import { useWishlist } from '@/context/WishlistContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const { isInWishlist, toggleItem } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <Link
      href={`/${product.category}/${product.slug}`}
      style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div
        style={{
          position: 'relative',
          aspectRatio: '3/4',
          overflow: 'hidden',
          backgroundColor: 'var(--raw-cotton)',
        }}
      >
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          style={{
            objectFit: 'cover',
            transform: hovered ? 'scale(1.03)' : 'scale(1)',
            transition: 'transform 0.4s ease',
          }}
          sizes="(max-width: 768px) 50vw, 25vw"
        />

        {/* Badge */}
        {(product.isNew || product.isBestseller) && (
          <span
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              background: 'var(--black)',
              color: 'var(--cream)',
              fontSize: 9,
              fontWeight: 500,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              padding: '4px 8px',
            }}
          >
            {product.isNew ? 'New' : 'Bestseller'}
          </span>
        )}

        {/* Wishlist */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleItem(product);
          }}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'none',
            border: 'none',
            padding: 6,
            cursor: 'pointer',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.3s',
          }}
        >
          <Heart
            size={18}
            strokeWidth={1.5}
            fill={inWishlist ? 'var(--black)' : 'none'}
            color="var(--black)"
          />
        </button>
      </div>

      {/* Info */}
      <div style={{ paddingTop: 14, paddingBottom: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--black)' }}>
            {product.name}
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexShrink: 0 }}>
            {product.originalPrice && (
              <span style={{ fontSize: 12, color: 'var(--dust)', textDecoration: 'line-through' }}>
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
            <span style={{ fontSize: 14, fontWeight: 500 }}>
              ₹{product.price.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
        <p style={{ fontSize: 11, color: 'var(--dust)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 4 }}>
          {product.subcategory}
          {discount && (
            <span style={{ marginLeft: 8, color: 'var(--dust)' }}>— {discount}% off</span>
          )}
        </p>
      </div>
    </Link>
  );
}
