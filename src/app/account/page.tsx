'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Package, Heart, MapPin, LogOut, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useWishlist } from '@/context/WishlistContext';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useAuth } from '@/context/AuthContext';
import { ordersService } from '@/lib/services/orders.service';
import { usersService } from '@/lib/services/users.service';
import { formatPrice } from '@/lib/utils';

function safeDate(d: any): string {
  if (!d) return '—';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

type SidebarTab = 'orders' | 'wishlist' | 'addresses';

const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 14px', border: '1px solid var(--border)', background: 'var(--cream)', fontSize: 13, outline: 'none', color: 'var(--black)', fontFamily: 'DM Sans, sans-serif' };
const labelStyle: React.CSSProperties = { fontSize: 11, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--dust)', display: 'block', marginBottom: 8, fontWeight: 500 };

const statusColors: Record<string, string> = {
  pending: '#B45309', confirmed: '#B45309',
  processing: '#1D4ED8',
  shipped: '#6D28D9',
  delivered: '#065F46',
  cancelled: '#991B1B',
};
const statusBg: Record<string, string> = {
  pending: '#FEF3C7', confirmed: '#FEF3C7',
  processing: '#DBEAFE',
  shipped: '#EDE9FE',
  delivered: '#D1FAE5',
  cancelled: '#FEE2E2',
};

function getPasswordStrength(pwd: string): 'weak' | 'good' | 'strong' {
  if (pwd.length < 8 || !/[A-Za-z]/.test(pwd) || !/\d/.test(pwd)) return 'weak';
  if (/[^A-Za-z0-9]/.test(pwd)) return 'strong';
  return 'good';
}

const strengthColors = { weak: '#DC2626', good: '#D97706', strong: '#059669' };
const strengthWidths = { weak: '33%', good: '66%', strong: '100%' };
const strengthLabels = { weak: 'WEAK', good: 'GOOD', strong: 'STRONG' };

export default function AccountPage() {
  const isMobile = useIsMobile();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, login, register, logout } = useAuth();

  // Form visibility state
  const [showRegister, setShowRegister] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [activeTab, setActiveTab] = useState<SidebarTab>('orders');
  const { items: wishlistItems } = useWishlist();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  // Register form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [registerError, setRegisterError] = useState('');

  // Real data state
  const [realOrders, setRealOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      ordersService.getOrders().then((res: any) => setRealOrders(res.data || [])).catch(console.error);
      usersService.getAddresses().then((res: any) => setAddresses(res.data || [])).catch(console.error);
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      await login(loginEmail, loginPassword);
    } catch (err: any) {
      setLoginError(err.message || 'Invalid credentials');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    if (regPassword !== regConfirmPassword) {
      setRegisterError('Passwords do not match');
      return;
    }
    try {
      const result = await register({ firstName, lastName, email: regEmail, password: regPassword, phone });
      if (result?.requiresVerification) {
        router.push('/verify-email');
      }
    } catch (err: any) {
      setRegisterError(err.message || 'Registration failed');
    }
  };

  const primaryBtn: React.CSSProperties = { padding: '14px', background: 'var(--black)', color: 'var(--cream)', border: 'none', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 500, width: '100%', fontFamily: 'DM Sans, sans-serif' };

  // Initial auth loading state
  if (isLoading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  // Login form
  if (!isAuthenticated && !showRegister) {
    return (
      <div style={{ backgroundColor: 'var(--cream)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ width: '100%', maxWidth: 420 }}>
          <h1 style={{ fontSize: 13, letterSpacing: '0.16em', textTransform: 'uppercase', textAlign: 'center', marginBottom: 8 }}>Sign In</h1>
          <p style={{ fontSize: 13, color: 'var(--dust)', textAlign: 'center', marginBottom: 36 }}>Welcome back.</p>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" style={inputStyle} required value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} style={{ ...inputStyle, paddingRight: 44 }} required value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--dust)' }}>
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            {loginError && <p style={{ fontSize: 12, color: '#991B1B', marginTop: -8 }}>{loginError}</p>}
            <button type="submit" style={primaryBtn}>Sign In</button>
          </form>
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            {!showForgot ? (
              <button onClick={() => { setShowForgot(true); setForgotEmail(loginEmail); }}
                style={{ background: 'none', border: 'none', fontSize: 12, color: 'var(--dust)', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'DM Sans, sans-serif' }}>
                Forgot Password?
              </button>
            ) : forgotStatus === 'sent' ? (
              <p style={{ fontSize: 13, color: '#065F46' }}>
                If this email is registered, a reset link has been sent. Check your inbox.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                <input type="email" placeholder="Your email address" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                  style={{ ...inputStyle, textAlign: 'center' }} />
                <button
                  onClick={async () => {
                    if (!forgotEmail) return;
                    setForgotStatus('sending');
                    try { await api.post('/auth/forgot-password', { email: forgotEmail }); } catch {}
                    setForgotStatus('sent');
                  }}
                  disabled={forgotStatus === 'sending'}
                  style={{ padding: '11px', background: 'var(--black)', color: 'var(--cream)', border: 'none', fontSize: 11, letterSpacing: '0.10em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                  {forgotStatus === 'sending' ? 'Sending...' : 'Send Reset Link'}
                </button>
                <button onClick={() => setShowForgot(false)}
                  style={{ background: 'none', border: 'none', fontSize: 12, color: 'var(--dust)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                  Back to login
                </button>
              </div>
            )}
          </div>
          <div style={{ textAlign: 'center', marginTop: 28, paddingTop: 28, borderTop: '1px solid var(--border)' }}>
            <p style={{ fontSize: 13, color: 'var(--dust)', marginBottom: 12 }}>New to Qotn?</p>
            <button onClick={() => setShowRegister(true)} style={{ padding: '12px 28px', background: 'transparent', color: 'var(--black)', border: '1px solid var(--black)', fontSize: 12, letterSpacing: '0.10em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 500, fontFamily: 'DM Sans, sans-serif' }}>
              Create Account
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Register form
  if (!isAuthenticated && showRegister) {
    return (
      <div style={{ backgroundColor: 'var(--cream)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ width: '100%', maxWidth: 480 }}>
          <h1 style={{ fontSize: 13, letterSpacing: '0.16em', textTransform: 'uppercase', textAlign: 'center', marginBottom: 8 }}>Create Account</h1>
          <p style={{ fontSize: 13, color: 'var(--dust)', textAlign: 'center', marginBottom: 36 }}>Join the cotton family.</p>
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
              <div><label style={labelStyle}>First Name</label><input style={inputStyle} required value={firstName} onChange={e => setFirstName(e.target.value)} /></div>
              <div><label style={labelStyle}>Last Name</label><input style={inputStyle} required value={lastName} onChange={e => setLastName(e.target.value)} /></div>
            </div>
            <div><label style={labelStyle}>Email</label><input type="email" style={inputStyle} required value={regEmail} onChange={e => setRegEmail(e.target.value)} /></div>
            <div><label style={labelStyle}>Phone</label><input type="tel" style={inputStyle} value={phone} onChange={e => setPhone(e.target.value)} /></div>
            <div>
              <label style={labelStyle}>Password</label>
              <input type="password" style={inputStyle} required value={regPassword} onChange={e => setRegPassword(e.target.value)} />
              {regPassword.length > 0 && (() => {
                const strength = getPasswordStrength(regPassword);
                return (
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1, height: 3, background: '#E5E7EB', borderRadius: 2 }}>
                      <div style={{ height: '100%', width: strengthWidths[strength], background: strengthColors[strength], borderRadius: 2, transition: 'all 0.3s' }} />
                    </div>
                    <span style={{ fontSize: 10, letterSpacing: '0.1em', color: strengthColors[strength], fontWeight: 600, minWidth: 36 }}>
                      {strengthLabels[strength]}
                    </span>
                  </div>
                );
              })()}
            </div>
            <div><label style={labelStyle}>Confirm Password</label><input type="password" style={inputStyle} required value={regConfirmPassword} onChange={e => setRegConfirmPassword(e.target.value)} /></div>
            {registerError && <p style={{ fontSize: 12, color: '#991B1B', marginTop: -8 }}>{registerError}</p>}
            <button type="submit" style={{ ...primaryBtn, marginTop: 8 }}>Create Account</button>
          </form>
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <button onClick={() => setShowRegister(false)} style={{ background: 'none', border: 'none', fontSize: 13, color: 'var(--dust)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              Already have an account? <span style={{ color: 'var(--black)', textDecoration: 'underline' }}>Sign in</span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Logged In
  const sidebarItems = [{ id: 'orders' as SidebarTab, label: 'Orders', icon: Package }, { id: 'wishlist' as SidebarTab, label: 'Wishlist', icon: Heart }, { id: 'addresses' as SidebarTab, label: 'Addresses', icon: MapPin }];

  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Account';
  const displayEmail = user?.email || '';

  const renderTabContent = () => (
    <>
      {activeTab === 'orders' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <h2 style={{ fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20 }}>My Orders</h2>
          <div style={{ border: '1px solid var(--border)', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 400 }}>
              <thead><tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--raw-cotton)' }}>
                {['Order', 'Date', 'Items', 'Total', 'Status', ''].map((h) => <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 11, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--dust)', fontWeight: 500 }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {realOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '28px 14px', textAlign: 'center', color: 'var(--dust)', fontSize: 13 }}>No orders yet.</td>
                  </tr>
                ) : (
                  realOrders.map((order: any) => {
                    const statusKey = (order.status || '').toLowerCase();
                    return (
                      <tr key={order.orderNumber} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '13px 14px', fontWeight: 500, fontSize: 12, fontFamily: 'monospace' }}>{order.orderNumber}</td>
                        <td style={{ padding: '13px 14px', color: 'var(--dust)' }}>{safeDate(order.createdAt)}</td>
                        <td style={{ padding: '13px 14px', color: 'var(--dust)' }}>{Array.isArray(order.items) ? order.items.length : '—'}</td>
                        <td style={{ padding: '13px 14px' }}>{formatPrice(order.total)}</td>
                        <td style={{ padding: '13px 14px' }}>
                          <span style={{ fontSize: 11, padding: '3px 10px', background: statusBg[statusKey] || '#F3F4F6', color: statusColors[statusKey] || '#374151', letterSpacing: '0.08em', textTransform: 'capitalize', fontWeight: 500 }}>{statusKey}</span>
                        </td>
                        <td style={{ padding: '13px 14px' }}>
                          <Link href={`/order-confirmation?order=${order.orderNumber}`} style={{ fontSize: 12, color: 'var(--dust)', textDecoration: 'underline', fontFamily: 'DM Sans, sans-serif' }}>View</Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
      {activeTab === 'wishlist' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <h2 style={{ fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20 }}>Wishlist</h2>
          {wishlistItems.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
              <p style={{ color: 'var(--dust)', marginBottom: 16 }}>Your wishlist is empty.</p>
              <Link href="/men"><button style={{ padding: '12px 28px', background: 'var(--black)', color: 'var(--cream)', border: 'none', fontSize: 12, letterSpacing: '0.10em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Browse Products</button></Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: 16 }}>
              {wishlistItems.map((product) => (
                <Link key={product.id} href={`/${product.category}/${product.slug}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ position: 'relative', aspectRatio: '3/4', background: 'var(--raw-cotton)' }}>
                    <Image src={product.images[0]} alt={product.name} fill style={{ objectFit: 'cover' }} />
                  </div>
                  <p style={{ fontSize: 13, marginTop: 10 }}>{product.name}</p>
                  <p style={{ fontSize: 13, fontWeight: 500, marginTop: 4 }}>{formatPrice(product.price)}</p>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      )}
      {activeTab === 'addresses' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Saved Addresses</h2>
            <button style={{ padding: '10px 18px', background: 'var(--black)', color: 'var(--cream)', border: 'none', fontSize: 11, letterSpacing: '0.10em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>+ Add</button>
          </div>
          {addresses.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--dust)' }}>No saved addresses yet.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
              {addresses.map((addr: any) => (
                <div key={addr.id} style={{ border: addr.isDefault ? '1px solid var(--black)' : '1px solid var(--border)', padding: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 11, letterSpacing: '0.10em', textTransform: 'uppercase', fontWeight: 500 }}>
                      {addr.label || (addr.isDefault ? 'Default' : 'Address')}
                    </span>
                    <button style={{ background: 'none', border: 'none', fontSize: 11, color: 'var(--dust)', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'DM Sans, sans-serif' }}>Edit</button>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{addr.firstName} {addr.lastName}</p>
                  <p style={{ fontSize: 13, color: 'var(--dust)', lineHeight: 1.7 }}>{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}</p>
                  <p style={{ fontSize: 13, color: 'var(--dust)' }}>{addr.city} – {addr.pincode}</p>
                  {addr.phone && <p style={{ fontSize: 12, color: 'var(--dust)', marginTop: 4 }}>{addr.phone}</p>}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </>
  );

  /* Mobile: tabs at top */
  if (isMobile) {
    return (
      <div style={{ backgroundColor: 'var(--cream)', minHeight: '100vh' }}>
        <div style={{ padding: '20px 16px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={18} strokeWidth={1.5} color="var(--cream)" />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 500 }}>{displayName}</p>
              <p style={{ fontSize: 11, color: 'var(--dust)' }}>{displayEmail}</p>
            </div>
          </div>
          {/* Tab bar */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
            {sidebarItems.map(({ id, label }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                style={{ flex: 1, padding: '10px 0', background: 'none', border: 'none', borderBottom: activeTab === id ? '2px solid var(--black)' : '2px solid transparent', marginBottom: -1, fontSize: 11, letterSpacing: '0.08em', color: activeTab === id ? 'var(--black)' : 'var(--dust)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                {label}
              </button>
            ))}
          </div>
          {renderTabContent()}
          <button onClick={logout}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 0', background: 'none', border: 'none', fontSize: 13, color: 'var(--dust)', cursor: 'pointer', marginTop: 32, fontFamily: 'DM Sans, sans-serif' }}>
            <LogOut size={15} strokeWidth={1.5} /> Logout
          </button>
        </div>
      </div>
    );
  }

  /* Desktop: sidebar + content */
  return (
    <div style={{ backgroundColor: 'var(--cream)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '56px 40px', display: 'grid', gridTemplateColumns: '200px 1fr', gap: 48 }}>
        <div>
          <div style={{ marginBottom: 28 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <User size={18} strokeWidth={1.5} color="var(--cream)" />
            </div>
            <p style={{ fontSize: 14, fontWeight: 400 }}>{displayName}</p>
            <p style={{ fontSize: 12, color: 'var(--dust)', marginTop: 2 }}>{displayEmail}</p>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {sidebarItems.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: activeTab === id ? 'var(--raw-cotton)' : 'transparent', border: 'none', cursor: 'pointer', fontSize: 13, color: activeTab === id ? 'var(--black)' : 'var(--dust)', textAlign: 'left', fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.04em' }}>
                <Icon size={14} strokeWidth={1.5} /> {label}
              </button>
            ))}
            <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--dust)', textAlign: 'left', fontFamily: 'DM Sans, sans-serif', marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
              <LogOut size={14} strokeWidth={1.5} /> Logout
            </button>
          </nav>
        </div>
        {renderTabContent()}
      </div>
    </div>
  );
}
