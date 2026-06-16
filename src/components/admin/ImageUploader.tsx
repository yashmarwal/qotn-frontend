'use client';

import { useRef, useState, useCallback } from 'react';
import { Upload, Trash2, Loader } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const API_BASE =
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3001/api'
    : '/api';

interface Props {
  images: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  minImages?: number;
}

const isGif = (url: string) => url.includes('.gif') || url.includes('f_gif');

// publicId is embedded in Cloudinary URLs as the path segment after /upload/
function extractPublicId(url: string): string | null {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/i);
  return match ? match[1] : null;
}

export default function ImageUploader({ images, onChange, maxImages = 6, minImages = 3 }: Props) {
  useAuth(); // ensures auth context is available (auth via httpOnly cookie)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [slotLoading, setSlotLoading] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Total slots = max of (maxImages, current count), capped at maxImages
  const totalSlots = Math.min(maxImages, Math.max(maxImages, images.length));
  const slots = Array.from({ length: totalSlots });

  const openFilePicker = (slotIndex: number) => {
    if (images[slotIndex] || slotIndex >= maxImages) return; // slot occupied
    if (!fileInputRef.current) return;
    fileInputRef.current.dataset.slot = String(slotIndex);
    fileInputRef.current.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const slotIndex = Number(fileInputRef.current?.dataset.slot ?? images.length);
    e.target.value = '';

    setError('');
    setSlotLoading(slotIndex);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('qotn_token') : null;
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_BASE}/upload/image`, {
        method: 'POST',
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Upload failed');

      const url: string = data.data?.url ?? data.url;
      if (!url) throw new Error('No URL returned from upload');

      const next = [...images];
      next[slotIndex] = url;
      onChange(next.filter(Boolean));
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setSlotLoading(null);
    }
  };

  const handleDelete = async (index: number) => {
    const url = images[index];
    const publicId = extractPublicId(url);

    const next = images.filter((_, i) => i !== index);
    onChange(next); // optimistic removal

    if (publicId) {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('qotn_token') : null;
        await fetch(`${API_BASE}/upload/image`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: 'include' as const,
          body: JSON.stringify({ publicId }),
        });
      } catch {
        // best-effort — image already removed from state
      }
    }
  };

  // ── Drag-to-reorder ───────────────────────────────────────────────────────
  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (!images[index]) return;
    e.dataTransfer.effectAllowed = 'move';
    setDragIndex(index);
  };

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (!images[index]) return;
    setDragOverIndex(index);
  }, [images]);

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    const next = [...images];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(dropIndex, 0, moved);
    onChange(next);
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const tooFew = images.length < minImages;

  return (
    <div>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {slots.map((_, i) => {
          const url = images[i];
          const isLoading = slotLoading === i;
          const isDragging = dragIndex === i;
          const isDropTarget = dragOverIndex === i && dragIndex !== i;

          return url ? (
            // ── Filled slot ────────────────────────────────────────────────
            <div
              key={i}
              draggable
              onDragStart={e => handleDragStart(e, i)}
              onDragOver={e => handleDragOver(e, i)}
              onDrop={e => handleDrop(e, i)}
              onDragEnd={handleDragEnd}
              style={{
                position: 'relative',
                aspectRatio: '1 / 1',
                borderRadius: 6,
                overflow: 'hidden',
                cursor: 'grab',
                border: isDropTarget ? '2px dashed #1A1A1A' : '2px solid transparent',
                opacity: isDragging ? 0.4 : 1,
                transition: 'opacity 0.15s, border 0.15s',
              }}
            >
              <img src={url} alt={`Product image ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', pointerEvents: 'none' }} />

              {/* Hover overlay */}
              <div
                className="img-overlay"
                style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(0,0,0,0)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.45)'; (e.currentTarget.querySelector('.del-btn') as HTMLElement | null)?.style && Object.assign((e.currentTarget.querySelector('.del-btn') as HTMLElement).style, { opacity: '1' }); }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0)'; (e.currentTarget.querySelector('.del-btn') as HTMLElement | null)?.style && Object.assign((e.currentTarget.querySelector('.del-btn') as HTMLElement).style, { opacity: '0' }); }}
              >
                <button
                  className="del-btn"
                  onClick={() => handleDelete(i)}
                  style={{ opacity: 0, background: '#fff', border: 'none', borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'opacity 0.2s' }}
                  title="Delete image"
                >
                  <Trash2 size={14} color="#DC2626" />
                </button>
              </div>

              {/* Primary badge */}
              {i === 0 && (
                <span style={{ position: 'absolute', top: 6, left: 6, background: '#1A1A1A', color: '#F5F0E8', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 7px', borderRadius: 3, fontWeight: 600, pointerEvents: 'none' }}>
                  Primary
                </span>
              )}

              {/* GIF badge */}
              {isGif(url) && (
                <span style={{ position: 'absolute', top: 6, right: 6, background: '#1A1A1A', color: '#F5F0E8', fontSize: 9, letterSpacing: '0.06em', padding: '2px 5px', borderRadius: 3, fontWeight: 600, pointerEvents: 'none' }}>
                  GIF
                </span>
              )}
            </div>
          ) : (
            // ── Empty slot ─────────────────────────────────────────────────
            <button
              key={i}
              type="button"
              onClick={() => openFilePicker(i)}
              disabled={isLoading || i > images.length} // disable future slots until prior ones filled
              onDragOver={e => e.preventDefault()}
              onDrop={e => handleDrop(e, i)}
              style={{
                aspectRatio: '1 / 1',
                borderRadius: 6,
                border: `2px dashed ${isDropTarget ? '#1A1A1A' : '#C8C4BC'}`,
                background: '#F5F0E8',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 8, cursor: i <= images.length ? 'pointer' : 'default',
                transition: 'border-color 0.2s, background 0.2s',
                opacity: i > images.length ? 0.4 : 1,
              }}
              onMouseEnter={e => { if (i <= images.length) (e.currentTarget as HTMLElement).style.background = '#EDE8DF'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#F5F0E8'; }}
            >
              {isLoading ? (
                <div style={{ width: 22, height: 22, border: '2px solid #1A1A1A', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              ) : (
                <>
                  <Upload size={18} color="#9E9987" strokeWidth={1.5} />
                  <span style={{ fontSize: 11, color: '#9E9987', letterSpacing: '0.06em', textAlign: 'center', lineHeight: 1.4 }}>
                    {i === 0 ? 'Upload Primary' : 'Upload Image'}
                  </span>
                </>
              )}
            </button>
          );
        })}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Hint + validation */}
      <p style={{ fontSize: 11, color: '#9E9987', marginTop: 8, letterSpacing: '0.04em' }}>
        First image is the primary product image. Drag to reorder. JPG, PNG, WebP · max 5 MB. GIF · max 15 MB.
      </p>
      {tooFew && images.length > 0 && (
        <p style={{ fontSize: 11, color: '#B45309', marginTop: 4, letterSpacing: '0.04em' }}>
          ⚠ Upload at least {minImages} images ({images.length}/{minImages} added)
        </p>
      )}
      {error && (
        <p style={{ fontSize: 12, color: '#DC2626', marginTop: 6, background: '#FEF2F2', padding: '6px 10px', borderRadius: 4 }}>
          {error}
        </p>
      )}
    </div>
  );
}
