'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

interface LookVideo {
  id: string;
  title: string;
  videoUrl: string;
  productId?: string;
  productSlug?: string;
  productCategory?: string;
}

export default function ShopTheLook() {
  const [videos, setVideos] = useState<LookVideo[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch('/api/look-videos', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        const list: LookVideo[] = Array.isArray(d?.data) ? d.data : [];
        setVideos(list.slice(0, 15));
      })
      .catch(() => {});
  }, []);

  // Auto-scroll when not hovered
  useEffect(() => {
    if (videos.length === 0 || hovered) return;
    const el = scrollRef.current;
    if (!el) return;

    timerRef.current = setInterval(() => {
      if (!el) return;
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft >= maxScroll - 4) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: 220, behavior: 'smooth' });
      }
    }, 2800);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [videos.length, hovered]);

  if (videos.length === 0) return null;

  return (
    <section style={{ padding: '48px 0', backgroundColor: 'var(--black)', overflow: 'hidden' }}>
      <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.5)', textAlign: 'center', marginBottom: 24 }}>
        Shop The Look
      </p>

      <div
        ref={scrollRef}
        onMouseEnter={() => setHovered('yes')}
        onMouseLeave={() => setHovered(null)}
        style={{
          display: 'flex',
          gap: 12,
          overflowX: 'auto',
          paddingLeft: 20,
          paddingRight: 20,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {videos.map(video => {
          const isHovered = hovered === video.id;
          const productHref = video.productCategory && video.productSlug
            ? `/${video.productCategory}/${video.productSlug}`
            : null;

          return (
            <div
              key={video.id}
              onMouseEnter={() => setHovered(video.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                flexShrink: 0,
                width: 180,
                scrollSnapAlign: 'start',
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

              {/* Hover overlay */}
              {productHref && (
                <Link
                  href={productHref}
                  style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'flex-end',
                    background: isHovered ? 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)' : 'transparent',
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
    </section>
  );
}
