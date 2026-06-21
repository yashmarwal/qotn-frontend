'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ordersService } from '@/lib/services/orders.service';
import { formatPrice } from '@/lib/utils';
import { ChevronLeft, ChevronDown, Package, X } from 'lucide-react';

const STATUS_COLOR: Record<string, string> = {
  PENDING: '#B45309',
  CONFIRMED: '#0369A1',
  PROCESSING: '#7C3AED',
  SHIPPED: '#0284C7',
  DELIVERED: '#15803D',
  CANCELLED: '#DC2626',
  RETURNED: '#6B7280',
  REFUNDED: '#6B7280',
};

const TERMINAL = ['CANCELLED', 'RETURNED', 'REFUNDED'];

// Returns null if the action is allowed, or a reason string if blocked.
function cancelBlockReason(order: any): string | null {
  if (order.customStitching?.length > 0) return 'Custom stitched orders cannot be cancelled.';
  if (!['PENDING', 'CONFIRMED'].includes(order.status)) return 'Order cannot be cancelled after it has been dispatched.';
  return null;
}

function returnBlockReason(order: any): string | null {
  if (order.customStitching?.length > 0) return 'Custom stitched orders cannot be returned.';
  if (order.status !== 'DELIVERED') return 'Return can only be requested after delivery.';
  return null;
}

interface ConfirmDialogProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

function ConfirmDialog({ message, onConfirm, onCancel, loading }: ConfirmDialogProps) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
        style={{ background: '#F5F0E8', padding: '32px 28px', maxWidth: 380, width: '100%', position: 'relative' }}>
        <button onClick={onCancel} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <X size={16} strokeWidth={1.5} color="#9E9987" />
        </button>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: '#1A1A1A', marginBottom: 28, fontFamily: 'DM Sans, sans-serif' }}>{message}</p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onCancel} disabled={loading}
            style={{ flex: 1, height: 42, background: 'none', border: '1px solid rgba(26,26,26,0.2)', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', color: '#1A1A1A' }}>
            No, Keep It
          </button>
          <button onClick={onConfirm} disabled={loading}
            style={{ flex: 1, height: 42, background: '#1A1A1A', border: 'none', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif', color: '#F5F0E8', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Please wait…' : 'Yes, Confirm'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function OrdersPage() {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [dialog, setDialog] = useState<{ type: 'cancel' | 'return'; orderNumber: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  // Per-order inline message (reason blocked or API error)
  const [inlineMsg, setInlineMsg] = useState<Record<string, string>>({});

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

  function handleCancelClick(order: any) {
    const reason = cancelBlockReason(order);
    if (reason) {
      setInlineMsg((p) => ({ ...p, [order.orderNumber]: reason }));
      return;
    }
    setInlineMsg((p) => ({ ...p, [order.orderNumber]: '' }));
    setDialog({ type: 'cancel', orderNumber: order.orderNumber });
  }

  function handleReturnClick(order: any) {
    const reason = returnBlockReason(order);
    if (reason) {
      setInlineMsg((p) => ({ ...p, [order.orderNumber]: reason }));
      return;
    }
    setInlineMsg((p) => ({ ...p, [order.orderNumber]: '' }));
    setDialog({ type: 'return', orderNumber: order.orderNumber });
  }

  async function handleConfirm() {
    if (!dialog) return;
    setActionLoading(true);
    try {
      let updatedOrder: any;
      if (dialog.type === 'cancel') {
        const res: any = await ordersService.cancelOrder(dialog.orderNumber);
        updatedOrder = res.data?.data || res.data;
      } else {
        const res: any = await ordersService.requestReturn(dialog.orderNumber);
        updatedOrder = res.data?.data || res.data;
      }
      if (updatedOrder) {
        setOrders((prev) => prev.map((o) => o.orderNumber === dialog.orderNumber ? { ...o, ...updatedOrder } : o));
      }
      setDialog(null);
    } catch (err: any) {
      const msg = err?.message || (dialog.type === 'cancel' ? 'Could not cancel order.' : 'Could not request return.');
      setInlineMsg((p) => ({ ...p, [dialog.orderNumber]: msg }));
      setDialog(null);
    } finally {
      setActionLoading(false);
    }
  }

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
    <>
      <AnimatePresence>
        {dialog && (
          <ConfirmDialog
            message={
              dialog.type === 'cancel'
                ? 'Are you sure you want to cancel this order? This action cannot be undone.'
                : 'Are you sure you want to request a return? Our team will review and contact you within 24 hours.'
            }
            onConfirm={handleConfirm}
            onCancel={() => setDialog(null)}
            loading={actionLoading}
          />
        )}
      </AnimatePresence>

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
              {orders.map((order: any, idx: number) => {
                const cancelBlocked = cancelBlockReason(order);
                const returnBlocked = returnBlockReason(order);
                const isTerminal = TERMINAL.includes(order.status);
                const msg = inlineMsg[order.orderNumber];

                return (
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
                                  {item.productName || item.product?.name || item.name || 'Item'}
                                  {(item.variant?.size || item.size) && (
                                    <span style={{ color: '#9E9987' }}> — {item.variant?.size || item.size}</span>
                                  )}
                                  <span style={{ color: '#9E9987' }}> × {item.quantity}</span>
                                </span>
                                <span style={{ color: '#1A1A1A' }}>{formatPrice((item.price || 0) * (item.quantity || 1))}</span>
                              </div>
                            ))}

                            {order.address && (
                              <div style={{ marginTop: 10, paddingTop: 14, borderTop: '1px solid rgba(26,26,26,0.08)', fontSize: 12, color: '#9E9987', lineHeight: 1.75 }}>
                                <p style={{ fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6, color: '#C8C3BA' }}>Delivery Address</p>
                                <p>
                                  {order.address.addressLine1}
                                  {order.address.addressLine2 ? `, ${order.address.addressLine2}` : ''}
                                  , {order.address.city}, {order.address.state} {order.address.pincode}
                                </p>
                              </div>
                            )}

                            {/* Cancel / Return — always shown unless order is already terminal */}
                            {!isTerminal && (
                              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                  {/* Cancel button */}
                                  <button
                                    onClick={() => handleCancelClick(order)}
                                    style={{
                                      height: 36, padding: '0 18px',
                                      background: 'none',
                                      border: '1px solid rgba(220,38,38,0.4)',
                                      fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
                                      cursor: cancelBlocked ? 'not-allowed' : 'pointer',
                                      fontFamily: 'DM Sans, sans-serif',
                                      color: '#DC2626',
                                      opacity: cancelBlocked ? 0.4 : 1,
                                      transition: 'opacity 0.2s',
                                    }}>
                                    Cancel Order
                                  </button>

                                  {/* Return button */}
                                  <button
                                    onClick={() => handleReturnClick(order)}
                                    style={{
                                      height: 36, padding: '0 18px',
                                      background: 'none',
                                      border: '1px solid rgba(26,26,26,0.3)',
                                      fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
                                      cursor: returnBlocked ? 'not-allowed' : 'pointer',
                                      fontFamily: 'DM Sans, sans-serif',
                                      color: '#1A1A1A',
                                      opacity: returnBlocked ? 0.4 : 1,
                                      transition: 'opacity 0.2s',
                                    }}>
                                    Request Return
                                  </button>
                                </div>

                                {/* Inline message — reason blocked or API error */}
                                {msg && (
                                  <motion.p
                                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                                    style={{ fontSize: 12, color: '#9E9987', lineHeight: 1.6 }}>
                                    {msg}
                                  </motion.p>
                                )}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
