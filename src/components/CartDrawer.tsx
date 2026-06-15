'use client';

import { X, Minus, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalItems, totalPrice } = useCart();
  const stitchingItems = items.filter(i => i.customStitchingId);
  const stitchingCharge = stitchingItems.length * 24900;
  const grandTotal = totalPrice + stitchingCharge;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          onClick={closeCart}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(26,26,26,0.3)',
            zIndex: 80,
          }}
        />
      )}

      {/* Drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100%',
          width: '100%',
          maxWidth: 440,
          backgroundColor: 'var(--cream)',
          zIndex: 90,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 28px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <span style={{ fontSize: 13, letterSpacing: '0.12em', fontWeight: 500, textTransform: 'uppercase' }}>
            Bag ({totalItems})
          </span>
          <button onClick={closeCart} style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer' }}>
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 28px' }}>
          {items.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%', gap: 16 }}>
              <p style={{ fontSize: 14, color: 'var(--dust)' }}>Your bag is empty.</p>
              <button
                onClick={closeCart}
                style={{
                  fontSize: 12,
                  letterSpacing: '0.10em',
                  textTransform: 'uppercase',
                  background: 'none',
                  border: 'none',
                  color: 'var(--black)',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                }}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {items.map((item, idx) => (
                <div
                  key={`${item.product.id}-${item.size}`}
                  style={{
                    display: 'flex',
                    gap: 16,
                    padding: '20px 0',
                    borderBottom: idx < items.length - 1 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  <div style={{ position: 'relative', width: 80, height: 100, flexShrink: 0, background: 'var(--raw-cotton)' }}>
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 14, fontWeight: 400 }}>{item.product.name}</span>
                      <button
                        onClick={() => removeItem(item.product.id, item.size)}
                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--dust)' }}
                      >
                        <Trash2 size={14} strokeWidth={1.5} />
                      </button>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--dust)' }}>
                      {item.customStitchingId ? 'Custom Size' : item.size} · {item.color}
                    </span>
                    {item.customStitchingId && (
                      <span style={{ fontSize: 11, color: 'var(--dust)' }}>✂ Custom Stitched · +₹249</span>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1px solid var(--border)' }}>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                          style={{ background: 'none', border: 'none', padding: '6px 10px', cursor: 'pointer' }}
                        >
                          <Minus size={12} strokeWidth={1.5} />
                        </button>
                        <span style={{ fontSize: 13, padding: '0 8px', minWidth: 24, textAlign: 'center' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                          style={{ background: 'none', border: 'none', padding: '6px 10px', cursor: 'pointer' }}
                        >
                          <Plus size={12} strokeWidth={1.5} />
                        </button>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 500 }}>
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: '20px 28px', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: 'var(--dust)' }}>Subtotal</span>
              <span style={{ fontSize: 13 }}>{formatPrice(totalPrice)}</span>
            </div>
            {stitchingCharge > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: 'var(--dust)' }}>Custom Stitching ({stitchingItems.length})</span>
                <span style={{ fontSize: 13 }}>+{formatPrice(stitchingCharge)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: 'var(--dust)' }}>Shipping</span>
              <span style={{ fontSize: 13 }}>{grandTotal >= 99900 ? 'FREE' : formatPrice(9900)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, paddingTop: 8, borderTop: '1px solid var(--border)', marginTop: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 500 }}>Total</span>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{formatPrice(grandTotal + (grandTotal >= 99900 ? 0 : 9900))}</span>
            </div>
            <Link href="/checkout" onClick={closeCart}>
              <button
                style={{
                  width: '100%',
                  padding: '16px',
                  background: 'var(--black)',
                  color: 'var(--cream)',
                  border: 'none',
                  fontSize: 12,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                Proceed to Checkout
              </button>
            </Link>
            <button
              onClick={closeCart}
              style={{
                width: '100%',
                marginTop: 12,
                background: 'none',
                border: 'none',
                fontSize: 12,
                color: 'var(--dust)',
                cursor: 'pointer',
                textDecoration: 'underline',
                letterSpacing: '0.05em',
              }}
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
