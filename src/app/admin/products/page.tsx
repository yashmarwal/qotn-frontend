'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Search, Edit, Trash2, X, RefreshCw, ChevronDown } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import AdminGuard from '@/components/AdminGuard';
import ImageUploader from '@/components/admin/ImageUploader';
import { adminService } from '@/lib/services/admin.service';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

const ADULT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
const KIDS_SIZES = ['0-6M', '6-12M', '1-2Y', '2-3Y', '3-4Y', '4-5Y', '5-6Y', '6-7Y', '7-8Y', '8-9Y', '9-10Y'];
const GENDERS = ['MEN', 'WOMEN', 'KIDS', 'UNISEX'];

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', border: '1px solid var(--border)',
  background: 'var(--cream)', fontSize: 13, outline: 'none',
  color: 'var(--black)', fontFamily: 'DM Sans, sans-serif', height: 44,
};
const textareaStyle: React.CSSProperties = {
  ...inputStyle, height: 'auto', minHeight: 80, resize: 'vertical' as const,
};
const labelStyle: React.CSSProperties = {
  fontSize: 11, letterSpacing: '0.10em', textTransform: 'uppercase' as const,
  color: 'var(--dust)', display: 'block', marginBottom: 6, fontWeight: 500,
};

const emptyForm = {
  name: '', slug: '', description: '',
  fabric: '100% Pure Cotton', care: 'Machine wash cold. Do not tumble dry.',
  price: '', originalPrice: '', category: '', gender: 'UNISEX',
  isNew: false, isBestseller: false, isFeatured: false, isActive: true,
  images: [] as string[],
};

type FormState = typeof emptyForm;

function makeSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function AdminProductsPage() {
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [form, setForm] = useState<FormState>({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState('');
  const [variantPreviewOpen, setVariantPreviewOpen] = useState(false);

  // Size/Color state (outside form)
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [sizeStocks, setSizeStocks] = useState<Record<string, number>>({});
  const [colors, setColors] = useState<{ name: string; hex: string }[]>([{ name: 'White', hex: '#FFFFFF' }]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchProducts = () => {
    setLoading(true);
    api.get<{ data: any[] }>('/products?limit=48&page=1')
      .then((res: any) => { setProducts(res.data || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, [refreshKey]);

  useEffect(() => {
    adminService.getCategories()
      .then((res: any) => setCategories(res.data || []))
      .catch(() => {});
  }, []);

  const sizePills = form.gender === 'KIDS' ? KIDS_SIZES : ADULT_SIZES;

  const buildVariants = () => {
    if (!form.price || selectedSizes.length === 0) return [];
    const pricePaise = Math.round(parseFloat(form.price) * 100);
    const origPaise = form.originalPrice ? Math.round(parseFloat(form.originalPrice) * 100) : undefined;
    const slugBase = form.slug.trim() || makeSlug(form.name);
    const variants: any[] = [];
    for (const col of colors.filter(c => c.name.trim())) {
      for (const size of selectedSizes) {
        variants.push({
          size,
          color: col.name,
          colorHex: col.hex,
          price: pricePaise,
          ...(origPaise ? { originalPrice: origPaise } : {}),
          sku: `${slugBase}-${col.name.toLowerCase().replace(/\s+/g, '-')}-${size.toLowerCase()}`,
          stock: sizeStocks[size] ?? 0,
        });
      }
    }
    return variants;
  };

  const filtered = products.filter(p => {
    const matchSearch = (p.name ?? '').toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat ? (p.category?.slug ?? '').toLowerCase() === filterCat.toLowerCase() : true;
    return matchSearch && matchCat;
  });

  const openAdd = () => {
    setEditProduct(null);
    setForm({ ...emptyForm });
    setSelectedSizes([]);
    setSizeStocks({});
    setColors([{ name: 'White', hex: '#FFFFFF' }]);
    setFormError('');
    setVariantPreviewOpen(false);
    setModalOpen(true);
  };

  const openEdit = (p: any) => {
    setEditProduct(p);
    const rawImages: string[] = (p.images ?? []).map((img: any) =>
      typeof img === 'string' ? img : img?.url ?? '').filter(Boolean);

    const variants = p.variants ?? [];
    const sizesFromVariants = [...new Set<string>(variants.map((v: any) => v.size).filter(Boolean))];
    const colorNames = [...new Set<string>(variants.map((v: any) => v.color).filter(Boolean))];
    const stocksBySize: Record<string, number> = {};
    for (const v of variants) {
      if (v.size && (stocksBySize[v.size] === undefined || v.stock > stocksBySize[v.size])) {
        stocksBySize[v.size] = v.stock ?? 0;
      }
    }
    const colorsForState = colorNames.map(colorName => {
      const v = variants.find((vv: any) => vv.color === colorName);
      return { name: colorName, hex: v?.colorHex ?? '#CCCCCC' };
    });

    const firstVariant = variants[0];
    const priceVal = firstVariant?.price ?? p.price ?? 0;
    const origVal = firstVariant?.originalPrice ?? p.originalPrice ?? 0;

    setForm({
      name: p.name ?? '',
      slug: p.slug ?? '',
      description: p.description ?? '',
      fabric: p.fabric ?? '100% Pure Cotton',
      care: p.care ?? '',
      price: priceVal ? String(priceVal / 100) : '',
      originalPrice: origVal ? String(origVal / 100) : '',
      category: p.category?.slug ?? '',
      gender: p.gender ?? 'UNISEX',
      isNew: p.isNew ?? false,
      isBestseller: p.isBestseller ?? false,
      isFeatured: p.isFeatured ?? false,
      isActive: p.isActive !== false,
      images: rawImages,
    });
    setSelectedSizes(sizesFromVariants);
    setSizeStocks(stocksBySize);
    setColors(colorsForState.length > 0 ? colorsForState : [{ name: 'White', hex: '#FFFFFF' }]);
    setFormError('');
    setVariantPreviewOpen(false);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      await adminService.deleteProduct(id);
      setRefreshKey(k => k + 1);
      showToast('Product deleted');
    } catch (err: any) {
      showToast(err.message || 'Delete failed');
    }
  };

  const handleSave = async () => {
    setFormError('');
    if (!form.name.trim()) { setFormError('Product name is required.'); return; }
    if (!form.category) { setFormError('Category is required.'); return; }
    if (!form.price || isNaN(Number(form.price))) { setFormError('Valid price is required.'); return; }
    if (form.images.length < 1) { setFormError('Upload at least one image.'); return; }
    if (selectedSizes.length === 0) { setFormError('Select at least one size.'); return; }
    if (colors.filter(c => c.name.trim()).length === 0) { setFormError('Add at least one color.'); return; }

    setSaving(true);
    try {
      const variants = buildVariants();
      const payload: any = {
        name: form.name.trim(),
        slug: form.slug.trim() || makeSlug(form.name),
        description: form.description.trim(),
        fabric: form.fabric.trim() || '100% Pure Cotton',
        care: form.care.trim(),
        category: form.category,
        gender: form.gender,
        price: Math.round(parseFloat(form.price) * 100),
        ...(form.originalPrice ? { originalPrice: Math.round(parseFloat(form.originalPrice) * 100) } : {}),
        isNew: form.isNew,
        isBestseller: form.isBestseller,
        isFeatured: form.isFeatured,
        isActive: form.isActive,
        images: form.images,
        variants,
      };

      if (editProduct) {
        await adminService.updateProduct(editProduct.id, payload);
        showToast('Product updated');
      } else {
        await adminService.createProduct(payload);
        showToast('Product created');
      }
      setModalOpen(false);
      setRefreshKey(k => k + 1);
    } catch (err: any) {
      setFormError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const previewVariants = buildVariants();

  return (
    <AdminGuard>
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F7F5F2' }}>
        <AdminSidebar />

        <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
          {toast && (
            <div style={{ position: 'fixed', top: 24, right: 24, background: '#1A1A1A', color: '#F5F0E8', padding: '12px 24px', fontSize: 13, zIndex: 9999, boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
              {toast}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
            <h1 style={{ fontSize: 22, fontWeight: 400, letterSpacing: '0.04em' }}>Products</h1>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setRefreshKey(k => k + 1)} title="Refresh" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', background: 'transparent', border: '1px solid var(--border)', fontSize: 12, cursor: 'pointer', color: 'var(--dust)' }}>
                <RefreshCw size={13} strokeWidth={1.5} />
              </button>
              <button onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'var(--black)', color: 'var(--cream)', border: 'none', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 500 }}>
                <Plus size={14} /> Add Product
              </button>
            </div>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--dust)', pointerEvents: 'none' }} />
              <input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputStyle, paddingLeft: 36 }} />
            </div>
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ ...inputStyle, width: 'auto', cursor: 'pointer' }}>
              <option value="">All Categories</option>
              {categories.map((c: any) => <option key={c.id} value={c.slug}>{c.name}</option>)}
              {categories.length === 0 && <>
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="kids">Kids</option>
              </>}
            </select>
          </div>

          {/* Table */}
          <div style={{ background: 'var(--cream)', border: '1px solid var(--border)', opacity: loading ? 0.6 : 1 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: '#F0EDE8' }}>
                  {['', 'Product', 'ID', 'Category', 'Price', 'Variants', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--dust)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--dust)', fontSize: 13 }}>
                    {loading ? 'Loading...' : 'No products yet.'}
                  </td></tr>
                ) : filtered.map(product => {
                  const variantCount = product._count?.variants ?? product.variants?.length ?? 0;
                  const categoryName = product.category?.name ?? product.category ?? '—';
                  const firstImage = product.images?.[0]?.url ?? product.images?.[0] ?? null;
                  const priceValue = product.variants?.[0]?.price ?? product.price ?? 0;
                  const isActive = product.isActive !== false;
                  return (
                    <tr key={product.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 16px', width: 56 }}>
                        <div style={{ position: 'relative', width: 40, height: 52, background: 'var(--raw-cotton)' }}>
                          {firstImage
                            ? <Image src={firstImage} alt={product.name} fill style={{ objectFit: 'cover' }} />
                            : <div style={{ width: '100%', height: '100%', background: '#E5E0DA' }} />}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <p style={{ fontWeight: 500 }}>{product.name}</p>
                        <p style={{ fontSize: 11, color: 'var(--dust)', marginTop: 2 }}>{product.slug}</p>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <p style={{ fontSize: 10, color: 'var(--dust)', fontFamily: 'monospace' }}>{product.id?.slice(0, 8)}…</p>
                      </td>
                      <td style={{ padding: '12px 16px', textTransform: 'capitalize', color: 'var(--dust)' }}>{categoryName}</td>
                      <td style={{ padding: '12px 16px' }}><p style={{ fontWeight: 500 }}>{formatPrice(priceValue)}</p></td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ color: variantCount < 3 ? '#B45309' : 'var(--black)' }}>{variantCount} variant{variantCount !== 1 ? 's' : ''}</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: 10, padding: '3px 10px', background: isActive ? '#D1FAE5' : '#F0EDE8', color: isActive ? '#065F46' : 'var(--dust)', fontWeight: 600, letterSpacing: '0.06em' }}>
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => openEdit(product)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--dust)', padding: 4 }}><Edit size={14} strokeWidth={1.5} /></button>
                          <button onClick={() => handleDelete(product.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: 4 }}><Trash2 size={14} strokeWidth={1.5} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </main>

        {/* Add / Edit Modal */}
        {modalOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px', overflowY: 'auto' }} onClick={() => setModalOpen(false)}>
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,26,26,0.55)' }} />
            <div style={{ position: 'relative', background: 'var(--cream)', width: '100%', maxWidth: 760, padding: 40, zIndex: 1, margin: 'auto' }} onClick={e => e.stopPropagation()}>
              {/* Modal header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                <h2 style={{ fontSize: 14, letterSpacing: '0.10em', textTransform: 'uppercase', fontWeight: 500 }}>
                  {editProduct ? 'Edit Product' : 'Add Product'}
                </h2>
                <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} strokeWidth={1.5} /></button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* Row: Name + Slug */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Product Name *</label>
                    <input style={inputStyle} value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: f.slug || makeSlug(e.target.value) }))}
                      placeholder="Pure Cotton Kurta" />
                  </div>
                  <div>
                    <label style={labelStyle}>Slug</label>
                    <input style={inputStyle} value={form.slug}
                      onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                      placeholder="pure-cotton-kurta" />
                  </div>
                </div>

                {/* Row: Category + Gender */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Category *</label>
                    <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.category}
                      onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                      <option value="">Select category</option>
                      {categories.map((c: any) => <option key={c.id} value={c.slug}>{c.name}</option>)}
                      {categories.length === 0 && <>
                        <option value="men">Men</option>
                        <option value="women">Women</option>
                        <option value="kids">Kids</option>
                      </>}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Gender</label>
                    <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.gender}
                      onChange={e => {
                        setForm(f => ({ ...f, gender: e.target.value }));
                        setSelectedSizes([]);
                      }}>
                      {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Base Price (₹) *</label>
                    <input type="number" style={inputStyle} value={form.price}
                      onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                      placeholder="999" min="0" step="1" />
                  </div>
                </div>

                {/* Row: Original Price */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Original Price (₹) <span style={{ color: 'var(--dust)', fontWeight: 400 }}>optional</span></label>
                    <input type="number" style={inputStyle} value={form.originalPrice}
                      onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value }))}
                      placeholder="1299" min="0" step="1" />
                  </div>
                  <div>
                    <label style={labelStyle}>Fabric</label>
                    <input style={inputStyle} value={form.fabric}
                      onChange={e => setForm(f => ({ ...f, fabric: e.target.value }))}
                      placeholder="100% Pure Cotton" />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label style={labelStyle}>Description</label>
                  <textarea style={textareaStyle} value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="A breathable pure cotton kurta..." />
                </div>

                {/* Care instructions */}
                <div>
                  <label style={labelStyle}>Care Instructions</label>
                  <input style={inputStyle} value={form.care}
                    onChange={e => setForm(f => ({ ...f, care: e.target.value }))}
                    placeholder="Machine wash cold. Do not tumble dry." />
                </div>

                {/* Sizes */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <label style={{ ...labelStyle, margin: 0 }}>Sizes * ({form.gender === 'KIDS' ? 'Kids' : 'Adult'})</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="button" onClick={() => setSelectedSizes([...sizePills])}
                        style={{ fontSize: 11, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--black)', textDecoration: 'underline' }}>
                        Select All
                      </button>
                      <button type="button" onClick={() => setSelectedSizes([])}
                        style={{ fontSize: 11, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--dust)', textDecoration: 'underline' }}>
                        Clear
                      </button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {sizePills.map(size => {
                      const sel = selectedSizes.includes(size);
                      return (
                        <button key={size} type="button"
                          onClick={() => setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size])}
                          style={{ padding: '7px 14px', fontSize: 12, border: `1px solid ${sel ? '#1A1A1A' : 'var(--border)'}`, background: sel ? '#1A1A1A' : 'var(--cream)', color: sel ? '#F5F0E8' : '#1A1A1A', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: sel ? 500 : 400, transition: 'all 0.12s' }}>
                          {size}
                        </button>
                      );
                    })}
                  </div>

                  {/* Stock per size */}
                  {selectedSizes.length > 0 && (
                    <div style={{ marginTop: 12, border: '1px solid var(--border)' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                        <thead>
                          <tr style={{ background: '#F0EDE8', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 500, letterSpacing: '0.06em', fontSize: 11 }}>SIZE</th>
                            <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 500, letterSpacing: '0.06em', fontSize: 11 }}>STOCK QTY</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedSizes.map(size => (
                            <tr key={size} style={{ borderBottom: '1px solid var(--border)' }}>
                              <td style={{ padding: '6px 12px', fontWeight: 500 }}>{size}</td>
                              <td style={{ padding: '4px 12px' }}>
                                <input type="number" min="0" value={sizeStocks[size] ?? 0}
                                  onChange={e => setSizeStocks(p => ({ ...p, [size]: parseInt(e.target.value) || 0 }))}
                                  style={{ width: 80, padding: '5px 8px', border: '1px solid var(--border)', background: 'var(--cream)', fontSize: 12, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Colors */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <label style={{ ...labelStyle, margin: 0 }}>Colors *</label>
                    <button type="button"
                      onClick={() => setColors(c => [...c, { name: '', hex: '#CCCCCC' }])}
                      style={{ fontSize: 11, background: 'none', border: '1px solid var(--border)', cursor: 'pointer', padding: '4px 10px', color: 'var(--black)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Plus size={11} /> Add Color
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {colors.map((col, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input type="color" value={col.hex}
                          onChange={e => setColors(c => c.map((x, idx) => idx === i ? { ...x, hex: e.target.value } : x))}
                          style={{ width: 40, height: 40, border: '1px solid var(--border)', padding: 2, background: 'var(--cream)', cursor: 'pointer', flexShrink: 0 }} />
                        <input placeholder="Color name (e.g. White)" value={col.name}
                          onChange={e => setColors(c => c.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))}
                          style={{ ...inputStyle, flex: 1 }} />
                        {colors.length > 1 && (
                          <button type="button" onClick={() => setColors(c => c.filter((_, idx) => idx !== i))}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: 4, flexShrink: 0 }}>
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Variant Preview */}
                {previewVariants.length > 0 && (
                  <div style={{ border: '1px solid var(--border)' }}>
                    <button type="button" onClick={() => setVariantPreviewOpen(o => !o)}
                      style={{ width: '100%', padding: '10px 14px', background: '#F0EDE8', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.06em', fontWeight: 500 }}>
                      This will create {previewVariants.length} variant{previewVariants.length !== 1 ? 's' : ''}
                      <ChevronDown size={13} style={{ transform: variantPreviewOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </button>
                    {variantPreviewOpen && (
                      <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                          <thead>
                            <tr style={{ background: '#F9F8F6' }}>
                              {['Size', 'Color', 'Price', 'Stock', 'SKU'].map(h => (
                                <th key={h} style={{ padding: '6px 12px', textAlign: 'left', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--dust)', fontWeight: 500 }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {previewVariants.map((v, i) => (
                              <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                                <td style={{ padding: '5px 12px' }}>{v.size}</td>
                                <td style={{ padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span style={{ width: 12, height: 12, borderRadius: '50%', background: v.colorHex, border: '1px solid var(--border)', display: 'inline-block', flexShrink: 0 }} />
                                  {v.color}
                                </td>
                                <td style={{ padding: '5px 12px' }}>₹{(v.price / 100).toLocaleString('en-IN')}</td>
                                <td style={{ padding: '5px 12px' }}>{v.stock}</td>
                                <td style={{ padding: '5px 12px', color: 'var(--dust)', fontFamily: 'monospace', fontSize: 11 }}>{v.sku}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Images */}
                <div>
                  <label style={labelStyle}>Product Images (min 3, max 6)</label>
                  <ImageUploader images={form.images} onChange={urls => setForm(f => ({ ...f, images: urls }))} maxImages={6} minImages={3} />
                </div>

                {/* Flags */}
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                  {[
                    { key: 'isNew', label: 'New Arrival' },
                    { key: 'isBestseller', label: 'Bestseller' },
                    { key: 'isFeatured', label: 'Featured' },
                    { key: 'isActive', label: 'Active' },
                  ].map(({ key, label }) => (
                    <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                      <input type="checkbox" checked={(form as any)[key]}
                        onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))}
                        style={{ accentColor: 'var(--black)', width: 16, height: 16 }} />
                      {label}
                    </label>
                  ))}
                </div>

                {formError && (
                  <p style={{ fontSize: 12, color: '#DC2626', background: '#FEF2F2', padding: '8px 12px' }}>
                    {formError}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
                <button onClick={() => setModalOpen(false)}
                  style={{ padding: '13px 20px', background: 'transparent', border: '1px solid var(--border)', fontSize: 12, letterSpacing: '0.08em', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  style={{ flex: 1, padding: '13px', background: 'var(--black)', color: 'var(--cream)', border: 'none', fontSize: 12, letterSpacing: '0.10em', textTransform: 'uppercase', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 500, opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Saving...' : editProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
