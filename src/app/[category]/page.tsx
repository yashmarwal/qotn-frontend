'use client';

import { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '@/components/shared/ProductCard';
import ProductCardSkeleton from '@/components/shared/ProductCardSkeleton';
import PageTransition from '@/components/shared/PageTransition';
import { useIsMobile } from '@/hooks/useIsMobile';
import { productsService } from '@/lib/services/products.service';
import { adaptApiProductList } from '@/lib/adapters';
import { Product } from '@/types';

const categoryLabels: Record<string, string> = { men: 'Men', women: 'Women', kids: 'Kids' };
const allSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2-3Y', '3-4Y', '4-5Y', '5-6Y', '6-7Y', '7-8Y'];
const allColors = ['White', 'Black', 'Cream', 'Olive', 'Blue', 'Beige', 'Grey', 'Navy', 'Terracotta', 'Sage', 'Blush'];

export default function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = use(params);
  const isMobile = useIsMobile();
  const [sortBy, setSortBy] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [showSizeFilter, setShowSizeFilter] = useState(false);
  const [showColorFilter, setShowColorFilter] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const label = categoryLabels[category] || category;

  useEffect(() => {
    setLoading(true);
    const sortMap: Record<string, 'price_asc' | 'price_desc' | 'newest'> = {
      'price-asc': 'price_asc',
      'price-desc': 'price_desc',
      'newest': 'newest',
    };
    productsService.getAll({
      category,
      ...(sortBy && sortMap[sortBy] ? { sortBy: sortMap[sortBy] } : {}),
      ...(selectedSizes.length === 1 ? { size: selectedSizes[0] } : {}),
      ...(selectedColors.length === 1 ? { color: selectedColors[0] } : {}),
      page: 1,
      limit: 48,
    }).then((res: any) => {
      let result = adaptApiProductList(res.data || []);
      if (selectedSizes.length > 1) result = result.filter((p) => selectedSizes.some((s) => p.sizes.includes(s)));
      if (selectedColors.length > 1) result = result.filter((p) => selectedColors.some((c) => p.colors.includes(c)));
      setFiltered(result);
      setTotal(res.meta?.total || result.length);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [category, sortBy, selectedSizes, selectedColors]);

  const toggleSize = (s: string) => setSelectedSizes((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  const toggleColor = (c: string) => setSelectedColors((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);

  /* ── MOBILE ── */
  if (isMobile) {
    const activeFilters = selectedSizes.length + selectedColors.length;
    return (
      <div style={{ backgroundColor: 'var(--cream)', minHeight: '100vh' }}>
        {/* Hero banner */}
        <div style={{ height: 160, backgroundColor: 'var(--black)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <h1 style={{ fontSize: 32, fontWeight: 300, letterSpacing: '0.12em', color: 'var(--cream)', textTransform: 'uppercase', textAlign: 'center', lineHeight: 1 }}>{label}</h1>
          {!loading && <p style={{ fontSize: 11, color: 'rgba(245,240,232,0.55)', marginTop: 6, letterSpacing: '0.06em' }}>{total} products</p>}
        </div>

        {/* Sticky filter bar */}
        <div style={{ position: 'sticky', top: 52, zIndex: 30, backgroundColor: 'var(--cream)', borderBottom: '1px solid var(--border)', height: 44, display: 'flex', alignItems: 'center', overflowX: 'auto', gap: 8, paddingLeft: 12, paddingRight: 12, scrollbarWidth: 'none' }}>
          {/* Filter pill */}
          <button onClick={() => setShowMobileFilter(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0 14px', height: 32, minHeight: 'unset', border: `1px solid ${activeFilters > 0 ? 'var(--black)' : 'var(--border)'}`, background: activeFilters > 0 ? 'var(--black)' : 'transparent', color: activeFilters > 0 ? 'var(--cream)' : 'var(--black)', fontSize: 11, letterSpacing: '0.06em', cursor: 'pointer', flexShrink: 0, fontFamily: 'DM Sans, sans-serif', borderRadius: 16 }}>
            <SlidersHorizontal size={11} /> FILTER{activeFilters > 0 && ` (${activeFilters})`}
          </button>
          {/* Sort pills */}
          {['newest', 'price-asc', 'price-desc'].map((opt) => (
            <button key={opt} onClick={() => setSortBy(sortBy === opt ? '' : opt)}
              style={{ padding: '0 14px', height: 32, minHeight: 'unset', border: `1px solid ${sortBy === opt ? 'var(--black)' : 'var(--border)'}`, background: sortBy === opt ? 'var(--black)' : 'transparent', color: sortBy === opt ? 'var(--cream)' : 'var(--black)', fontSize: 11, letterSpacing: '0.06em', cursor: 'pointer', flexShrink: 0, fontFamily: 'DM Sans, sans-serif', borderRadius: 16 }}>
              {opt === 'newest' ? 'NEWEST' : opt === 'price-asc' ? 'LOW–HIGH' : 'HIGH–LOW'}
            </button>
          ))}
          {/* Quick size pills */}
          {['XS', 'S', 'M', 'L', 'XL'].map((s) => (
            <button key={s} onClick={() => toggleSize(s)}
              style={{ padding: '0 12px', height: 32, minHeight: 'unset', border: `1px solid ${selectedSizes.includes(s) ? 'var(--black)' : 'var(--border)'}`, background: selectedSizes.includes(s) ? 'var(--black)' : 'transparent', color: selectedSizes.includes(s) ? 'var(--cream)' : 'var(--black)', fontSize: 11, cursor: 'pointer', flexShrink: 0, fontFamily: 'DM Sans, sans-serif', borderRadius: 16 }}>
              {s}
            </button>
          ))}
          <div style={{ width: 4, flexShrink: 0 }} />
        </div>

        {/* Filter bottom sheet */}
        <AnimatePresence>
          {showMobileFilter && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setShowMobileFilter(false)}
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 60 }}
              />
              <motion.div
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                style={{
                  position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 61,
                  backgroundColor: '#fff', borderRadius: '16px 16px 0 0',
                  maxHeight: '75vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
                }}
              >
                {/* Handle */}
                <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
                  <div style={{ width: 40, height: 4, backgroundColor: '#DDD', borderRadius: 2 }} />
                </div>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 13, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Filters</span>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    {activeFilters > 0 && (
                      <button onClick={() => { setSelectedSizes([]); setSelectedColors([]); }}
                        style={{ background: 'none', border: 'none', fontSize: 12, color: 'var(--dust)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', minHeight: 'unset' }}>
                        Clear All
                      </button>
                    )}
                    <button onClick={() => setShowMobileFilter(false)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', minHeight: 'unset' }}>
                      <X size={18} />
                    </button>
                  </div>
                </div>
                {/* Filter content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                  <p style={{ fontSize: 10, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--dust)', marginBottom: 10, fontWeight: 500 }}>SIZE</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                    {allSizes.map((s) => (
                      <button key={s} onClick={() => toggleSize(s)}
                        style={{ padding: '8px 14px', height: 38, minHeight: 'unset', fontSize: 12, border: `1px solid ${selectedSizes.includes(s) ? 'var(--black)' : 'var(--border)'}`, background: selectedSizes.includes(s) ? 'var(--black)' : 'transparent', color: selectedSizes.includes(s) ? 'var(--cream)' : 'var(--black)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', borderRadius: 4 }}>
                        {s}
                      </button>
                    ))}
                  </div>
                  <p style={{ fontSize: 10, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--dust)', marginBottom: 10, fontWeight: 500 }}>COLOR</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingBottom: 8 }}>
                    {allColors.map((c) => (
                      <button key={c} onClick={() => toggleColor(c)}
                        style={{ padding: '8px 14px', height: 38, minHeight: 'unset', fontSize: 12, border: `1px solid ${selectedColors.includes(c) ? 'var(--black)' : 'var(--border)'}`, background: selectedColors.includes(c) ? 'var(--black)' : 'transparent', color: selectedColors.includes(c) ? 'var(--cream)' : 'var(--black)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', borderRadius: 4 }}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Apply button */}
                <div style={{ padding: '12px 16px', paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))', borderTop: '1px solid var(--border)' }}>
                  <button onClick={() => setShowMobileFilter(false)}
                    style={{ width: '100%', height: 52, minHeight: 'unset', background: 'var(--black)', color: 'var(--cream)', border: 'none', fontSize: 12, letterSpacing: '0.10em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>
                    APPLY FILTERS{activeFilters > 0 && ` (${activeFilters})`}
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Product grid */}
        <div style={{ padding: '12px 12px 24px' }}>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} variant="mobile" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <p style={{ fontSize: 14, color: 'var(--dust)' }}>No products found.</p>
              {activeFilters > 0 && (
                <button onClick={() => { setSelectedSizes([]); setSelectedColors([]); }} style={{ marginTop: 16, background: 'none', border: '1px solid var(--border)', padding: '10px 20px', fontSize: 12, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', minHeight: 'unset' }}>
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <p style={{ fontSize: 11, color: 'var(--dust)', marginBottom: 12, letterSpacing: '0.04em' }}>Showing {filtered.length} of {total} products</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {filtered.map((p, i) => (
                  <motion.div key={p.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.3) }}>
                    <ProductCard product={p} variant="mobile" />
                  </motion.div>
                ))}
              </div>
              {filtered.length < total && (
                <button style={{ width: '100%', height: 48, minHeight: 'unset', background: 'transparent', color: 'var(--black)', border: '1px solid var(--border)', fontSize: 12, letterSpacing: '0.10em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', marginTop: 24 }}>
                  LOAD MORE
                </button>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  /* ── DESKTOP ── */
  return (
    <PageTransition>
    <div style={{ backgroundColor: 'var(--cream)', minHeight: '100vh' }}>
      {/* Hero Banner */}
      <div style={{ height: 260, backgroundColor: 'var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(48px, 8vw, 96px)', fontWeight: 300, letterSpacing: '0.12em', color: 'var(--cream)', textTransform: 'uppercase' }}>{label}</h1>
          <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.5)', marginTop: 8 }}>Pure Cotton. Nothing Else.</p>
        </motion.div>
      </div>

      {/* Filter bar */}
      <div style={{ position: 'sticky', top: 64, zIndex: 40, backgroundColor: 'var(--cream)', borderBottom: '1px solid var(--border)', padding: '0 40px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 52 }}>
          <p style={{ fontSize: 12, color: 'var(--dust)' }}>{filtered.length} products</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Sort */}
            <div style={{ position: 'relative' }}>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                style={{ appearance: 'none', background: 'none', border: '1px solid var(--border)', padding: '6px 28px 6px 12px', fontSize: 12, letterSpacing: '0.06em', color: 'var(--black)', cursor: 'pointer', outline: 'none', fontFamily: 'DM Sans, sans-serif' }}>
                <option value="">Sort by</option>
                <option value="new">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
              <ChevronDown size={12} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
            {/* Size */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => { setShowSizeFilter(!showSizeFilter); setShowColorFilter(false); }}
                style={{ background: 'none', border: '1px solid var(--border)', padding: '6px 14px', fontSize: 12, letterSpacing: '0.06em', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'DM Sans, sans-serif' }}>
                Size{selectedSizes.length > 0 && ` (${selectedSizes.length})`} <ChevronDown size={11} />
              </button>
              {showSizeFilter && (
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 4, background: 'var(--cream)', border: '1px solid var(--border)', padding: 14, display: 'flex', flexWrap: 'wrap', gap: 6, width: 240, zIndex: 50 }}>
                  {allSizes.map((s) => (
                    <button key={s} onClick={() => toggleSize(s)}
                      style={{ padding: '4px 10px', fontSize: 11, border: '1px solid var(--border)', background: selectedSizes.includes(s) ? 'var(--black)' : 'transparent', color: selectedSizes.includes(s) ? 'var(--cream)' : 'var(--black)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Color */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => { setShowColorFilter(!showColorFilter); setShowSizeFilter(false); }}
                style={{ background: 'none', border: '1px solid var(--border)', padding: '6px 14px', fontSize: 12, letterSpacing: '0.06em', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'DM Sans, sans-serif' }}>
                Color{selectedColors.length > 0 && ` (${selectedColors.length})`} <ChevronDown size={11} />
              </button>
              {showColorFilter && (
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 4, background: 'var(--cream)', border: '1px solid var(--border)', padding: 14, display: 'flex', flexWrap: 'wrap', gap: 6, width: 260, zIndex: 50 }}>
                  {allColors.map((c) => (
                    <button key={c} onClick={() => toggleColor(c)}
                      style={{ padding: '4px 10px', fontSize: 11, border: '1px solid var(--border)', background: selectedColors.includes(c) ? 'var(--black)' : 'transparent', color: selectedColors.includes(c) ? 'var(--cream)' : 'var(--black)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 40px' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} variant="desktop" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}><p style={{ fontSize: 14, color: 'var(--dust)' }}>No products found.</p></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {filtered.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.4) }}>
                <ProductCard product={p} variant="desktop" />
              </motion.div>
            ))}
          </div>
        )}
        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 64 }}>
          {['←', '1', '2', '3', '→'].map((p, i) => (
            <button key={i} style={{ width: 36, height: 36, background: p === '1' ? 'var(--black)' : 'transparent', color: p === '1' ? 'var(--cream)' : 'var(--black)', border: '1px solid var(--border)', fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
    </PageTransition>
  );
}
