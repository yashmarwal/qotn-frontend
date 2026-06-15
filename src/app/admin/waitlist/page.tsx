'use client';
import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import AdminGuard from '@/components/AdminGuard';
import { useAuth } from '@/context/AuthContext';
import { adminService } from '@/lib/services/admin.service';
import { formatDate } from '@/lib/utils';

export default function AdminWaitlistPage() {
  const { isAdmin, isLoading } = useAuth();
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifying, setNotifying] = useState<string | null>(null);

  useEffect(() => {
    adminService.getWaitlist()
      .then((res: any) => setEntries(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);


  // Group by variantId
  const grouped: Record<string, any[]> = {};
  for (const e of entries) {
    if (!grouped[e.variantId]) grouped[e.variantId] = [];
    grouped[e.variantId].push(e);
  }

  return (
    <AdminGuard>
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F9F8F6' }}>
      <AdminSidebar />
      <main style={{ flex: 1, padding: '32px 40px', maxWidth: 1100 }}>
        <h1 style={{ fontSize: 24, fontWeight: 300, letterSpacing: '0.06em', marginBottom: 8 }}>Waitlist</h1>
        <p style={{ color: 'var(--dust)', fontSize: 13, marginBottom: 32 }}>{entries.length} total entries across {Object.keys(grouped).length} variants</p>

        {Object.keys(grouped).length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--border)', padding: 60, textAlign: 'center' }}>
            <p style={{ color: 'var(--dust)' }}>{loading ? 'Loading...' : 'No waitlist entries yet.'}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {Object.entries(grouped).map(([variantId, groupEntries]) => (
              <div key={variantId} style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', background: '#F9F8F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 12, fontFamily: 'monospace', color: 'var(--dust)' }}>Variant: {variantId.slice(0, 12)}...</p>
                    <p style={{ margin: '4px 0 0', fontSize: 13, fontWeight: 500 }}>{groupEntries.length} {groupEntries.length === 1 ? 'person' : 'people'} waiting</p>
                  </div>
                  <button
                    disabled={notifying === variantId}
                    onClick={async () => {
                      setNotifying(variantId);
                      try {
                        await adminService.notifyWaitlist(variantId);
                        alert(`Notified ${groupEntries.length} waitlist entries`);
                        setEntries(prev => prev.filter(e => e.variantId !== variantId));
                      } catch (err: any) {
                        alert(err.message || 'Failed to notify');
                      } finally {
                        setNotifying(null);
                      }
                    }}
                    style={{
                      padding: '8px 16px', background: notifying === variantId ? 'var(--dust)' : 'var(--ink)',
                      color: 'var(--cream)', border: 'none', borderRadius: 6, cursor: notifying === variantId ? 'not-allowed' : 'pointer',
                      fontSize: 12, letterSpacing: '0.06em', fontFamily: 'inherit',
                    }}
                  >
                    {notifying === variantId ? 'Sending...' : 'Send Back-in-Stock Email'}
                  </button>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Email', 'Product ID', 'Date'].map(h => (
                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--dust)', fontWeight: 500 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {groupEntries.map(e => (
                      <tr key={e.id} style={{ borderTop: '1px solid var(--border)' }}>
                        <td style={{ padding: '10px 16px', fontSize: 13 }}>{e.email}</td>
                        <td style={{ padding: '10px 16px', fontSize: 12, fontFamily: 'monospace', color: 'var(--dust)' }}>{e.productId.slice(0, 12)}...</td>
                        <td style={{ padding: '10px 16px', fontSize: 12, color: 'var(--dust)' }}>{formatDate(e.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
    </AdminGuard>
  );
}
