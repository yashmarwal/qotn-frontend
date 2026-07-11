'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface LookVideo {
  id: string;
  title: string;
  videoUrl: string;
  productId?: string;
  productSlug?: string;
  productCategory?: string;
}

const CARD_WIDTH = 180;
const CARD_GAP = 12;
// ~40px/s feels slow and smooth
const SPEED_PX_PER_SEC = 40;
const DRAG_LOCK_THRESHOLD = 6;

export default function ShopTheLook() {
  const [videos, setVideos] = useState<LookVideo[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const stripWidthRef = useRef(0);
  const offsetRef = useRef(0);
  const draggingRef = useRef(false);
  const pausedRef = useRef(false); // desktop hover pause

  useEffect(() => {
    fetch('/api/look-videos', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        const list: LookVideo[] = Array.isArray(d?.data) ? d.data : [];
        setVideos(list.slice(0, 15));
      })
      .catch(() => {});
  }, []);

  // One full set of cards width — the strip is rendered twice, so wrapping
  // the offset within this range keeps the loop seamless.
  const stripWidth = videos.length * (CARD_WIDTH + CARD_GAP);
  stripWidthRef.current = stripWidth;

  const applyTransform = () => {
    if (stripRef.current) {
      stripRef.current.style.transform = `translateX(-${offsetRef.current}px)`;
    }
  };

  // Auto-scroll loop — advances the offset unless someone is dragging it
  // or hovering (desktop). Touch drag below takes over the same offset,
  // so releasing it just resumes forward auto-scroll from that position.
  useEffect(() => {
    let raf = 0;
    let lastTime: number | null = null;

    const tick = (time: number) => {
      if (lastTime === null) lastTime = time;
      const dt = time - lastTime;
      lastTime = time;

      const w = stripWidthRef.current;
      if (!draggingRef.current && !pausedRef.current && w > 0) {
        offsetRef.current = (((offsetRef.current + (SPEED_PX_PER_SEC * dt) / 1000) % w) + w) % w;
        applyTransform();
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Touch drag — native listeners (not passive) so we can preventDefault
  // to stop page scroll only once a horizontal drag is detected.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let dragging = false;
    let horizontalLock: boolean | null = null;
    let startX = 0;
    let startY = 0;
    let startOffset = 0;

    const onTouchStart = (e: TouchEvent) => {
      dragging = true;
      draggingRef.current = true;
      horizontalLock = null;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startOffset = offsetRef.current;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!dragging) return;
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;

      if (horizontalLock === null) {
        if (Math.abs(dx) < DRAG_LOCK_THRESHOLD && Math.abs(dy) < DRAG_LOCK_THRESHOLD) return;
        horizontalLock = Math.abs(dx) > Math.abs(dy);
        if (!horizontalLock) {
          // Vertical swipe — let the page scroll normally instead.
          dragging = false;
          draggingRef.current = false;
          return;
        }
      }

      e.preventDefault();
      const w = stripWidthRef.current;
      offsetRef.current = (((startOffset - dx) % w) + w) % w;
      applyTransform();
    };

    const onTouchEnd = () => {
      dragging = false;
      draggingRef.current = false;
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    el.addEventListener('touchcancel', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
    };
  }, []);

  if (videos.length === 0) return null;

  return (
    <section style={{ padding: '48px 0', backgroundColor: 'var(--black)', overflow: 'hidden' }}>
      <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.5)', textAlign: 'center', marginBottom: 24 }}>
        Shop The Look
      </p>

      <div
        ref={containerRef}
        style={{ overflow: 'hidden', width: '100%', touchAction: 'pan-y' }}
        onMouseEnter={() => { pausedRef.current = true; }}
        onMouseLeave={() => { pausedRef.current = false; setHoveredId(null); }}
      >
        {/* Inner strip — rendered twice so the loop is seamless */}
        <div
          ref={stripRef}
          style={{
            display: 'flex',
            gap: CARD_GAP,
            width: 'max-content',
            willChange: 'transform',
          }}
        >
          {[...videos, ...videos].map((video, idx) => {
            const isHovered = hoveredId === video.id;
            const productHref = video.productCategory && video.productSlug
              ? `/${video.productCategory}/${video.productSlug}`
              : null;

            return (
              <div
                key={`${video.id}-${idx}`}
                onMouseEnter={() => setHoveredId(video.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  flexShrink: 0,
                  width: CARD_WIDTH,
                  position: 'relative',
                  aspectRatio: '9/16',
                  borderRadius: 6,
                  overflow: 'hidden',
                  backgroundColor: '#111',
                  cursor: productHref ? 'pointer' : 'default',
                }}
              >
                <video
                  src={video.videoUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                {productHref && (
                  <Link
                    href={productHref}
                    style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', alignItems: 'flex-end',
                      background: isHovered
                        ? 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)'
                        : 'transparent',
                      transition: 'background 0.25s',
                      textDecoration: 'none',
                    }}
                  >
                    {isHovered && (
                      <div style={{ padding: '12px 10px', width: '100%' }}>
                        <p style={{ fontSize: 11, fontWeight: 500, color: '#F5F0E8', letterSpacing: '0.06em', marginBottom: 6 }}>
                          {video.title}
                        </p>
                        <span style={{ fontSize: 9, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#F5F0E8', borderBottom: '1px solid rgba(245,240,232,0.6)', paddingBottom: 1 }}>
                          Shop This Look
                        </span>
                      </div>
                    )}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
