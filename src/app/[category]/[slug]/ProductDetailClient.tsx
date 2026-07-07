'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ChevronDown, ChevronUp, Share2 } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import SizeGuide from '@/components/shared/SizeGuide';
import FindMySize from '@/components/shared/FindMySize';
import ProductCard from '@/components/shared/ProductCard';
import MobileBottomBar from '@/components/mobile/BottomBar';
import { useIsMobile } from '@/hooks/useIsMobile';
import { productsService } from '@/lib/services/products.service';
import { adaptApiProductList } from '@/lib/adapters';
import { formatPrice } from '@/lib/utils';
import CustomStitchingButton from '@/components/CustomStitching/CustomStitchingButton';
import FrequentlyBoughtTogether from '@/components/recommendations/FrequentlyBoughtTogether';
import RecentlyViewed from '@/components/recommendations/RecentlyViewed';
import { waitlistService } from '@/lib/services/waitlist.service';

interface Props { product: Product | null }

const colorMap: Record<string, string> = {
  White: '#FFFFFF', Black: '#1A1A1A', Cream: '#F5F0E8', Olive: '#6B7540',
  Blue: '#2B5EA7', 'Blue Stripe': '#2B5EA7', 'Light Blue': '#ADD8E6',
  Ecru: '#C2B280', Beige: '#F5F5DC', Grey: '#9E9E9E', Navy: '#001F5B',
  Terracotta: '#C1440E', Sage: '#8CAB84', Blush: '#FFB5A7', Ivory: '#FFFFF0',
  Mint: '#98FF98', Peach: '#FFCBA4', Yellow: '#FFE14D', Pink: '#FFB6C1',
  Lavender: '#E6E6FA', 'Sky Blue': '#87CEEB', 'Dusty Rose': '#D4A5A5',
  'Polka Dots': '#E8E2D8', Stripes: '#D4CFC6', 'Plain White': '#FFFFFF',
};

function AccordionItem({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid var(--border)' }}>
      <button onClick={() => setOpen(!open)}
        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
        <span style={{ fontSize: 11, letterSpacing: '0.12em', fontWeight: 500, textTransform: 'uppercase' }}>{title}</span>
        {open ? <ChevronUp size={13} strokeWidth={1.5} color="var(--dust)" /> : <ChevronDown size={13} strokeWidth={1.5} color="var(--dust)" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }} style={{ overflow: 'hidden' }}>
            <div style={{ paddingBottom: 16 }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProductDetailClient({ product }: Props) {
  const isMobile = useIsMobile();
  const router = useRouter();
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const [imgZoomed, setImgZoomed] = useState(false);
  const lastTapRef = useRef<number>(0);
  const [related, setRelated] = useState<Product[]>([]);
  const [customStitchingId, setCustomStitchingId] = useState<string | undefined>();
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);
  const [liveVariants, setLiveVariants] = useState<Array<{ id: string; size: string; color: string; stock: number }>>(product?._variants ?? []);
  const [stockError, setStockError] = useState('');
  const [shareCopied, setShareCopied] = useState(false);
  const [findMySizeOpen, setFindMySizeOpen] = useState(false);

  const colorHexMap: Record<string, string> = Object.fromEntries(
    (product?._variants ?? []).filter(v => v.colorHex).map(v => [v.color, v.colorHex as string])
  );
  const getColorHex = (color: string) => colorHexMap[color] || colorMap[color] || '#9E9E9E';

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: product?.name ?? 'QOTN', url });
      } else {
        await navigator.clipboard.writeText(url);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      }
    } catch {}
  };
  const galleryRef = useRef<HTMLDivElement>(null);

  const { addItem, openCart } = useCart();
  const { isInWishlist, toggleItem } = useWishlist();

  useEffect(() => {
    if (!product) return;
    productsService.getAll({ category: product.category, limit: 5 })
      .then((res: any) => {
        const adapted = adaptApiProductList(res.data || []);
        setRelated(adapted.filter((p) => p.id !== product.id).slice(0, 4));
      })
      .catch(console.error);
  }, [product?.id]);

  useEffect(() => {
    if (!product) return;
    const sessionId = localStorage.getItem('qotn_session') || Math.random().toString(36).slice(2);
    localStorage.setItem('qotn_session', sessionId);
    fetch(`${typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:3001/api' : '/api'}/recommendations/track-view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ productId: product.id, sessionId }),
    }).catch(() => {});
  }, [product?.id]);

  // Restore last-used size from sessionStorage; auto-select if available on this product
  useEffect(() => {
    if (!product) return;
    try {
      const lastSize = sessionStorage.getItem('qotn_last_size') || '';
      if (lastSize && product.sizes.includes(lastSize)) setSelectedSize(lastSize);
    } catch {}
  }, [product?.id]);

  // Re-fetch live stock on mount and whenever the tab regains focus
  useEffect(() => {
    if (!product?.slug) return;
    const refresh = async () => {
      try {
        const res: any = await productsService.getStock(product.slug);
        if (Array.isArray(res?.data) && res.data.length > 0) setLiveVariants(res.data);
      } catch {}
    };
    refresh();
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, [product?.slug]);

  if (!product) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
        <p style={{ fontSize: 15, color: 'var(--dust)' }}>Product not found.</p>
        <Link href="/"><button style={{ padding: '12px 32px', background: 'var(--black)', color: 'var(--cream)', border: 'none', fontSize: 12, letterSpacing: '0.10em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 500, fontFamily: 'DM Sans, sans-serif' }}>Back to Home</button></Link>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : null;

  // Returns live stock for a specific size+color combination
  const getVariantStock = (size: string, color: string): number => {
    const v = liveVariants.find(v => v.size === size && v.color === color);
    if (v !== undefined) return v.stock ?? 0;
    const fv = product._variants?.find(v => v.size === size && v.color === color);
    return fv?.stock ?? 0;
  };

  // A size is OOS when the selected color variant is OOS, or the aggregate is 0 if no color selected
  const sizeIsOOS = (size: string): boolean => {
    if (selectedColor) return getVariantStock(size, selectedColor) === 0;
    return liveVariants.filter(v => v.size === size).reduce((s, v) => s + (v.stock ?? 0), 0) === 0;
  };

  // True when the currently selected size (+ color if chosen) is out of stock
  const isCurrentVariantOOS = selectedSize ? sizeIsOOS(selectedSize) : false;

  const persistSize = (size: string) => {
    setSelectedSize(size);
    try { sessionStorage.setItem('qotn_last_size', size); } catch {}
  };

  const handleAddToBag = () => {
    if (!selectedSize) return;
    const color = selectedColor || product.colors[0];
    if (getVariantStock(selectedSize, color) === 0) {
      setStockError('Sorry, this item is out of stock. Try a different size or color.');
      return;
    }
    setStockError('');
    addItem(product, selectedSize, color, 1, customStitchingId);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      if (!isMobile) openCart();
    }, 800);
  };

  const handleBuyNow = () => {
    if (!selectedSize) return;
    const color = selectedColor || product.colors[0];
    if (getVariantStock(selectedSize, color) === 0) {
      setStockError('Sorry, this item is out of stock. Try a different size or color.');
      return;
    }
    setStockError('');
    addItem(product, selectedSize, color, 1, customStitchingId);
    router.push('/checkout');
  };

  const handleImageTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 320) {
      setImgZoomed(z => !z);
    }
    lastTapRef.current = now;
  };

  const scrollToImage = (idx: number) => {
    setActiveImage(idx);
    if (galleryRef.current) {
      galleryRef.current.scrollTo({ left: idx * galleryRef.current.offsetWidth, behavior: 'smooth' });
    }
  };

  const handleGalleryScroll = () => {
    if (galleryRef.current) {
      const idx = Math.round(galleryRef.current.scrollLeft / galleryRef.current.offsetWidth);
      setActiveImage(idx);
    }
  };

  const sizeOutOfStock = (size: string) => sizeIsOOS(size);

  /* ── MOBILE ── */
  if (isMobile) {
    return (
      <>
        <div style={{ backgroundColor: 'var(--cream)', paddingBottom: 88 }}>
          {/* Swipeable image gallery */}
          <div style={{ position: 'relative' }}>
            <div
              ref={galleryRef}
              onScroll={imgZoomed ? undefined : handleGalleryScroll}
              style={{ display: 'flex', overflowX: imgZoomed ? 'hidden' : 'auto', scrollSnapType: imgZoomed ? 'none' : 'x mandatory', scrollBehavior: 'smooth', msOverflowStyle: 'none', scrollbarWidth: 'none' }}
            >
              {product.images.map((img, i) => (
                <div key={i} onClick={handleImageTap} style={{ flexShrink: 0, width: '100%', aspectRatio: '3/4', scrollSnapAlign: 'start', position: 'relative', backgroundColor: 'var(--raw-cotton)', overflow: 'hidden', cursor: 'zoom-in' }}>
                  <Image src={img} alt={`${product.name} ${i + 1}`} fill style={{ objectFit: 'cover', transform: (imgZoomed && i === activeImage) ? 'scale(2.2)' : 'scale(1)', transition: 'transform 0.3s ease', transformOrigin: 'center center' }} sizes="100vw" priority={i === 0} />
                </div>
              ))}
            </div>

            {/* Dot indicators */}
            {product.images.length > 1 && !imgZoomed && (
              <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
                {product.images.map((_, i) => (
                  <button key={i} onClick={() => scrollToImage(i)}
                    style={{ width: i === activeImage ? 20 : 6, height: 6, borderRadius: 3, background: i === activeImage ? 'var(--cream)' : 'rgba(245,240,232,0.5)', border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.2s', minHeight: 'unset' }} />
                ))}
              </div>
            )}
            {imgZoomed && (
              <button onClick={() => setImgZoomed(false)}
                style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.55)', border: 'none', borderRadius: 20, padding: '5px 14px', color: '#F5F0E8', fontSize: 11, letterSpacing: '0.04em', cursor: 'pointer', zIndex: 5 }}>
                Tap to exit zoom
              </button>
            )}
            {!imgZoomed && (
              <div style={{ position: 'absolute', bottom: imgZoomed || product.images.length <= 1 ? 14 : 38, left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none', zIndex: 3 }}>
                <span style={{ fontSize: 9, color: 'rgba(245,240,232,0.5)', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>double tap to zoom</span>
              </div>
            )}
            {/* Image counter pill */}
            {product.images.length > 1 && (
              <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.45)', borderRadius: 12, padding: '3px 9px' }}>
                <span style={{ fontSize: 11, color: '#F5F0E8', letterSpacing: '0.04em' }}>{activeImage + 1}/{product.images.length}</span>
              </div>
            )}

            {(product.isNew || product.isBestseller) && (
              <span style={{ position: 'absolute', top: 14, left: 14, background: 'var(--black)', color: 'var(--cream)', fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '4px 10px' }}>
                {product.isNew ? 'NEW' : 'BESTSELLER'}
              </span>
            )}
          </div>

          {/* Content */}
          <div style={{ padding: '20px 16px 16px' }}>
            {/* Breadcrumb + share */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <Link href="/" style={{ fontSize: 10, color: 'var(--dust)', letterSpacing: '0.06em' }}>Home</Link>
                <span style={{ fontSize: 10, color: 'var(--dust)' }}>/</span>
                <Link href={`/${product.category}`} style={{ fontSize: 10, color: 'var(--dust)', letterSpacing: '0.06em', textTransform: 'capitalize' }}>{product.category}</Link>
              </div>
              <button onClick={handleShare} title="Share" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center', gap: 4, color: 'var(--dust)' }}>
                <Share2 size={14} strokeWidth={1.5} />
                {shareCopied && <span style={{ fontSize: 10, letterSpacing: '0.06em' }}>Copied!</span>}
              </button>
            </div>

            <h1 style={{ fontSize: 20, fontWeight: 500, lineHeight: 1.3, marginBottom: 10 }}>{product.name}</h1>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 22, fontWeight: 600 }}>{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span style={{ fontSize: 14, color: 'var(--dust)', textDecoration: 'line-through' }}>{formatPrice(product.originalPrice)}</span>
              )}
              {discount && <span style={{ fontSize: 11, color: '#2E7D32', fontWeight: 500 }}>{discount}% OFF</span>}
            </div>

            {/* COD badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 10, background: '#F0FFF4', color: '#065F46', border: '1px solid #A7F3D0', padding: '3px 9px', letterSpacing: '0.06em', fontWeight: 600, flexShrink: 0 }}>
                ✓ COD Available
              </span>
              <span style={{ fontSize: 10, color: 'var(--dust)' }}>Free delivery above ₹1499</span>
            </div>

            {/* Size */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 11, letterSpacing: '0.10em', fontWeight: 500, textTransform: 'uppercase' }}>
                  Size{selectedSize && ` — ${selectedSize}`}
                </span>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <button onClick={() => setFindMySizeOpen(true)} style={{ background: 'none', border: 'none', fontSize: 11, color: 'var(--black)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, letterSpacing: '0.04em', padding: 0 }}>
                    Find My Size
                  </button>
                  <span style={{ fontSize: 10, color: 'var(--border)' }}>|</span>
                  <button onClick={() => setSizeGuideOpen(true)} style={{ background: 'none', border: 'none', fontSize: 11, color: 'var(--dust)', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'DM Sans, sans-serif', padding: 0 }}>
                    Size Guide
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
                {product.sizes.map((size) => {
                  const oos = sizeOutOfStock(size);
                  const sel = selectedSize === size;
                  return (
                    <button key={size} onClick={() => !oos && persistSize(size)} disabled={oos}
                      style={{ padding: '9px 16px', fontSize: 12, border: sel ? 'none' : '1px solid var(--border)', background: sel ? 'var(--black)' : 'transparent', color: sel ? 'var(--cream)' : oos ? 'var(--dust)' : 'var(--black)', cursor: oos ? 'default' : 'pointer', textDecoration: oos ? 'line-through' : 'none', opacity: oos ? 0.4 : 1, flexShrink: 0, fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s' }}>
                      {size}
                    </button>
                  );
                })}
              </div>
              {selectedSize && !isCurrentVariantOOS && (() => {
                const cnt = selectedColor
                  ? getVariantStock(selectedSize, selectedColor)
                  : liveVariants.filter(v => v.size === selectedSize).reduce((s, v) => s + (v.stock ?? 0), 0);
                return cnt > 0 && cnt < 5 ? (
                  <p style={{ fontSize: 12, color: '#D97706', margin: '8px 0 0', fontWeight: 500 }}>⚠ Only {cnt} left in {selectedSize}!</p>
                ) : null;
              })()}
              {selectedSize && isCurrentVariantOOS && (
                <div style={{ marginTop: 12, padding: 16, background: '#F9F8F6', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: 12, margin: '0 0 10px', color: 'var(--dust)' }}>This item is out of stock. Get notified when it&apos;s back:</p>
                  {waitlistSubmitted ? (
                    <p style={{ fontSize: 13, color: '#065F46', fontWeight: 500, margin: 0 }}>✓ You&apos;re on the waitlist!</p>
                  ) : (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        type="email"
                        placeholder="your@email.com"
                        value={waitlistEmail}
                        onChange={e => setWaitlistEmail(e.target.value)}
                        style={{ flex: 1, padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
                      />
                      <button
                        onClick={async () => {
                          if (!waitlistEmail) return;
                          const variant = liveVariants.find(v => v.size === selectedSize && (!selectedColor || v.color === selectedColor))
                            ?? liveVariants.find(v => v.size === selectedSize);
                          if (!variant) return;
                          try {
                            await waitlistService.join({ email: waitlistEmail, productId: product.id, variantId: variant.id });
                            setWaitlistSubmitted(true);
                          } catch {}
                        }}
                        style={{ padding: '10px 16px', background: 'var(--ink)', color: 'var(--cream)', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', letterSpacing: '0.06em' }}
                      >
                        Notify Me
                      </button>
                    </div>
                  )}
                </div>
              )}
              {stockError && <p style={{ fontSize: 12, color: '#DC2626', margin: '8px 0 0', fontWeight: 500 }}>⚠ {stockError}</p>}
            </div>

            {/* Colors */}
            <div style={{ marginBottom: 20 }}>
              <span style={{ fontSize: 11, letterSpacing: '0.10em', fontWeight: 500, textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>
                Color{selectedColor && ` — ${selectedColor}`}
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                {product.colors.map((color) => {
                  const hex = getColorHex(color);
                  const sel = selectedColor === color;
                  return (
                    <button key={color} onClick={() => setSelectedColor(color)} title={color}
                      style={{ width: 28, height: 28, minHeight: 'unset', borderRadius: '50%', aspectRatio: '1/1', flexShrink: 0, backgroundColor: hex, border: sel ? '2px solid var(--black)' : (hex === '#FFFFFF' || hex === '#F5F0E8') ? '1px solid var(--border)' : '1px solid transparent', outline: sel ? '2px solid var(--cream)' : 'none', outlineOffset: '-3px', cursor: 'pointer', padding: 0, transition: 'transform 0.15s', transform: sel ? 'scale(1.15)' : 'scale(1)' }} />
                  );
                })}
              </div>
            </div>

            {/* Fabric */}
            <div style={{ marginBottom: 20, padding: '14px 0', borderTop: '1px solid var(--border)' }}>
              <p style={{ fontSize: 12, color: 'var(--dust)' }}>
                <span style={{ fontWeight: 500, textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.10em' }}>Fabric </span>
                — {product.fabric}
              </p>
            </div>

            {/* Wishlist + Share */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              <button onClick={() => toggleItem(product)}
                style={{ padding: '14px', background: 'none', border: '1px solid var(--border)', fontSize: 12, letterSpacing: '0.10em', textTransform: 'uppercase', cursor: 'pointer', color: 'var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'DM Sans, sans-serif' }}>
                <Heart size={14} strokeWidth={1.5} fill={inWishlist ? 'var(--black)' : 'none'} color="var(--black)" />
                {inWishlist ? 'Saved to Wishlist' : 'Add to Wishlist'}
              </button>
              <button onClick={handleShare} title="Share product"
                style={{ padding: '14px 16px', background: 'none', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--black)', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'DM Sans, sans-serif', fontSize: 11, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                <Share2 size={14} strokeWidth={1.5} />
                {shareCopied ? 'Copied!' : 'Share'}
              </button>
            </div>

            {/* Find My Size pill — above custom stitching */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setFindMySizeOpen(true)}
              style={{
                width: '100%', height: 50, marginBottom: 10,
                background: 'transparent',
                border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                position: 'relative', overflow: 'hidden',
              }}
            >
              {/* Shimmer sweep */}
              <motion.div
                animate={{ x: ['-120%', '220%'] }}
                transition={{ duration: 1.1, delay: 2, repeat: Infinity, repeatDelay: 5 }}
                style={{ position: 'absolute', top: 0, left: 0, width: '38%', height: '100%', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.45),transparent)', pointerEvents: 'none' }}
              />
              <span style={{ fontSize: 14 }}>📐</span>
              <span style={{ fontSize: 11, letterSpacing: '0.10em', fontWeight: 600, textTransform: 'uppercase', color: 'var(--black)' }}>Find My Size</span>
              <span style={{ fontSize: 10, color: 'var(--dust)', letterSpacing: '0.04em' }}>— Indian guide</span>
            </motion.button>

            {product.category !== 'kids' && (
              <CustomStitchingButton
                productId={product.id}
                productCategory={product.category}
                selectedSize={selectedSize}
                onStitchingAdded={(id) => {
                  setCustomStitchingId(id);
                  // Use selected size or fall back to first available variant
                  const size = selectedSize || product._variants?.[0]?.size || product.sizes[0] || 'Custom';
                  const color = selectedColor || product.colors[0] || 'Default';
                  addItem(product, size, color, 1, id);
                }}
                savedStitchingId={customStitchingId}
              />
            )}

            {/* Trust signals */}
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {['Free delivery above ₹1499', '100% pure cotton certified', 'Secure checkout'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>✓</span>
                  <span style={{ fontSize: 12, color: 'var(--dust)' }}>{item}</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 11, color: 'var(--dust)', lineHeight: 1.6, marginTop: 10, marginBottom: 20, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
              24-hour return on damaged items only. No returns on custom stitched orders.
            </p>

            {/* Accordions */}
            <AccordionItem title="Description">
              <p style={{ fontSize: 13, color: 'var(--dust)', lineHeight: 1.9 }}>{product.description}</p>
            </AccordionItem>
            <AccordionItem title="Fabric & Care">
              <p style={{ fontSize: 13, color: 'var(--dust)', lineHeight: 1.9, marginBottom: 8 }}><strong style={{ fontWeight: 500 }}>Fabric:</strong> {product.fabric}</p>
              <p style={{ fontSize: 13, color: 'var(--dust)', lineHeight: 1.9 }}><strong style={{ fontWeight: 500 }}>Care:</strong> {product.care}</p>
            </AccordionItem>
            <AccordionItem title="Shipping & Returns">
              <p style={{ fontSize: 13, color: 'var(--dust)', lineHeight: 1.9 }}>Free delivery on orders above ₹1499. Standard delivery 5–7 business days. Returns accepted within 24 hours of delivery. Custom stitched orders cannot be returned.</p>
            </AccordionItem>

            <div style={{ padding: '0 0 16px' }}>
              <FrequentlyBoughtTogether productId={product.id} />
            </div>
          </div>

          {/* Complete the look */}
          {related.length >= 2 && (
            <section style={{ margin: '0 0 4px', padding: '20px 16px', background: 'var(--raw-cotton)' }}>
              <p style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dust)', marginBottom: 16 }}>STYLE IT WITH</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {related.slice(0, 2).map((rp) => (
                  <Link key={rp.id} href={`/${rp.category}/${(rp as any).slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ position: 'relative', aspectRatio: '3/4', background: 'var(--cream)', overflow: 'hidden' }}>
                      <Image src={rp.images[0]} alt={rp.name} fill style={{ objectFit: 'cover' }} sizes="50vw" />
                    </div>
                    <p style={{ fontSize: 12, fontWeight: 500, marginTop: 6, color: 'var(--black)' }}>{rp.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--dust)', marginTop: 2 }}>{formatPrice(rp.price)}</p>
                  </Link>
                ))}
              </div>
              <p style={{ fontSize: 10, color: 'var(--dust)', marginTop: 10, letterSpacing: '0.04em' }}>
                Together: {formatPrice(product.price + related[0].price + related[1].price)}
              </p>
            </section>
          )}

          {/* You May Also Like — horizontal scroll */}
          {related.length > 0 && (
            <section style={{ padding: '0 0 16px' }}>
              <p style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dust)', marginBottom: 12, paddingLeft: 16 }}>YOU MAY ALSO LIKE</p>
              <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingLeft: 16, paddingRight: 16, scrollbarWidth: 'none', scrollSnapType: 'x mandatory', paddingBottom: 4 }}>
                {related.map((rp) => (
                  <div key={rp.id} style={{ width: 160, flexShrink: 0, scrollSnapAlign: 'start' }}>
                    <ProductCard product={rp} variant="mobile" />
                  </div>
                ))}
              </div>
            </section>
          )}

          <div style={{ padding: '0 16px' }}>
            <RecentlyViewed currentProductId={product.id} />
          </div>
        </div>

        <MobileBottomBar product={product} selectedSize={selectedSize} onAddToBag={handleAddToBag} added={added} isOOS={isCurrentVariantOOS} />
        <SizeGuide isOpen={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
        <FindMySize isOpen={findMySizeOpen} onClose={() => setFindMySizeOpen(false)} availableSizes={product.sizes} onSelect={(size) => { setSelectedSize(size); }} category={product.category} />
      </>
    );
  }

  /* ── DESKTOP ── */
  return (
    <>
      <div style={{ backgroundColor: 'var(--cream)', padding: '40px 40px 80px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Breadcrumb */}
          <nav style={{ marginBottom: 36, display: 'flex', alignItems: 'center', gap: 8 }}>
            {[{ href: '/', label: 'Home' }, { href: `/${product.category}`, label: product.category }, { href: '#', label: product.name }].map((item, i, arr) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {i < arr.length - 1 ? (
                  <Link href={item.href} style={{ fontSize: 11, color: 'var(--dust)', letterSpacing: '0.08em', textTransform: 'capitalize' }}>{item.label}</Link>
                ) : (
                  <span style={{ fontSize: 11, color: 'var(--black)', letterSpacing: '0.08em' }}>{item.label}</span>
                )}
                {i < arr.length - 1 && <span style={{ fontSize: 11, color: 'var(--dust)' }}>/</span>}
              </span>
            ))}
          </nav>

          {/* 2-col layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '58% 42%', gap: 64, alignItems: 'start' }}>
            {/* Images */}
            <div>
              <div style={{ position: 'relative', aspectRatio: '1/1', backgroundColor: 'var(--raw-cotton)', overflow: 'hidden' }}>
                <AnimatePresence initial={false}>
                  <motion.div
                    key={activeImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ position: 'absolute', inset: 0 }}
                  >
                    <Image src={product.images[activeImage]} alt={product.name} fill style={{ objectFit: 'contain' }} sizes="58vw" priority={activeImage === 0} />
                  </motion.div>
                </AnimatePresence>
                {(product.isNew || product.isBestseller) && (
                  <span style={{ position: 'absolute', top: 16, left: 16, background: 'var(--black)', color: 'var(--cream)', fontSize: 9, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '4px 10px', zIndex: 1 }}>
                    {product.isNew ? 'New' : 'Bestseller'}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImage(i)}
                    style={{ position: 'relative', width: 72, height: 72, padding: 0, border: activeImage === i ? '1px solid var(--black)' : '1px solid transparent', cursor: 'pointer', background: 'var(--raw-cotton)', overflow: 'hidden', flexShrink: 0, transition: 'border-color 0.15s' }}>
                    <Image src={img} alt={`${product.name} ${i + 1}`} fill style={{ objectFit: 'contain', opacity: activeImage === i ? 1 : 0.65 }} sizes="72px" />
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div>
              <p style={{ fontSize: 11, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--dust)', marginBottom: 12 }}>{product.subcategory}</p>
              <h1 style={{ fontSize: 28, fontWeight: 400, letterSpacing: '0.02em', lineHeight: 1.2, marginBottom: 18 }}>{product.name}</h1>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 10 }}>
                <span style={{ fontSize: 26, fontWeight: 500 }}>{formatPrice(product.price)}</span>
                {product.originalPrice && <span style={{ fontSize: 15, color: 'var(--dust)', textDecoration: 'line-through' }}>{formatPrice(product.originalPrice)}</span>}
                {discount && <span style={{ fontSize: 12, color: 'var(--dust)', letterSpacing: '0.06em' }}>{discount}% off</span>}
              </div>

              {/* COD badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 10, background: '#F0FFF4', color: '#065F46', border: '1px solid #A7F3D0', padding: '3px 9px', letterSpacing: '0.06em', fontWeight: 600 }}>
                  ✓ COD Available
                </span>
                <span style={{ fontSize: 10, color: 'var(--dust)' }}>Free delivery above ₹1499</span>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, marginBottom: 24 }}>
                <p style={{ fontSize: 12, color: 'var(--dust)' }}><span style={{ fontWeight: 500, textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.10em' }}>Fabric</span> — {product.fabric}</p>
              </div>

              {/* Size */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 11, letterSpacing: '0.10em', fontWeight: 500, textTransform: 'uppercase' }}>Size{selectedSize && ` — ${selectedSize}`}</span>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <button onClick={() => setFindMySizeOpen(true)} style={{ background: 'none', border: 'none', fontSize: 11, color: 'var(--black)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, padding: 0 }}>
                      Find My Size
                    </button>
                    <span style={{ fontSize: 10, color: 'var(--border)' }}>|</span>
                    <button onClick={() => setSizeGuideOpen(true)} style={{ background: 'none', border: 'none', fontSize: 11, color: 'var(--dust)', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'DM Sans, sans-serif', padding: 0 }}>Size Guide</button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {product.sizes.map((size) => {
                    const oos = sizeOutOfStock(size);
                    const sel = selectedSize === size;
                    return (
                      <button key={size} onClick={() => !oos && persistSize(size)} disabled={oos}
                        style={{ padding: '8px 16px', fontSize: 12, border: sel ? 'none' : '1px solid var(--border)', background: sel ? 'var(--black)' : 'transparent', color: sel ? 'var(--cream)' : oos ? 'var(--dust)' : 'var(--black)', cursor: oos ? 'default' : 'pointer', textDecoration: oos ? 'line-through' : 'none', opacity: oos ? 0.5 : 1, fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s' }}>
                        {size}
                      </button>
                    );
                  })}
                </div>
                {!selectedSize && <p style={{ fontSize: 11, color: 'var(--dust)', marginTop: 8 }}>Please select a size.</p>}
                {selectedSize && !isCurrentVariantOOS && (() => {
                  const cnt = selectedColor
                    ? getVariantStock(selectedSize, selectedColor)
                    : liveVariants.filter(v => v.size === selectedSize).reduce((s, v) => s + (v.stock ?? 0), 0);
                  return cnt > 0 && cnt < 5 ? (
                    <p style={{ fontSize: 12, color: '#D97706', margin: '8px 0 0', fontWeight: 500 }}>⚠ Only {cnt} left in {selectedSize}!</p>
                  ) : null;
                })()}
                {selectedSize && isCurrentVariantOOS && (
                  <div style={{ marginTop: 12, padding: 16, background: '#F9F8F6', borderRadius: 8, border: '1px solid var(--border)' }}>
                    <p style={{ fontSize: 12, margin: '0 0 10px', color: 'var(--dust)' }}>This item is out of stock. Get notified when it&apos;s back:</p>
                    {waitlistSubmitted ? (
                      <p style={{ fontSize: 13, color: '#065F46', fontWeight: 500, margin: 0 }}>✓ You&apos;re on the waitlist!</p>
                    ) : (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input
                          type="email"
                          placeholder="your@email.com"
                          value={waitlistEmail}
                          onChange={e => setWaitlistEmail(e.target.value)}
                          style={{ flex: 1, padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
                        />
                        <button
                          onClick={async () => {
                            if (!waitlistEmail) return;
                            const variant = liveVariants.find(v => v.size === selectedSize && (!selectedColor || v.color === selectedColor))
                              ?? liveVariants.find(v => v.size === selectedSize);
                            if (!variant) return;
                            try {
                              await waitlistService.join({ email: waitlistEmail, productId: product.id, variantId: variant.id });
                              setWaitlistSubmitted(true);
                            } catch {}
                          }}
                          style={{ padding: '10px 16px', background: 'var(--ink)', color: 'var(--cream)', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', letterSpacing: '0.06em' }}
                        >
                          Notify Me
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {stockError && <p style={{ fontSize: 12, color: '#DC2626', margin: '8px 0 0', fontWeight: 500 }}>⚠ {stockError}</p>}
              </div>

              {/* Colors */}
              <div style={{ marginBottom: 32 }}>
                <span style={{ fontSize: 11, letterSpacing: '0.10em', fontWeight: 500, textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>Color{selectedColor && ` — ${selectedColor}`}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  {product.colors.map((color) => {
                    const hex = getColorHex(color);
                    const sel = selectedColor === color;
                    return (
                      <button key={color} onClick={() => setSelectedColor(color)} title={color}
                        style={{ width: 28, height: 28, minHeight: 'unset', borderRadius: '50%', aspectRatio: '1/1', flexShrink: 0, backgroundColor: hex, border: sel ? '2px solid var(--black)' : (hex === '#FFFFFF' || hex === '#F5F0E8' || hex === '#FFFFF0') ? '1px solid var(--border)' : '1px solid transparent', outline: sel ? '2px solid var(--cream)' : 'none', outlineOffset: '-4px', cursor: 'pointer', padding: 0, transition: 'transform 0.15s', transform: sel ? 'scale(1.1)' : 'scale(1)' }} />
                    );
                  })}
                </div>
              </div>

              {/* Add to Bag + Buy Now */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                <button onClick={handleAddToBag} disabled={!selectedSize || isCurrentVariantOOS}
                  style={{ height: 52, background: (selectedSize && !isCurrentVariantOOS) ? 'var(--black)' : 'var(--border)', color: (selectedSize && !isCurrentVariantOOS) ? 'var(--cream)' : 'var(--dust)', border: 'none', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: (selectedSize && !isCurrentVariantOOS) ? 'pointer' : 'default', fontWeight: 500, fontFamily: 'DM Sans, sans-serif', transition: 'background 0.2s' }}>
                  {added ? 'Added ✓' : isCurrentVariantOOS ? 'Out of Stock' : 'Add to Bag'}
                </button>
                <button onClick={handleBuyNow} disabled={!selectedSize || isCurrentVariantOOS}
                  style={{ height: 52, background: (selectedSize && !isCurrentVariantOOS) ? 'var(--cream)' : 'var(--border)', color: (selectedSize && !isCurrentVariantOOS) ? 'var(--black)' : 'var(--dust)', border: (selectedSize && !isCurrentVariantOOS) ? '1px solid var(--black)' : 'none', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: (selectedSize && !isCurrentVariantOOS) ? 'pointer' : 'default', fontWeight: 500, fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s' }}>
                  Buy Now
                </button>
              </div>

              {/* Find My Size pill — desktop */}
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ scale: 1.012 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setFindMySizeOpen(true)}
                style={{
                  width: '100%', height: 48, marginBottom: 10,
                  background: 'transparent', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                  position: 'relative', overflow: 'hidden',
                }}
              >
                <motion.div
                  animate={{ x: ['-120%', '220%'] }}
                  transition={{ duration: 1.1, delay: 2.5, repeat: Infinity, repeatDelay: 5 }}
                  style={{ position: 'absolute', top: 0, left: 0, width: '38%', height: '100%', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.45),transparent)', pointerEvents: 'none' }}
                />
                <span style={{ fontSize: 14 }}>📐</span>
                <span style={{ fontSize: 11, letterSpacing: '0.10em', fontWeight: 600, textTransform: 'uppercase', color: 'var(--black)' }}>Find My Size</span>
                <span style={{ fontSize: 10, color: 'var(--dust)', letterSpacing: '0.04em' }}>— Indian sizing guide</span>
              </motion.button>

              {product.category !== 'kids' && (
                <CustomStitchingButton
                  productId={product.id}
                  productCategory={product.category}
                  onStitchingAdded={(id) => {
                    setCustomStitchingId(id);
                    // Use selected size or fall back to first available variant
                    const size = selectedSize || product._variants?.[0]?.size || product.sizes[0] || 'Custom';
                    const color = selectedColor || product.colors[0] || 'Default';
                    addItem(product, size, color, 1, id);
                  }}
                  savedStitchingId={customStitchingId}
                />
              )}

              {/* Trust signals — 2×2 grid */}
              <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                {[
                  { icon: '✓', text: 'Free delivery above ₹1499' },
                  { icon: '✓', text: '100% pure cotton certified' },
                  { icon: '✓', text: 'Secure checkout — 256-bit SSL' },
                  { icon: '✓', text: 'Made in India' },
                ].map(item => (
                  <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, color: '#4CAF50', fontWeight: 700, flexShrink: 0 }}>{item.icon}</span>
                    <span style={{ fontSize: 11, color: 'var(--dust)', lineHeight: 1.4 }}>{item.text}</span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 11, color: 'var(--dust)', lineHeight: 1.6, marginTop: 10 }}>
                24-hour return on damaged items only. No returns on custom stitched orders.
              </p>

              {/* Wishlist + Share */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, marginTop: 16, marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
                <button onClick={() => toggleItem(product)}
                  style={{ padding: '13px', background: 'none', border: '1px solid var(--border)', fontSize: 12, letterSpacing: '0.10em', textTransform: 'uppercase', cursor: 'pointer', color: 'var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'DM Sans, sans-serif' }}>
                  <Heart size={14} strokeWidth={1.5} fill={inWishlist ? 'var(--black)' : 'none'} color="var(--black)" />
                  {inWishlist ? 'Saved to Wishlist' : 'Add to Wishlist'}
                </button>
                <button onClick={handleShare} title="Share product"
                  style={{ padding: '13px 16px', background: 'none', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--black)', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'DM Sans, sans-serif', fontSize: 11, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                  <Share2 size={14} strokeWidth={1.5} />
                  {shareCopied ? 'Copied!' : 'Share'}
                </button>
              </div>

              {/* Accordions */}
              <AccordionItem title="Description">
                <p style={{ fontSize: 13, color: 'var(--dust)', lineHeight: 1.9 }}>{product.description}</p>
              </AccordionItem>
              <AccordionItem title="Fabric & Care">
                <p style={{ fontSize: 13, color: 'var(--dust)', lineHeight: 1.9, marginBottom: 8 }}><strong style={{ fontWeight: 500 }}>Fabric:</strong> {product.fabric}</p>
                <p style={{ fontSize: 13, color: 'var(--dust)', lineHeight: 1.9 }}><strong style={{ fontWeight: 500 }}>Care:</strong> {product.care}</p>
              </AccordionItem>
              <AccordionItem title="Shipping & Returns">
                <p style={{ fontSize: 13, color: 'var(--dust)', lineHeight: 1.9 }}>Free delivery on orders above ₹1499. Standard delivery: 5–7 business days. Returns accepted within 24 hours of delivery. Custom stitched orders cannot be returned.</p>
              </AccordionItem>

              <FrequentlyBoughtTogether productId={product.id} />
            </div>
          </div>

          {/* Complete the look */}
          {related.length >= 2 && (
            <section style={{ marginTop: 80, padding: '48px 40px', background: 'var(--raw-cotton)', borderRadius: 2 }}>
              <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--dust)', marginBottom: 36, textAlign: 'center' }}>STYLE IT WITH</p>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(related.length, 2)}, 1fr)`, gap: 32, maxWidth: 600, margin: '0 auto' }}>
                {related.slice(0, 2).map((rp) => (
                  <Link key={rp.id} href={`/${rp.category}/${(rp as any).slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ position: 'relative', aspectRatio: '3/4', background: 'var(--cream)', overflow: 'hidden' }}>
                      <Image src={rp.images[0]} alt={rp.name} fill style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.04)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'; }}
                        sizes="300px" />
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 500, marginTop: 10, color: 'var(--black)' }}>{rp.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--dust)', marginTop: 3 }}>{formatPrice(rp.price)}</p>
                  </Link>
                ))}
              </div>
              <p style={{ fontSize: 12, color: 'var(--dust)', textAlign: 'center', marginTop: 24, letterSpacing: '0.04em' }}>
                Wear together · Combined value {formatPrice(product.price + related[0].price + related[1].price)}
              </p>
            </section>
          )}

          {/* Related */}
          {related.length > 0 && (
            <section style={{ marginTop: 100 }}>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} style={{ textAlign: 'center', marginBottom: 48 }}>
                <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--dust)' }}>You May Also Like</p>
              </motion.div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
                {related.map((rp, i) => (
                  <motion.div key={rp.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}>
                    <ProductCard product={rp} variant="desktop" />
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          <RecentlyViewed currentProductId={product.id} />
        </div>
      </div>

      <SizeGuide isOpen={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
      <FindMySize isOpen={findMySizeOpen} onClose={() => setFindMySizeOpen(false)} availableSizes={product.sizes} onSelect={(size) => { setSelectedSize(size); }} />
    </>
  );
}
