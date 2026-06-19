'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { usersService } from '@/lib/services/users.service';
import { ChevronLeft, Plus, Trash2, MapPin, Check } from 'lucide-react';

type Address = {
  id: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
};

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand',
  'West Bengal','Delhi','Puducherry','Chandigarh','Jammu and Kashmir','Ladakh',
];

const EMPTY_FORM = { name: '', phone: '', street: '', city: '', state: 'Rajasthan', pincode: '' };

export default function AddressesPage() {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [fetching, setFetching] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/account');
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    usersService.getAddresses()
      .then((res: any) => setAddresses(res.data?.data || res.data || []))
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [isAuthenticated]);

  const openAdd = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (addr: Address) => {
    setEditId(addr.id);
    setForm({ name: addr.name, phone: addr.phone, street: addr.street, city: addr.city, state: addr.state, pincode: addr.pincode });
    setFormError('');
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await usersService.deleteAddress(id);
      setAddresses(a => a.filter(x => x.id !== id));
    } catch {}
  };

  const handleSetDefault = async (id: string) => {
    try {
      await usersService.setDefaultAddress(id);
      setAddresses(a => a.map(x => ({ ...x, isDefault: x.id === id })));
    } catch {}
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.phone.trim() || !form.street.trim() || !form.city.trim() || !form.pincode.trim()) {
      setFormError('Please fill in all fields.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      if (editId) {
        const res = await usersService.updateAddress(editId, form);
        const updated = res.data?.data || res.data;
        setAddresses(a => a.map(x => x.id === editId ? { ...x, ...updated } : x));
      } else {
        const res = await usersService.createAddress(form);
        const created = res.data?.data || res.data;
        setAddresses(a => [...a, created]);
      }
      setShowForm(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save address. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const label: React.CSSProperties = {
    fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9E9987',
    display: 'block', marginBottom: 8, fontWeight: 500,
  };
  const input: React.CSSProperties = {
    width: '100%', padding: '10px 0', background: 'transparent', border: 'none',
    borderBottom: '1px solid rgba(26,26,26,0.18)', fontSize: 14, color: '#1A1A1A',
    outline: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F5F0E8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.4, repeat: Infinity }}>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, letterSpacing: '0.14em', color: '#9E9987', textTransform: 'uppercase' }}>Loading</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: 'easeOut' }}
      style={{ minHeight: '100vh', background: '#F5F0E8', fontFamily: 'DM Sans, sans-serif', padding: 'clamp(48px,8vw,80px) 24px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>

        <button onClick={() => router.back()}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', padding: 0, cursor: 'pointer', marginBottom: 36, color: '#9E9987', fontSize: 12, letterSpacing: '0.08em', fontFamily: 'DM Sans, sans-serif' }}>
          <ChevronLeft size={14} strokeWidth={1.5} /> Back
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 44 }}>
          <div>
            <p style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9E9987', marginBottom: 12 }}>My Account</p>
            <h1 style={{ fontSize: 28, fontWeight: 300, color: '#1A1A1A', letterSpacing: '-0.01em' }}>Saved Addresses</h1>
          </div>
          {!showForm && (
            <button onClick={openAdd}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid rgba(26,26,26,0.2)', padding: '10px 18px', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1A1A1A', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'border-color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#1A1A1A')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(26,26,26,0.2)')}>
              <Plus size={11} strokeWidth={2} /> Add New
            </button>
          )}
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              style={{ background: 'rgba(26,26,26,0.04)', padding: '28px 28px 24px', marginBottom: 32 }}>
              <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1A1A1A', marginBottom: 28, fontWeight: 500 }}>
                {editId ? 'Edit Address' : 'New Address'}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                <div>
                  <label style={label}>Full Name</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={input}
                    onFocus={e => (e.target.style.borderBottomColor = '#1A1A1A')}
                    onBlur={e => (e.target.style.borderBottomColor = 'rgba(26,26,26,0.18)')} />
                </div>
                <div>
                  <label style={label}>Phone</label>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} type="tel" style={input}
                    onFocus={e => (e.target.style.borderBottomColor = '#1A1A1A')}
                    onBlur={e => (e.target.style.borderBottomColor = 'rgba(26,26,26,0.18)')} />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={label}>Street / Area</label>
                <input value={form.street} onChange={e => setForm(f => ({ ...f, street: e.target.value }))}
                  placeholder="House no., building, street, area" style={input}
                  onFocus={e => (e.target.style.borderBottomColor = '#1A1A1A')}
                  onBlur={e => (e.target.style.borderBottomColor = 'rgba(26,26,26,0.18)')} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px', gap: 20, marginBottom: 24 }}>
                <div>
                  <label style={label}>City</label>
                  <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} style={input}
                    onFocus={e => (e.target.style.borderBottomColor = '#1A1A1A')}
                    onBlur={e => (e.target.style.borderBottomColor = 'rgba(26,26,26,0.18)')} />
                </div>
                <div>
                  <label style={label}>State</label>
                  <select value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                    style={{ ...input, cursor: 'pointer', appearance: 'none' as any }}>
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={label}>Pincode</label>
                  <input value={form.pincode} onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))} maxLength={6} style={input}
                    onFocus={e => (e.target.style.borderBottomColor = '#1A1A1A')}
                    onBlur={e => (e.target.style.borderBottomColor = 'rgba(26,26,26,0.18)')} />
                </div>
              </div>

              {formError && (
                <p style={{ fontSize: 12, color: '#991B1B', marginBottom: 16 }}>{formError}</p>
              )}

              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={handleSave} disabled={saving}
                  style={{ flex: 1, padding: '14px', background: saving ? '#C8C3BA' : '#1A1A1A', color: '#F5F0E8', border: 'none', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 500, transition: 'background 0.2s' }}>
                  {saving ? 'Saving…' : editId ? 'Update Address' : 'Save Address'}
                </button>
                <button onClick={() => setShowForm(false)}
                  style={{ padding: '14px 20px', background: 'none', border: '1px solid rgba(26,26,26,0.2)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9E9987', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {fetching ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2].map(i => (
              <motion.div key={i} animate={{ opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
                style={{ height: 108, background: 'rgba(26,26,26,0.05)' }} />
            ))}
          </div>
        ) : addresses.length === 0 && !showForm ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
            style={{ textAlign: 'center', padding: '80px 0' }}>
            <MapPin size={36} strokeWidth={1} color="#C8C3BA" style={{ display: 'block', margin: '0 auto 24px' }} />
            <p style={{ fontSize: 18, fontWeight: 300, color: '#1A1A1A', marginBottom: 8, letterSpacing: '-0.01em' }}>No saved addresses.</p>
            <p style={{ fontSize: 13, color: '#9E9987', marginBottom: 36, lineHeight: 1.7 }}>Add an address to speed up checkout.</p>
            <button onClick={openAdd}
              style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1A1A1A', background: 'none', border: '1px solid rgba(26,26,26,0.2)', padding: '13px 28px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              Add Address
            </button>
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {addresses.map((addr, idx) => (
              <motion.div key={addr.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: idx * 0.06 }}
                style={{ background: addr.isDefault ? 'rgba(26,26,26,0.05)' : 'transparent', border: '1px solid rgba(26,26,26,0.1)', padding: '22px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <p style={{ fontSize: 14, color: '#1A1A1A', fontWeight: 500 }}>{addr.name}</p>
                    {addr.isDefault && (
                      <span style={{ fontSize: 9, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#1A1A1A', background: 'rgba(26,26,26,0.1)', padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Check size={8} strokeWidth={2.5} /> Default
                      </span>
                    )}
                  </div>
                  <button onClick={() => handleDelete(addr.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C8C3BA', padding: 4, transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#DC2626')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#C8C3BA')}>
                    <Trash2 size={14} strokeWidth={1.5} />
                  </button>
                </div>
                <p style={{ fontSize: 13, color: '#9E9987', lineHeight: 1.75, marginBottom: 14 }}>
                  {addr.street}, {addr.city}, {addr.state} — {addr.pincode}<br />
                  {addr.phone}
                </p>
                <div style={{ display: 'flex', gap: 18 }}>
                  <button onClick={() => openEdit(addr)}
                    style={{ background: 'none', border: 'none', padding: 0, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1A1A1A', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                    Edit
                  </button>
                  {!addr.isDefault && (
                    <button onClick={() => handleSetDefault(addr.id)}
                      style={{ background: 'none', border: 'none', padding: 0, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9E9987', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                      Set as default
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
