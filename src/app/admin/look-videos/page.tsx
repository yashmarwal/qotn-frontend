'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Edit, X, Video as VideoIcon, Search } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import AdminGuard from '@/components/AdminGuard';
import { adminService } from '@/lib/services/admin.service';
import { api } from '@/lib/api';

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', border: '1px solid var(--border)',
  background: 'var(--cream)', fontSize: 13, outline: 'none',
  color: 'var(--black)', fontFamily: 'DM Sans, sans-serif', height: 44,
  boxSizing: 'border-box',
};
const labelStyle: React.CSSProperties = {
  fontSize: 11, letterSpacing: '0.10em', textTransform: 'uppercase' as const,
  color: 'var(--dust)', display: 'block', marginBottom: 6, fontWeight: 500,
};

const emptyForm = {
  title: '',
  videoUrl: '',
  productId: '',
  productSlug: '',
  productCategory: '',
  sortOrder: 0,
  isActive: true,
};

export default function AdminLookVideosPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editVideo, setEditVideo] = useState<any>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  // Video upload state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Product search state
  const [productQuery, setProductQuery] = useState('');
  const [productResults, setProductResults] = useState<any[]>([]);
  const [searchingProducts, setSearchingProducts] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchVideos = () => {
    adminService.getLookVideos()
      .then((res: any) => setVideos(Array.isArray(res.data) ? res.data : []))
      .catch(console.error);
  };

  useEffect(() => { fetchVideos(); }, []);

  // Debounced product search
  useEffect(() => {
    if (!productQuery.trim() || productQuery.length < 2) { setProductResults([]); return; }
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      setSearchingProducts(true);
      try {
        const res: any = await api.get(`/products?search=${encodeURIComponent(productQuery)}&limit=8`);
        setProductResults(res.data || []);
      } catch { setProductResults([]); }
      finally { setSearchingProducts(false); }
    }, 350);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [productQuery]);

  const selectProduct = (p: any) => {
    const category = p.category?.slug ?? p.category ?? '';
    setForm(f => ({
      ...f,
      productId: p.id,
      productSlug: p.slug,
      productCategory: category,
    }));
    setProductQuery(p.name);
    setProductResults([]);
  };

  const clearProduct = () => {
    setForm(f => ({ ...f, productId: '', productSlug: '', productCategory: '' }));
    setProductQuery('');
    setProductResults([]);
  };

  const handleVideoUpload = async (file: File) => {
    if (file.size > 20 * 1024 * 1024) { showToast('Video must be under 20 MB'); return; }
    setUploading(true);
    setUploadProgress('Uploading to Cloudinary…');
    try {
      const token = localStorage.getItem('qotn_token') || '';
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload/video', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || 'Upload failed');
      }
      const data = await res.json();
      const url = data?.data?.url || data?.url;
      if (!url) throw new Error('No URL returned');
      setForm(f => ({ ...f, videoUrl: url }));
      setUploadProgress('');
      showToast('Video uploaded successfully');
    } catch (err: any) {
      showToast(err.message || 'Upload failed');
      setUploadProgress('');
    } finally {
      setUploading(false);
    }
  };

  const openAdd = () => {
    setEditVideo(null);
    setForm({ ...emptyForm });
    setProductQuery('');
    setProductResults([]);
    setModalOpen(true);
  };

  const openEdit = (v: any) => {
    setEditVideo(v);
    setForm({
      title: v.title ?? '',
      videoUrl: v.videoUrl ?? '',
      productId: v.productId ?? '',
      productSlug: v.productSlug ?? '',
      productCategory: v.productCategory ?? '',
      sortOrder: v.sortOrder ?? 0,
      isActive: v.isActive ?? true,
    });
    setProductQuery(v.productSlug ? `${v.productSlug}` : '');
    setProductResults([]);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { showToast('Title is required'); return; }
    if (!form.videoUrl.trim()) { showToast('Please upload a video first'); return; }
    setSaving(true);
    try {
      const payload: any = {
        title: form.title,
        videoUrl: form.videoUrl,
        sortOrder: Number(form.sortOrder) || 0,
        isActive: form.isActive,
        ...(form.productId ? { productId: form.productId } : {}),
        ...(form.productSlug ? { productSlug: form.productSlug } : {}),
        ...(form.productCategory ? { productCategory: form.productCategory } : {}),
      };
      if (editVideo) {
        await adminService.updateLookVideo(editVideo.id, payload);
        showToast('Look video updated');
      } else {
        await adminService.createLookVideo(payload);
        showToast('Look video added');
      }
      setModalOpen(false);
      fetchVideos();
    } catch (err: any) {
      showToast(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this look video?')) return;
    await adminService.deleteLookVideo(id);
    fetchVideos();
    showToast('Deleted');
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    await adminService.updateLookVideo(id, { isActive: !isActive });
    fetchVideos();
  };

  return (
    <AdminGuard>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#F7F5F2' }}>
        <AdminSidebar />
        <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>

          {toast && (
            <div style={{ position: 'fixed', top: 24, right: 24, background: '#1A1A1A', color: '#F5F0E8', padding: '12px 24px', fontSize: 13, zIndex: 9999, boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
              {toast}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 400, letterSpacing: '0.04em' }}>Look Videos</h1>
              <p style={{ fontSize: 12, color: 'var(--dust)', marginTop: 4 }}>
                9:16 videos shown in the &quot;Shop The Look&quot; section on the homepage. Max 15.
              </p>
            </div>
            <button onClick={openAdd}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'var(--black)', color: 'var(--cream)', border: 'none', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 500 }}>
              <Plus size={14} /> Add Video
            </button>
          </div>

          <p style={{ fontSize: 12, color: 'var(--dust)', marginBottom: 28, padding: '10px 14px', background: 'rgba(26,26,26,0.04)', borderLeft: '3px solid var(--border)' }}>
            Tip: Upload vertical (9:16) videos — 30–60 seconds work best. Link each to a product so viewers can shop directly.
          </p>

          {/* Table */}
          <div style={{ background: 'var(--cream)', border: '1px solid var(--border)', overflow: 'hidden' }}>
            {videos.length === 0 ? (
              <div style={{ padding: 60, textAlign: 'center' }}>
                <VideoIcon size={32} color="#ccc" style={{ display: 'block', margin: '0 auto 12px' }} />
                <p style={{ color: 'var(--dust)', margin: 0 }}>No look videos yet. Click &quot;Add Video&quot; to upload your first one.</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: '#F0EDE8' }}>
                    {['Preview', 'Title', 'Linked Product', 'Order', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, letterSpacing: '0.08em', fontWeight: 500, color: 'var(--dust)', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {videos.map((v, i) => (
                    <tr key={v.id} style={{ borderBottom: i < videos.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ width: 48, height: 72, background: '#1A1A1A', borderRadius: 2, overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                          <video
                            src={v.videoUrl}
                            muted
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 500 }}>{v.title}</td>
                      <td style={{ padding: '12px 16px' }}>
                        {v.productSlug ? (
                          <span style={{ fontSize: 12, color: '#1E40AF', background: '#DBEAFE', padding: '3px 8px', borderRadius: 2 }}>
                            /{v.productCategory}/{v.productSlug}
                          </span>
                        ) : (
                          <span style={{ fontSize: 12, color: 'var(--dust)' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--dust)' }}>{v.sortOrder}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <button onClick={() => handleToggle(v.id, v.isActive)}
                          style={{ padding: '4px 12px', border: 'none', cursor: 'pointer', fontSize: 11, fontFamily: 'DM Sans, sans-serif', fontWeight: 600, letterSpacing: '0.04em', background: v.isActive ? '#D1FAE5' : '#FEE2E2', color: v.isActive ? '#065F46' : '#991B1B' }}>
                          {v.isActive ? 'Active' : 'Hidden'}
                        </button>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => openEdit(v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--dust)', padding: 4 }}><Edit size={14} strokeWidth={1.5} /></button>
                          <button onClick={() => handleDelete(v.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: 4 }}><Trash2 size={14} strokeWidth={1.5} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>

        {/* Modal */}
        {modalOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px', overflowY: 'auto' }} onClick={() => setModalOpen(false)}>
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,26,26,0.55)' }} />
            <div style={{ position: 'relative', background: 'var(--cream)', width: '100%', maxWidth: 640, padding: 40, zIndex: 1, margin: 'auto' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                <h2 style={{ fontSize: 14, letterSpacing: '0.10em', textTransform: 'uppercase', fontWeight: 500 }}>
                  {editVideo ? 'Edit Look Video' : 'Add Look Video'}
                </h2>
                <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} strokeWidth={1.5} /></button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* Title */}
                <div>
                  <label style={labelStyle}>Title *</label>
                  <input style={inputStyle} value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="Summer Cotton Look" />
                </div>

                {/* Video upload */}
                <div>
                  <label style={labelStyle}>Video (9:16, max 20 MB) *</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
                    style={{ display: 'none' }}
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleVideoUpload(f); }}
                  />
                  {form.videoUrl ? (
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 12, border: '1px solid var(--border)', background: '#F9F8F6' }}>
                      <video src={form.videoUrl} muted style={{ width: 54, height: 80, objectFit: 'cover', borderRadius: 2, background: '#1A1A1A', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 12, color: '#065F46', fontWeight: 500, marginBottom: 4 }}>✓ Video uploaded</p>
                        <p style={{ fontSize: 11, color: 'var(--dust)', wordBreak: 'break-all' }}>{form.videoUrl.split('/').slice(-2).join('/')}</p>
                      </div>
                      <button onClick={() => { setForm(f => ({ ...f, videoUrl: '' })); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: 4, flexShrink: 0 }}>
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      style={{ width: '100%', height: 80, border: '2px dashed var(--border)', background: 'transparent', cursor: uploading ? 'wait' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--dust)', fontFamily: 'DM Sans, sans-serif' }}>
                      <VideoIcon size={22} strokeWidth={1.5} color="var(--dust)" />
                      <span style={{ fontSize: 12 }}>{uploading ? uploadProgress || 'Uploading…' : 'Click to upload video'}</span>
                    </button>
                  )}
                </div>

                {/* Product search */}
                <div>
                  <label style={labelStyle}>Link to Product <span style={{ color: 'var(--dust)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional — viewers can tap to shop)</span></label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'relative' }}>
                      <Search size={14} strokeWidth={1.5} color="var(--dust)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                      <input
                        style={{ ...inputStyle, paddingLeft: 36 }}
                        value={productQuery}
                        onChange={e => setProductQuery(e.target.value)}
                        placeholder="Search product by name…"
                      />
                      {form.productSlug && (
                        <button onClick={clearProduct}
                          style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--dust)', padding: 2 }}>
                          <X size={13} />
                        </button>
                      )}
                    </div>

                    {/* Dropdown results */}
                    {(productResults.length > 0 || searchingProducts) && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--cream)', border: '1px solid var(--border)', borderTop: 'none', zIndex: 50, maxHeight: 240, overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                        {searchingProducts ? (
                          <div style={{ padding: '12px 14px', fontSize: 12, color: 'var(--dust)' }}>Searching…</div>
                        ) : (
                          productResults.map((p: any) => (
                            <button key={p.id} onClick={() => selectProduct(p)}
                              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'none', border: 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer', textAlign: 'left', fontFamily: 'DM Sans, sans-serif' }}>
                              {p.images?.[0]?.url && (
                                <img src={p.images[0].url} alt={p.name} style={{ width: 32, height: 40, objectFit: 'cover', flexShrink: 0, borderRadius: 2, background: '#F0EDE8' }} />
                              )}
                              <div>
                                <p style={{ fontSize: 13, fontWeight: 500, margin: 0 }}>{p.name}</p>
                                <p style={{ fontSize: 11, color: 'var(--dust)', margin: '2px 0 0' }}>/{p.category?.slug}/{p.slug}</p>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {form.productSlug && (
                    <p style={{ fontSize: 11, color: '#065F46', marginTop: 6 }}>
                      ✓ Linked → /{form.productCategory}/{form.productSlug}
                    </p>
                  )}
                </div>

                {/* Sort order + Active */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Sort Order <span style={{ color: 'var(--dust)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(lower = first)</span></label>
                    <input type="number" min="0" style={inputStyle} value={form.sortOrder}
                      onChange={e => setForm(f => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 2 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
                      <input type="checkbox" checked={form.isActive}
                        onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                        style={{ accentColor: 'var(--black)', width: 16, height: 16 }} />
                      Show on homepage
                    </label>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
                <button onClick={() => setModalOpen(false)}
                  style={{ padding: '13px 20px', background: 'transparent', border: '1px solid var(--border)', fontSize: 12, letterSpacing: '0.08em', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving || uploading}
                  style={{ flex: 1, padding: '13px', background: 'var(--black)', color: 'var(--cream)', border: 'none', fontSize: 12, letterSpacing: '0.10em', textTransform: 'uppercase', cursor: (saving || uploading) ? 'not-allowed' : 'pointer', fontWeight: 500, opacity: (saving || uploading) ? 0.7 : 1, fontFamily: 'DM Sans, sans-serif' }}>
                  {saving ? 'Saving…' : editVideo ? 'Save Changes' : 'Add Look Video'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
