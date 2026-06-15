'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, User, ShoppingBag, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { formatPrice } from '@/lib/utils';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const navLinks = [
  { href: '/men',         label: 'Men' },
  { href: '/women',       label: 'Women' },
  { href: '/kids',        label: 'Kids' },
  { href: '/collections', label: 'Collections' },
  { href: '/about',       label: 'About' },
];

const TRENDING = ['Men\'s Tees', 'Women\'s Kurtis', 'Kids Cotton', 'New Arrivals'];

export default function DesktopNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();
  const { totalItems, openCart } = useCart();
  const { items: wishlistItems } = useWishlist();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeSearch(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = searchOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [searchOpen]);

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

  const openSearch = () => { setSearchQuery(''); setSearchResults([]); setSearchOpen(true); };
  const closeSearch = () => setSearchOpen(false);

  const iconBtn: React.CSSProperties = {
    background: 'none', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 40, height: 40, color: 'var(--dust)', cursor: 'pointer',
    transition: 'color 150ms ease', position: 'relative',
  };

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 50, height: 64,
        backgroundColor: 'var(--cream)',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        transition: 'border-color 200ms ease',
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', height: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', alignItems: 'center', padding: '0 40px' }}>
          {/* ZONE LEFT */}
          <Link href="/" className="brand-wordmark" style={{ fontSize: 20, color: 'var(--black)', minHeight: 'unset' }}>QOTN</Link>

          {/* ZONE CENTER */}
          <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 36 }}>
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className="nav-link-desktop" style={{ minHeight: 'unset' }}>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* ZONE RIGHT */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
            <button style={iconBtn} aria-label="Search products" onClick={openSearch}>
              <Search size={18} strokeWidth={1.5} />
            </button>
            <Link href="/account" style={{ ...iconBtn, textDecoration: 'none' }} aria-label="My account">
              <User size={18} strokeWidth={1.5} />
            </Link>
            <button onClick={openCart} style={{ ...iconBtn, position: 'relative', gap: 6, paddingRight: 4 }} aria-label={`Shopping bag, ${totalItems} items`} suppressHydrationWarning>
              <ShoppingBag size={18} strokeWidth={1.5} />
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, letterSpacing: '0.05em', color: 'var(--dust)' }} suppressHydrationWarning>({totalItems})</span>
            </button>
          </div>
        </div>
      </header>

      {/* ─── Search Overlay ──────────────────────── */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={e => { if (e.target === e.currentTarget) closeSearch(); }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(245,240,232,0.97)', backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 80 }}>
            {/* Close */}
            <button onClick={closeSearch} aria-label="Close search"
              style={{ position: 'fixed', top: 16, right: 24, width: 48, height: 48, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dust)' }}>
              <X size={22} strokeWidth={1.5} />
            </button>

            <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--dust)', marginBottom: 16 }}>SEARCH</p>

            {/* Input */}
            <div style={{ width: '100%', maxWidth: 600, position: 'relative' }}>
              <input
                autoFocus
                type="search"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={e => { if (e.key === 'Enter' && searchQuery.trim()) { router.push(`/search?q=${encodeURIComponent(searchQuery)}`); closeSearch(); } }}
                placeholder="Search for products..."
                style={{ width: '100%', fontSize: 32, fontWeight: 300, letterSpacing: '0.04em', border: 'none', borderBottom: '1px solid var(--black)', background: 'transparent', padding: '16px 0', outline: 'none', fontFamily: 'DM Sans, sans-serif', color: 'var(--black)' }}
              />
            </div>

            {/* Results */}
            <div style={{ width: '100%', maxWidth: 600, marginTop: 24 }}>
              {searchQuery.trim() === '' ? (
                <>
                  <p style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dust)', marginBottom: 12 }}>TRENDING SEARCHES</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {TRENDING.map(t => (
                      <button key={t} onClick={() => { setSearchQuery(t); runSearch(t); }}
                        style={{ padding: '8px 16px', border: '1px solid var(--border)', background: 'transparent', fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', borderRadius: 20 }}>
                        {t}
                      </button>
                    ))}
                  </div>
                </>
              ) : searching ? (
                <p style={{ fontSize: 13, color: 'var(--dust)' }}>Searching…</p>
              ) : searchResults.length === 0 ? (
                <p style={{ fontSize: 14, color: 'var(--dust)' }}>No products found for &quot;{searchQuery}&quot;</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {searchResults.map((p: any) => {
                    const img = p.images?.[0]?.url || p.images?.[0] || '';
                    const price = p.variants?.[0]?.price ?? p.minPrice ?? 0;
                    return (
                      <Link key={p.id} href={`/${p.category?.slug ?? p.categoryId}/${p.slug}`}
                        onClick={closeSearch}
                        style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: '1px solid var(--border)', textDecoration: 'none', color: 'inherit' }}>
                        {img && <Image src={img} alt={p.name} width={40} height={40} style={{ objectFit: 'cover', borderRadius: 2, flexShrink: 0 }} />}
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 15, fontWeight: 400 }}>{p.name}</p>
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 500, flexShrink: 0 }}>{formatPrice(price)}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
