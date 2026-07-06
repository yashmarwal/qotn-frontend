'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/types';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  variant?: 'desktop' | 'mobile';
}

function QuickAddSheet({ product, onClose }: { product: Product; onClose: () => void }) {
  const [selectedSize, setSelectedSize] = useState('');
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const handleAdd = () => {
    if (!selectedSize || added) return;
    addItem(product, selectedSize, product.colors[0] || '', 1);
    setAdded(true);
    setTimeout(() => { onClose(); }, 900);
  };

  return createPortal(
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300 }}
      />
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 301,
          backgroundColor: 'var(--cream)', borderRadius: '14px 14px 0 0',
          paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 10, paddingBottom: 2 }}>
          <div style={{ width: 36, height: 4, background: 'var(--border)', borderRadius: 2 }} />
        </div>

        <div style={{ padding: '12px 16px 0' }}>
          {/* Header */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 18 }}>
            <div style={{ position: 'relative', width: 56, height: 72, flexShrink: 0, background: 'var(--raw-cotton)', borderRadius: 4, overflow: 'hidden' }}>
              <Image src={product.images[0]} alt={product.name} fill style={{ objectFit: 'cover' }} sizes="56px" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--black)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--black)', marginTop: 2 }}>{formatPrice(product.price)}</p>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--dust)', flexShrink: 0 }}>
              <X size={18} strokeWidth={1.5} />
            </button>
          </div>

          {/* Size label */}
          <p style={{ fontSize: 10, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--dust)', fontWeight: 500, marginBottom: 10 }}>
            Select Size
          </p>

          {/* Size buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
            {product.sizes.map(size => {
              const sel = selectedSize === size;
              return (
                <motion.button key={size}
                  whileTap={{ scale: 0.88 }} transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                  onClick={() => setSelectedSize(size)}
                  style={{ padding: '9px 16px', fontSize: 12, border: sel ? 'none' : '1px solid var(--border)', background: sel ? 'var(--black)' : 'transparent', color: sel ? 'var(--cream)' : 'var(--black)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', minHeight: 'unset', transition: 'all 0.15s', borderRadius: 4 }}>
                  {size}
                </motion.button>
              );
            })}
          </div>

          {/* Add button */}
          <motion.button
            onClick={handleAdd}
            disabled={!selectedSize}
            whileTap={selectedSize ? { scale: 0.97 } : {}}
            style={{ width: '100%', height: 52, background: selectedSize ? 'var(--black)' : 'var(--border)', color: selectedSize ? 'var(--cream)' : 'var(--dust)', border: 'none', fontSize: 12, letterSpacing: '0.10em', textTransform: 'uppercase', cursor: selectedSize ? 'pointer' : 'default', fontFamily: 'DM Sans, sans-serif', fontWeight: 500, overflow: 'hidden', position: 'relative' }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={added ? 'added' : 'add'}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                style={{ display: 'block' }}
              >
                {added ? 'Added to Bag ✓' : selectedSize ? 'Add to Bag' : 'Select a Size'}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.div>
    </>,
    document.body
  );
}

export default function ProductCard({ product, variant = 'desktop' }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { isInWishlist, toggleItem } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  useEffect(() => { setMounted(true); }, []);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  if (variant === 'mobile') {
    return (
      <>
        <Link
          href={`/${product.category}/${product.slug}`}
          style={{ display: 'block', textDecoration: 'none', color: 'inherit', minWidth: 0, width: '100%', overflow: 'hidden' }}
        >
          <div style={{ overflow: 'hidden', backgroundColor: 'transparent', width: '100%', minWidth: 0 }}>
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
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginBottom: 7, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--black)' }}>{formatPrice(product.price)}</span>
                {product.originalPrice && (
                  <span style={{ fontSize: 10, color: 'var(--dust)', textDecoration: 'line-through' }}>{formatPrice(product.originalPrice)}</span>
                )}
                {discount && (
                  <span style={{ fontSize: 10, color: '#2E7D32', fontWeight: 500 }}>{discount}% off</span>
                )}
              </div>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickAddOpen(true); }}
                style={{
                  width: '100%', height: 32, minHeight: 'unset', background: '#1A1A1A', color: '#F5F0E8',
                  border: 'none', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
                  cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 500,
                }}>
                ADD
              </button>
            </div>
          </div>
        </Link>

        {mounted && quickAddOpen && (
          <AnimatePresence>
            <QuickAddSheet product={product} onClose={() => setQuickAddOpen(false)} />
          </AnimatePresence>
        )}
      </>
    );
  }

  const hasSecondImage = product.images.length > 1;

  // Desktop variant
  return (
    <Link
      href={`/${product.category}/${product.slug}`}
      style={{
        display: 'block', textDecoration: 'none', color: 'inherit',
        transform: hovered ? 'translateY(-5px)' : 'translateY(0)',
        transition: 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
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
