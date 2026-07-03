'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Menu, X, Search, ShoppingBag, Heart, User, ChevronLeft, Clock, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

const API =
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3001/api'
    : '/api';

const navLinks = [
  { href: '/men',           label: 'MEN' },
  { href: '/women',         label: 'WOMEN' },
  { href: '/kids',          label: 'KIDS' },
  { href: '/#new-arrivals', label: 'NEW ARRIVALS' },
  { href: '/about',         label: 'ABOUT' },
  { href: '/contact',       label: 'CONTACT' },
];

const RECENT_KEY = 'qotn_recent_searches';
const TRENDING_SHOW = 4;
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

export default function MobileNavbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const [lastScroll, setLastScroll] = useState(0);
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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setSearchOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

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

  const handleResultClick = () => {
    if (searchQuery.trim()) saveRecent(searchQuery.trim());
    setSearchOpen(false);
  };

  const clearRecent = () => {
    localStorage.removeItem(RECENT_KEY);
    setRecentSearches([]);
  };

  // Rotate trending pills every 2s when search overlay is open
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

  const navH = compact ? 44 : 52;

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 50, height: navH,
        backgroundColor: 'var(--cream)', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 4px', transition: 'height 0.2s ease',
      }}>
        <button onClick={() => setDrawerOpen(true)} aria-label="Open menu"
          style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48 }}>
          <Menu size={22} strokeWidth={1.5} />
        </button>

        <Link href="/" onClick={() => setDrawerOpen(false)}
          className="brand-wordmark"
          style={{ fontSize: 16, color: 'var(--black)', position: 'absolute', left: '50%', transform: 'translateX(-50%)', textDecoration: 'none', minHeight: 'unset' }}>
          QOTN
        </Link>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button onClick={openSearch} aria-label="Search products"
            style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48 }}>
            <Search size={20} strokeWidth={1.5} />
          </button>
          <button onClick={() => router.push('/cart')} aria-label={`Shopping bag, ${totalItems} items`}
            style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, position: 'relative' }}>
            <ShoppingBag size={20} strokeWidth={1.5} />
            {totalItems > 0 && (
              <span style={{ position: 'absolute', top: 8, right: 8, width: 16, height: 16, borderRadius: '50%', background: 'var(--black)', color: 'var(--cream)', fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, pointerEvents: 'none' }}>
                {totalItems > 9 ? '9+' : totalItems}
              </span>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
              <button onClick={() => setSearchOpen(false)} aria-label="Close search"
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', width: 40, height: 44 }}>
                <ChevronLeft size={22} strokeWidth={1.5} />
              </button>
              <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={16} strokeWidth={1.5} style={{ position: 'absolute', left: 14, color: 'var(--dust)', pointerEvents: 'none' }} />
                <input
                  autoFocus
                  type="search"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      saveRecent(searchQuery.trim());
                      setSearchOpen(false);
                    }
                  }}
                  placeholder="Search products…"
                  style={{ width: '100%', height: 48, padding: '0 36px 0 42px', background: 'var(--raw-cotton)', border: 'none', borderRadius: 4, fontSize: 15, outline: 'none', fontFamily: 'DM Sans, sans-serif', color: 'var(--black)' }}
                />
                {searchQuery && (
                  <button onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                    style={{ position: 'absolute', right: 10, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--dust)' }}>
                    <X size={14} strokeWidth={1.5} />
                  </button>
                )}
              </div>
            </div>

            {/* Results area */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {searchQuery.trim() === '' ? (
                <div style={{ padding: '20px 16px' }}>
                  {/* Recent searches */}
                  {recentSearches.length > 0 && (
                    <div style={{ marginBottom: 24 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Clock size={11} strokeWidth={1.5} color="var(--dust)" />
                          <p style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dust)', fontWeight: 500 }}>RECENT</p>
                        </div>
                        <button onClick={clearRecent}
                          style={{ background: 'none', border: 'none', fontSize: 11, color: 'var(--dust)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                          Clear
                        </button>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {recentSearches.map(s => (
                          <button key={s} onClick={() => { setSearchQuery(s); runSearch(s); }}
                            style={{ padding: '8px 14px', border: '1px solid var(--border)', background: 'transparent', fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', borderRadius: 20, color: 'var(--black)' }}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Trending — dynamic from real products, rotates every 2s */}
                  {visibleTrending.length > 0 && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                        <TrendingUp size={11} strokeWidth={1.5} color="var(--dust)" />
                        <p style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dust)', fontWeight: 500 }}>TRENDING</p>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, opacity: trendingFade ? 1 : 0, transition: 'opacity 0.2s ease' }}>
                        {visibleTrending.map(name => (
                          <button key={name} onClick={() => { setSearchQuery(name); runSearch(name); }}
                            style={{ padding: '8px 14px', border: '1px solid var(--border)', background: 'transparent', fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', borderRadius: 20, color: 'var(--black)' }}>
                            {name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : searching ? (
                <div style={{ padding: '0 16px' }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderBottom: '1px solid var(--border)', opacity: 0.4 }}>
                      <div style={{ width: 60, height: 60, background: 'var(--raw-cotton)', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ height: 13, width: '65%', background: 'var(--raw-cotton)', marginBottom: 8 }} />
                        <div style={{ height: 10, width: '35%', background: 'var(--raw-cotton)' }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchResults.length === 0 ? (
                <div style={{ padding: '32px 16px' }}>
                  <p style={{ fontSize: 15, color: 'var(--dust)', marginBottom: 6 }}>No results for <strong style={{ color: 'var(--black)', fontWeight: 500 }}>&ldquo;{searchQuery}&rdquo;</strong></p>
                  <p style={{ fontSize: 13, color: 'var(--dust)', lineHeight: 1.6 }}>Try a different word, or browse Men, Women or Kids.</p>
                </div>
              ) : (
                <>
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
                        style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderBottom: '1px solid var(--border)', textDecoration: 'none', color: 'inherit', minHeight: 80 }}>
                        <div style={{ width: 60, height: 60, flexShrink: 0, overflow: 'hidden', background: 'var(--raw-cotton)' }}>
                          {img && <Image src={img} alt={p.name} width={60} height={60} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 400, color: 'var(--black)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <HighlightMatch text={p.name} query={searchQuery} />
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            {catLabel && (
                              <span style={{ fontSize: 9, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--dust)', border: '1px solid var(--border)', padding: '2px 7px', borderRadius: 20 }}>
                                {catLabel}
                              </span>
                            )}
                            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--black)' }}>{formatPrice(minPrice)}</span>
                            {origPrice && origPrice > minPrice && (
                              <span style={{ fontSize: 11, color: 'var(--dust)', textDecoration: 'line-through' }}>{formatPrice(origPrice)}</span>
                            )}
                            {discount && (
                              <span style={{ fontSize: 11, color: '#15803D', fontWeight: 500 }}>{discount}% off</span>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                  <p style={{ fontSize: 11, color: 'var(--dust)', textAlign: 'center', padding: '16px 0', letterSpacing: '0.04em' }}>
                    Top {searchResults.length} results shown
                  </p>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
