'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, TrendingUp, Package, Users, Plus, Eye } from 'lucide-react';
import Link from 'next/link';
import AdminSidebar from '@/components/AdminSidebar';
import AdminGuard from '@/components/AdminGuard';
import { useAuth } from '@/context/AuthContext';
import { adminService } from '@/lib/services/admin.service';
import { formatPrice, formatDate } from '@/lib/utils';

const statusColors: Record<string, string> = {
  pending: '#B45309',
  confirmed: '#1E40AF',
  processing: '#1D4ED8',
  shipped: '#6D28D9',
  delivered: '#065F46',
  cancelled: '#991B1B',
};
const statusBg: Record<string, string> = {
  pending: '#FEF3C7',
  confirmed: '#DBEAFE',
  processing: '#DBEAFE',
  shipped: '#EDE9FE',
  delivered: '#D1FAE5',
  cancelled: '#FEE2E2',
};

export default function AdminDashboardPage() {
  const { isAdmin, isLoading } = useAuth();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    adminService.getDashboard()
      .then((res: any) => setStats(res.data))
      .catch(console.error);
  }, []);


  const statCards = [
    { label: 'Total Orders', value: stats?.totalOrders ?? '...', icon: ShoppingBag, change: '+12% this month' },
    { label: 'Revenue', value: stats ? formatPrice(stats.totalRevenue) : '...', icon: TrendingUp, change: '+8% this month' },
    { label: 'Products', value: stats?.totalProducts ?? '...', icon: Package, change: '12 new this month' },
    { label: 'Customers', value: stats?.totalCustomers ?? '...', icon: Users, change: '+56 this month' },
  ];

  const recentOrders = stats?.recentOrders ?? [];

  return (
    <AdminGuard>
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F7F5F2' }}>
      <AdminSidebar />
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 400, letterSpacing: '0.04em', color: 'var(--black)' }}>Dashboard</h1>
            <p style={{ fontSize: 13, color: 'var(--dust)', marginTop: 4 }}>Welcome back, Admin.</p>
          </div>
          <Link href="/admin/products">
            <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'var(--black)', color: 'var(--cream)', border: 'none', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 500, fontFamily: 'DM Sans, sans-serif' }}>
              <Plus size={14} /> Add Product
            </button>
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 40 }}>
          {statCards.map(({ label, value, icon: Icon, change }, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.08 }}
              style={{ background: 'var(--cream)', border: '1px solid var(--border)', padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <p style={{ fontSize: 11, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--dust)', fontWeight: 500 }}>{label}</p>
                <Icon size={18} strokeWidth={1.5} color="var(--dust)" />
              </div>
              <p style={{ fontSize: 28, fontWeight: 300, letterSpacing: '-0.01em', lineHeight: 1 }}>{value}</p>
              <p style={{ fontSize: 11, color: 'var(--dust)' }}>{change}</p>
            </motion.div>
          ))}
        </div>

        <div style={{ background: 'var(--cream)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: 13, letterSpacing: '0.10em', textTransform: 'uppercase', fontWeight: 500 }}>Recent Orders</h2>
            <Link href="/admin/orders" style={{ fontSize: 12, color: 'var(--dust)', textDecoration: 'underline' }}>View All</Link>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: '#F0EDE8' }}>
                {['Order ID', 'Customer', 'Items', 'Amount', 'Payment', 'Status', 'Date', ''].map((h) => (
                  <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--dust)', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '24px 20px', textAlign: 'center', color: 'var(--dust)', fontSize: 13 }}>No orders yet.</td>
                </tr>
              ) : (
                recentOrders.map((order: any) => {
                  const statusKey = order.status?.toLowerCase() ?? 'pending';
                  return (
                    <tr key={order.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '13px 20px', fontWeight: 500, fontSize: 12, fontFamily: 'monospace' }}>{order.orderNumber}</td>
                      <td style={{ padding: '13px 20px' }}>{order.user?.firstName} {order.user?.lastName}</td>
                      <td style={{ padding: '13px 20px', color: 'var(--dust)' }}>{order.items?.length ?? '-'}</td>
                      <td style={{ padding: '13px 20px', fontWeight: 500 }}>{formatPrice(order.total)}</td>
                      <td style={{ padding: '13px 20px', color: 'var(--dust)' }}>{order.paymentStatus}</td>
                      <td style={{ padding: '13px 20px' }}>
                        <span style={{ fontSize: 10, padding: '3px 10px', background: statusBg[statusKey] ?? '#F0EDE8', color: statusColors[statusKey] ?? 'var(--dust)', letterSpacing: '0.08em', textTransform: 'capitalize', fontWeight: 600 }}>{statusKey}</span>
                      </td>
                      <td style={{ padding: '13px 20px', color: 'var(--dust)' }}>{formatDate(order.createdAt)}</td>
                      <td style={{ padding: '13px 20px' }}>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--dust)' }}><Eye size={14} strokeWidth={1.5} /></button>
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
