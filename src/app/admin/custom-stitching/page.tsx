'use client';
import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import AdminGuard from '@/components/AdminGuard';
import { useAuth } from '@/context/AuthContext';
import { adminService } from '@/lib/services/admin.service';
import { formatDate } from '@/lib/utils';

const statusColors: Record<string, string> = {
  PENDING: '#B45309', IN_PROGRESS: '#1D4ED8', COMPLETED: '#065F46',
};
const statusBg: Record<string, string> = {
  PENDING: '#FEF3C7', IN_PROGRESS: '#DBEAFE', COMPLETED: '#D1FAE5',
};

export default function AdminCustomStitchingPage() {
  const { isAdmin, isLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchOrders = (status?: string) => {
    setLoading(true);
    adminService.getCustomStitching(status || undefined)
      .then((res: any) => setOrders(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusUpdate = async (id: string, status: string) => {
    await adminService.updateStitchingStatus(id, status);
    fetchOrders(filterStatus);
    if (selectedOrder?.id === id) setSelectedOrder({ ...selectedOrder, status });
  };


  return (
    <AdminGuard>
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F9F8F6' }}>
      <AdminSidebar />
      <main style={{ flex: 1, padding: '32px 40px', maxWidth: 1200 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 300, letterSpacing: '0.06em', margin: 0 }}>Custom Stitching Orders</h1>
            <p style={{ color: 'var(--dust)', fontSize: 13, margin: '4px 0 0' }}>{orders.length} total orders</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['', 'PENDING', 'IN_PROGRESS', 'COMPLETED'].map(s => (
              <button
                key={s}
                onClick={() => { setFilterStatus(s); fetchOrders(s || undefined); }}
                style={{
                  padding: '8px 16px', borderRadius: 6, fontSize: 12, letterSpacing: '0.06em',
                  border: `1px solid ${filterStatus === s ? 'var(--ink)' : 'var(--border)'}`,
                  background: filterStatus === s ? 'var(--ink)' : '#fff',
                  color: filterStatus === s ? 'var(--cream)' : 'var(--ink)',
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                {s || 'All'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: selectedOrder ? '1fr 380px' : '1fr', gap: 24 }}>
          {/* Table */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden', opacity: loading ? 0.6 : 1 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F9F8F6' }}>
                  {['Product ID', 'Garment', 'Status', 'Charge', 'Date', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--dust)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: 'var(--dust)' }}>No custom stitching orders yet.</td></tr>
                ) : orders.map(order => (
                  <tr key={order.id} style={{ borderTop: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => setSelectedOrder(order)}>
                    <td style={{ padding: '12px 16px', fontSize: 12, fontFamily: 'monospace' }}>{order.productId.slice(0, 8)}...</td>
                    <td style={{ padding: '12px 16px', fontSize: 13 }}>{order.garmentType.replace(/_/g, ' ')}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: statusBg[order.status] || '#F3F4F6', color: statusColors[order.status] || '#374151', padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 500 }}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13 }}>₹{(order.charge / 100).toFixed(0)}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--dust)' }}>{formatDate(order.createdAt)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <select
                        value={order.status}
                        onChange={e => { e.stopPropagation(); handleStatusUpdate(order.id, e.target.value); }}
                        onClick={e => e.stopPropagation()}
                        style={{ fontSize: 12, padding: '4px 8px', border: '1px solid var(--border)', borderRadius: 4, fontFamily: 'inherit', cursor: 'pointer' }}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="IN_PROGRESS">IN PROGRESS</option>
                        <option value="COMPLETED">COMPLETED</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Detail panel */}
          {selectedOrder && (
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--border)', padding: 24, height: 'fit-content', position: 'sticky', top: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 500, margin: 0, letterSpacing: '0.06em' }}>Measurements</h3>
                <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--dust)' }}>×</button>
              </div>
              <p style={{ fontSize: 12, color: 'var(--dust)', marginBottom: 4 }}>Garment: <strong style={{ color: 'var(--ink)' }}>{selectedOrder.garmentType.replace(/_/g, ' ')}</strong></p>
              <p style={{ fontSize: 12, color: 'var(--dust)', marginBottom: 16 }}>Date: {formatDate(selectedOrder.createdAt)}</p>

              <div style={{ marginBottom: 20 }}>
                {Object.entries(selectedOrder.measurements || {}).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 13, textTransform: 'capitalize' }}>{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{String(v)} in</span>
                  </div>
                ))}
              </div>

              {selectedOrder.specialInstructions && (
                <div style={{ background: '#FEF3C7', borderRadius: 8, padding: 12, marginBottom: 16 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#92400E', margin: '0 0 4px' }}>Special Instructions</p>
                  <p style={{ fontSize: 13, margin: 0, color: '#1A1A1A' }}>{selectedOrder.specialInstructions}</p>
                </div>
              )}

              <button
                onClick={() => window.print()}
                style={{ width: '100%', padding: '12px', border: '1px solid var(--ink)', background: '#fff', borderRadius: 8, cursor: 'pointer', fontSize: 13, letterSpacing: '0.06em', fontFamily: 'inherit' }}
              >
                Print Measurements
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
    </AdminGuard>
  );
}
