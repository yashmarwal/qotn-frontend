'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ordersService } from '@/lib/services/orders.service';
import { formatPrice } from '@/lib/utils';
import { ChevronLeft, ChevronDown, Package } from 'lucide-react';

const STATUS_COLOR: Record<string, string> = {
  PENDING: '#B45309',
  CONFIRMED: '#0369A1',
  PROCESSING: '#7C3AED',
  SHIPPED: '#0284C7',
  DELIVERED: '#15803D',
  CANCELLED: '#DC2626',
  REFUNDED: '#6B7280',
};

export default function OrdersPage() {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/account');
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    ordersService.getOrders()
      .then((res: any) => setOrders(res.data?.data || res.data || []))
      .catch(() => setError('Unable to load orders. Please try again.'))
      .finally(() => setFetching(false));
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F5F0E8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.4, repeat: Infinity }}>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, letterSpacing: '0.14em', color: '#9E9987', textTransform: 'uppercase' }}>Loading</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: 'easeOut' }}
      style={{ minHeight: '100vh', background: '#F5F0E8', fontFamily: 'DM Sans, sans-serif', padding: 'clamp(48px,8vw,80px) 24px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>

        <button onClick={() => router.back()}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', padding: 0, cursor: 'pointer', marginBottom: 36, color: '#9E9987', fontSize: 12, letterSpacing: '0.08em', fontFamily: 'DM Sans, sans-serif' }}>
          <ChevronLeft size={14} strokeWidth={1.5} /> Back
        </button>

        <p style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9E9987', marginBottom: 12 }}>My Account</p>
        <h1 style={{ fontSize: 28, fontWeight: 300, color: '#1A1A1A', letterSpacing: '-0.01em', marginBottom: 44 }}>My Orders</h1>

        {fetching ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map(i => (
              <motion.div key={i} animate={{ opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.15 }}
                style={{ height: 88, background: 'rgba(26,26,26,0.05)' }} />
            ))}
          </div>
        ) : error ? (
          <p style={{ fontSize: 13, color: '#991B1B' }}>{error}</p>
        ) : orders.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
            style={{ textAlign: 'center', padding: '80px 0' }}>
            <Package size={36} strokeWidth={1} color="#C8C3BA" style={{ display: 'block', margin: '0 auto 24px' }} />
            <p style={{ fontSize: 18, fontWeight: 300, color: '#1A1A1A', marginBottom: 8, letterSpacing: '-0.01em' }}>No orders yet.</p>
            <p style={{ fontSize: 13, color: '#9E9987', marginBottom: 36, lineHeight: 1.7 }}>Your order history will appear here.<br />Every thread has a story.</p>
            <Link href="/men" style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1A1A1A', textDecoration: 'none', borderBottom: '1px solid #1A1A1A', paddingBottom: 2 }}>
              Explore Collection →
            </Link>
          </motion.div>
        ) : (
          <div style={{ borderTop: '1px solid rgba(26,26,26,0.1)' }}>
            {orders.map((order: any, idx: number) => (
              <motion.div key={order.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: idx * 0.05 }}
                style={{ borderBottom: '1px solid rgba(26,26,26,0.1)' }}>
                <button onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                  style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 0', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', textAlign: 'left' }}>
                  <div>
                    <p style={{ fontSize: 14, color: '#1A1A1A', fontWeight: 500, marginBottom: 5 }}>
                      Order #{order.orderNumber || order.id?.slice(0, 8).toUpperCase()}
                    </p>
                    <p style={{ fontSize: 12, color: '#9E9987' }}>
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      &nbsp;·&nbsp;{formatPrice(order.total || order.grandTotal || 0)}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
                    <span style={{ fontSize: 10, letterSpacing: '0.10em', textTransform: 'uppercase', color: STATUS_COLOR[order.status] || '#9E9987', fontWeight: 600 }}>
                      {order.status || 'PENDING'}
                    </span>
                    <motion.div animate={{ rotate: expandedId === order.id ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown size={14} strokeWidth={1.5} color="#9E9987" />
                    </motion.div>
                  </div>
                </button>

                <AnimatePresence>
                  {expandedId === order.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }} style={{ overflow: 'hidden' }}>
                      <div style={{ paddingBottom: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {(order.items || order.orderItems || []).map((item: any, i: number) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                            <span style={{ color: '#1A1A1A' }}>
                              {item.productName || item.name || 'Item'}
                              <span style={{ color: '#9E9987' }}> × {item.quantity}</span>
                            </span>
                            <span style={{ color: '#1A1A1A' }}>{formatPrice((item.price || 0) * (item.quantity || 1))}</span>
                          </div>
                        ))}
                        {order.shippingAddress && (
                          <div style={{ marginTop: 10, paddingTop: 14, borderTop: '1px solid rgba(26,26,26,0.08)', fontSize: 12, color: '#9E9987', lineHeight: 1.75 }}>
                            <p style={{ fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6, color: '#C8C3BA' }}>Delivery Address</p>
                            <p>{order.shippingAddress.street || order.shippingAddress.line1}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode || order.shippingAddress.postalCode}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
