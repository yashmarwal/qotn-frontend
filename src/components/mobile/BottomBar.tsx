'use client';

import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

interface BottomBarProps {
  product: Product;
  selectedSize: string;
  onAddToBag: () => void;
  added: boolean;
  isOOS?: boolean;
}

export default function MobileBottomBar({ product, selectedSize, onAddToBag, added, isOOS }: BottomBarProps) {
  const router = useRouter();
  const { addItem } = useCart();

  const handleBuyNow = () => {
    if (!selectedSize || isOOS) return;
    addItem(product, selectedSize, product.colors[0] || '', 1);
    router.push('/checkout');
  };

  return (
    <div
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 60,
        backgroundColor: 'var(--black)',
        display: 'flex', alignItems: 'center',
        padding: '12px 16px', paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))', gap: 10,
      }}
    >
      <div style={{ flexShrink: 0, minWidth: 72 }}>
        <p style={{ fontSize: 10, color: 'rgba(245,240,232,0.5)', letterSpacing: '0.08em', marginBottom: 2 }}>Price</p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--cream)' }}>
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span style={{ fontSize: 11, color: 'rgba(245,240,232,0.4)', textDecoration: 'line-through' }}>
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={onAddToBag}
        disabled={!selectedSize || !!isOOS}
        style={{
          flex: 1, height: 48,
          background: (selectedSize && !isOOS) ? 'var(--cream)' : 'rgba(245,240,232,0.25)',
          color: (selectedSize && !isOOS) ? 'var(--black)' : 'rgba(245,240,232,0.4)',
          border: 'none', borderRadius: 2,
          fontSize: 11, letterSpacing: '0.10em', textTransform: 'uppercase',
          fontWeight: 600, cursor: (selectedSize && !isOOS) ? 'pointer' : 'default',
          fontFamily: 'DM Sans, sans-serif', transition: 'background 0.15s, color 0.15s',
          overflow: 'hidden', position: 'relative',
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={added ? 'added' : 'default'}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.16 }}
            style={{ display: 'block' }}
          >
            {!selectedSize ? 'Select Size' : isOOS ? 'Out of Stock' : added ? 'Added ✓' : 'Add to Bag'}
          </motion.span>
        </AnimatePresence>
      </button>

      <button
        onClick={handleBuyNow}
        disabled={!selectedSize || !!isOOS}
        style={{
          flex: 1, height: 48,
          background: 'transparent',
          color: (selectedSize && !isOOS) ? 'var(--cream)' : 'rgba(245,240,232,0.4)',
          border: (selectedSize && !isOOS) ? '1px solid rgba(245,240,232,0.4)' : '1px solid rgba(245,240,232,0.15)',
          borderRadius: 2,
          fontSize: 11, letterSpacing: '0.10em', textTransform: 'uppercase',
          fontWeight: 500, cursor: (selectedSize && !isOOS) ? 'pointer' : 'default',
          fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s',
        }}
      >
        Buy Now
      </button>
    </div>
  );
}
