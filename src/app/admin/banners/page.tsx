'use client';
import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, X, Image as ImageIcon } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import AdminGuard from '@/components/AdminGuard';
import ImageUploader from '@/components/admin/ImageUploader';
import { adminService } from '@/lib/services/admin.service';

const POSITIONS = ['HERO', 'COLLECTION_TOP', 'PRODUCT_TOP', 'FOOTER'] as const;
const positionLabel: Record<string, string> = {
  HERO: 'Hero', COLLECTION_TOP: 'Collection Top', PRODUCT_TOP: 'Product Top', FOOTER: 'Footer',
};

const emptyForm = {
  title: '', subtitle: '', image: '', mobileImage: '',
  link: '', position: 'HERO', isActive: true, startsAt: '', expiresAt: '',
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', border: '1px solid var(--border)',
  background: 'var(--cream)', fontSize: 13, outline: 'none',
  color: 'var(--black)', fontFamily: 'DM Sans, sans-serif', height: 44,
};
const labelStyle: React.CSSProperties = {
  fontSize: 11, letterSpacing: '0.10em', textTransform: 'uppercase' as const,
  color: 'var(--dust)', display: 'block', marginBottom: 6, fontWeight: 500,
};

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editBanner, setEditBanner] = useState<any>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchBanners = () => {
    adminService.getBanners()
      .then((res: any) => setBanners(Array.isArray(res.data) ? res.data : []))
      .catch(console.error);
  };

  useEffect(() => { fetchBanners(); }, []);

  const openAdd = () => {
    setEditBanner(null);
    setForm({ ...emptyForm });
    setModalOpen(true);
  };

  const openEdit = (b: any) => {
    setEditBanner(b);
    setForm({
      title: b.title ?? '',
      subtitle: b.subtitle ?? '',
      image: b.image ?? '',
      mobileImage: b.mobileImage ?? '',
      link: b.link ?? '',
      position: b.position ?? 'HERO',
      isActive: b.isActive ?? true,
      startsAt: b.startsAt ? new Date(b.startsAt).toISOString().slice(0, 16) : '',
      expiresAt: b.expiresAt ? new Date(b.expiresAt).toISOString().slice(0, 16) : '',
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { showToast('Title is required'); return; }
    if (!form.image.trim()) { showToast('Desktop image is required'); return; }
    setSaving(true);
    try {
      const payload: any = {
        title: form.title,
        image: form.image,
        position: form.position,
        isActive: form.isActive,
        ...(form.subtitle ? { subtitle: form.subtitle } : {}),
        ...(form.mobileImage ? { mobileImage: form.mobileImage } : {}),
        ...(form.link ? { link: form.link } : {}),
        ...(form.startsAt ? { startsAt: form.startsAt } : {}),
        ...(form.expiresAt ? { expiresAt: form.expiresAt } : {}),
      };
      if (editBanner) {
        await adminService.updateBanner(editBanner.id, payload);
        showToast('Banner updated');
      } else {
        await adminService.createBanner(payload);
        showToast('Banner created');
      }
      setModalOpen(false);
      fetchBanners();
    } catch (err: any) {
      showToast(err.message || 'Failed to save banner');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this banner?')) return;
    await adminService.deleteBanner(id);
    fetchBanners();
    showToast('Banner deleted');
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    await adminService.updateBanner(id, { isActive: !isActive });
    fetchBanners();
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

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <h1 style={{ fontSize: 22, fontWeight: 400, letterSpacing: '0.04em' }}>Banners</h1>
            <button onClick={openAdd}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'var(--black)', color: 'var(--cream)', border: 'none', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 500 }}>
              <Plus size={14} /> Add Banner
            </button>
          </div>

          {/* Table */}
          <div style={{ background: 'var(--cream)', border: '1px solid var(--border)', overflow: 'hidden' }}>
            {banners.length === 0 ? (
              <div style={{ padding: 60, textAlign: 'center' }}>
                <ImageIcon size={32} color="#ccc" style={{ display: 'block', margin: '0 auto 12px' }} />
                <p style={{ color: 'var(--dust)', margin: 0 }}>No banners yet. Click &quot;Add Banner&quot; to create one.</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: '#F0EDE8' }}>
                    {['Preview', 'Title', 'Position', 'Status', 'Dates', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, letterSpacing: '0.08em', fontWeight: 500, color: 'var(--dust)', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {banners.map((banner, i) => (
                    <tr key={banner.id} style={{ borderBottom: i < banners.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <td style={{ padding: '12px 16px' }}>
                        {banner.image ? (
                          <div style={{ width: 60, height: 60, overflow: 'hidden', border: '1px solid var(--border)' }}>
                            <img src={banner.image} alt={banner.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        ) : (
                          <div style={{ width: 60, height: 60, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                            <ImageIcon size={16} color="#ccc" />
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <p style={{ margin: 0, fontWeight: 500 }}>{banner.title}</p>
                        {banner.subtitle && <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--dust)' }}>{banner.subtitle}</p>}
                        {banner.link && <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--dust)' }}>→ {banner.link}</p>}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: 11, background: '#F0EDE8', padding: '3px 8px', letterSpacing: '0.04em' }}>{positionLabel[banner.position] ?? banner.position}</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button onClick={() => handleToggle(banner.id, banner.isActive)}
                          style={{ padding: '4px 12px', border: 'none', cursor: 'pointer', fontSize: 11, fontFamily: 'DM Sans, sans-serif', fontWeight: 600, letterSpacing: '0.04em', background: banner.isActive ? '#D1FAE5' : '#FEE2E2', color: banner.isActive ? '#065F46' : '#991B1B' }}>
                          {banner.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--dust)' }}>
                        {banner.startsAt ? new Date(banner.startsAt).toLocaleDateString('en-IN') : '—'}
                        {' → '}
                        {banner.expiresAt ? new Date(banner.expiresAt).toLocaleDateString('en-IN') : '∞'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => openEdit(banner)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--dust)', padding: 4 }}><Edit size={14} strokeWidth={1.5} /></button>
                          <button onClick={() => handleDelete(banner.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: 4 }}><Trash2 size={14} strokeWidth={1.5} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>

        {/* Add/Edit Modal */}
        {modalOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px', overflowY: 'auto' }} onClick={() => setModalOpen(false)}>
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,26,26,0.55)' }} />
            <div style={{ position: 'relative', background: 'var(--cream)', width: '100%', maxWidth: 720, padding: 40, zIndex: 1, margin: 'auto' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                <h2 style={{ fontSize: 14, letterSpacing: '0.10em', textTransform: 'uppercase', fontWeight: 500 }}>
                  {editBanner ? 'Edit Banner' : 'Add Banner'}
                </h2>
                <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} strokeWidth={1.5} /></button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* Title + Subtitle */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Title *</label>
                    <input style={inputStyle} value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="Pure Cotton. Nothing Else." />
                  </div>
                  <div>
                    <label style={labelStyle}>Subtitle <span style={{ color: 'var(--dust)', fontWeight: 400 }}>optional</span></label>
                    <input style={inputStyle} value={form.subtitle}
                      onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))}
                      placeholder="New arrivals for Men, Women & Kids" />
                  </div>
                </div>

                {/* Desktop image upload */}
                <div>
                  <label style={labelStyle}>Desktop Banner Image *</label>
                  <ImageUploader
                    images={form.image ? [form.image] : []}
                    onChange={urls => setForm(f => ({ ...f, image: urls[0] || '' }))}
                    maxImages={1}
                    minImages={0}
                  />
                </div>

                {/* Mobile image upload */}
                <div>
                  <label style={labelStyle}>Mobile Banner Image <span style={{ color: 'var(--dust)', fontWeight: 400 }}>optional — portrait crop</span></label>
                  <ImageUploader
                    images={form.mobileImage ? [form.mobileImage] : []}
                    onChange={urls => setForm(f => ({ ...f, mobileImage: urls[0] || '' }))}
                    maxImages={1}
                    minImages={0}
                  />
                  <p style={{ fontSize: 11, color: 'var(--dust)', marginTop: 6 }}>If left empty, desktop image will be used on mobile too.</p>
                </div>

                {/* Link + Position */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Link URL <span style={{ color: 'var(--dust)', fontWeight: 400 }}>optional</span></label>
                    <input style={inputStyle} value={form.link}
                      onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
                      placeholder="/men" />
                  </div>
                  <div>
                    <label style={labelStyle}>Position</label>
                    <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.position}
                      onChange={e => setForm(f => ({ ...f, position: e.target.value }))}>
                      {POSITIONS.map(p => <option key={p} value={p}>{positionLabel[p]}</option>)}
                    </select>
                  </div>
                </div>

                {/* Dates */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Starts At <span style={{ color: 'var(--dust)', fontWeight: 400 }}>optional</span></label>
                    <input type="datetime-local" style={inputStyle} value={form.startsAt}
                      onChange={e => setForm(f => ({ ...f, startsAt: e.target.value }))} />
                  </div>
                  <div>
                    <label style={labelStyle}>Expires At <span style={{ color: 'var(--dust)', fontWeight: 400 }}>optional</span></label>
                    <input type="datetime-local" style={inputStyle} value={form.expiresAt}
                      onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} />
                  </div>
                </div>

                {/* Active toggle */}
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
                  <input type="checkbox" checked={form.isActive}
                    onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                    style={{ accentColor: 'var(--black)', width: 16, height: 16 }} />
                  Active immediately
                </label>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
                <button onClick={() => setModalOpen(false)}
                  style={{ padding: '13px 20px', background: 'transparent', border: '1px solid var(--border)', fontSize: 12, letterSpacing: '0.08em', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  style={{ flex: 1, padding: '13px', background: 'var(--black)', color: 'var(--cream)', border: 'none', fontSize: 12, letterSpacing: '0.10em', textTransform: 'uppercase', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 500, opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Saving...' : editBanner ? 'Save Changes' : 'Add Banner'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
