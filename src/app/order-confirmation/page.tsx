'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { CheckCircle, Package, ArrowRight, MapPin, Truck } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { ordersService } from '@/lib/services/orders.service';
import { formatPrice, formatDate } from '@/lib/utils';

function safeFormatDate(d: any): string {
  return formatDate(d);
}

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order') ?? '';

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderNumber) { setError('No order number provided.'); setLoading(false); return; }
    ordersService.getOrder(orderNumber)
      .then((res: any) => { setOrder(res.data); })
      .catch((err: any) => { setError(err.message || 'Failed to load order.'); })
      .finally(() => setLoading(false));
  }, [orderNumber]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--cream)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 32, height: 32, border: '2px solid #1A1A1A', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ fontSize: 13, color: 'var(--dust)' }}>Loading your order...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--cream)', padding: 24 }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 15, marginBottom: 20, color: 'var(--dust)' }}>{error || 'Order not found.'}</p>
          <Link href="/"><button style={{ padding: '14px 28px', background: 'var(--black)', color: 'var(--cream)', border: 'none', fontSize: 12, letterSpacing: '0.10em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Continue Shopping</button></Link>
        </div>
      </div>
    );
  }

  const addr = order.address;
  const deliveryLabel = order.deliveryMethod === 'EXPRESS' ? '2–3 Business Days' : '5–7 Business Days';
  const isCOD = order.paymentMethod === 'COD';
  const stitchingItems = order.customStitching ?? [];
  const stitchingCharge = stitchingItems.length * 24900;

  return (
    <div style={{ backgroundColor: 'var(--cream)', minHeight: '100vh', padding: '60px 24px' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ maxWidth: 620, margin: '0 auto' }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }} style={{ marginBottom: 20 }}>
            <CheckCircle size={56} strokeWidth={1} color="var(--black)" style={{ margin: '0 auto' }} />
          </motion.div>
          <h1 style={{ fontSize: 13, letterSpacing: '0.20em', textTransform: 'uppercase', marginBottom: 12, fontWeight: 500 }}>Order Placed</h1>
          <p style={{ fontSize: 15, color: 'var(--dust)', marginBottom: 6 }}>Thank you for choosing pure.</p>
          <p style={{ fontSize: 12, color: 'var(--dust)', letterSpacing: '0.06em' }}>
            A confirmation has been sent to your email.
          </p>
        </div>

        {/* Order meta */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          style={{ border: '1px solid var(--border)', padding: 24, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <p style={{ fontSize: 10, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--dust)', marginBottom: 6 }}>Order Number</p>
              <p style={{ fontSize: 16, fontWeight: 600, letterSpacing: '0.04em', fontFamily: 'monospace' }}>{order.orderNumber}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 10, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--dust)', marginBottom: 6 }}>Placed On</p>
              <p style={{ fontSize: 14 }}>{safeFormatDate(order.createdAt)}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            <span style={{ fontSize: 11, padding: '4px 10px', background: '#D1FAE5', color: '#065F46', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {order.status}
            </span>
            <span style={{ fontSize: 11, padding: '4px 10px', background: '#F0EDE8', color: 'var(--dust)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {isCOD ? 'Cash on Delivery' : order.paymentMethod}
            </span>
            <span style={{ fontSize: 11, padding: '4px 10px', background: '#DBEAFE', color: '#1E40AF', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {deliveryLabel}
            </span>
          </div>

          {/* Items */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            <p style={{ fontSize: 10, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--dust)', marginBottom: 12 }}>Items</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {order.items?.map((item: any) => {
                const hasStitching = stitchingItems.some((cs: any) => cs.orderItemId === item.id);
                const primaryImg = item.product?.images?.[0]?.url;
                return (
                  <div key={item.id} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    {primaryImg && (
                      <div style={{ position: 'relative', width: 56, height: 72, flexShrink: 0, background: 'var(--raw-cotton)' }}>
                        <Image src={primaryImg} alt={item.product.name} fill style={{ objectFit: 'cover' }} />
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 400, marginBottom: 2 }}>{item.product?.name}</p>
                      <p style={{ fontSize: 12, color: 'var(--dust)', marginBottom: 2 }}>
                        {item.variant?.size} · {item.variant?.color} · × {item.quantity}
                      </p>
                      {hasStitching && (
                        <p style={{ fontSize: 11, color: 'var(--dust)' }}>✂ Custom Stitched</p>
                      )}
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 500, flexShrink: 0 }}>{formatPrice(item.total)}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pricing breakdown */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: 'var(--dust)' }}>Subtotal</span>
              <span style={{ fontSize: 13 }}>{formatPrice(order.subtotal)}</span>
            </div>
            {stitchingCharge > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: 'var(--dust)' }}>Custom Stitching ({stitchingItems.length}× ₹249)</span>
                <span style={{ fontSize: 13 }}>+{formatPrice(stitchingCharge)}</span>
              </div>
            )}
            {order.shippingCharge > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: 'var(--dust)' }}>{isCOD ? 'COD Charge' : 'Shipping'}</span>
                <span style={{ fontSize: 13 }}>{formatPrice(order.shippingCharge)}</span>
              </div>
            )}
            {order.shippingCharge === 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: 'var(--dust)' }}>Shipping</span>
                <span style={{ fontSize: 13, color: '#065F46' }}>FREE</span>
              </div>
            )}
            {order.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: '#065F46' }}>Discount</span>
                <span style={{ fontSize: 13, color: '#065F46' }}>−{formatPrice(order.discount)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 4 }}>
              <span style={{ fontSize: 15, fontWeight: 500 }}>{isCOD ? 'Amount Due on Delivery' : 'Total Paid'}</span>
              <span style={{ fontSize: 15, fontWeight: 600 }}>{formatPrice(order.total)}</span>
            </div>
          </div>
        </motion.div>

        {/* Delivery address */}
        {addr && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
            style={{ border: '1px solid var(--border)', padding: 20, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <MapPin size={14} strokeWidth={1.5} color="var(--dust)" />
              <p style={{ fontSize: 10, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--dust)' }}>Delivery Address</p>
            </div>
            <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{addr.firstName} {addr.lastName}</p>
            <p style={{ fontSize: 13, color: 'var(--dust)', lineHeight: 1.7 }}>
              {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}<br />
              {addr.city}, {addr.state} – {addr.pincode}
            </p>
            {addr.phone && <p style={{ fontSize: 12, color: 'var(--dust)', marginTop: 4 }}>{addr.phone}</p>}
          </motion.div>
        )}

        {/* Dispatch note */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.4 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 32, color: 'var(--dust)' }}>
          <Truck size={15} strokeWidth={1.5} />
          <p style={{ fontSize: 13 }}>
            {order.deliveryMethod === 'EXPRESS'
              ? 'Express delivery — dispatched within 12 hours.'
              : 'Your order will be dispatched within 24 hours.'}
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.5 }}
          style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/account">
            <button style={{ padding: '14px 24px', background: 'transparent', color: 'var(--black)', border: '1px solid var(--black)', fontSize: 12, letterSpacing: '0.10em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 500, fontFamily: 'DM Sans, sans-serif' }}>
              View Orders
            </button>
          </Link>
          <Link href="/">
            <button style={{ padding: '14px 24px', background: 'var(--black)', color: 'var(--cream)', border: 'none', fontSize: 12, letterSpacing: '0.10em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'DM Sans, sans-serif' }}>
              Continue Shopping <ArrowRight size={12} />
            </button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--cream)' }}>
        <p style={{ color: 'var(--dust)' }}>Loading...</p>
      </div>
    }>
      <OrderConfirmationContent />
    </Suspense>
  );
}
