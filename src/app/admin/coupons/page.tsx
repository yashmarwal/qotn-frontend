'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, X } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import AdminGuard from '@/components/AdminGuard';
import { adminService } from '@/lib/services/admin.service';

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
const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: 'none',
  WebkitAppearance: 'none',
  cursor: 'pointer',
};

const emptyForm = {
  code: '',
  description: '',
  discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
  discountValue: '',
  minOrderValue: '',
  maxDiscount: '',
  usageLimit: '',
  perUserLimit: '1',
  isActive: true,
  expiresAt: '',
};

function formatInr(paise: number | null | undefined) {
  if (paise == null) return '—';
  return `₹${(paise / 100).toLocaleString('en-IN')}`;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCoupon, setEditCoupon] = useState<any>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchCoupons = () => {
    adminService.getCoupons()
      .then((res: any) => setCoupons(Array.isArray(res.data) ? res.data : []))
      .catch(console.error);
  };

  useEffect(() => { fetchCoupons(); }, []);

  const openCreate = () => {
    setEditCoupon(null);
    setForm({ ...emptyForm });
    setModalOpen(true);
  };

  const openEdit = (coupon: any) => {
    setEditCoupon(coupon);
    setForm({
      code: coupon.code ?? '',
      description: coupon.description ?? '',
      discountType: coupon.discountType ?? 'PERCENTAGE',
      discountValue: coupon.discountType === 'FIXED'
        ? String((coupon.discountValue ?? 0) / 100)
        : String(coupon.discountValue ?? ''),
      minOrderValue: coupon.minOrderValue != null ? String(coupon.minOrderValue / 100) : '',
      maxDiscount: coupon.maxDiscount != null ? String(coupon.maxDiscount / 100) : '',
      usageLimit: coupon.usageLimit != null ? String(coupon.usageLimit) : '',
      perUserLimit: coupon.perUserLimit != null ? String(coupon.perUserLimit) : '1',
      isActive: coupon.isActive ?? true,
      expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 10) : '',
    });
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditCoupon(null); };

  const buildPayload = () => {
    const isFixed = form.discountType === 'FIXED';
    const payload: Record<string, any> = {
      code: form.code.toUpperCase().trim(),
      description: form.description || undefined,
      discountType: form.discountType,
      discountValue: isFixed
        ? Math.round(parseFloat(form.discountValue || '0') * 100)
        : parseInt(form.discountValue || '0', 10),
      isActive: form.isActive,
      perUserLimit: form.perUserLimit ? parseInt(form.perUserLimit, 10) : 1,
    };
    if (form.minOrderValue) payload.minOrderValue = Math.round(parseFloat(form.minOrderValue) * 100);
    if (form.maxDiscount && form.discountType === 'PERCENTAGE') {
      payload.maxDiscount = Math.round(parseFloat(form.maxDiscount) * 100);
    }
    if (form.usageLimit) payload.usageLimit = parseInt(form.usageLimit, 10);
    if (form.expiresAt) payload.expiresAt = new Date(form.expiresAt).toISOString();
    return payload;
  };

  const handleSave = async () => {
    if (!form.code || !form.discountValue) { showToast('Code and discount value are required'); return; }
    setSaving(true);
    try {
      if (editCoupon) {
        await adminService.updateCoupon(editCoupon.id, buildPayload());
        showToast('Coupon updated');
      } else {
        await adminService.createCoupon(buildPayload());
        showToast('Coupon created');
      }
      closeModal();
      fetchCoupons();
    } catch {
      showToast('Failed to save coupon');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    try {
      await adminService.deleteCoupon(id);
      showToast('Coupon deleted');
      fetchCoupons();
    } catch {
      showToast('Failed to delete');
    }
  };

  const handleToggleActive = async (coupon: any) => {
    try {
      await adminService.updateCoupon(coupon.id, { isActive: !coupon.isActive });
      fetchCoupons();
    } catch {
      showToast('Failed to update');
    }
  };

  const f = (key: keyof typeof form, val: any) => setForm(p => ({ ...p, [key]: val }));

  return (
    <AdminGuard>
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--cream)' }}>
        <AdminSidebar />

        <main style={{ flex: 1, padding: '40px 40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 300, letterSpacing: '0.06em', color: 'var(--black)', marginBottom: 4 }}>
                OFFERS & COUPONS
              </h1>
              <p style={{ fontSize: 13, color: 'var(--dust)' }}>{coupons.length} coupons</p>
            </div>
            <button
              onClick={openCreate}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--black)', color: 'var(--cream)', border: 'none', padding: '10px 20px', fontSize: 12, letterSpacing: '0.08em', cursor: 'pointer' }}
            >
              <Plus size={14} /> NEW COUPON
            </button>
          </div>

          {/* Table */}
          <div style={{ background: '#fff', border: '1px solid var(--border)', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', background: 'var(--cream)' }}>
                  {['Code', 'Type', 'Discount', 'Min Order', 'Max Disc', 'Usage', 'Per User', 'Expires', 'Active', ''].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--dust)', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {coupons.length === 0 && (
                  <tr><td colSpan={10} style={{ padding: 40, textAlign: 'center', color: 'var(--dust)' }}>No coupons yet</td></tr>
                )}
                {coupons.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 600, fontFamily: 'monospace', letterSpacing: '0.05em' }}>{c.code}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--dust)' }}>{c.discountType}</td>
                    <td style={{ padding: '14px 16px' }}>
                      {c.discountType === 'PERCENTAGE'
                        ? `${c.discountValue}%`
                        : formatInr(c.discountValue)}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--dust)' }}>{formatInr(c.minOrderValue)}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--dust)' }}>
                      {c.discountType === 'PERCENTAGE' ? formatInr(c.maxDiscount) : '—'}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--dust)' }}>
                      {c.usageCount ?? 0}{c.usageLimit != null ? ` / ${c.usageLimit}` : ''}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--dust)' }}>{c.perUserLimit ?? 1}x</td>
                    <td style={{ padding: '14px 16px', color: 'var(--dust)', fontSize: 12 }}>
                      {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <button
                        onClick={() => handleToggleActive(c)}
                        style={{
                          padding: '4px 10px', fontSize: 11, border: 'none', cursor: 'pointer', borderRadius: 2,
                          background: c.isActive ? '#D1FAE5' : '#FEE2E2',
                          color: c.isActive ? '#065F46' : '#991B1B',
                          fontWeight: 600,
                        }}
                      >
                        {c.isActive ? 'Active' : 'Off'}
                      </button>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => openEdit(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--dust)', padding: 4 }}>
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDelete(c.id, c.code)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: 4 }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>

        {/* Modal */}
        {modalOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div style={{ background: '#fff', width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', padding: 32, position: 'relative' }}>
              <button onClick={closeModal} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
              <h2 style={{ fontSize: 15, fontWeight: 500, letterSpacing: '0.06em', marginBottom: 24 }}>
                {editCoupon ? 'EDIT COUPON' : 'NEW COUPON'}
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Code */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Coupon Code *</label>
                  <input
                    style={{ ...inputStyle, textTransform: 'uppercase', fontFamily: 'monospace', letterSpacing: '0.08em' }}
                    value={form.code} placeholder="e.g. SAVE20"
                    onChange={e => f('code', e.target.value.toUpperCase())}
                    disabled={!!editCoupon}
                  />
                </div>

                {/* Description */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Description</label>
                  <input style={inputStyle} value={form.description} placeholder="e.g. 20% off on all orders"
                    onChange={e => f('description', e.target.value)} />
                </div>

                {/* Discount Type */}
                <div>
                  <label style={labelStyle}>Discount Type *</label>
                  <select style={selectStyle} value={form.discountType}
                    onChange={e => f('discountType', e.target.value as 'PERCENTAGE' | 'FIXED')}>
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (₹)</option>
                  </select>
                </div>

                {/* Discount Value */}
                <div>
                  <label style={labelStyle}>
                    {form.discountType === 'PERCENTAGE' ? 'Discount %' : 'Discount ₹'} *
                  </label>
                  <input style={inputStyle} type="number" min="0"
                    value={form.discountValue} placeholder={form.discountType === 'PERCENTAGE' ? '20' : '100'}
                    onChange={e => f('discountValue', e.target.value)} />
                </div>

                {/* Min Order */}
                <div>
                  <label style={labelStyle}>Min Order Value (₹)</label>
                  <input style={inputStyle} type="number" min="0" value={form.minOrderValue} placeholder="e.g. 500"
                    onChange={e => f('minOrderValue', e.target.value)} />
                </div>

                {/* Max Discount — only for percentage */}
                {form.discountType === 'PERCENTAGE' && (
                  <div>
                    <label style={labelStyle}>Max Discount Cap (₹)</label>
                    <input style={inputStyle} type="number" min="0" value={form.maxDiscount} placeholder="e.g. 300"
                      onChange={e => f('maxDiscount', e.target.value)} />
                  </div>
                )}

                {/* Usage Limit */}
                <div>
                  <label style={labelStyle}>Total Usage Limit</label>
                  <input style={inputStyle} type="number" min="1" value={form.usageLimit} placeholder="Leave blank for unlimited"
                    onChange={e => f('usageLimit', e.target.value)} />
                </div>

                {/* Per User Limit */}
                <div>
                  <label style={labelStyle}>Uses Per Customer</label>
                  <input style={inputStyle} type="number" min="1" value={form.perUserLimit} placeholder="1"
                    onChange={e => f('perUserLimit', e.target.value)} />
                </div>

                {/* Expires At */}
                <div>
                  <label style={labelStyle}>Expiry Date</label>
                  <input style={inputStyle} type="date" value={form.expiresAt}
                    onChange={e => f('expiresAt', e.target.value)} />
                </div>

                {/* Active */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 24 }}>
                  <input type="checkbox" id="isActive" checked={form.isActive}
                    onChange={e => f('isActive', e.target.checked)}
                    style={{ width: 16, height: 16, cursor: 'pointer' }} />
                  <label htmlFor="isActive" style={{ fontSize: 13, cursor: 'pointer' }}>Active</label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 28, justifyContent: 'flex-end' }}>
                <button onClick={closeModal}
                  style={{ padding: '10px 24px', background: 'none', border: '1px solid var(--border)', fontSize: 12, cursor: 'pointer', letterSpacing: '0.06em' }}>
                  CANCEL
                </button>
                <button onClick={handleSave} disabled={saving}
                  style={{ padding: '10px 28px', background: 'var(--black)', color: 'var(--cream)', border: 'none', fontSize: 12, cursor: 'pointer', letterSpacing: '0.08em', opacity: saving ? 0.6 : 1 }}>
                  {saving ? 'SAVING...' : 'SAVE'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div style={{ position: 'fixed', bottom: 24, right: 24, background: 'var(--black)', color: 'var(--cream)', padding: '12px 20px', fontSize: 13, zIndex: 2000 }}>
            {toast}
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
