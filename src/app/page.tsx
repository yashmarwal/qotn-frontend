'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Leaf, Droplets, MapPin, ChevronDown } from 'lucide-react';

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
  'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800',
  'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=800',
];
import Marquee from '@/components/shared/Marquee';
import ProductCard from '@/components/shared/ProductCard';
import ProductCardSkeleton from '@/components/shared/ProductCardSkeleton';
import PageTransition from '@/components/shared/PageTransition';
import WhyQotn from '@/components/shared/WhyQotn';
import StatsBanner from '@/components/shared/StatsBanner';
import TrustStrip from '@/components/shared/TrustStrip';
import TrustBadges from '@/components/shared/TrustBadges';
import PromoBanner from '@/components/shared/PromoBanner';
import ShopTheLook from '@/components/ShopTheLook';
import FounderVideo from '@/components/shared/FounderVideo';
import { categories } from '@/lib/dummy-data';
import { useIsMobile } from '@/hooks/useIsMobile';
import { productsService } from '@/lib/services/products.service';
import { categoriesService } from '@/lib/services/categories.service';
import { adaptApiProductList } from '@/lib/adapters';
import { Product } from '@/types';

const fadeUp = { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 } };
const stagger = { animate: { transition: { staggerChildren: 0.15 } } };

export default function HomePage() {
  const isMobile = useIsMobile();
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestsellers, setBestsellers] = useState<Product[]>([]);
  const [apiCategories, setApiCategories] = useState<any[]>([]);
  const [trending, setTrending] = useState<Product[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'men' | 'women' | 'kids'>('women');
  const [tabProducts, setTabProducts] = useState<Product[]>([]);
  const [tabLoading, setTabLoading] = useState(false);

  // Hero slideshow state — always declared, only used by mobile branch
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const heroTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    Promise.all([
      productsService.getNewArrivals(),
      productsService.getBestsellers(),
      categoriesService.getAll(),
    ]).then(([naRes, bsRes, catRes]: any[]) => {
      setNewArrivals(adaptApiProductList(naRes.data || []));
      setBestsellers(adaptApiProductList(bsRes.data || []));
      setApiCategories(catRes.data || []);
    }).catch(console.error);

    fetch('/api/collections', { credentials: 'include' })
      .then(r => r.json())
      .then(d => setCollections(Array.isArray(d.data) ? d.data : []))
      .catch(() => {});

    fetch('/api/recommendations/trending', { credentials: 'include' })
      .then(r => r.json())
      .then(d => setTrending(adaptApiProductList(d.data || [])))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setTabLoading(true);
    productsService.getAll({ category: activeTab, limit: 8, sortBy: 'newest' })
      .then((res: any) => setTabProducts(adaptApiProductList(res.data || [])))
      .catch(() => setTabProducts([]))
      .finally(() => setTabLoading(false));
  }, [activeTab]);

  // Fetch hero banner images (runs unconditionally)
  useEffect(() => {
    fetch('/api/banners?position=HERO', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        const imgs = (d?.data ?? [])
          .filter((b: any) => b.isActive)
          .map((b: any) => b.mobileImage || b.image)
          .filter(Boolean);
        setHeroImages(imgs.length > 0 ? imgs : FALLBACK_IMAGES);
      })
      .catch(() => setHeroImages(FALLBACK_IMAGES));
  }, []);

  // Auto-advance slideshow + Page Visibility pause (runs unconditionally)
  useEffect(() => {
    if (heroImages.length <= 1) return;
    heroTimer.current = setInterval(() => setHeroIndex(i => (i + 1) % heroImages.length), 3000);
    const onVisibility = () => {
      if (document.hidden && heroTimer.current) {
        clearInterval(heroTimer.current);
        heroTimer.current = null;
      } else if (!document.hidden && !heroTimer.current) {
        heroTimer.current = setInterval(() => setHeroIndex(i => (i + 1) % heroImages.length), 3000);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      if (heroTimer.current) clearInterval(heroTimer.current);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [heroImages.length]);

  const handleHeroTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (heroImages.length <= 1) return;
    const x = e.nativeEvent.offsetX;
    const w = (e.currentTarget as HTMLDivElement).offsetWidth;
    if (x < w / 3) setHeroIndex(i => (i - 1 + heroImages.length) % heroImages.length);
    else if (x > (2 * w) / 3) setHeroIndex(i => (i + 1) % heroImages.length);
  };

  const displayCategories = apiCategories.length > 0 ? apiCategories : categories;

  /* ── MOBILE ── */
  if (isMobile) {
    return (
      <PageTransition>
      <div style={{ backgroundColor: 'var(--cream)' }}>

        {/* Hero — 60% slideshow / 40% content */}
        <section style={{ height: '100svh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div onClick={handleHeroTap} style={{ flex: '0 0 60%', position: 'relative', backgroundColor: 'var(--raw-cotton)', overflow: 'hidden', cursor: 'pointer' }}>
            <AnimatePresence mode="wait">
              {heroImages.length > 0 && (
                <motion.div
                  key={heroIndex}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1, transition: { duration: 1.2, ease: 'easeOut' } }}
                  exit={{ opacity: 0, transition: { duration: 0.8, ease: 'easeIn' } }}
                  style={{ position: 'absolute', inset: 0 }}
                >
                  <Image src={heroImages[heroIndex]} alt="QOTN Collection" fill style={{ objectFit: 'cover' }} sizes="100vw" priority={heroIndex === 0} />
                </motion.div>
              )}
            </AnimatePresence>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(to top, var(--cream), transparent)', zIndex: 2 }} />
            {/* Dot indicators */}
            {heroImages.length > 1 && (
              <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6, zIndex: 3 }}>
                {heroImages.map((_, i) => (
                  <div key={i} onClick={e => { e.stopPropagation(); setHeroIndex(i); }}
                    style={{ width: i === heroIndex ? 8 : 6, height: i === heroIndex ? 8 : 6, borderRadius: '50%', background: i === heroIndex ? 'var(--black)' : 'transparent', border: `1px solid var(--black)`, transition: 'all 0.2s', cursor: 'pointer' }} />
                ))}
              </div>
            )}
          </div>
          <div style={{ flex: '0 0 40%', backgroundColor: 'var(--cream)', padding: '20px 16px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }} style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--dust)', marginBottom: 6 }}>NEW COLLECTION</motion.p>
            <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.4 }} className="brand-wordmark" style={{ fontSize: 52, lineHeight: 1, color: 'var(--black)', marginBottom: 6 }}>QOTN</motion.h1>
            <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.52 }} style={{ fontSize: 12, color: 'var(--dust)', marginBottom: 18 }}>Pure Cotton. Nothing Else.</motion.p>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.64 }} style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <Link href="/men" style={{ flex: 1, minHeight: 'unset' }}>
                <button style={{ width: '100%', height: 48, minHeight: 'unset', background: 'var(--black)', color: 'var(--cream)', border: 'none', fontSize: 11, letterSpacing: '0.10em', textTransform: 'uppercase', fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>SHOP MEN</button>
              </Link>
              <Link href="/women" style={{ flex: 1, minHeight: 'unset' }}>
                <button style={{ width: '100%', height: 48, minHeight: 'unset', background: 'var(--cream)', color: 'var(--black)', border: '1px solid var(--black)', fontSize: 11, letterSpacing: '0.10em', textTransform: 'uppercase', fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>SHOP WOMEN</button>
              </Link>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35, delay: 0.78 }}>
              <Link href="/kids" style={{ textAlign: 'center', fontSize: 12, color: 'var(--dust)', display: 'block', letterSpacing: '0.06em', minHeight: 'unset' }}>
                SHOP KIDS →
              </Link>
            </motion.div>
          </div>
        </section>

        <Marquee />

        <StatsBanner />

        {/* Shop by Category — pill tabs + product grid */}
        <section style={{ padding: '20px 12px 8px' }}>
          <p style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dust)', textAlign: 'center', marginBottom: 16 }}>SHOP BY CATEGORY</p>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <div style={{ display: 'inline-flex', gap: 4, padding: 6, background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 999, boxShadow: '0 1px 1px rgba(0,0,0,0.04), 0 20px 40px -24px rgba(0,0,0,0.1)' }}>
              {(['men', 'women', 'kids'] as const).map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  style={{ height: 40, padding: '0 20px', borderRadius: 999, border: 'none', fontSize: 12, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', minHeight: 'unset', transition: 'background-color 220ms ease, color 220ms ease', background: activeTab === tab ? 'var(--black)' : 'transparent', color: activeTab === tab ? 'var(--cream)' : 'var(--dust)', boxShadow: activeTab === tab ? '0 8px 18px -10px rgba(0,0,0,0.4)' : 'none' }}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, alignItems: 'start' }}>
              {(tabLoading || tabProducts.length === 0 ? Array.from({ length: 6 }) : tabProducts.slice(0, 6)).map((p, i) => (
                p ? <ProductCard key={(p as any).id} product={p as any} variant="mobile" /> : <ProductCardSkeleton key={i} variant="mobile" />
              ))}
            </motion.div>
          </AnimatePresence>
          <Link href={`/${activeTab}`} style={{ display: 'block', marginTop: 10, minHeight: 'unset' }}>
            <button style={{ width: '100%', height: 48, minHeight: 'unset', background: 'transparent', color: 'var(--black)', border: '1px solid var(--black)', fontSize: 11, letterSpacing: '0.10em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              VIEW ALL {activeTab.toUpperCase()} →
            </button>
          </Link>
        </section>

        <ShopTheLook />

        {collections.length > 0 && (
          <section style={{ padding: '20px 12px 8px' }}>
            <p style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dust)', textAlign: 'center', marginBottom: 12 }}>COLLECTIONS</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {collections.map((col: any, i: number) => (
                <motion.div key={col.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.32, delay: i * 0.08 }}>
                <Link href={`/collections/${col.slug}`} style={{ textDecoration: 'none', color: 'inherit', minHeight: 'unset', display: 'block' }}>
                  <div style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', backgroundColor: 'var(--raw-cotton)', borderRadius: 4 }}>
                    {col.thumbnail ? (
                      <Image src={col.thumbnail} alt={col.name} fill style={{ objectFit: 'cover' }} sizes="50vw" loading="lazy" />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--raw-cotton)' }}>
                        <span style={{ fontSize: 24, fontWeight: 300, letterSpacing: '0.08em', color: 'var(--dust)' }}>
                          {col.name.split(' ').slice(0, 2).map((w: string) => w[0].toUpperCase()).join('')}
                        </span>
                      </div>
                    )}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)' }} />
                    <div style={{ position: 'absolute', bottom: 10, left: 10 }}>
                      <p style={{ color: '#F5F0E8', fontSize: 13, letterSpacing: '0.08em', fontWeight: 400, textTransform: 'uppercase', lineHeight: 1, marginBottom: 3 }}>{col.name}</p>
                      {col._count?.products !== undefined && <p style={{ color: 'rgba(245,240,232,0.7)', fontSize: 10 }}>{col._count.products} products</p>}
                    </div>
                  </div>
                </Link>
                </motion.div>
              ))}
            </div>
            <motion.div whileHover="hover" whileTap={{ scale: 0.97 }} style={{ marginTop: 10 }}>
              <Link href="/collections" style={{ display: 'block', textDecoration: 'none', minHeight: 'unset' }}>
                <motion.button style={{ width: '100%', height: 48, minHeight: 'unset', background: 'transparent', color: 'var(--black)', border: '1px solid var(--black)', fontSize: 11, letterSpacing: '0.10em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  variants={{ hover: { backgroundColor: 'var(--black)', color: 'var(--cream)' } }} transition={{ duration: 0.25 }}>
                  VIEW ALL COLLECTIONS
                  <motion.span variants={{ hover: { x: 4 } }} transition={{ duration: 0.2 }}><ArrowRight size={11} /></motion.span>
                </motion.button>
              </Link>
            </motion.div>
          </section>
        )}

        {/* New Arrivals */}
        <section id="new-arrivals" style={{ padding: '0 12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--black)', fontWeight: 500 }}>NEW ARRIVALS</p>
            <Link href="/men" style={{ fontSize: 10, color: 'var(--dust)', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 3, minHeight: 'unset' }}>VIEW ALL <ArrowRight size={10} /></Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, alignItems: 'start' }}>
            {(newArrivals.length === 0 ? Array.from({ length: 4 }) : newArrivals.slice(0, 4)).map((p, i) => (
              p ? (
                <motion.div key={(p as any).id} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: i * 0.06 }}>
                  <ProductCard product={p as any} variant="mobile" />
                </motion.div>
              ) : <ProductCardSkeleton key={i} variant="mobile" />
            ))}
          </div>
          <Link href="/men" style={{ display: 'block', marginTop: 10, minHeight: 'unset' }}>
            <button style={{ width: '100%', height: 44, minHeight: 'unset', background: 'transparent', color: 'var(--black)', border: '1px solid var(--border)', fontSize: 11, letterSpacing: '0.10em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>VIEW ALL NEW ARRIVALS</button>
          </Link>
        </section>

        {/* Brand Promise */}
        <section style={{ backgroundColor: 'var(--black)', padding: '48px 24px' }}>
          {['We only make one thing.', 'We make it purely.', 'Welcome to Qotn.'].map((line, i) => (
            <motion.p key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, delay: i * 0.12 }}
              style={{ fontSize: 'clamp(22px, 6vw, 28px)', fontWeight: 300, color: 'var(--cream)', lineHeight: 1.4, marginBottom: 4, textAlign: 'left' }}>
              {line}
            </motion.p>
          ))}
        </section>

        {/* Cotton Promise */}
        <section style={{ padding: '24px 16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, textAlign: 'center' }}>
            {[
              { icon: Leaf, num: '100%', label: 'Cotton' },
              { icon: Droplets, num: '0', label: 'Blends' },
              { icon: MapPin, num: 'India', label: 'Made' },
            ].map(({ icon: Icon, num, label }, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: i * 0.1 }}
                style={{ padding: '12px 4px' }}>
                <Icon size={24} strokeWidth={1.5} color="var(--dust)" style={{ margin: '0 auto 6px' }} />
                <p style={{ fontSize: 18, fontWeight: 300, marginBottom: 2 }}>{num}</p>
                <p style={{ fontSize: 9, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--dust)' }}>{label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Why Qotn — vertical stack */}
        <section style={{ padding: '0 16px', borderTop: '1px solid var(--border)' }}>
          {[
            { icon: '🛡', title: 'Purity Guaranteed', desc: 'Every fabric is tested. 100% cotton, zero blends. We certify every batch.' },
            { icon: '✂', title: 'Custom Stitched', desc: 'Your measurements. Perfect fit, every time. Just ₹249 extra.' },
            { icon: '🚚', title: 'Free Delivery', desc: 'Free delivery on orders above ₹1499. COD available with small surcharge.' },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -14 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.32, delay: i * 0.08 }}
              style={{ display: 'flex', gap: 14, paddingTop: 16, paddingBottom: 16, borderBottom: '1px solid var(--border)', alignItems: 'flex-start' }}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>{item.icon}</span>
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{item.title}</p>
                <p style={{ fontSize: 12, color: 'var(--dust)', lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </section>

        {/* Bestsellers */}
        <section id="bestsellers" style={{ padding: '0 12px', backgroundColor: 'var(--raw-cotton)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, marginBottom: 12 }}>
            <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--black)', fontWeight: 500 }}>BESTSELLERS</p>
            <Link href="/women" style={{ fontSize: 10, color: 'var(--dust)', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 3, minHeight: 'unset' }}>VIEW ALL <ArrowRight size={10} /></Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, paddingBottom: 16, alignItems: 'start' }}>
            {(bestsellers.length === 0 ? Array.from({ length: 4 }) : bestsellers.slice(0, 4)).map((p, i) => (
              p ? (
                <motion.div key={(p as any).id} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: i * 0.06 }}>
                  <ProductCard product={p as any} variant="mobile" />
                </motion.div>
              ) : <ProductCardSkeleton key={i} variant="mobile" />
            ))}
          </div>
        </section>

        {/* Trust badges — horizontal scroll */}
        <section style={{ padding: '16px', overflowX: 'auto', scrollbarWidth: 'none' }}>
          <div style={{ display: 'flex', gap: 8, width: 'max-content' }}>
            {[
              { icon: '🔒', label: 'Secure Payments' },
              { icon: '↩', label: 'Easy Returns' },
              { icon: '🌿', label: '100% Cotton' },
              { icon: '🇮🇳', label: 'Made in India' },
              { icon: '✂', label: 'Custom Stitching' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 20, backgroundColor: 'var(--cream)', whiteSpace: 'nowrap' }}>
                <span style={{ fontSize: 14 }}>{item.icon}</span>
                <span style={{ fontSize: 10, color: 'var(--dust)', letterSpacing: '0.04em' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </section>

      </div>
      <FounderVideo />
      </PageTransition>
    );
  }

  /* ── DESKTOP ── */
  return (
    <PageTransition>
    <div style={{ backgroundColor: 'var(--cream)' }}>
      {/* Hero */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '0 24px' }}>
        <motion.div variants={stagger} initial="initial" animate="animate" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
          <motion.h1 variants={fadeUp} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="brand-wordmark"
            style={{ fontSize: 'clamp(80px, 15vw, 180px)', color: 'var(--black)', lineHeight: 1 }}>
            QOTN
          </motion.h1>
          <motion.p variants={fadeUp} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{ fontSize: 13, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--dust)' }}>
            Pure Cotton. Nothing Else.
          </motion.p>
          <motion.div variants={fadeUp} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
            <Link href="/men">
              <button style={{ padding: '14px 40px', background: 'var(--black)', color: 'var(--cream)', border: 'none', fontSize: 12, letterSpacing: '0.10em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 500, fontFamily: 'DM Sans, sans-serif' }}>
                Shop Now
              </button>
            </Link>
          </motion.div>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} style={{ position: 'absolute', bottom: 40 }}>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}>
            <ChevronDown size={18} strokeWidth={1.5} color="var(--dust)" />
          </motion.div>
        </motion.div>
      </section>

      <PromoBanner isMobile={false} />

      <Marquee />

      <StatsBanner />

      {/* Shop by Category — pill tabs + product grid */}
      <section style={{ padding: '100px 40px', backgroundColor: 'var(--cream)' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ textAlign: 'center', marginBottom: 40 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--dust)' }}>Shop by Category</p>
        </motion.div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 56 }}>
          <div style={{ display: 'inline-flex', gap: 4, padding: 6, background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 999, boxShadow: '0 1px 1px rgba(0,0,0,0.04), 0 20px 40px -24px rgba(0,0,0,0.1)' }}>
            {(['men', 'women', 'kids'] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{ height: 40, padding: '0 24px', borderRadius: 999, border: 'none', fontSize: 12, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'background-color 220ms ease, color 220ms ease', background: activeTab === tab ? 'var(--black)' : 'transparent', color: activeTab === tab ? 'var(--cream)' : 'var(--dust)', boxShadow: activeTab === tab ? '0 8px 18px -10px rgba(0,0,0,0.4)' : 'none' }}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, maxWidth: 1000, margin: '0 auto' }}>
            {(tabLoading || tabProducts.length === 0 ? Array.from({ length: 8 }) : tabProducts.slice(0, 8)).map((p, i) => (
              p ? (
                <motion.div key={(p as any).id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <ProductCard product={p as any} variant="desktop" />
                </motion.div>
              ) : <ProductCardSkeleton key={i} variant="desktop" />
            ))}
          </motion.div>
        </AnimatePresence>
        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <Link href={`/${activeTab}`} style={{ display: 'inline-block', textDecoration: 'none' }}>
            <motion.button whileHover={{ backgroundColor: 'var(--black)', color: 'var(--cream)' }} transition={{ duration: 0.2 }}
              style={{ height: 48, padding: '0 40px', background: 'transparent', color: 'var(--black)', border: '1px solid var(--black)', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              VIEW ALL {activeTab.toUpperCase()} <ArrowRight size={12} strokeWidth={2} />
            </motion.button>
          </Link>
        </div>
      </section>

      <ShopTheLook />

      {collections.length > 0 && (
        <section style={{ padding: '80px 40px', backgroundColor: 'var(--cream)' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--dust)' }}>Collections</p>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, maxWidth: 1200, margin: '0 auto' }}>
            {collections.map((col: any, i: number) => (
              <motion.div key={col.id} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: Math.min(i * 0.08, 0.4) }}>
                <Link href={`/collections/${col.slug}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
                  onMouseEnter={e => { const img = (e.currentTarget as HTMLElement).querySelector('img') as HTMLImageElement | null; if (img) img.style.transform = 'scale(1.03)'; }}
                  onMouseLeave={e => { const img = (e.currentTarget as HTMLElement).querySelector('img') as HTMLImageElement | null; if (img) img.style.transform = 'scale(1)'; }}>
                  <div style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden', backgroundColor: 'var(--raw-cotton)' }}>
                    {col.thumbnail ? (
                      <Image src={col.thumbnail} alt={col.name} fill style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }} sizes="33vw" />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 48, fontWeight: 300, letterSpacing: '0.10em', color: 'var(--dust)' }}>
                          {col.name.split(' ').slice(0, 2).map((w: string) => w[0].toUpperCase()).join('')}
                        </span>
                      </div>
                    )}
                  </div>
                  <div style={{ paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div>
                      <p style={{ fontSize: 18, fontWeight: 400, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{col.name}</p>
                      {col._count?.products !== undefined && <p style={{ fontSize: 12, color: 'var(--dust)', marginTop: 4 }}>{col._count.products} products</p>}
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--dust)', display: 'flex', alignItems: 'center', gap: 4 }}>Explore <ArrowRight size={12} /></span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} style={{ textAlign: 'center', marginTop: 48 }}>
            <Link href="/collections" style={{ display: 'inline-block', textDecoration: 'none' }}>
              <motion.button whileHover="hover"
                style={{ height: 52, padding: '0 40px', background: 'transparent', color: 'var(--black)', border: '1px solid var(--black)', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                VIEW ALL COLLECTIONS
                <motion.span variants={{ hover: { x: 4 } }} transition={{ duration: 0.2 }} style={{ display: 'flex', alignItems: 'center' }}>
                  <ArrowRight size={12} strokeWidth={2} />
                </motion.span>
              </motion.button>
            </Link>
          </motion.div>
        </section>
      )}

      <TrustBadges />

      {/* New Arrivals */}
      <section id="new-arrivals" style={{ padding: '80px 40px', backgroundColor: 'var(--cream)' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--dust)' }}>New Arrivals</p>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, maxWidth: 1000, margin: '0 auto 48px' }}>
          {newArrivals.length === 0
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} variant="desktop" />)
            : newArrivals.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: Math.min(i * 0.08, 0.4) }}>
                  <ProductCard product={p} variant="desktop" />
                </motion.div>
              ))
          }
        </div>
        <div style={{ textAlign: 'center' }}>
          <Link href="/men" style={{ fontSize: 12, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--black)', display: 'inline-flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--black)', paddingBottom: 2 }}>
            View All <ArrowRight size={12} strokeWidth={2} />
          </Link>
        </div>
      </section>

      <WhyQotn />

      {/* Brand Promise */}
      <section style={{ backgroundColor: 'var(--black)', padding: '120px 40px', textAlign: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {['We only make one thing.', 'We make it purely.', 'Welcome to Qotn.'].map((line, i) => (
            <motion.p key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.15 }}
              style={{ fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 300, color: 'var(--cream)', lineHeight: 1.3 }}>
              {line}
            </motion.p>
          ))}
        </div>
      </section>

      {/* Cotton Promise */}
      <section style={{ padding: '100px 40px', backgroundColor: 'var(--cream)' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} style={{ textAlign: 'center', marginBottom: 64 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--dust)' }}>The Cotton Promise</p>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 48, maxWidth: 900, margin: '0 auto' }}>
          {[
            { icon: Leaf, number: '100%', label: 'Pure Cotton', desc: 'Every thread, every weave — pure cotton. Nothing synthetic, ever.' },
            { icon: Droplets, number: '0', label: 'Blends. Ever.', desc: 'No polyester. No nylon. No blends. Cotton is enough.' },
            { icon: MapPin, number: 'Made', label: 'In India', desc: 'Woven, cut, and stitched in India by skilled craftspeople.' },
          ].map(({ icon: Icon, number, label, desc }, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <Icon size={24} strokeWidth={1.5} color="var(--dust)" />
              <div>
                <p style={{ fontSize: 36, fontWeight: 300, lineHeight: 1 }}>{number}</p>
                <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dust)', marginTop: 4 }}>{label}</p>
              </div>
              <p style={{ fontSize: 13, color: 'var(--dust)', lineHeight: 1.7, maxWidth: 220 }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Bestsellers */}
      <section id="bestsellers" style={{ padding: '80px 40px', backgroundColor: 'var(--raw-cotton)' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--dust)' }}>Bestsellers</p>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, maxWidth: 1000, margin: '0 auto 48px' }}>
          {bestsellers.length === 0
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} variant="desktop" />)
            : bestsellers.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: Math.min(i * 0.08, 0.4) }}>
                  <ProductCard product={p} variant="desktop" />
                </motion.div>
              ))
          }
        </div>
        <div style={{ textAlign: 'center' }}>
          <Link href="/women" style={{ fontSize: 12, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--black)', display: 'inline-flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--black)', paddingBottom: 2 }}>
            View All <ArrowRight size={12} strokeWidth={2} />
          </Link>
        </div>
      </section>

      {/* Trending Now */}
      {trending.length > 0 && (
        <section id="trending" style={{ padding: '80px 40px', backgroundColor: 'var(--cream)' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--dust)' }}>🔥 Trending Now</p>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, maxWidth: 1000, margin: '0 auto 48px' }}>
            {trending.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}>
                <ProductCard product={p} variant="desktop" />
              </motion.div>
            ))}
          </div>
          <div style={{ textAlign: 'center' }}>
            <Link href="/men" style={{ fontSize: 12, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--black)', display: 'inline-flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--black)', paddingBottom: 2 }}>
              View All <ArrowRight size={12} strokeWidth={2} />
            </Link>
          </div>
        </section>
      )}

      <TrustStrip />
    </div>
    <FounderVideo />
    </PageTransition>
  );
}
