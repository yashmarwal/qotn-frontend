'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import AdminGuard from '@/components/AdminGuard';
import { useAuth } from '@/context/AuthContext';
import { adminService } from '@/lib/services/admin.service';

const LOW_STOCK_THRESHOLD = 5;

export default function AdminInventoryPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const [variants, setVariants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingStock, setPendingStock] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  const fetchInventory = () => {
    setLoading(true);
    adminService.getInventory(1)
      .then((res: any) => {
        const data: any[] = res.data || [];
        setVariants(data);
        // seed pending stock with current values
        const initial: Record<string, number> = {};
        data.forEach((v) => { initial[v.id] = v.stock; });
        setPendingStock(initial);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchInventory(); }, []);

  const handleStockChange = (variantId: string, value: number) => {
    setPendingStock((prev) => ({ ...prev, [variantId]: value }));
  };

  const handleSave = async (variantId: string) => {
    setSaving((prev) => ({ ...prev, [variantId]: true }));
    try {
      await adminService.updateStock(variantId, pendingStock[variantId] ?? 0);
      fetchInventory();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving((prev) => ({ ...prev, [variantId]: false }));
    }
  };

  const lowStockCount = variants.filter((v) => v.stock < LOW_STOCK_THRESHOLD).length;


  return (
    <AdminGuard>
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F7F5F2' }}>
      <AdminSidebar />

      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 400, letterSpacing: '0.04em' }}>Inventory</h1>
          <p style={{ fontSize: 13, color: 'var(--dust)', marginTop: 4 }}>Manage stock levels by product and size.</p>
        </div>

        {!loading && lowStockCount > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 16px',
            background: '#FEF3C7',
            border: '1px solid #FCD34D',
            marginBottom: 24,
          }}>
            <AlertTriangle size={16} color="#B45309" />
            <p style={{ fontSize: 13, color: '#B45309' }}>
              <strong>{lowStockCount}</strong> size variants are running low (below {LOW_STOCK_THRESHOLD} units).
            </p>
          </div>
        )}

        <div style={{ background: 'var(--cream)', border: '1px solid var(--border)', opacity: loading ? 0.6 : 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: '#F0EDE8' }}>
                {['Product', 'SKU', 'Size', 'Color', 'Stock', ''].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--dust)', fontWeight: 500 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {variants.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--dust)', fontSize: 13 }}>
                    {loading ? 'Loading...' : 'No inventory data yet.'}
                  </td>
                </tr>
              ) : (
                variants.map((variant) => {
                  const currentStock = pendingStock[variant.id] ?? variant.stock;
                  const isLow = variant.stock < LOW_STOCK_THRESHOLD;
                  return (
                    <tr
                      key={variant.id}
                      style={{ borderBottom: '1px solid var(--border)', background: isLow ? '#FFFBEB' : 'transparent' }}
                    >
                      <td style={{ padding: '12px 16px', fontWeight: 500 }}>{variant.product?.name ?? '—'}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--dust)', fontSize: 11, fontFamily: 'monospace' }}>{variant.sku ?? '—'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 10px',
                          border: '1px solid var(--border)',
                          fontSize: 11,
                          letterSpacing: '0.06em',
                        }}>
                          {variant.size ?? '—'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--dust)', textTransform: 'capitalize' }}>{variant.color ?? '—'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <input
                          type="number"
                          min={0}
                          value={currentStock}
                          onChange={(e) => handleStockChange(variant.id, parseInt(e.target.value) || 0)}
                          style={{
                            width: 72,
                            padding: '6px 10px',
                            border: `1px solid ${isLow ? '#FCD34D' : 'var(--border)'}`,
                            background: isLow ? '#FEF3C7' : 'var(--cream)',
                            fontSize: 13,
                            outline: 'none',
                            color: isLow ? '#B45309' : 'var(--black)',
                            fontFamily: 'DM Sans, sans-serif',
                            fontWeight: isLow ? 600 : 400,
                          }}
                        />
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <button
                            onClick={() => handleSave(variant.id)}
                            disabled={saving[variant.id]}
                            style={{
                              padding: '5px 14px',
                              background: 'var(--black)',
                              color: 'var(--cream)',
                              border: 'none',
                              fontSize: 11,
                              letterSpacing: '0.06em',
                              cursor: saving[variant.id] ? 'not-allowed' : 'pointer',
                              fontFamily: 'DM Sans, sans-serif',
                              opacity: saving[variant.id] ? 0.6 : 1,
                            }}
                          >
                            {saving[variant.id] ? 'Saving...' : 'Save'}
                          </button>
                          {isLow && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#B45309', fontWeight: 500 }}>
                              <AlertTriangle size={12} /> Low stock
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
    </AdminGuard>
  );
}
