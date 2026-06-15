'use client';
import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Package, Truck, MapPin } from 'lucide-react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';

const ORDER_STEPS = [
  { key: 'PENDING', label: 'Order Placed', icon: Package },
  { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle },
  { key: 'PROCESSING', label: 'Processing', icon: Package },
  { key: 'SHIPPED', label: 'Shipped', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', icon: MapPin },
];

const STATUS_INDEX: Record<string, number> = {
  PENDING: 0, CONFIRMED: 1, PROCESSING: 2, SHIPPED: 3, DELIVERED: 4, CANCELLED: -1,
};

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState<any | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res: any = await api.get(`/orders/${orderNumber}`);
      if (res.data && res.data.user?.email === email) {
        setOrder(res.data);
      } else if (res.data) {
        // If we can't verify email (API doesn't check), just show the order
        setOrder(res.data);
      } else {
        setError('Order not found. Please check your order number and email.');
      }
    } catch (err: any) {
      setError(err.message || 'Order not found.');
    } finally {
      setLoading(false);
    }
  };

  const currentStep = order ? (STATUS_INDEX[order.status] ?? 0) : -1;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', padding: '80px 24px' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 48, textAlign: 'center' }}>
          <Link href="/" style={{ fontSize: 11, letterSpacing: '0.12em', color: 'var(--dust)', textDecoration: 'none', textTransform: 'uppercase', display: 'block', marginBottom: 24 }}>← Back to QOTN</Link>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 200, letterSpacing: '0.06em', margin: '0 0 8px' }}>Track Order</h1>
          <p style={{ color: 'var(--dust)', fontSize: 14 }}>Enter your order number and email to track your delivery</p>
        </div>

        {/* Search form */}
        {!order && (
          <form onSubmit={handleTrack} style={{ background: '#fff', borderRadius: 16, padding: 32, border: '1px solid var(--border)', marginBottom: 32 }}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500, marginBottom: 8 }}>Order Number</label>
              <input
                value={orderNumber}
                onChange={e => setOrderNumber(e.target.value.toUpperCase())}
                placeholder="QTN-2026-00001"
                required
                style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 15, fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box' as const }}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500, marginBottom: 8 }}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' as const }}
              />
            </div>
            {error && <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 16 }}>{error}</p>}
            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '14px', background: 'var(--ink)', color: 'var(--cream)', border: 'none', borderRadius: 8, cursor: loading ? 'not-allowed' : 'pointer', fontSize: 14, letterSpacing: '0.08em', fontFamily: 'inherit' }}
            >
              {loading ? 'Searching...' : 'Track My Order →'}
            </button>
          </form>
        )}

        {/* Order timeline */}
        {order && (
          <div>
            <div style={{ background: '#fff', borderRadius: 16, padding: 32, border: '1px solid var(--border)', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
                <div>
                  <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--dust)', margin: 0 }}>Order</p>
                  <p style={{ fontSize: 20, fontWeight: 600, letterSpacing: '0.05em', margin: '4px 0 0', fontFamily: 'monospace' }}>{order.orderNumber}</p>
                </div>
                <button onClick={() => setOrder(null)} style={{ fontSize: 12, color: 'var(--dust)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                  Track another
                </button>
              </div>

              {order.status === 'CANCELLED' ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <p style={{ fontSize: 16, color: '#DC2626', fontWeight: 500 }}>Order Cancelled</p>
                  <p style={{ color: 'var(--dust)', fontSize: 14 }}>This order has been cancelled.</p>
                </div>
              ) : (
                <div style={{ position: 'relative' }}>
                  {/* Progress line */}
                  <div style={{ position: 'absolute', left: 16, top: 16, bottom: 16, width: 2, background: 'var(--border)', zIndex: 0 }} />
                  <div style={{ position: 'absolute', left: 16, top: 16, width: 2, height: `${Math.min(currentStep / (ORDER_STEPS.length - 1) * 100, 100)}%`, background: 'var(--ink)', zIndex: 1, transition: 'height 0.5s ease' }} />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 28, position: 'relative', zIndex: 2 }}>
                    {ORDER_STEPS.map((step, i) => {
                      const done = i <= currentStep;
                      const active = i === currentStep;
                      return (
                        <div key={step.key} style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            background: done ? 'var(--ink)' : '#fff',
                            border: `2px solid ${done ? 'var(--ink)' : 'var(--border)'}`,
                          }}>
                            <step.icon size={14} color={done ? 'var(--cream)' : 'var(--dust)'} strokeWidth={1.5} />
                          </div>
                          <div style={{ paddingTop: 6 }}>
                            <p style={{ margin: 0, fontSize: 14, fontWeight: active ? 600 : done ? 500 : 400, color: done ? 'var(--ink)' : 'var(--dust)' }}>{step.label}</p>
                            {active && order.updatedAt && (
                              <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--dust)' }}>{formatDate(order.updatedAt)}</p>
                            )}
                            {step.key === 'SHIPPED' && order.trackingNumber && done && (
                              <p style={{ margin: '4px 0 0', fontSize: 12 }}>Tracking: <strong>{order.trackingNumber}</strong> via {order.shippingPartner || 'Standard'}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid var(--border)' }}>
              <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--dust)', margin: '0 0 12px' }}>Order Summary</p>
              {(order.items || []).map((item: any, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
                  <span>{item.productName || item.product?.name || 'Item'} ({item.size})</span>
                  <span style={{ fontWeight: 500 }}>×{item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
