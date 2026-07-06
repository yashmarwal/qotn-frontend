'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useIsMobile } from '@/hooks/useIsMobile';
import { formatPrice } from '@/lib/utils';

const btnStyle = (full?: boolean): React.CSSProperties => ({
  padding: full ? '16px' : '14px 40px',
  width: full ? '100%' : undefined,
  background: 'var(--black)', color: 'var(--cream)', border: 'none',
  fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase',
  cursor: 'pointer', fontWeight: 500, fontFamily: 'DM Sans, sans-serif',
});

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCart();
  const isMobile = useIsMobile();
  // All values in paise
  const stitchingCharge = items.filter(i => i.customStitchingId).length * 24900;
  const subtotal = totalPrice;
  const shipping = subtotal + stitchingCharge >= 149900 ? 0 : 9900;
  const total = subtotal + stitchingCharge + shipping;

  const EmptyState = () => (
    <div style={{ textAlign: 'center', padding: '80px 0' }}>
      <ShoppingBag size={40} strokeWidth={1} color="var(--dust)" style={{ margin: '0 auto 24px' }} />
      <p style={{ fontSize: 18, fontWeight: 300, marginBottom: 12 }}>Your bag is empty.</p>
      <p style={{ fontSize: 13, color: 'var(--dust)', marginBottom: 32 }}>Looks like you haven&apos;t added anything yet.</p>
      <Link href="/men"><button style={btnStyle()}>Start Shopping</button></Link>
    </div>
  );

  const SummaryBlock = () => (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, color: 'var(--dust)' }}>Subtotal</span>
          <span style={{ fontSize: 13 }}>{formatPrice(subtotal)}</span>
        </div>
        {stitchingCharge > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: 'var(--dust)' }}>
              Custom Stitching ({items.filter(i => i.customStitchingId).length} item{items.filter(i => i.customStitchingId).length > 1 ? 's' : ''})
            </span>
            <span style={{ fontSize: 13 }}>+{formatPrice(stitchingCharge)}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, color: 'var(--dust)' }}>Shipping</span>
          <span style={{ fontSize: 13 }}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
        </div>
      </div>
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 15, fontWeight: 500 }}>Total</span>
          <span style={{ fontSize: 15, fontWeight: 500 }}>{formatPrice(total)}</span>
        </div>
      </div>
      <Link href="/checkout"><button style={btnStyle(true)}>Proceed to Checkout</button></Link>
      <p style={{ fontSize: 11, color: 'var(--dust)', marginTop: 12, lineHeight: 1.6, textAlign: 'center' }}>
        24-hour return on damaged items only. No returns on custom stitched orders.{' '}
        <Link href="/return-policy" style={{ color: 'var(--dust)', textDecoration: 'underline' }}>Learn more</Link>
      </p>
      <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', gap: 8 }}>
          {[
            { icon: '🔒', label: 'Secure Payments' },
            { icon: '↩', label: 'Easy Returns' },
            { icon: '🌿', label: '100% Cotton' },
            { icon: '🇮🇳', label: 'Made in India' },
          ].map(item => (
            <div key={item.label} style={{ textAlign: 'center', flex: 1 }}>
              <p style={{ fontSize: 16, marginBottom: 3 }}>{item.icon}</p>
              <p style={{ fontSize: 9, color: 'var(--dust)', letterSpacing: '0.06em', textTransform: 'uppercase', lineHeight: 1.3 }}>{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /* ── MOBILE ── */
  if (isMobile) {
    return (
      <div style={{ backgroundColor: 'var(--cream)', minHeight: '100vh' }}>
        <div style={{ padding: '20px 16px 0' }}>
          <h1 style={{ fontSize: 13, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--dust)' }}>
            Your Bag{totalItems > 0 && ` (${totalItems})`}
          </h1>
        </div>

        {items.length === 0 ? (
          <div style={{ padding: '0 16px' }}><EmptyState /></div>
        ) : (
          <div style={{ paddingBottom: 'calc(128px + env(safe-area-inset-bottom, 0px))' }}>
            <div style={{ padding: '0 16px' }}>
              {items.map((item) => (
                <div key={`${item.product.id}-${item.size}`}
                  style={{ display: 'flex', gap: 14, padding: '18px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ position: 'relative', width: 80, height: 100, flexShrink: 0, background: 'var(--raw-cotton)' }}>
                    <Image src={item.product.images[0]} alt={item.product.name} fill style={{ objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{item.product.name}</span>
                      <button onClick={() => removeItem(item.product.id, item.size)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--dust)' }}>
                        <Trash2 size={14} strokeWidth={1.5} />
                      </button>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--dust)' }}>{item.size} · {item.color}</span>
                    {item.customStitchingId && (
                      <span style={{ fontSize: 11, color: 'var(--dust)' }}>✂ Custom Stitched · +₹249</span>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)' }}>
                        <button onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)} style={{ background: 'none', border: 'none', padding: '6px 10px', cursor: 'pointer' }}>
                          <Minus size={11} strokeWidth={1.5} />
                        </button>
                        <span style={{ fontSize: 12, padding: '0 8px', minWidth: 22, textAlign: 'center' }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)} style={{ background: 'none', border: 'none', padding: '6px 10px', cursor: 'pointer' }}>
                          <Plus size={11} strokeWidth={1.5} />
                        </button>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{formatPrice(item.product.price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ margin: '20px 16px', border: '1px solid var(--border)', padding: 20 }}>
              <h2 style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>Order Summary</h2>
              <SummaryBlock />
            </div>
          </div>
        )}

        {/* Sticky bottom checkout bar */}
        {items.length > 0 && (
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 44, backgroundColor: 'var(--cream)', borderTop: '1px solid var(--border)', padding: '12px 16px', paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: 'var(--dust)' }}>Total</span>
              <span style={{ fontSize: 16, fontWeight: 600 }}>{formatPrice(total)}</span>
            </div>
            <Link href="/checkout">
              <button style={{ ...btnStyle(true), height: 52, fontSize: 13, letterSpacing: '0.12em' }}>
                Proceed to Checkout →
              </button>
            </Link>
          </div>
        )}
      </div>
    );
  }

  /* ── DESKTOP ── */
  return (
    <div style={{ backgroundColor: 'var(--cream)', minHeight: '100vh', padding: '60px 40px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{ fontSize: 13, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 48, color: 'var(--dust)' }}>
          Your Bag{totalItems > 0 && ` (${totalItems})`}
        </motion.h1>

        {items.length === 0 ? <EmptyState /> : (
          <div style={{ display: 'grid', gridTemplateColumns: '65% 35%', gap: 48, alignItems: 'start' }}>
            {/* Left */}
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
                <span style={{ fontSize: 11, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--dust)' }}>Product</span>
                <span style={{ fontSize: 11, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--dust)' }}>Total</span>
              </div>
              {items.map((item) => (
                <div key={`${item.product.id}-${item.size}`} style={{ display: 'flex', gap: 20, padding: '24px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ position: 'relative', width: 90, height: 120, flexShrink: 0, background: 'var(--raw-cotton)' }}>
                    <Image src={item.product.images[0]} alt={item.product.name} fill style={{ objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 15, fontWeight: 400 }}>{item.product.name}</span>
                      <span style={{ fontSize: 15, fontWeight: 500 }}>{formatPrice(item.product.price * item.quantity)}</span>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--dust)' }}>{item.size} · {item.color}</span>
                    <span style={{ fontSize: 12, color: 'var(--dust)' }}>{formatPrice(item.product.price)} each</span>
                    {item.customStitchingId && (
                      <span style={{ fontSize: 11, color: 'var(--dust)' }}>✂ Custom Stitched · +₹249</span>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)' }}>
                        <button onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)} style={{ background: 'none', border: 'none', padding: '8px 12px', cursor: 'pointer' }}><Minus size={12} strokeWidth={1.5} /></button>
                        <span style={{ fontSize: 13, padding: '0 8px', minWidth: 28, textAlign: 'center' }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)} style={{ background: 'none', border: 'none', padding: '8px 12px', cursor: 'pointer' }}><Plus size={12} strokeWidth={1.5} /></button>
                      </div>
                      <button onClick={() => removeItem(item.product.id, item.size)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--dust)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontFamily: 'DM Sans, sans-serif' }}>
                        <Trash2 size={12} strokeWidth={1.5} /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Sticky summary */}
            <div style={{ border: '1px solid var(--border)', padding: 28, position: 'sticky', top: 80 }}>
              <h2 style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20 }}>Order Summary</h2>
              <SummaryBlock />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
