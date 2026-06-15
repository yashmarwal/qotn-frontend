'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, User, ShoppingBag, Menu, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const navLinks = [
  { href: '/men', label: 'Men' },
  { href: '/women', label: 'Women' },
  { href: '/kids', label: 'Kids' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalItems, openCart } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          height: 64,
          backgroundColor: 'var(--cream)',
          borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
          transition: 'border-color 0.3s ease',
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            margin: '0 auto',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 40px',
          }}
        >
          {/* Mobile: Bag left */}
          <div className="md:hidden flex items-center">
            <button
              onClick={openCart}
              style={{ background: 'none', border: 'none', padding: 8, position: 'relative' }}
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              {totalItems > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    width: 16,
                    height: 16,
                    background: 'var(--black)',
                    color: 'var(--cream)',
                    borderRadius: '50%',
                    fontSize: 9,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 500,
                  }}
                >
                  {totalItems}
                </span>
              )}
            </button>
          </div>

          {/* Logo */}
          <Link
            href="/"
            className="brand-wordmark md:absolute md:left-1/2 md:-translate-x-1/2"
            style={{
              fontSize: 20,
              color: 'var(--black)',
              textDecoration: 'none',
            }}
          >
            QOTN
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontSize: 13,
                  letterSpacing: '0.08em',
                  color: 'var(--black)',
                  textDecoration: 'none',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.5')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              style={{ background: 'none', border: 'none', padding: 8 }}
              className="hidden md:flex"
            >
              <Search size={18} strokeWidth={1.5} />
            </button>
            <Link href="/account" style={{ padding: 8 }} className="hidden md:flex">
              <User size={18} strokeWidth={1.5} />
            </Link>
            <button
              onClick={openCart}
              style={{ background: 'none', border: 'none', padding: 8, position: 'relative', display: 'flex', alignItems: 'center', gap: 6 }}
              className="hidden md:flex"
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              <span style={{ fontSize: 12, letterSpacing: '0.05em' }}>
                ({totalItems})
              </span>
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              style={{ background: 'none', border: 'none', padding: 8 }}
              className="md:hidden"
            >
              <Menu size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            backgroundColor: 'var(--cream)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 24px',
              height: 56,
              borderBottom: '1px solid var(--border)',
            }}
          >
            <Link
              href="/"
              className="brand-wordmark"
              style={{ fontSize: 18 }}
              onClick={() => setMobileOpen(false)}
            >
              QOTN
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              style={{ background: 'none', border: 'none', padding: 8 }}
            >
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>
          <nav style={{ padding: '48px 24px', flex: 1 }}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'block',
                  fontSize: 32,
                  fontWeight: 300,
                  letterSpacing: '0.08em',
                  color: 'var(--black)',
                  padding: '16px 0',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div style={{ padding: '24px', borderTop: '1px solid var(--border)' }}>
            <Link href="/account" onClick={() => setMobileOpen(false)} style={{ fontSize: 13, letterSpacing: '0.08em', color: 'var(--dust)' }}>
              Account
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
