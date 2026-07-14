'use client';

import { useRef, useState } from 'react';
import { Upload, Trash2 } from 'lucide-react';

const API_BASE =
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3001/api'
    : '/api';

interface Props {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
}

function isVideo(url: string) {
  return /\.(mp4|webm|ogg)(\?|$)/i.test(url);
}
function isGif(url: string) {
  return /\.gif(\?|$)/i.test(url);
}

export default function MediaUploader({ value, onChange, label = 'Upload', hint }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');

  const handleFile = async (file: File) => {
    setError('');
    setLoading(true);
    setProgress('Uploading…');
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('qotn_token') : null;
      const form = new FormData();
      form.append('file', file);

      const isVid = file.type.startsWith('video/');
      const endpoint = isVid ? `${API_BASE}/upload/video` : `${API_BASE}/upload/image`;

      const res = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Upload failed');
      const url: string = data.data?.url ?? data.url;
      if (!url) throw new Error('No URL returned');
      onChange(url);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setLoading(false);
      setProgress('');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  return (
    <div>
      <input
        ref={ref}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
        style={{ display: 'none' }}
        onChange={handleChange}
      />

      {value ? (
        <div style={{ position: 'relative', width: 140, borderRadius: 6, overflow: 'hidden', background: '#1A1A1A' }}>
          {isVideo(value) ? (
            <video
              src={value}
              muted
              loop
              playsInline
              autoPlay
              style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <img
              src={value}
              alt="thumbnail"
              style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover', display: 'block' }}
            />
          )}
          {/* Badges */}
          {isVideo(value) && (
            <span style={{ position: 'absolute', top: 6, left: 6, background: '#1A1A1A', color: '#F5F0E8', fontSize: 9, letterSpacing: '0.08em', padding: '2px 6px', borderRadius: 3, fontWeight: 600 }}>MP4</span>
          )}
          {isGif(value) && (
            <span style={{ position: 'absolute', top: 6, left: 6, background: '#1A1A1A', color: '#F5F0E8', fontSize: 9, letterSpacing: '0.08em', padding: '2px 6px', borderRadius: 3, fontWeight: 600 }}>GIF</span>
          )}
          {/* Remove */}
          <button
            onClick={() => onChange('')}
            style={{ position: 'absolute', top: 6, right: 6, background: '#fff', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', minHeight: 'unset' }}
          >
            <Trash2 size={12} color="#DC2626" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={loading}
          style={{
            width: 140, aspectRatio: '4/5', border: '2px dashed #C8C4BC', borderRadius: 6,
            background: '#F5F0E8', display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 8, cursor: 'pointer',
          }}
        >
          {loading ? (
            <>
              <div style={{ width: 20, height: 20, border: '2px solid #1A1A1A', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              <span style={{ fontSize: 10, color: '#9E9987', letterSpacing: '0.04em' }}>{progress}</span>
            </>
          ) : (
            <>
              <Upload size={18} color="#9E9987" strokeWidth={1.5} />
              <span style={{ fontSize: 11, color: '#9E9987', letterSpacing: '0.04em', textAlign: 'center', lineHeight: 1.4 }}>{label}</span>
            </>
          )}
        </button>
      )}

      {hint && <p style={{ fontSize: 11, color: '#9E9987', marginTop: 6, letterSpacing: '0.04em' }}>{hint}</p>}
      {error && <p style={{ fontSize: 11, color: '#DC2626', marginTop: 4, background: '#FEF2F2', padding: '4px 8px', borderRadius: 4 }}>{error}</p>}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
