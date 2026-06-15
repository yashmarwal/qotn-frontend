'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import AdminGuard from '@/components/AdminGuard';
import { useAuth } from '@/context/AuthContext';
import { adminService } from '@/lib/services/admin.service';
import { formatPrice, formatDate } from '@/lib/utils';

export default function AdminCustomersPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<any>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminService.getCustomers(1)
      .then((res: any) => { setCustomers(res.data || []); setMeta(res.meta); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter((c) => {
    const name = `${c.firstName ?? ''} ${c.lastName ?? ''}`.toLowerCase();
    return name.includes(search.toLowerCase()) || (c.email ?? '').toLowerCase().includes(search.toLowerCase());
  });


  return (
    <AdminGuard>
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F7F5F2' }}>
      <AdminSidebar />
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 400, letterSpacing: '0.04em' }}>Customers</h1>
          <p style={{ fontSize: 13, color: 'var(--dust)', marginTop: 4 }}>{loading ? '...' : `${meta?.total ?? customers.length} total customers`}</p>
        </div>

        <div style={{ position: 'relative', maxWidth: 320, marginBottom: 24 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--dust)', pointerEvents: 'none' }} />
          <input placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 14px 10px 36px', border: '1px solid var(--border)', background: 'var(--cream)', fontSize: 13, outline: 'none', color: 'var(--black)', fontFamily: 'DM Sans, sans-serif' }} />
        </div>

        <div style={{ background: 'var(--cream)', border: '1px solid var(--border)', opacity: loading ? 0.6 : 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: '#F0EDE8' }}>
                {['Name', 'Email', 'Phone', 'Orders', 'Spent', 'Joined'].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--dust)', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--dust)', fontSize: 13 }}>
                    {loading ? 'Loading...' : 'No customers yet.'}
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '13px 16px', fontWeight: 500 }}>{c.firstName} {c.lastName}</td>
                    <td style={{ padding: '13px 16px', color: 'var(--dust)' }}>{c.email}</td>
                    <td style={{ padding: '13px 16px', color: 'var(--dust)' }}>{c.phone ?? '—'}</td>
                    <td style={{ padding: '13px 16px', fontWeight: 500 }}>{c._count?.orders ?? 0}</td>
                    <td style={{ padding: '13px 16px', fontWeight: 500 }}>{formatPrice(c.totalSpent ?? 0)}</td>
                    <td style={{ padding: '13px 16px', color: 'var(--dust)' }}>{c.createdAt ? formatDate(c.createdAt) : '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
    </AdminGuard>
  );
}
