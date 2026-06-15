'use client';

import { useState, useEffect } from 'react';
import { Eye, Search, Scissors, Printer } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import AdminGuard from '@/components/AdminGuard';
import { adminService } from '@/lib/services/admin.service';
import { printBill } from './PrintBill';
import { formatPrice, formatDate } from '@/lib/utils';

const statusColors: Record<string, string> = {
  pending: '#B45309', confirmed: '#1E40AF', processing: '#1D4ED8',
  shipped: '#6D28D9', delivered: '#065F46', cancelled: '#991B1B',
};
const statusBg: Record<string, string> = {
  pending: '#FEF3C7', confirmed: '#DBEAFE', processing: '#DBEAFE',
  shipped: '#EDE9FE', delivered: '#D1FAE5', cancelled: '#FEE2E2',
};
const ALL_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const STITCHING_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];

export default function AdminOrdersPage() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  const fetchOrders = (page = 1, filters?: any) => {
    setLoading(true);
    adminService.getOrders({ page, ...filters })
      .then((res: any) => { setOrders(res.data || []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      await adminService.updateOrderStatus(orderId, { status });
      fetchOrders();
    } catch (err) { console.error(err); }
  };

  const handleStitchingStatusUpdate = async (stitchingId: string, status: string) => {
    try {
      await adminService.updateStitchingStatus(stitchingId, status);
      fetchOrders();
    } catch (err) { console.error(err); }
  };

  const filtered = orders.filter((o) => {
    const customerName = `${o.user?.firstName ?? ''} ${o.user?.lastName ?? ''}`.toLowerCase();
    const matchSearch = o.orderNumber?.toLowerCase().includes(search.toLowerCase()) || customerName.includes(search.toLowerCase());
    const matchStatus = filterStatus ? o.status === filterStatus : true;
    return matchSearch && matchStatus;
  });

  const inputStyle: React.CSSProperties = {
    padding: '10px 14px', border: '1px solid var(--border)', background: 'var(--cream)',
    fontSize: 13, outline: 'none', color: 'var(--black)', fontFamily: 'DM Sans, sans-serif',
  };

  return (
    <AdminGuard>
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F7F5F2' }}>
        <AdminSidebar />
        <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 22, fontWeight: 400, letterSpacing: '0.04em' }}>Orders</h1>
            <p style={{ fontSize: 13, color: 'var(--dust)', marginTop: 4 }}>Manage and track all customer orders.</p>
          </div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--dust)', pointerEvents: 'none' }} />
              <input placeholder="Search orders or customers..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...inputStyle, width: '100%', paddingLeft: 36 }} />
            </div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="">All Status</option>
              {ALL_STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
            </select>
          </div>

          <div style={{ background: 'var(--cream)', border: '1px solid var(--border)', opacity: loading ? 0.6 : 1 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: '#F0EDE8' }}>
                  {['Order ID', 'Customer', 'Items', '✂', 'Total', 'Payment', 'Status', 'Date', '', ''].map((h, i) => (
                    <th key={i} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--dust)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--dust)', fontSize: 13 }}>
                      {loading ? 'Loading...' : 'No orders yet.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((order) => {
                    const statusKey = order.status?.toLowerCase() ?? 'pending';
                    const hasStitching = order.customStitching && order.customStitching.length > 0;
                    return (
                      <tr key={order.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '13px 16px', fontWeight: 500, fontSize: 12, fontFamily: 'monospace' }}>{order.orderNumber}</td>
                        <td style={{ padding: '13px 16px' }}>{order.user?.firstName} {order.user?.lastName}</td>
                        <td style={{ padding: '13px 16px', color: 'var(--dust)' }}>{order.items?.length ?? '-'}</td>
                        <td style={{ padding: '13px 16px' }}>
                          {hasStitching && (
                            <span title="Has custom stitching">
                              <Scissors size={14} color="#1A1A1A" strokeWidth={1.5} />
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '13px 16px', fontWeight: 500 }}>{formatPrice(order.total)}</td>
                        <td style={{ padding: '13px 16px', color: 'var(--dust)' }}>{order.paymentStatus}</td>
                        <td style={{ padding: '13px 16px' }}>
                          <select value={order.status} onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                            style={{ padding: '4px 8px', background: statusBg[statusKey] ?? '#F0EDE8', color: statusColors[statusKey] ?? 'var(--dust)', border: 'none', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                            {ALL_STATUSES.map((s) => (
                              <option key={s} value={s} style={{ background: 'white', color: 'black' }}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
                            ))}
                          </select>
                        </td>
                        <td style={{ padding: '13px 16px', color: 'var(--dust)' }}>{formatDate(order.createdAt)}</td>
                        <td style={{ padding: '13px 16px' }}>
                          <button onClick={() => setSelected(selected === order.id ? null : order.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--dust)' }}>
                            <Eye size={14} strokeWidth={1.5} />
                          </button>
                        </td>
                        <td style={{ padding: '13px 16px' }}>
                          <button onClick={() => printBill(order)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', height: 32, background: 'transparent', border: '1px solid var(--border)', color: 'var(--dust)', fontSize: 11, letterSpacing: '0.06em', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                            <Printer size={12} strokeWidth={1.5} /> Print
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {selected && (() => {
            const order = orders.find((o) => o.id === selected);
            if (!order) return null;
            const hasStitching = order.customStitching && order.customStitching.length > 0;
            return (
              <div style={{ marginTop: 20, border: '1px solid var(--border)', background: 'var(--cream)', padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                  <h3 style={{ fontSize: 13, letterSpacing: '0.10em', textTransform: 'uppercase', margin: 0 }}>Order Detail — {order.orderNumber}</h3>
                  <button onClick={() => printBill(order)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 20px', height: 44, background: 'transparent', border: '1px solid var(--black)', color: 'var(--black)', fontSize: 11, letterSpacing: '0.10em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>
                    <Printer size={14} strokeWidth={1.5} /> PRINT BILL
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 20 }}>
                  {[
                    { label: 'Customer', value: `${order.user?.firstName ?? ''} ${order.user?.lastName ?? ''}`.trim() },
                    { label: 'Email', value: order.user?.email ?? '—' },
                    { label: 'Payment', value: order.paymentStatus },
                    { label: 'Date', value: formatDate(order.createdAt) },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p style={{ fontSize: 10, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--dust)', marginBottom: 5 }}>{label}</p>
                      <p style={{ fontSize: 14 }}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* Items */}
                {order.items && order.items.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <p style={{ fontSize: 10, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--dust)', marginBottom: 10 }}>Items</p>
                    {order.items.map((item: any) => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                        <span>{item.product?.name} · {item.variant?.size} · ×{item.quantity}</span>
                        <span>{formatPrice(item.total)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', marginBottom: hasStitching ? 24 : 0 }}>
                  <p style={{ fontSize: 15, fontWeight: 500 }}>Total: {formatPrice(order.total)}</p>
                </div>

                {/* Custom Stitching Section */}
                {hasStitching && (
                  <div style={{ borderTop: '2px solid #1A1A1A', paddingTop: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                      <Scissors size={16} />
                      <h4 style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0 }}>Custom Stitching Required</h4>
                    </div>
                    {order.customStitching.map((cs: any) => (
                      <div key={cs.id} style={{ border: '1px solid var(--border)', padding: 20, marginBottom: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 500, margin: '0 0 4px' }}>Garment: {cs.garmentType}</p>
                            <span style={{ fontSize: 11, padding: '3px 8px', background: cs.status === 'COMPLETED' ? '#D1FAE5' : cs.status === 'IN_PROGRESS' ? '#DBEAFE' : '#FEF3C7', color: cs.status === 'COMPLETED' ? '#065F46' : cs.status === 'IN_PROGRESS' ? '#1E40AF' : '#B45309', fontWeight: 600 }}>
                              {cs.status}
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <select value={cs.status} onChange={(e) => handleStitchingStatusUpdate(cs.id, e.target.value)}
                              style={{ padding: '6px 10px', border: '1px solid var(--border)', background: 'var(--cream)', fontSize: 12, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                              {STITCHING_STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                            </select>
                            <button onClick={() => {
                              const lines = [`QOTN Custom Stitching — ${order.orderNumber}`, `Garment: ${cs.garmentType}`, '',
                                ...Object.entries(cs.measurements as Record<string, unknown>).map(([k, v]) => `${k}: ${String(v)} in`),
                                cs.specialInstructions ? `\nInstructions: ${cs.specialInstructions}` : '',
                              ].filter(Boolean).join('\n');
                              const win = window.open('', '_blank');
                              if (win) { win.document.write(`<pre style="font-family:monospace;padding:20px">${lines}</pre>`); win.print(); }
                            }} style={{ padding: '6px 12px', border: '1px solid var(--border)', background: 'transparent', fontSize: 12, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                              Print
                            </button>
                          </div>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                          <tbody>
                            {Object.entries(cs.measurements as Record<string, unknown>).map(([k, v]) => (
                              <tr key={k} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '6px 12px', fontWeight: 500, textTransform: 'capitalize', color: 'var(--dust)', width: '50%' }}>{k.replace(/([A-Z])/g, ' $1').trim()}</td>
                                <td style={{ padding: '6px 12px' }}>{String(v)} inches</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {cs.specialInstructions && (
                          <div style={{ marginTop: 12, padding: 12, background: '#FEF3C7', border: '1px solid #F59E0B' }}>
                            <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#92400E', marginBottom: 4 }}>Special Instructions</p>
                            <p style={{ fontSize: 13, margin: 0 }}>{cs.specialInstructions}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
        </main>
      </div>
    </AdminGuard>
  );
}
