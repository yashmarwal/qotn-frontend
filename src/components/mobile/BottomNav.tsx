'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, ShoppingBag, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { totalItems } = useCart();

  const isHome = pathname === '/';
  const isCart = pathname === '/cart';
  const isAccount = pathname.startsWith('/account') || pathname.startsWith('/orders') || pathname.startsWith('/addresses');

  const handleSearch = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('qotn:open-search'));
    }
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingTop: 8,
    paddingBottom: 4,
    textDecoration: 'none',
    color: active ? 'var(--black)' : 'var(--dust)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'DM Sans, sans-serif',
  });

  const labelStyle = (active: boolean): React.CSSProperties => ({
    fontSize: 9,
    letterSpacing: '0.06em',
    fontWeight: active ? 600 : 400,
    color: active ? 'var(--black)' : 'var(--dust)',
  });

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 42,
        backgroundColor: 'var(--cream)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'stretch',
        height: 'calc(56px + env(safe-area-inset-bottom, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* Home */}
      <Link href="/" style={tabStyle(isHome)}>
        <Home size={20} strokeWidth={isHome ? 2 : 1.5} color={isHome ? 'var(--black)' : 'var(--dust)'} />
        <span style={labelStyle(isHome)}>Home</span>
      </Link>

      {/* Search */}
      <button onClick={handleSearch} style={tabStyle(false)}>
        <Search size={20} strokeWidth={1.5} color="var(--dust)" />
        <span style={labelStyle(false)}>Search</span>
      </button>

      {/* Cart */}
      <Link href="/cart" style={tabStyle(isCart)}>
        <div style={{ position: 'relative' }}>
          <ShoppingBag size={20} strokeWidth={isCart ? 2 : 1.5} color={isCart ? 'var(--black)' : 'var(--dust)'} />
          {totalItems > 0 && (
            <span
              suppressHydrationWarning
              style={{
                position: 'absolute',
                top: -5,
                right: -6,
                width: 15,
                height: 15,
                borderRadius: '50%',
                background: 'var(--black)',
                color: 'var(--cream)',
                fontSize: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                pointerEvents: 'none',
              }}
            >
              {totalItems > 9 ? '9+' : totalItems}
            </span>
          )}
        </div>
        <span style={labelStyle(isCart)}>Cart</span>
      </Link>

      {/* Account */}
      <Link href="/account" style={tabStyle(isAccount)}>
        <User size={20} strokeWidth={isAccount ? 2 : 1.5} color={isAccount ? 'var(--black)' : 'var(--dust)'} />
        <span style={labelStyle(isAccount)}>Account</span>
      </Link>
    </nav>
  );
}
