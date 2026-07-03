'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, User, ShoppingBag, X, Clock, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { formatPrice } from '@/lib/utils';

const API =
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3001/api'
    : '/api';

const navLinks = [
  { href: '/men',         label: 'Men' },
  { href: '/women',       label: 'Women' },
  { href: '/kids',        label: 'Kids' },
  { href: '/collections', label: 'Collections' },
  { href: '/about',       label: 'About' },
];

const RECENT_KEY = 'qotn_recent_searches';
const TRENDING_SHOW = 5;
const CAT_LABELS: Record<string, string> = { men: "Men's", women: "Women's", kids: "Kids'" };

function getRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; }
}
function saveRecent(q: string) {
  const prev = getRecent().filter(s => s.toLowerCase() !== q.toLowerCase());
  localStorage.setItem(RECENT_KEY, JSON.stringify([q, ...prev].slice(0, 5)));
}

function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <strong style={{ fontWeight: 600, color: 'var(--black)' }}>{text.slice(idx, idx + query.length)}</strong>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function DesktopNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingNames, setTrendingNames] = useState<string[]>([]);
  const [trendingIdx, setTrendingIdx] = useState(0);
  const [trendingFade, setTrendingFade] = useState(true);
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
    fetch(`${API}/products?search=${encodeURIComponent(q)}&limit=8`)
      .then(r => r.json())
      .then(d => setSearchResults(d.data || []))
      .catch(() => setSearchResults([]))
      .finally(() => setSearching(false));
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => runSearch(q), 280);
  };

  const openSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchOpen(true);
    setRecentSearches(getRecent());
    setTrendingIdx(0);
    setTrendingFade(true);
    if (trendingNames.length === 0) {
      fetch(`${API}/products?limit=40&page=1`)
        .then(r => r.json())
        .then(d => setTrendingNames((d.data || []).map((p: any) => p.name).filter(Boolean)))
        .catch(() => {});
    }
  };

  const closeSearch = () => setSearchOpen(false);

  const handleResultClick = () => {
    if (searchQuery.trim()) saveRecent(searchQuery.trim());
    closeSearch();
  };

  const handleEnter = () => {
    if (!searchQuery.trim()) return;
    saveRecent(searchQuery.trim());
    closeSearch();
  };

  const clearRecent = () => {
    localStorage.removeItem(RECENT_KEY);
    setRecentSearches([]);
  };

  // Rotate trending pills every 2s when search is open
  useEffect(() => {
    if (!searchOpen || trendingNames.length <= TRENDING_SHOW) return;
    const t = setInterval(() => {
      setTrendingFade(false);
      setTimeout(() => {
        setTrendingIdx(i => (i + TRENDING_SHOW) % trendingNames.length);
        setTrendingFade(true);
      }, 200);
    }, 2000);
    return () => clearInterval(t);
  }, [searchOpen, trendingNames.length]);

  const visibleTrending = Array.from(
    { length: Math.min(TRENDING_SHOW, trendingNames.length) },
    (_, i) => trendingNames[(trendingIdx + i) % trendingNames.length]
  );

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
          <Link href="/" className="brand-wordmark" style={{ fontSize: 20, color: 'var(--black)', minHeight: 'unset' }}>QOTN</Link>
          <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 36 }}>
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className="nav-link-desktop" style={{ minHeight: 'unset' }}>{link.label}</Link>
            ))}
          </nav>
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

      {/* ─── Search Overlay ────────────────────────────── */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={e => { if (e.target === e.currentTarget) closeSearch(); }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(245,240,232,0.97)', backdropFilter: 'blur(10px)', zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 72 }}>

            <button onClick={closeSearch} aria-label="Close search"
              style={{ position: 'fixed', top: 16, right: 24, width: 44, height: 44, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dust)' }}>
              <X size={20} strokeWidth={1.5} />
            </button>

            {/* Input */}
            <div style={{ width: '100%', maxWidth: 620, position: 'relative' }}>
              <Search size={18} strokeWidth={1.5} style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', color: 'var(--dust)', pointerEvents: 'none' }} />
              <input
                autoFocus
                type="search"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={e => { if (e.key === 'Enter' && searchQuery.trim()) handleEnter(); }}
                placeholder="Search for cotton kurtas, shirts, dresses…"
                style={{ width: '100%', fontSize: 28, fontWeight: 300, letterSpacing: '0.02em', border: 'none', borderBottom: '1px solid var(--black)', background: 'transparent', padding: '14px 0 14px 32px', outline: 'none', fontFamily: 'DM Sans, sans-serif', color: 'var(--black)' }}
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                  style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--dust)', display: 'flex', alignItems: 'center' }}>
                  <X size={16} strokeWidth={1.5} />
                </button>
              )}
            </div>

            {/* Results panel */}
            <div style={{ width: '100%', maxWidth: 620, marginTop: 28 }}>
              {searchQuery.trim() === '' ? (
                <div>
                  {/* Recent searches */}
                  {recentSearches.length > 0 && (
                    <div style={{ marginBottom: 28 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <Clock size={11} strokeWidth={1.5} color="var(--dust)" />
                          <p style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dust)' }}>RECENT</p>
                        </div>
                        <button onClick={clearRecent}
                          style={{ background: 'none', border: 'none', fontSize: 11, color: 'var(--dust)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.04em' }}>
                          Clear all
                        </button>
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {recentSearches.map(s => (
                          <button key={s} onClick={() => { setSearchQuery(s); runSearch(s); }}
                            style={{ padding: '8px 16px', border: '1px solid var(--border)', background: 'transparent', fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', borderRadius: 20, color: 'var(--black)' }}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Trending — dynamic from real products, rotates every 2s */}
                  {visibleTrending.length > 0 && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
                        <TrendingUp size={11} strokeWidth={1.5} color="var(--dust)" />
                        <p style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dust)' }}>TRENDING</p>
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', opacity: trendingFade ? 1 : 0, transition: 'opacity 0.2s ease' }}>
                        {visibleTrending.map(name => (
                          <button key={name} onClick={() => { setSearchQuery(name); runSearch(name); }}
                            style={{ padding: '8px 16px', border: '1px solid var(--border)', background: 'transparent', fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', borderRadius: 20, color: 'var(--black)' }}>
                            {name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : searching ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {[1,2,3].map(i => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 0', borderBottom: '1px solid var(--border)', opacity: 0.4 }}>
                      <div style={{ width: 56, height: 56, background: 'var(--raw-cotton)', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ height: 14, width: '60%', background: 'var(--raw-cotton)', marginBottom: 6 }} />
                        <div style={{ height: 10, width: '30%', background: 'var(--raw-cotton)' }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchResults.length === 0 ? (
                <div style={{ paddingTop: 8 }}>
                  <p style={{ fontSize: 15, color: 'var(--dust)', marginBottom: 6 }}>No results for <strong style={{ color: 'var(--black)', fontWeight: 500 }}>&ldquo;{searchQuery}&rdquo;</strong></p>
                  <p style={{ fontSize: 13, color: 'var(--dust)' }}>Try searching for kurta, shirt, dress, or browse by category above.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {searchResults.map((p: any) => {
                    const img = p.images?.[0]?.url || (typeof p.images?.[0] === 'string' ? p.images[0] : '');
                    const variants = p.variants || [];
                    const prices = variants.map((v: any) => v.price).filter(Boolean);
                    const minPrice = prices.length > 0 ? Math.min(...prices) : (p.minPrice ?? 0);
                    const origPrices = variants.map((v: any) => v.originalPrice).filter(Boolean);
                    const origPrice = origPrices.length > 0 ? Math.max(...origPrices) : null;
                    const discount = origPrice && minPrice && origPrice > minPrice
                      ? Math.round(((origPrice - minPrice) / origPrice) * 100) : null;
                    const catSlug = p.category?.slug ?? p.categoryId ?? '';
                    const catLabel = CAT_LABELS[catSlug] || catSlug;

                    return (
                      <Link key={p.id} href={`/${catSlug}/${p.slug}`}
                        onClick={handleResultClick}
                        style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: '1px solid var(--border)', textDecoration: 'none', color: 'inherit' }}>
                        <div style={{ width: 56, height: 56, flexShrink: 0, overflow: 'hidden', background: 'var(--raw-cotton)' }}>
                          {img && <Image src={img} alt={p.name} width={56} height={56} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 15, fontWeight: 400, color: 'var(--black)', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <HighlightMatch text={p.name} query={searchQuery} />
                          </p>
                          {catLabel && (
                            <span style={{ display: 'inline-block', fontSize: 9, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--dust)', border: '1px solid var(--border)', padding: '2px 7px', borderRadius: 20 }}>
                              {catLabel}
                            </span>
                          )}
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--black)' }}>{formatPrice(minPrice)}</p>
                          {origPrice && origPrice > minPrice && (
                            <p style={{ fontSize: 11, color: 'var(--dust)', textDecoration: 'line-through' }}>{formatPrice(origPrice)}</p>
                          )}
                          {discount && (
                            <p style={{ fontSize: 11, color: '#15803D', fontWeight: 500 }}>{discount}% off</p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                  <p style={{ fontSize: 12, color: 'var(--dust)', paddingTop: 12, textAlign: 'center' }}>
                    Showing top {searchResults.length} results · Press Enter to see all
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
