'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Edit2, Trash2, X, Search, Check } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import AdminGuard from '@/components/AdminGuard';
import ImageUploader from '@/components/admin/ImageUploader';
import { adminService } from '@/lib/services/admin.service';
import { productsService } from '@/lib/services/products.service';
import { adaptApiProductList } from '@/lib/adapters';

const API =
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3001/api'
    : '/api';

const empty = () => ({ name: '', slug: '', description: '', thumbnail: '', isActive: true, sortOrder: 0 });

function makeSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState(empty());
  const [saving, setSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Product picker
  const [pickerOpen, setPickerOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [pickerLoading, setPickerLoading] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [collectionProducts, setCollectionProducts] = useState<any[]>([]);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLoading(true);
    adminService.getCollections()
      .then((r: any) => setCollections(r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const openAdd = () => {
    setEditing(null);
    setForm(empty());
    setCollectionProducts([]);
    setModal('add');
  };

  const openEdit = async (col: any) => {
    setEditing(col);
    setForm({
      name: col.name,
      slug: col.slug,
      description: col.description || '',
      thumbnail: col.thumbnail || '',
      isActive: col.isActive,
      sortOrder: col.sortOrder,
    });
    // Fetch collection products
    try {
      const r: any = await fetch(`${API}/collections/${col.slug}?limit=48`).then(x => x.json());
      setCollectionProducts(adaptApiProductList(r.data?.products || []));
    } catch { setCollectionProducts([]); }
    setModal('edit');
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (modal === 'add') {
        await adminService.createCollection(form);
      } else if (editing) {
        await adminService.updateCollection(editing.id, form);
      }
      setModal(null);
      setRefreshKey(k => k + 1);
    } catch (e: any) {
      alert(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this collection? Products are not deleted.')) return;
    await adminService.deleteCollection(id);
    setRefreshKey(k => k + 1);
  };

  const handleToggleActive = async (col: any) => {
    await adminService.updateCollection(col.id, { isActive: !col.isActive });
    setRefreshKey(k => k + 1);
  };

  const handleRemoveProduct = async (productId: string) => {
    if (!editing) return;
    await adminService.removeProductFromCollection(editing.id, productId);
    setCollectionProducts(p => p.filter((x: any) => x.id !== productId));
  };

  const fetchPickerProducts = useCallback(async (q: string) => {
    setPickerLoading(true);
    try {
      const params: any = { limit: 48, page: 1 };
      if (q.trim()) params.search = q.trim();
      const res: any = await productsService.getAll(params);
      setAllProducts(adaptApiProductList(res.data || []));
    } catch { setAllProducts([]); }
    finally { setPickerLoading(false); }
  }, []);

  const openPicker = async () => {
    setSelectedProductIds(new Set());
    setProductSearch('');
    setPickerOpen(true);
    await fetchPickerProducts('');
  };

  const handlePickerSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setProductSearch(q);
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => fetchPickerProducts(q), 300);
  };

  const handleAddSelected = async () => {
    if (!editing) return;
    for (const pid of selectedProductIds) {
      await adminService.addProductToCollection(editing.id, pid);
    }
    const r: any = await fetch(`${API}/collections/${editing.slug}?limit=48`).then(x => x.json());
    setCollectionProducts(adaptApiProductList(r.data?.products || []));
    setPickerOpen(false);
  };

  const f = (key: string, val: any) => setForm(prev => ({ ...prev, [key]: val }));
  // Filter out products already in the collection from picker results
  const filteredPicker = allProducts.filter(p =>
    !collectionProducts.find((cp: any) => cp.id === p.id)
  );

  const inputCls: React.CSSProperties = { width: '100%', padding: '10px 12px', border: '1px solid var(--border)', background: '#fff', fontSize: 13, outline: 'none', fontFamily: 'DM Sans, sans-serif', borderRadius: 2 };
  const labelCls: React.CSSProperties = { fontSize: 11, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--dust)', display: 'block', marginBottom: 6, fontWeight: 500 };

  return (
    <AdminGuard>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#F8F8F6' }}>
        <AdminSidebar />
        <main style={{ flex: 1, padding: '32px', overflow: 'auto' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 400, letterSpacing: '0.06em' }}>Collections</h1>
              <p style={{ fontSize: 12, color: 'var(--dust)', marginTop: 4 }}>{collections.length} collections</p>
            </div>
            <button onClick={openAdd}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'var(--black)', color: 'var(--cream)', border: 'none', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              <Plus size={14} /> Add Collection
            </button>
          </div>

          {/* Table */}
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: '#FAFAF8' }}>
                  {['Thumbnail', 'Name', 'Slug', 'Products', 'Active', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', fontSize: 10, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--dust)', textAlign: 'left', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: 'var(--dust)', fontSize: 13 }}>Loading…</td></tr>
                ) : collections.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: 'var(--dust)', fontSize: 13 }}>No collections yet. Add one.</td></tr>
                ) : collections.map(col => (
                  <tr key={col.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      {col.thumbnail
                        ? <img src={col.thumbnail} alt={col.name} style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }} />
                        : <div style={{ width: 50, height: 50, background: 'var(--raw-cotton)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 9, color: 'var(--dust)' }}>No img</span></div>
                      }
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 400 }}>{col.name}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--dust)', fontFamily: 'monospace' }}>{col.slug}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13 }}>{col._count?.products ?? 0}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <button onClick={() => handleToggleActive(col)}
                        style={{ padding: '4px 10px', background: col.isActive ? '#D1FAE5' : '#FEE2E2', color: col.isActive ? '#065F46' : '#991B1B', border: 'none', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', borderRadius: 12 }}>
                        {col.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => openEdit(col)} style={{ background: 'none', border: '1px solid var(--border)', padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontFamily: 'DM Sans, sans-serif', borderRadius: 2 }}>
                          <Edit2 size={12} /> Edit
                        </button>
                        <button onClick={() => handleDelete(col.id)} style={{ background: 'none', border: '1px solid #FEE2E2', padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#DC2626', fontFamily: 'DM Sans, sans-serif', borderRadius: 2 }}>
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Add / Edit Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: 600, maxHeight: '90vh', overflow: 'auto', borderRadius: 4, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 16, fontWeight: 500, letterSpacing: '0.04em' }}>{modal === 'add' ? 'Add Collection' : 'Edit Collection'}</h2>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}><X size={18} /></button>
            </div>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={labelCls}>Name *</label>
                <input style={inputCls} value={form.name} onChange={e => { f('name', e.target.value); if (!editing) f('slug', makeSlug(e.target.value)); }} placeholder="e.g. Summer Essentials" />
              </div>
              <div>
                <label style={labelCls}>Slug</label>
                <input style={inputCls} value={form.slug} onChange={e => f('slug', e.target.value)} placeholder="summer-essentials" />
              </div>
              <div>
                <label style={labelCls}>Description</label>
                <textarea style={{ ...inputCls, height: 80, resize: 'vertical' }} value={form.description} onChange={e => f('description', e.target.value)} placeholder="Optional description..." />
              </div>
              <div>
                <label style={labelCls}>Thumbnail</label>
                <ImageUploader
                  images={form.thumbnail ? [form.thumbnail] : []}
                  onChange={urls => f('thumbnail', urls[0] || '')}
                  maxImages={1}
                  minImages={0}
                />
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelCls}>Sort Order</label>
                  <input type="number" style={inputCls} value={form.sortOrder} onChange={e => f('sortOrder', parseInt(e.target.value) || 0)} min={0} />
                </div>
                <div>
                  <label style={labelCls}>Active</label>
                  <button onClick={() => f('isActive', !form.isActive)}
                    style={{ marginTop: 2, padding: '10px 16px', background: form.isActive ? '#D1FAE5' : '#FEE2E2', color: form.isActive ? '#065F46' : '#991B1B', border: 'none', fontSize: 12, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', borderRadius: 2, height: 40 }}>
                    {form.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>
              </div>

              {/* Products in collection — edit mode only */}
              {modal === 'edit' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <label style={{ ...labelCls, marginBottom: 0 }}>Products in Collection ({collectionProducts.length})</label>
                    <button onClick={openPicker}
                      style={{ padding: '6px 12px', background: 'var(--black)', color: 'var(--cream)', border: 'none', fontSize: 11, letterSpacing: '0.06em', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', borderRadius: 2 }}>
                      + Add Products
                    </button>
                  </div>
                  {collectionProducts.length === 0 ? (
                    <p style={{ fontSize: 12, color: 'var(--dust)', padding: '12px 0' }}>No products in this collection.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 200, overflowY: 'auto' }}>
                      {collectionProducts.map((p: any) => (
                        <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 2 }}>
                          <img src={p.images[0]} alt={p.name} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 2, flexShrink: 0 }} />
                          <span style={{ flex: 1, fontSize: 13 }}>{p.name}</span>
                          <button onClick={() => handleRemoveProduct(p.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--dust)', display: 'flex', padding: 4 }}>
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
              <button onClick={() => setModal(null)} style={{ flex: 1, height: 44, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: 12, letterSpacing: '0.06em', fontFamily: 'DM Sans, sans-serif', borderRadius: 2 }}>Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.name.trim()}
                style={{ flex: 2, height: 44, background: form.name.trim() ? 'var(--black)' : 'var(--border)', color: form.name.trim() ? 'var(--cream)' : 'var(--dust)', border: 'none', cursor: form.name.trim() ? 'pointer' : 'default', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500, fontFamily: 'DM Sans, sans-serif', borderRadius: 2 }}>
                {saving ? 'Saving…' : 'Save Collection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Picker Modal */}
      {pickerOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget) setPickerOpen(false); }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: 480, maxHeight: '80vh', borderRadius: 4, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 15, fontWeight: 500 }}>Add Products</h3>
              <button onClick={() => setPickerOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
            </div>
            <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 32, top: '50%', transform: 'translateY(-50%)', color: 'var(--dust)', pointerEvents: 'none' }} />
              <input
                autoFocus
                value={productSearch}
                onChange={handlePickerSearch}
                placeholder="Search products..."
                style={{ width: '100%', padding: '8px 12px 8px 36px', border: '1px solid var(--border)', borderRadius: 2, fontSize: 13, outline: 'none' }}
              />
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {pickerLoading ? (
                <p style={{ padding: 24, textAlign: 'center', fontSize: 13, color: 'var(--dust)' }}>Loading…</p>
              ) : filteredPicker.length === 0 ? (
                <p style={{ padding: 24, textAlign: 'center', fontSize: 13, color: 'var(--dust)' }}>
                  {productSearch.trim() ? `No products found for "${productSearch}"` : 'No products to add.'}
                </p>
              ) : filteredPicker.map((p: any) => (
                <div key={p.id}
                  onClick={() => setSelectedProductIds(prev => {
                    const n = new Set(prev);
                    n.has(p.id) ? n.delete(p.id) : n.add(p.id);
                    return n;
                  })}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', cursor: 'pointer', borderBottom: '1px solid var(--border)', background: selectedProductIds.has(p.id) ? '#F0FDF4' : 'transparent' }}>
                  <div style={{ width: 20, height: 20, border: `1px solid ${selectedProductIds.has(p.id) ? '#065F46' : 'var(--border)'}`, borderRadius: 2, background: selectedProductIds.has(p.id) ? '#065F46' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {selectedProductIds.has(p.id) && <Check size={11} color="#fff" />}
                  </div>
                  <img src={p.images[0]} alt={p.name} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 2, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13 }}>{p.name}</span>
                </div>
              ))}
              {!pickerLoading && filteredPicker.length > 0 && (
                <p style={{ padding: '10px 20px 14px', fontSize: 11, color: 'var(--dust)', textAlign: 'center' }}>
                  Showing {filteredPicker.length} products. Search to find more.
                </p>
              )}
            </div>
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
              <button onClick={() => setPickerOpen(false)} style={{ flex: 1, height: 40, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: 12, fontFamily: 'DM Sans, sans-serif', borderRadius: 2 }}>Cancel</button>
              <button onClick={handleAddSelected} disabled={selectedProductIds.size === 0}
                style={{ flex: 2, height: 40, background: selectedProductIds.size > 0 ? 'var(--black)' : 'var(--border)', color: selectedProductIds.size > 0 ? 'var(--cream)' : 'var(--dust)', border: 'none', cursor: selectedProductIds.size > 0 ? 'pointer' : 'default', fontSize: 12, letterSpacing: '0.08em', fontFamily: 'DM Sans, sans-serif', borderRadius: 2 }}>
                Add {selectedProductIds.size > 0 ? `(${selectedProductIds.size})` : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminGuard>
  );
}
