'use client';
import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import AdminGuard from '@/components/AdminGuard';
import { useAuth } from '@/context/AuthContext';
import { adminService } from '@/lib/services/admin.service';
import { formatPrice } from '@/lib/utils';

export default function AdminAnalyticsPage() {
  const { isAdmin, isLoading } = useAuth();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    adminService.getAnalytics()
      .then((res: any) => setData(res.data))
      .catch(console.error);
  }, []);


  const ordersByDay = data?.ordersByDay || [];
  const maxRevenue = Math.max(...ordersByDay.map((d: any) => d.revenue), 1);

  return (
    <AdminGuard>
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F9F8F6' }}>
      <AdminSidebar />
      <main style={{ flex: 1, padding: '32px 40px', maxWidth: 1200 }}>
        <h1 style={{ fontSize: 24, fontWeight: 300, letterSpacing: '0.06em', marginBottom: 32 }}>Analytics</h1>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Custom Stitching (This Month)', value: data?.stitchingThisMonth ?? '...', unit: 'orders' },
            { label: 'Waitlist Entries', value: data?.waitlistCount ?? '...', unit: 'entries' },
          ].map(stat => (
            <div key={stat.label} style={{ background: '#fff', borderRadius: 12, padding: '24px 20px', border: '1px solid var(--border)' }}>
              <p style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--dust)', margin: '0 0 8px' }}>{stat.label}</p>
              <p style={{ fontSize: 28, fontWeight: 300, margin: 0 }}>{stat.value} <span style={{ fontSize: 13, color: 'var(--dust)' }}>{stat.unit}</span></p>
            </div>
          ))}
        </div>

        {/* Revenue chart (last 30 days) */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--border)', padding: 24, marginBottom: 32 }}>
          <h2 style={{ fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500, marginBottom: 20 }}>Revenue — Last 30 Days</h2>
          {ordersByDay.length === 0 ? (
            <p style={{ color: 'var(--dust)', textAlign: 'center', padding: '40px 0' }}>No data yet. Revenue will appear once orders are placed.</p>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 160, overflowX: 'auto', paddingBottom: 8 }}>
              {ordersByDay.map((d: any) => (
                <div key={d.date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 28 }}>
                  <div
                    title={`${d.date}: ${formatPrice(d.revenue)} (${d.count} orders)`}
                    style={{
                      width: 20,
                      height: Math.max(4, (d.revenue / maxRevenue) * 140),
                      background: 'var(--ink)',
                      borderRadius: '3px 3px 0 0',
                      cursor: 'pointer',
                      transition: 'opacity 0.2s',
                    }}
                  />
                  <span style={{ fontSize: 8, color: 'var(--dust)', transform: 'rotate(-45deg)', transformOrigin: 'center', whiteSpace: 'nowrap' }}>
                    {d.date.slice(5)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top viewed products */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--border)', padding: 24 }}>
          <h2 style={{ fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500, marginBottom: 20 }}>Top Viewed Products</h2>
          {(data?.topViewed || []).length === 0 ? (
            <p style={{ color: 'var(--dust)', textAlign: 'center', padding: '20px 0' }}>No product view data yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {(data?.topViewed || []).map((p: any, i: number) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 18, fontWeight: 200, color: 'var(--dust)', minWidth: 24 }}>{i + 1}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>{p.name}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--dust)' }}>{p.slug}</p>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{p.views} views</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
    </AdminGuard>
  );
}
