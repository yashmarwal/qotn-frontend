'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  BarChart2,
  Image,
  LogOut,
  Bell,
  Layers,
  Tag,
  Video,
} from 'lucide-react';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: Tag },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/inventory', label: 'Inventory', icon: BarChart2 },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/admin/waitlist', label: 'Waitlist', icon: Bell },
  { href: '/admin/banners', label: 'Banners', icon: Image },
  { href: '/admin/collections', label: 'Collections', icon: Layers },
  { href: '/admin/look-videos', label: 'Look Videos', icon: Video },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: 240,
        minHeight: '100vh',
        backgroundColor: 'var(--black)',
        color: 'var(--cream)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{ padding: '28px 24px', borderBottom: '1px solid rgba(245,240,232,0.1)' }}>
        <span className="brand-wordmark" style={{ fontSize: 18, color: 'var(--cream)' }}>QOTN</span>
        <p style={{ fontSize: 10, color: 'rgba(245,240,232,0.4)', letterSpacing: '0.08em', marginTop: 4, textTransform: 'uppercase' }}>
          Admin Panel
        </p>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 0' }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 24px',
                fontSize: 13,
                color: active ? '#1A1A1A' : 'rgba(245,240,232,0.55)',
                backgroundColor: active ? '#F5F0E8' : 'transparent',
                textDecoration: 'none',
                letterSpacing: '0.04em',
                borderLeft: active ? '3px solid #F5F0E8' : '3px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              <Icon size={16} strokeWidth={1.5} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '16px 0', borderTop: '1px solid rgba(245,240,232,0.1)' }}>
        <Link
          href="/admin"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 24px',
            fontSize: 13,
            color: 'rgba(245,240,232,0.5)',
            textDecoration: 'none',
            letterSpacing: '0.04em',
            transition: 'color 0.2s',
          }}
        >
          <LogOut size={16} strokeWidth={1.5} />
          Logout
        </Link>
      </div>
    </aside>
  );
}
