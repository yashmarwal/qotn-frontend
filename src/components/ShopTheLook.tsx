'use client';

import { useState, useEffect } from 'react';
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

export default function ShopTheLook() {
  const [videos, setVideos] = useState<LookVideo[]>([]);
  const [paused, setPaused] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/look-videos', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        const list: LookVideo[] = Array.isArray(d?.data) ? d.data : [];
        setVideos(list.slice(0, 15));
      })
      .catch(() => {});
  }, []);

  if (videos.length === 0) return null;

  // One full set of cards width — animate from 0 to -this value, then loop
  const stripWidth = videos.length * (CARD_WIDTH + CARD_GAP);
  // ~40px/s feels slow and smooth
  const duration = Math.round(stripWidth / 40);

  return (
    <section style={{ padding: '48px 0', backgroundColor: 'var(--black)', overflow: 'hidden' }}>
      <style>{`
        @keyframes stl-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-${stripWidth}px); }
        }
      `}</style>

      <p style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.5)', textAlign: 'center', marginBottom: 24 }}>
        Shop The Look
      </p>

      <div
        style={{ overflow: 'hidden', width: '100%' }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => { setPaused(false); setHoveredId(null); }}
      >
        {/* Inner strip — rendered twice so the loop is seamless */}
        <div
          style={{
            display: 'flex',
            gap: CARD_GAP,
            width: 'max-content',
            animation: `stl-scroll ${duration}s linear infinite`,
            animationPlayState: paused ? 'paused' : 'running',
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
