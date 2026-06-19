'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Menu, X, Search, ShoppingBag, Heart, User, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

const API =
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3001/api'
    : '/api';

const navLinks = [
  { href: '/men', label: 'MEN' },
  { href: '/women', label: 'WOMEN' },
  { href: '/kids', label: 'KIDS' },
  { href: '/#new-arrivals', label: 'NEW ARRIVALS' },
  { href: '/about', label: 'ABOUT' },
  { href: '/contact', label: 'CONTACT' },
];

const TRENDING = ['Men\'s Tees', 'Women\'s Kurtis', 'Kids Cotton', 'New Arrivals'];

export default function MobileNavbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const [lastScroll, setLastScroll] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();
  const { totalItems } = useCart();

  useEffect(() => {
    document.body.style.overflow = (drawerOpen || searchOpen) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen, searchOpen]);

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      if (current > 80 && current > lastScroll) setCompact(true);
      else if (current < lastScroll) setCompact(false);
      setLastScroll(current <= 0 ? 0 : current);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScroll]);

  // ESC to close search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setSearchOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const runSearch = useCallback((q: string) => {
    if (!q.trim()) { setSearchResults([]); return; }
    setSearching(true);
    fetch(`${API}/products?search=${encodeURIComponent(q)}&limit=5`)
      .then(r => r.json())
      .then(d => setSearchResults(d.data || []))
      .catch(() => setSearchResults([]))
      .finally(() => setSearching(false));
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => runSearch(q), 300);
  };

  const navH = compact ? 44 : 52;

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 50, height: navH,
        backgroundColor: 'var(--cream)', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 4px', transition: 'height 0.2s ease',
      }}>
        {/* Hamburger */}
        <button onClick={() => setDrawerOpen(true)} aria-label="Open menu"
          style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48 }}>
          <Menu size={22} strokeWidth={1.5} />
        </button>

        {/* Logo */}
        <Link href="/" onClick={() => setDrawerOpen(false)}
          className="brand-wordmark"
          style={{ fontSize: 16, color: 'var(--black)', position: 'absolute', left: '50%', transform: 'translateX(-50%)', textDecoration: 'none', minHeight: 'unset' }}>
          QOTN
        </Link>

        {/* Right icons */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button onClick={() => { setSearchQuery(''); setSearchResults([]); setSearchOpen(true); }}
            aria-label="Search products"
            style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48 }}>
            <Search size={20} strokeWidth={1.5} />
          </button>
          <button onClick={() => router.push('/cart')}
            aria-label={`Shopping bag, ${totalItems} items`}
            style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, position: 'relative' }}>
            <ShoppingBag size={20} strokeWidth={1.5} />
            {totalItems > 0 && (
              <span style={{
                position: 'absolute', top: 8, right: 8,
                width: 16, height: 16, borderRadius: '50%',
                background: 'var(--black)', color: 'var(--cream)',
                fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 600, pointerEvents: 'none',
              }}>{totalItems > 9 ? '9+' : totalItems}</span>
            )}
          </button>
        </div>
      </header>

      {/* ─── Drawer ──────────────────────────────── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              onClick={() => setDrawerOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 98 }} />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{ position: 'fixed', top: 0, left: 0, height: '100%', width: '85%', maxWidth: 340, backgroundColor: '#1A1A1A', zIndex: 99, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px', height: 64, borderBottom: '1px solid #333', flexShrink: 0 }}>
                <span className="brand-wordmark" style={{ fontSize: 20, color: '#F5F0E8' }}>QOTN</span>
                <button onClick={() => setDrawerOpen(false)} aria-label="Close menu"
                  style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F5F0E8', width: 44, height: 44 }}>
                  <X size={22} strokeWidth={1.5} />
                </button>
              </div>
              <nav style={{ flex: 1 }}>
                {navLinks.map(link => (
                  <Link key={link.href} href={link.href} onClick={() => setDrawerOpen(false)}
                    style={{ display: 'block', fontSize: 28, fontWeight: 300, letterSpacing: '0.08em', color: '#F5F0E8', padding: '18px 24px', borderBottom: '1px solid #333', textDecoration: 'none', minHeight: 'unset' }}>
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div style={{ padding: '20px 24px', paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 0px))', borderTop: '1px solid #333', display: 'flex', gap: 32, flexShrink: 0 }}>
                <Link href="/account" onClick={() => setDrawerOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(245,240,232,0.6)', fontSize: 13, letterSpacing: '0.06em', textDecoration: 'none', minHeight: 44 }}>
                  <User size={16} strokeWidth={1.5} color="rgba(245,240,232,0.6)" /> My Account
                </Link>
                <Link href="/wishlist" onClick={() => setDrawerOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(245,240,232,0.6)', fontSize: 13, letterSpacing: '0.06em', textDecoration: 'none', minHeight: 44 }}>
                  <Heart size={16} strokeWidth={1.5} color="rgba(245,240,232,0.6)" /> Wishlist
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Mobile Search Overlay ────────────────── */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ y: '-100%' }} animate={{ y: 0 }} exit={{ y: '-100%' }}
            transition={{ duration: 0.28, ease: [0, 0, 0.2, 1] }}
            style={{ position: 'fixed', inset: 0, background: 'var(--cream)', zIndex: 200, display: 'flex', flexDirection: 'column' }}>
            {/* Top bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
              <button onClick={() => setSearchOpen(false)} aria-label="Close search"
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', width: 40, height: 40 }}>
                <ChevronLeft size={22} strokeWidth={1.5} />
              </button>
              <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={18} strokeWidth={1.5} style={{ position: 'absolute', left: 14, color: 'var(--dust)', pointerEvents: 'none' }} />
                <input
                  autoFocus
                  type="search"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={e => { if (e.key === 'Enter' && searchQuery.trim()) { router.push(`/search?q=${encodeURIComponent(searchQuery)}`); setSearchOpen(false); } }}
                  placeholder="Search products..."
                  style={{ width: '100%', height: 52, padding: '0 16px 0 46px', background: 'var(--raw-cotton)', border: 'none', borderRadius: 4, fontSize: 16, outline: 'none', fontFamily: 'DM Sans, sans-serif' }}
                />
              </div>
            </div>

            {/* Results */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {searchQuery.trim() === '' ? (
                <div style={{ padding: '20px 16px' }}>
                  <p style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dust)', marginBottom: 14, fontWeight: 500 }}>TRENDING SEARCHES</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {TRENDING.map(t => (
                      <button key={t} onClick={() => { setSearchQuery(t); runSearch(t); }}
                        style={{ padding: '8px 14px', border: '1px solid var(--border)', background: 'transparent', fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', borderRadius: 20 }}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              ) : searching ? (
                <p style={{ padding: '24px 16px', fontSize: 13, color: 'var(--dust)' }}>Searching…</p>
              ) : searchResults.length === 0 ? (
                <p style={{ padding: '24px 16px', fontSize: 13, color: 'var(--dust)' }}>No products found for &quot;{searchQuery}&quot;</p>
              ) : searchResults.map((p: any) => {
                const img = p.images?.[0]?.url || p.images?.[0] || '';
                const price = p.variants?.[0]?.price ?? p.minPrice ?? 0;
                return (
                  <Link key={p.id} href={`/${p.category?.slug ?? p.categoryId}/${p.slug}`}
                    onClick={() => setSearchOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderBottom: '1px solid var(--border)', textDecoration: 'none', color: 'inherit', minHeight: 72 }}>
                    {img && <Image src={img} alt={p.name} width={48} height={48} style={{ objectFit: 'cover', borderRadius: 2, flexShrink: 0 }} />}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 400 }}>{p.name}</p>
                      <p style={{ fontSize: 13, color: 'var(--dust)', marginTop: 2 }}>{formatPrice(price)}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
