'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface Collection {
  id: string;
  slug: string;
  name: string;
  thumbnail?: string;
  mobileThumbnail?: string;
  description?: string;
  _count?: { products: number };
}

function isVideo(url: string) {
  return /\.(mp4|webm|ogg)(\?|$)/i.test(url);
}

function CollectionMedia({ url, name }: { url: string; name: string }) {
  if (isVideo(url)) {
    return (
      <video
        src={url}
        autoPlay
        muted
        loop
        playsInline
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      />
    );
  }
  // GIF or image — use <img> so GIFs animate (next/image strips animation)
  return (
    <img
      src={url}
      alt={name}
      loading="lazy"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
    />
  );
}

export default function MobileCollectionCards({ collections }: { collections: Collection[] }) {
  if (!collections.length) return null;

  return (
    <section style={{ padding: '0 0 4px' }}>
      <p style={{
        fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
        color: 'var(--dust)', textAlign: 'center',
        padding: '24px 0 14px',
      }}>
        Collections
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 12px' }}>
        {collections.map((col, i) => (
          <motion.div
            key={col.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.38, delay: i * 0.06 }}
          >
            <Link
              href={`/collections/${col.slug}`}
              style={{ display: 'block', textDecoration: 'none', minHeight: 'unset' }}
            >
              {/* Card */}
              <div style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '4 / 5',
                overflow: 'hidden',
                borderRadius: 6,
                backgroundColor: 'var(--raw-cotton)',
              }}>
                {/* Media — prefer mobileThumbnail (video/GIF), fall back to thumbnail */}
                {(col.mobileThumbnail || col.thumbnail) ? (
                  <CollectionMedia url={col.mobileThumbnail || col.thumbnail!} name={col.name} />
                ) : (
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'var(--raw-cotton)',
                  }}>
                    <span style={{ fontSize: 36, fontWeight: 300, letterSpacing: '0.08em', color: 'var(--dust)' }}>
                      {col.name.split(' ').slice(0, 2).map((w: string) => w[0].toUpperCase()).join('')}
                    </span>
                  </div>
                )}

                {/* Gradient overlay */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.18) 45%, transparent 70%)',
                }} />

                {/* Text */}
                <div style={{ position: 'absolute', bottom: 20, left: 18, right: 18 }}>
                  <p style={{
                    color: '#F5F0E8',
                    fontSize: 20,
                    fontWeight: 400,
                    letterSpacing: '0.10em',
                    textTransform: 'uppercase',
                    lineHeight: 1.1,
                    marginBottom: 6,
                  }}>
                    {col.name}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {col._count?.products !== undefined && (
                      <span style={{ color: 'rgba(245,240,232,0.65)', fontSize: 11, letterSpacing: '0.06em' }}>
                        {col._count.products} pieces
                      </span>
                    )}
                    <span style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      color: 'rgba(245,240,232,0.85)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
                    }}>
                      Explore <ArrowRight size={11} strokeWidth={2} />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* View all */}
      <div style={{ padding: '12px 12px 0' }}>
        <Link href="/collections" style={{ display: 'block', textDecoration: 'none', minHeight: 'unset' }}>
          <div style={{
            width: '100%', height: 46,
            border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            fontSize: 11, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--black)',
          }}>
            View All Collections <ArrowRight size={11} strokeWidth={2} />
          </div>
        </Link>
      </div>
    </section>
  );
}
