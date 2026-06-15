'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import AdminGuard from '@/components/AdminGuard';
import ImageUploader from '@/components/admin/ImageUploader';
import { api } from '@/lib/api';

interface Category {
  id: string;
  name: string;
  slug: string;
  gender: string;
  image: string | null;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  productCount: number;
}

const blank = (): Partial<Category> => ({ name: '', slug: '', gender: 'UNISEX', image: null, description: '', isActive: true, sortOrder: 0 });

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', border: '1px solid var(--border)', background: '#fff',
  fontSize: 13, outline: 'none', color: 'var(--black)', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box',
};
const labelStyle: React.CSSProperties = {
  fontSize: 11, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--dust)', display: 'block', marginBottom: 6, fontWeight: 500,
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<Partial<Category>>(blank());
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    api.get<{ data: Category[] }>('/admin/categories')
      .then((res: any) => setCategories(res.data || []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(blank()); setError(''); setModalOpen(true); };
  const openEdit = (cat: Category) => { setEditing(cat); setForm({ ...cat }); setError(''); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.name || !form.slug) { setError('Name and slug are required.'); return; }
    setSaving(true); setError('');
    try {
      if (editing) {
        await api.patch(`/admin/categories/${editing.id}`, form);
      } else {
        await api.post('/admin/categories', form);
      }
      setModalOpen(false);
      load();
    } catch (e: any) {
      setError(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/admin/categories/${deleteTarget.id}`);
      setDeleteTarget(null);
      load();
    } catch (e: any) {
      alert(e.message || 'Delete failed');
    }
  };

  const set = (k: keyof Category, v: any) => setForm(f => ({ ...f, [k]: v }));

  return (
    <AdminGuard>
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--cream)' }}>
        <AdminSidebar />
        <main style={{ flex: 1, padding: '36px 40px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 400, marginBottom: 4 }}>Categories</h1>
              <p style={{ fontSize: 13, color: 'var(--dust)' }}>{categories.length} categories</p>
            </div>
            <button onClick={openCreate}
              style={{ padding: '10px 20px', background: 'var(--black)', color: 'var(--cream)', border: 'none', fontSize: 12, letterSpacing: '0.10em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>
              + Add Category
            </button>
          </div>

          {loading ? (
            <p style={{ color: 'var(--dust)', fontSize: 13 }}>Loading...</p>
          ) : (
            <div style={{ border: '1px solid var(--border)', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--raw-cotton)' }}>
                    {['Image', 'Name', 'Slug', 'Gender', 'Products', 'Status', 'Order', ''].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--dust)', fontWeight: 500 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {categories.map(cat => (
                    <tr key={cat.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 16px' }}>
                        {cat.image
                          ? <img src={cat.image} alt={cat.name} style={{ width: 40, height: 40, objectFit: 'cover' }} />
                          : <div style={{ width: 40, height: 40, background: 'var(--raw-cotton)' }} />
                        }
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 500 }}>{cat.name}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--dust)', fontFamily: 'monospace', fontSize: 12 }}>{cat.slug}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--dust)' }}>{cat.gender}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--dust)' }}>{cat.productCount}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: 11, padding: '3px 10px', background: cat.isActive ? '#D1FAE5' : '#FEE2E2', color: cat.isActive ? '#065F46' : '#991B1B', letterSpacing: '0.06em' }}>
                          {cat.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--dust)' }}>{cat.sortOrder}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 12 }}>
                          <button onClick={() => openEdit(cat)} style={{ background: 'none', border: 'none', fontSize: 12, color: 'var(--black)', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'DM Sans, sans-serif' }}>Edit</button>
                          <button onClick={() => setDeleteTarget(cat)} style={{ background: 'none', border: 'none', fontSize: 12, color: '#991B1B', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'DM Sans, sans-serif' }}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>

        {/* Edit / Create Modal */}
        {modalOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}>
            <div style={{ background: '#fff', width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto', padding: 32 }}>
              <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 24 }}>{editing ? 'Edit Category' : 'New Category'}</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <label style={labelStyle}>Name</label>
                  <input style={inputStyle} value={form.name || ''} onChange={e => { set('name', e.target.value); if (!editing) set('slug', slugify(e.target.value)); }} />
                </div>
                <div>
                  <label style={labelStyle}>Slug</label>
                  <input style={inputStyle} value={form.slug || ''} onChange={e => set('slug', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Gender</label>
                  <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.gender || 'UNISEX'} onChange={e => set('gender', e.target.value)}>
                    {['MEN', 'WOMEN', 'KIDS', 'UNISEX'].map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Description</label>
                  <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical', height: 'auto' }} value={form.description || ''} onChange={e => set('description', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Image</label>
                  <ImageUploader
                    images={form.image ? [form.image] : []}
                    onChange={(urls) => set('image', urls[0] || null)}
                    maxImages={1}
                    minImages={0}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Sort Order</label>
                    <input type="number" style={inputStyle} value={form.sortOrder ?? 0} onChange={e => set('sortOrder', parseInt(e.target.value) || 0)} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 22 }}>
                    <input type="checkbox" id="isActive" checked={!!form.isActive} onChange={e => set('isActive', e.target.checked)} style={{ width: 16, height: 16, cursor: 'pointer' }} />
                    <label htmlFor="isActive" style={{ ...labelStyle, margin: 0, cursor: 'pointer' }}>Active</label>
                  </div>
                </div>
              </div>

              {error && <p style={{ fontSize: 12, color: '#991B1B', marginTop: 12 }}>{error}</p>}

              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button onClick={handleSave} disabled={saving}
                  style={{ flex: 1, padding: '12px', background: 'var(--black)', color: 'var(--cream)', border: 'none', fontSize: 12, letterSpacing: '0.10em', textTransform: 'uppercase', cursor: saving ? 'wait' : 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 500, opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Saving...' : 'Save Category'}
                </button>
                <button onClick={() => setModalOpen(false)}
                  style={{ padding: '12px 20px', background: 'transparent', color: 'var(--black)', border: '1px solid var(--border)', fontSize: 12, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        {deleteTarget && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}>
            <div style={{ background: '#fff', padding: 32, maxWidth: 400, width: '100%' }}>
              <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: 12 }}>Delete &ldquo;{deleteTarget.name}&rdquo;?</h2>
              <p style={{ fontSize: 13, color: 'var(--dust)', marginBottom: 24, lineHeight: 1.7 }}>
                Are you sure? This cannot be undone.
                {deleteTarget.productCount > 0 && (
                  <><br /><strong style={{ color: '#991B1B' }}>Warning: This category has {deleteTarget.productCount} product{deleteTarget.productCount > 1 ? 's' : ''} and cannot be deleted.</strong></>
                )}
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                {deleteTarget.productCount === 0 && (
                  <button onClick={handleDelete}
                    style={{ flex: 1, padding: '12px', background: '#991B1B', color: '#fff', border: 'none', fontSize: 12, letterSpacing: '0.10em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>
                    Delete
                  </button>
                )}
                <button onClick={() => setDeleteTarget(null)}
                  style={{ flex: 1, padding: '12px', background: 'transparent', color: 'var(--black)', border: '1px solid var(--border)', fontSize: 12, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
