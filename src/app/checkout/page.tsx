'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ordersService } from '@/lib/services/orders.service';
import { couponsService } from '@/lib/services/coupons.service';
import { usersService } from '@/lib/services/users.service';
import { cartService } from '@/lib/services/cart.service';
import { paymentsService } from '@/lib/services/payments.service';
import { authService } from '@/lib/services/auth.service';
import { formatPrice } from '@/lib/utils';

declare global {
  interface Window { Razorpay: any; }
}

type Step = 1 | 2 | 3;
type Delivery = 'standard' | 'cod';

const indianStates = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh',
];

const inp: React.CSSProperties = {
  width: '100%', padding: '11px 14px', border: '1px solid var(--border)',
  background: 'var(--cream)', fontSize: 13, outline: 'none', color: 'var(--black)',
  fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box',
};
const lbl: React.CSSProperties = {
  fontSize: 10, letterSpacing: '0.10em', textTransform: 'uppercase',
  color: 'var(--dust)', display: 'block', marginBottom: 6, fontWeight: 500,
};

async function loadRazorpay(): Promise<void> {
  if (window.Razorpay) return;
  await new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Failed to load payment gateway. Please check your internet connection.'));
    document.body.appendChild(s);
  });
}

async function syncCartToBackend(items: any[]): Promise<number> {
  await cartService.clearCart().catch(() => {});
  let count = 0;
  for (const item of items) {
    let vid = item.variantId;
    if (!vid) {
      const vs = (item.product as any)._variants;
      if (Array.isArray(vs)) {
        const m = vs.find((v: any) => v.size === item.size && v.color === item.color);
        vid = m?.id;
      }
    }
    if (!vid) continue;
    try {
      await cartService.addItem(item.product.id, vid, item.quantity, item.customStitchingId);
      count++;
    } catch {}
  }
  return count;
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const isMobile = useIsMobile();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user, register } = useAuth();

  // ── Guest mode ───────────────────────────────────────────────────────────
  const [guestMode, setGuestMode] = useState(false);
  const [guestEmail, setGuestEmail] = useState('');
  const [guestEmailError, setGuestEmailError] = useState('');

  // ── Steps & flow ────────────────────────────────────────────────────────
  const [step, setStep] = useState<Step>(1);
  const [delivery, setDelivery] = useState<Delivery>('standard');

  // ── Address ─────────────────────────────────────────────────────────────
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddr, setSelectedAddr] = useState<any>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [addrForm, setAddrForm] = useState({
    firstName: '', lastName: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '',
  });
  const [addrErrors, setAddrErrors] = useState<Record<string, string>>({});
  const [savingAddr, setSavingAddr] = useState(false);
  const [pinLookupLoading, setPinLookupLoading] = useState(false);

  // ── Coupon ───────────────────────────────────────────────────────────────
  const [couponInput, setCouponInput] = useState('');
  const [couponData, setCouponData] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
  const [couponsOpen, setCouponsOpen] = useState(false);

  // ── Payment ──────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [orderError, setOrderError] = useState('');

  // ── COD OTP ──────────────────────────────────────────────────────────────
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);

  // ── Computed prices (all in paise) ───────────────────────────────────────
  const stitchingCharge = items.filter(i => i.customStitchingId).length * 24900;
  const subtotalWithStitching = totalPrice + stitchingCharge;
  const freeDeliveryThreshold = 149900;
  const baseDelivery = subtotalWithStitching >= freeDeliveryThreshold ? 0 : 9900;
  const shippingPaise = delivery === 'cod' ? baseDelivery + 5000 : baseDelivery;
  const discountPaise = couponData?.discount ?? 0;
  const grandTotal = Math.max(0, subtotalWithStitching + shippingPaise - discountPaise);
  const isCOD = delivery === 'cod';

  // The email used for OTP — authenticated user's email or guest email
  const otpEmail = isAuthenticated ? (user?.email ?? '') : guestEmail;

  useEffect(() => {
    fetch('/api/coupons/active')
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : (data.data || []);
        setAvailableCoupons(list);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    usersService.getAddresses().then((res: any) => {
      const addrs: any[] = res.data || [];
      setSavedAddresses(addrs);
      if (addrs.length === 0) {
        setShowNewForm(true);
      } else {
        const def = addrs.find(a => a.isDefault) || addrs[0];
        setSelectedAddr(def);
      }
    }).catch(() => {});
  }, [isAuthenticated]);

  // ── Coupon ───────────────────────────────────────────────────────────────
  const applyCoupon = async (directCode?: string) => {
    const code = (directCode ?? couponInput).trim();
    if (!code) return;
    if (directCode) setCouponInput(directCode);
    setCouponError(''); setCouponLoading(true);
    try {
      const res: any = await couponsService.validate(code, subtotalWithStitching);
      const d = res.data;
      if (d?.valid) { setCouponData(d); setCouponsOpen(false); }
      else { setCouponData(null); setCouponError(d?.message || 'Invalid coupon code.'); }
    } catch (err: any) {
      setCouponData(null); setCouponError(err.message || 'Could not validate coupon.');
    } finally { setCouponLoading(false); }
  };

  const removeCoupon = () => { setCouponData(null); setCouponInput(''); setCouponError(''); };

  // ── PIN code auto-fill ───────────────────────────────────────────────────
  const lookupPincode = async (pin: string) => {
    if (!/^\d{6}$/.test(pin)) return;
    setPinLookupLoading(true);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();
      const post = data?.[0];
      if (post?.Status === 'Success' && post.PostOffice?.length > 0) {
        const po = post.PostOffice[0];
        setAddrForm(f => ({
          ...f,
          city: f.city || po.District || po.Name || '',
          state: f.state || (indianStates.includes(po.State) ? po.State : ''),
        }));
        setAddrErrors(f => ({ ...f, city: '', state: '' }));
      }
    } catch {}
    finally { setPinLookupLoading(false); }
  };

  // ── OTP helpers ──────────────────────────────────────────────────────────
  const sendOTP = async (): Promise<boolean> => {
    setOtpSending(true); setOtpError('');
    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail }),
      });
      const data = await res.json();
      if (!res.ok) { setOtpError(data.message || 'Failed to send code.'); return false; }
      setOtpSent(true);
      return true;
    } catch {
      setOtpError('Network error. Please try again.');
      return false;
    } finally {
      setOtpSending(false);
    }
  };

  const verifyOTP = async (): Promise<boolean> => {
    if (!otpValue.trim()) { setOtpError('Please enter the code.'); return false; }
    setOtpVerifying(true); setOtpError('');
    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail, otp: otpValue.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setOtpError(data.message || 'Incorrect code.'); return false; }
      setOtpVerified(true);
      return true;
    } catch {
      setOtpError('Network error. Please try again.');
      return false;
    } finally {
      setOtpVerifying(false);
    }
  };

  // ── Address continue ─────────────────────────────────────────────────────
  const handleAddrContinue = async () => {
    // Guest mode: validate email first
    if (guestMode) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail.trim())) {
        setGuestEmailError('Enter a valid email address');
        return;
      }
      setGuestEmailError('');
    }

    if (!guestMode && !showNewForm && selectedAddr) { setStep(2); return; }

    const errs: Record<string, string> = {};
    if (!addrForm.firstName.trim()) errs.firstName = 'Required';
    if (!addrForm.lastName.trim()) errs.lastName = 'Required';
    if (!/^\d{10}$/.test(addrForm.phone.trim())) errs.phone = 'Enter a valid 10-digit number';
    if (!addrForm.line1.trim()) errs.line1 = 'Required';
    if (!addrForm.city.trim()) errs.city = 'Required';
    if (!addrForm.state) errs.state = 'Select a state';
    if (!/^\d{6}$/.test(addrForm.pincode.trim())) errs.pincode = 'Enter a valid 6-digit pincode';
    if (Object.keys(errs).length) { setAddrErrors(errs); return; }

    if (guestMode) {
      // For guest, just advance — address is stored in state, saved at order time
      setStep(2);
      return;
    }

    setSavingAddr(true); setAddrErrors({});
    try {
      const res: any = await usersService.createAddress({
        firstName: addrForm.firstName.trim(), lastName: addrForm.lastName.trim(),
        phone: addrForm.phone.trim(), addressLine1: addrForm.line1.trim(),
        addressLine2: addrForm.line2.trim() || undefined,
        city: addrForm.city.trim(), state: addrForm.state, pincode: addrForm.pincode.trim(),
      });
      const saved = res.data;
      setSavedAddresses(p => [...p, saved]);
      setSelectedAddr(saved);
      setShowNewForm(false);
      setStep(2);
    } catch (err: any) {
      setAddrErrors({ general: err.message || 'Failed to save address. Please try again.' });
    } finally { setSavingAddr(false); }
  };

  // ── Helpers for guest order placement ────────────────────────────────────
  const registerAndLoginGuest = async (): Promise<string | null> => {
    // Auto-register the guest with their email
    const password = crypto.randomUUID();
    try {
      await register({
        firstName: addrForm.firstName.trim(),
        lastName: addrForm.lastName.trim(),
        email: guestEmail.trim().toLowerCase(),
        phone: addrForm.phone.trim(),
        password,
      });
      return localStorage.getItem('qotn_token');
    } catch (err: any) {
      const msg: string = err?.message ?? '';
      if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('exist')) {
        throw new Error('An account with this email already exists. Please sign in to continue.');
      }
      throw err;
    }
  };

  const createGuestAddress = async (): Promise<string> => {
    const res: any = await usersService.createAddress({
      firstName: addrForm.firstName.trim(), lastName: addrForm.lastName.trim(),
      phone: addrForm.phone.trim(), addressLine1: addrForm.line1.trim(),
      addressLine2: addrForm.line2.trim() || undefined,
      city: addrForm.city.trim(), state: addrForm.state, pincode: addrForm.pincode.trim(),
    });
    return res.data.id;
  };

  // ── COD order ────────────────────────────────────────────────────────────
  const handleCODOrder = async () => {
    if (isCOD && !otpVerified) {
      // Open OTP modal first
      setOtpModalOpen(true);
      setOtpSent(false);
      setOtpValue('');
      setOtpError('');
      return;
    }
    await placeCODOrder();
  };

  const placeCODOrder = async () => {
    setLoading(true); setOrderError('');
    try {
      if (items.length === 0) throw new Error('Your cart is empty.');

      let addressId = selectedAddr?.id;

      if (guestMode) {
        await registerAndLoginGuest();
        addressId = await createGuestAddress();
      }

      const synced = await syncCartToBackend(items);
      if (synced === 0) throw new Error('Could not process cart. Please re-add your items.');

      const res: any = await ordersService.createOrder({
        addressId,
        deliveryMethod: 'COD',
        paymentMethod: 'COD',
        couponCode: couponData?.coupon?.code,
      });
      clearCart();
      router.push(`/order-confirmation?order=${res.data.order.orderNumber}`);
    } catch (err: any) {
      setOrderError(err.message || 'Failed to place order. Please try again.');
      setLoading(false);
    }
  };

  // ── Online payment ────────────────────────────────────────────────────────
  const handleProceedToPayment = async () => {
    setLoading(true); setOrderError('');
    try {
      if (items.length === 0) throw new Error('Your cart is empty.');

      let addressId = selectedAddr?.id;

      if (guestMode) {
        await registerAndLoginGuest();
        addressId = await createGuestAddress();
      }

      const synced = await syncCartToBackend(items);
      if (synced === 0) throw new Error('Could not process cart. Please re-add your items.');

      const prepRes: any = await paymentsService.prepareCheckout({
        addressId,
        deliveryMethod: delivery.toUpperCase(),
        couponCode: couponData?.coupon?.code,
      });
      const { razorpayOrderId, amount, key } = prepRes.data;

      await loadRazorpay();

      const addr = guestMode
        ? { firstName: addrForm.firstName, lastName: addrForm.lastName, phone: addrForm.phone }
        : selectedAddr;

      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay({
          key,
          amount,
          currency: 'INR',
          name: 'QOTN',
          description: 'Pure Cotton. Nothing Else.',
          order_id: razorpayOrderId,
          prefill: {
            name: `${addr.firstName} ${addr.lastName}`,
            contact: addr.phone,
            ...(guestMode ? { email: guestEmail } : {}),
          },
          theme: { color: '#1A1A1A', backdrop_color: 'rgba(0,0,0,0.7)' },
          modal: {
            ondismiss: () => {
              setLoading(false);
              reject(new Error('__dismissed__'));
            },
          },
          handler: async (response: any) => {
            try {
              const captureRes: any = await paymentsService.confirmOrder({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                addressId,
                deliveryMethod: delivery.toUpperCase(),
                couponCode: couponData?.coupon?.code,
              });
              clearCart();
              router.push(`/order-confirmation?order=${captureRes.data.order.orderNumber}`);
              resolve();
            } catch (err: any) {
              reject(new Error(err.message || 'Payment verification failed. Contact support.'));
            }
          },
        });
        rzp.on('payment.failed', (resp: any) => {
          reject(new Error(resp?.error?.description || 'Payment failed.'));
        });
        rzp.open();
      });

    } catch (err: any) {
      if (err.message === '__dismissed__') return;
      setOrderError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  // ────────────────────────────────────────────────────────────────────────
  // GUARDS
  // ────────────────────────────────────────────────────────────────────────
  if (authLoading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)' }}>
      <div style={{ width: 28, height: 28, border: '2px solid #1A1A1A', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // Not authenticated AND not in guest mode — show choice screen
  if (!isAuthenticated && !guestMode) return (
    <div style={{ backgroundColor: 'var(--cream)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 400, width: '100%' }}>
        <h1 style={{ fontSize: 13, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8, color: 'var(--dust)' }}>Checkout</h1>
        <p style={{ fontSize: 20, fontWeight: 300, marginBottom: 32, lineHeight: 1.4 }}>How would you like to continue?</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Link href="/account?redirect=/checkout">
            <button style={{ width: '100%', padding: '16px', background: '#1A1A1A', color: '#F5F0E8', border: 'none', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 500, fontFamily: 'DM Sans, sans-serif' }}>
              Sign In / Create Account
            </button>
          </Link>
          <button
            onClick={() => setGuestMode(true)}
            style={{ width: '100%', padding: '16px', background: 'transparent', color: 'var(--black)', border: '1px solid var(--border)', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
            Continue as Guest
          </button>
        </div>
        <p style={{ fontSize: 11, color: 'var(--dust)', marginTop: 20, lineHeight: 1.7, textAlign: 'center' }}>
          Guest orders get a free account — you can track your order and set a password later.
        </p>
      </div>
    </div>
  );

  if (items.length === 0) return (
    <div style={{ backgroundColor: 'var(--cream)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 15, marginBottom: 20, color: 'var(--dust)' }}>Your cart is empty.</p>
        <Link href="/men">
          <button style={{ padding: '14px 32px', background: 'var(--black)', color: 'var(--cream)', border: 'none', fontSize: 12, letterSpacing: '0.10em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Shop Now</button>
        </Link>
      </div>
    </div>
  );

  // ────────────────────────────────────────────────────────────────────────
  // OTP MODAL
  // ────────────────────────────────────────────────────────────────────────
  const OTPModal = () => (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }} onClick={() => { if (!loading) { setOtpModalOpen(false); setOtpVerified(false); }}} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        style={{ position: 'relative', background: 'var(--cream)', width: '100%', maxWidth: 420, padding: isMobile ? '28px 20px' : '36px 32px', zIndex: 1 }}
      >
        <h2 style={{ fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>Verify Your Order</h2>
        <p style={{ fontSize: 13, color: 'var(--dust)', lineHeight: 1.65, marginBottom: 24 }}>
          We&rsquo;ll send a 6-digit verification code to{' '}
          <strong style={{ color: 'var(--black)' }}>{otpEmail}</strong>{' '}
          to confirm your Cash on Delivery order.
        </p>

        {!otpSent ? (
          <button
            onClick={async () => { await sendOTP(); }}
            disabled={otpSending}
            style={{ width: '100%', padding: '14px', background: otpSending ? '#9E9987' : '#1A1A1A', color: '#F5F0E8', border: 'none', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: otpSending ? 'wait' : 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {otpSending ? (
              <><div style={{ width: 14, height: 14, border: '2px solid #F5F0E8', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Sending…</>
            ) : 'Send Verification Code'}
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={lbl}>Enter 6-digit code</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                autoFocus
                value={otpValue}
                onChange={e => { setOtpValue(e.target.value.replace(/\D/g, '')); setOtpError(''); }}
                onKeyDown={e => { if (e.key === 'Enter' && otpValue.length === 6) handleOTPVerify(); }}
                style={{ ...inp, fontSize: 22, letterSpacing: '0.3em', textAlign: 'center', fontFamily: 'monospace', borderColor: otpError ? '#DC2626' : undefined }}
                placeholder="——————"
              />
            </div>
            {otpError && <p style={{ fontSize: 12, color: '#DC2626', marginTop: -6 }}>{otpError}</p>}
            <button
              onClick={handleOTPVerify}
              disabled={otpVerifying || otpValue.length < 6}
              style={{ width: '100%', padding: '14px', background: (otpVerifying || otpValue.length < 6) ? '#9E9987' : '#1A1A1A', color: '#F5F0E8', border: 'none', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: (otpVerifying || otpValue.length < 6) ? 'default' : 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {otpVerifying ? (
                <><div style={{ width: 14, height: 14, border: '2px solid #F5F0E8', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Verifying…</>
              ) : 'Verify & Place Order'}
            </button>
            <button
              onClick={async () => { setOtpSent(false); setOtpValue(''); setOtpError(''); await sendOTP(); }}
              disabled={otpSending}
              style={{ background: 'none', border: 'none', fontSize: 12, color: 'var(--dust)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', textDecoration: 'underline', padding: 0, textAlign: 'center' }}>
              {otpSending ? 'Resending…' : 'Resend code'}
            </button>
          </div>
        )}
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </motion.div>
    </div>
  );

  const handleOTPVerify = async () => {
    const ok = await verifyOTP();
    if (ok) {
      setOtpModalOpen(false);
      await placeCODOrder();
    }
  };

  // ────────────────────────────────────────────────────────────────────────
  // STEP INDICATOR
  // ────────────────────────────────────────────────────────────────────────
  const StepIndicator = () => {
    const steps = [{ n: 1, label: 'Address' }, { n: 2, label: 'Delivery' }, { n: 3, label: 'Review' }];
    if (isMobile) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
          {steps.map(({ n, label }) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: step >= n ? '#1A1A1A' : '#D4CFC6', transition: 'background 0.2s' }} />
              {step === n && <span style={{ fontSize: 11, letterSpacing: '0.08em', color: '#1A1A1A' }}>{label}</span>}
            </div>
          ))}
        </div>
      );
    }
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 48 }}>
        {steps.map(({ n, label }, i) => (
          <div key={n} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: step >= n ? '#1A1A1A' : 'transparent', border: step >= n ? 'none' : '1px solid #D4CFC6', color: step >= n ? '#F5F0E8' : '#9E9987', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500, transition: 'all 0.2s' }}>
                {step > n ? <Check size={12} strokeWidth={2.5} /> : n}
              </div>
              <span style={{ fontSize: 12, letterSpacing: '0.08em', color: step >= n ? '#1A1A1A' : '#9E9987', fontWeight: step === n ? 500 : 400 }}>{label}</span>
            </div>
            {i < steps.length - 1 && <div style={{ width: 40, height: 1, background: '#D4CFC6', margin: '0 12px' }} />}
          </div>
        ))}
      </div>
    );
  };

  // ────────────────────────────────────────────────────────────────────────
  // STEP 1 — ADDRESS
  // ────────────────────────────────────────────────────────────────────────
  const AddressStep = () => (
    <motion.div key="addr" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <h2 style={{ fontSize: 13, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 24 }}>Delivery Address</h2>

      {/* Guest email field */}
      {guestMode && (
        <div style={{ marginBottom: 20, padding: '16px 18px', background: 'rgba(26,26,26,0.03)', border: '1px solid var(--border)' }}>
          <label style={lbl}>Email address *</label>
          <input
            type="email"
            style={{ ...inp, borderColor: guestEmailError ? '#DC2626' : undefined }}
            placeholder="your@email.com"
            value={guestEmail}
            onChange={e => { setGuestEmail(e.target.value); setGuestEmailError(''); }}
          />
          {guestEmailError && <p style={{ fontSize: 11, color: '#DC2626', marginTop: 4 }}>{guestEmailError}</p>}
          <p style={{ fontSize: 11, color: 'var(--dust)', marginTop: 6, lineHeight: 1.5 }}>
            Order confirmation and COD verification will be sent here.
          </p>
        </div>
      )}

      {/* Saved address cards — only for authenticated users */}
      {isAuthenticated && savedAddresses.length > 0 && !showNewForm && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          {savedAddresses.map((addr: any) => {
            const selected = selectedAddr?.id === addr.id;
            return (
              <button key={addr.id} onClick={() => { setSelectedAddr(addr); setShowNewForm(false); }}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: 18, border: selected ? '1.5px solid #1A1A1A' : '1px solid var(--border)', background: selected ? 'rgba(26,26,26,0.02)' : 'transparent', cursor: 'pointer', textAlign: 'left', fontFamily: 'DM Sans, sans-serif', width: '100%' }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', border: selected ? '5px solid #1A1A1A' : '1.5px solid #C8C3BA', flexShrink: 0, marginTop: 1, transition: 'all 0.15s' }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 3 }}>
                    {addr.firstName} {addr.lastName}
                    {addr.isDefault && <span style={{ fontSize: 10, letterSpacing: '0.08em', background: '#1A1A1A', color: '#F5F0E8', padding: '2px 6px', marginLeft: 8 }}>DEFAULT</span>}
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--dust)', lineHeight: 1.6 }}>
                    {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}<br />
                    {addr.city}, {addr.state} – {addr.pincode}
                  </p>
                  {addr.phone && <p style={{ fontSize: 12, color: 'var(--dust)', marginTop: 4 }}>{addr.phone}</p>}
                </div>
                {selected && <Check size={16} strokeWidth={2.5} color="#1A1A1A" style={{ flexShrink: 0, marginTop: 1 }} />}
              </button>
            );
          })}
          <button onClick={() => { setShowNewForm(true); setSelectedAddr(null); }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', border: '1px dashed #C8C3BA', background: 'transparent', cursor: 'pointer', fontSize: 13, color: 'var(--dust)', fontFamily: 'DM Sans, sans-serif', textAlign: 'left' }}>
            <span style={{ fontSize: 18, fontWeight: 300, lineHeight: 1 }}>+</span> Add New Address
          </button>
        </div>
      )}

      {/* New address form — always shown for guests, toggled for auth users */}
      {(showNewForm || savedAddresses.length === 0 || guestMode) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {isAuthenticated && savedAddresses.length > 0 && (
            <button onClick={() => { setShowNewForm(false); setSelectedAddr(savedAddresses.find(a => a.isDefault) || savedAddresses[0]); }}
              style={{ alignSelf: 'flex-start', background: 'none', border: 'none', fontSize: 12, color: 'var(--dust)', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'DM Sans, sans-serif', padding: 0, marginBottom: 4 }}>
              ← Use saved address
            </button>
          )}
          {addrErrors.general && <p style={{ fontSize: 12, color: '#DC2626', background: '#FEF2F2', padding: '10px 14px', borderLeft: '3px solid #DC2626' }}>{addrErrors.general}</p>}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
            {[['firstName', 'First Name *'], ['lastName', 'Last Name *']].map(([k, l]) => (
              <div key={k}>
                <label style={lbl}>{l}</label>
                <input style={{ ...inp, borderColor: addrErrors[k] ? '#DC2626' : undefined }}
                  value={(addrForm as any)[k]} onChange={e => { setAddrForm(f => ({ ...f, [k]: e.target.value })); setAddrErrors(f => ({ ...f, [k]: '' })); }} />
                {addrErrors[k] && <p style={{ fontSize: 11, color: '#DC2626', marginTop: 4 }}>{addrErrors[k]}</p>}
              </div>
            ))}
          </div>
          <div>
            <label style={lbl}>Phone * (10 digits)</label>
            <input type="tel" maxLength={10} style={{ ...inp, borderColor: addrErrors.phone ? '#DC2626' : undefined }}
              value={addrForm.phone} onChange={e => { setAddrForm(f => ({ ...f, phone: e.target.value })); setAddrErrors(f => ({ ...f, phone: '' })); }} />
            {addrErrors.phone && <p style={{ fontSize: 11, color: '#DC2626', marginTop: 4 }}>{addrErrors.phone}</p>}
          </div>
          <div>
            <label style={lbl}>Address Line 1 *</label>
            <input style={{ ...inp, borderColor: addrErrors.line1 ? '#DC2626' : undefined }}
              value={addrForm.line1} onChange={e => { setAddrForm(f => ({ ...f, line1: e.target.value })); setAddrErrors(f => ({ ...f, line1: '' })); }} />
            {addrErrors.line1 && <p style={{ fontSize: 11, color: '#DC2626', marginTop: 4 }}>{addrErrors.line1}</p>}
          </div>
          <div>
            <label style={lbl}>Address Line 2 (Optional)</label>
            <input style={inp} value={addrForm.line2} onChange={e => setAddrForm(f => ({ ...f, line2: e.target.value }))} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr', gap: 14 }}>
            <div>
              <label style={lbl}>City *</label>
              <input style={{ ...inp, borderColor: addrErrors.city ? '#DC2626' : undefined }}
                value={addrForm.city} onChange={e => { setAddrForm(f => ({ ...f, city: e.target.value })); setAddrErrors(f => ({ ...f, city: '' })); }} />
              {addrErrors.city && <p style={{ fontSize: 11, color: '#DC2626', marginTop: 4 }}>{addrErrors.city}</p>}
            </div>
            <div>
              <label style={lbl}>State *</label>
              <select style={{ ...inp, cursor: 'pointer', borderColor: addrErrors.state ? '#DC2626' : undefined }}
                value={addrForm.state} onChange={e => { setAddrForm(f => ({ ...f, state: e.target.value })); setAddrErrors(f => ({ ...f, state: '' })); }}>
                <option value="">Select</option>
                {indianStates.map(s => <option key={s}>{s}</option>)}
              </select>
              {addrErrors.state && <p style={{ fontSize: 11, color: '#DC2626', marginTop: 4 }}>{addrErrors.state}</p>}
            </div>
            <div style={{ gridColumn: isMobile ? '1 / -1' : undefined }}>
              <label style={lbl}>Pincode * (6 digits)</label>
              <div style={{ position: 'relative' }}>
                <input maxLength={6} style={{ ...inp, borderColor: addrErrors.pincode ? '#DC2626' : undefined, paddingRight: pinLookupLoading ? 36 : undefined }}
                  value={addrForm.pincode}
                  onChange={e => { setAddrForm(f => ({ ...f, pincode: e.target.value })); setAddrErrors(f => ({ ...f, pincode: '' })); }}
                  onBlur={e => lookupPincode(e.target.value)} />
                {pinLookupLoading && (
                  <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, border: '2px solid #C8C3BA', borderTopColor: '#1A1A1A', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                )}
              </div>
              {addrErrors.pincode && <p style={{ fontSize: 11, color: '#DC2626', marginTop: 4 }}>{addrErrors.pincode}</p>}
              {pinLookupLoading && <p style={{ fontSize: 11, color: 'var(--dust)', marginTop: 4 }}>Looking up pincode…</p>}
            </div>
          </div>
        </div>
      )}

      <button onClick={handleAddrContinue} disabled={savingAddr}
        style={{ marginTop: 28, padding: '14px', width: isMobile ? '100%' : 200, background: '#1A1A1A', color: '#F5F0E8', border: 'none', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: savingAddr ? 'wait' : 'pointer', fontWeight: 500, fontFamily: 'DM Sans, sans-serif', opacity: savingAddr ? 0.7 : 1 }}>
        {savingAddr ? 'Saving...' : 'Continue →'}
      </button>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </motion.div>
  );

  // ────────────────────────────────────────────────────────────────────────
  // STEP 2 — DELIVERY METHOD
  // ────────────────────────────────────────────────────────────────────────
  const DeliveryStep = () => {
    const isFreeDelivery = subtotalWithStitching >= freeDeliveryThreshold;
    const options: { id: Delivery; label: string; sub: string; badge?: string; price: string }[] = [
      {
        id: 'standard', label: 'Standard Delivery', sub: '5–7 business days',
        badge: isFreeDelivery ? 'FREE DELIVERY' : undefined,
        price: isFreeDelivery ? 'FREE' : '₹99',
      },
      {
        id: 'cod', label: 'Cash on Delivery', sub: '5–7 business days',
        price: isFreeDelivery ? '₹50' : '₹149',
      },
    ];
    return (
      <motion.div key="delivery" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h2 style={{ fontSize: 13, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 24 }}>Delivery Method</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {options.map(opt => {
            const sel = delivery === opt.id;
            return (
              <button key={opt.id} onClick={() => { setDelivery(opt.id); setOtpVerified(false); }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', border: sel ? '1.5px solid #1A1A1A' : '1px solid var(--border)', background: sel ? 'rgba(26,26,26,0.02)' : 'transparent', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', textAlign: 'left', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', border: sel ? '5px solid #1A1A1A' : '1.5px solid #C8C3BA', flexShrink: 0, transition: 'all 0.15s' }} />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <p style={{ fontSize: 14, fontWeight: 500, color: '#1A1A1A' }}>{opt.label}</p>
                      {opt.badge && <span style={{ fontSize: 9, letterSpacing: '0.08em', background: '#065F46', color: '#fff', padding: '2px 6px' }}>{opt.badge}</span>}
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--dust)', marginTop: 3 }}>{opt.sub}</p>
                    {opt.id === 'cod' && (
                      <p style={{ fontSize: 11, color: 'var(--dust)', marginTop: 3 }}>Email OTP verification required</p>
                    )}
                  </div>
                </div>
                <span style={{ fontSize: 15, fontWeight: 500, color: '#1A1A1A', flexShrink: 0, marginLeft: 16 }}>{opt.price}</span>
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
          <button onClick={() => setStep(1)} style={{ padding: '14px 20px', background: 'transparent', color: 'var(--black)', border: '1px solid var(--border)', fontSize: 12, letterSpacing: '0.08em', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>← Back</button>
          <button onClick={() => setStep(3)} style={{ flex: 1, padding: '14px', background: '#1A1A1A', color: '#F5F0E8', border: 'none', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 500, fontFamily: 'DM Sans, sans-serif' }}>
            Review Order →
          </button>
        </div>
      </motion.div>
    );
  };

  // ────────────────────────────────────────────────────────────────────────
  // STEP 3 — REVIEW & PAY
  // ────────────────────────────────────────────────────────────────────────
  const ReviewStep = () => (
    <motion.div key="review" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <h2 style={{ fontSize: 13, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 24 }}>Order Summary</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
        {items.map(item => (
          <div key={`${item.product.id}-${item.size}-${item.color}`} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{ position: 'relative', width: 64, height: 80, flexShrink: 0, background: 'var(--raw-cotton)' }}>
              <Image src={item.product.images[0]} alt={item.product.name} fill style={{ objectFit: 'cover' }} />
              <span style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: '#1A1A1A', color: '#F5F0E8', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>{item.quantity}</span>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 400, marginBottom: 3 }}>{item.product.name}</p>
              <p style={{ fontSize: 12, color: 'var(--dust)' }}>{item.size} · {item.color}</p>
              {item.customStitchingId && <p style={{ fontSize: 11, color: 'var(--dust)', marginTop: 2 }}>✂ Custom Stitched +₹249</p>}
            </div>
            <p style={{ fontSize: 14, fontWeight: 500, flexShrink: 0 }}>{formatPrice(item.product.price * item.quantity)}</p>
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, color: 'var(--dust)' }}>Subtotal</span>
          <span style={{ fontSize: 13 }}>{formatPrice(totalPrice)}</span>
        </div>
        {stitchingCharge > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: 'var(--dust)' }}>Custom Stitching ({items.filter(i => i.customStitchingId).length}× ₹249)</span>
            <span style={{ fontSize: 13 }}>+{formatPrice(stitchingCharge)}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, color: 'var(--dust)' }}>{isCOD ? 'COD Charge' : 'Delivery'}</span>
          <span style={{ fontSize: 13, color: shippingPaise === 0 ? '#065F46' : undefined }}>{shippingPaise === 0 ? 'FREE' : formatPrice(shippingPaise)}</span>
        </div>
        {couponData && discountPaise > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: '#065F46' }}>Coupon ({couponData?.coupon?.code})</span>
            <span style={{ fontSize: 13, color: '#065F46' }}>−{formatPrice(discountPaise)}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
          <span style={{ fontSize: 16, fontWeight: 600 }}>Total</span>
          <span style={{ fontSize: 16, fontWeight: 600 }}>{formatPrice(grandTotal)}</span>
        </div>
      </div>

      {/* Coupon */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 10, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--dust)', marginBottom: 10, fontWeight: 500 }}>Apply Coupon</p>
        {couponData ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderLeft: '3px solid #16A34A' }}>
            <div>
              <p style={{ fontSize: 13, color: '#15803D', fontWeight: 600, letterSpacing: '0.06em', fontFamily: 'monospace' }}>{couponData?.coupon?.code}</p>
              <p style={{ fontSize: 12, color: '#16A34A', marginTop: 2 }}>You save {formatPrice(discountPaise)} with this coupon</p>
            </div>
            <button onClick={removeCoupon} style={{ background: 'none', border: '1px solid #BBF7D0', fontSize: 11, color: '#15803D', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', padding: '5px 12px', letterSpacing: '0.06em' }}>REMOVE</button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 0 }}>
              <input style={{ ...inp, flex: 1, textTransform: 'uppercase', letterSpacing: '0.08em' }} placeholder="ENTER COUPON CODE"
                value={couponInput} onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                onKeyDown={e => e.key === 'Enter' && applyCoupon()} />
              <button onClick={() => applyCoupon()} disabled={couponLoading || !couponInput.trim()}
                style={{ padding: '0 20px', background: '#1A1A1A', color: '#F5F0E8', border: 'none', fontSize: 11, letterSpacing: '0.10em', textTransform: 'uppercase', cursor: !couponInput.trim() ? 'default' : 'pointer', fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap', opacity: !couponInput.trim() ? 0.45 : 1 }}>
                {couponLoading ? '...' : 'Apply'}
              </button>
            </div>
            {couponError && <p style={{ fontSize: 12, color: '#DC2626', marginTop: 6 }}>{couponError}</p>}
            {availableCoupons.length > 0 && (
              <div style={{ marginTop: 10 }}>
                <button onClick={() => setCouponsOpen(o => !o)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', background: 'rgba(26,26,26,0.03)', border: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', textAlign: 'left' }}>
                  <span style={{ fontSize: 13, color: 'var(--black)' }}>🏷 {availableCoupons.length} coupon{availableCoupons.length > 1 ? 's' : ''} available</span>
                  <span style={{ fontSize: 11, color: 'var(--dust)', letterSpacing: '0.04em' }}>{couponsOpen ? '▲ Hide' : '▼ View all'}</span>
                </button>
                {couponsOpen && (
                  <div style={{ border: '1px solid var(--border)', borderTop: 'none', display: 'flex', flexDirection: 'column' }}>
                    {availableCoupons.map((c, idx) => {
                      const minPaise = c.minOrderValue ?? 0;
                      const eligible = subtotalWithStitching >= minPaise;
                      const shortfall = minPaise - subtotalWithStitching;
                      const discLabel = c.discountType === 'PERCENTAGE'
                        ? `${c.discountValue}% OFF${c.maxDiscount ? ` (up to ₹${Math.round(c.maxDiscount / 100)})` : ''}`
                        : `₹${Math.round(c.discountValue / 100)} OFF`;
                      return (
                        <div key={c.code} style={{ padding: '14px 16px', borderTop: idx > 0 ? '1px solid var(--border)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, opacity: eligible ? 1 : 0.55, background: 'var(--cream)' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                              <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, letterSpacing: '0.10em', color: 'var(--black)', background: 'rgba(26,26,26,0.06)', padding: '2px 8px', borderRadius: 2 }}>{c.code}</span>
                            </div>
                            <p style={{ fontSize: 13, fontWeight: 600, color: '#15803D', marginBottom: 2 }}>{discLabel}</p>
                            {c.description && <p style={{ fontSize: 12, color: 'var(--dust)', lineHeight: 1.4, marginBottom: 2 }}>{c.description}</p>}
                            {minPaise > 0 && (
                              <p style={{ fontSize: 11, color: eligible ? 'var(--dust)' : '#DC2626' }}>
                                {eligible ? `Min. order ₹${Math.round(minPaise / 100).toLocaleString('en-IN')}` : `Add ₹${Math.round(shortfall / 100).toLocaleString('en-IN')} more to unlock`}
                              </p>
                            )}
                            {c.expiresAt && <p style={{ fontSize: 10, color: 'var(--dust)', marginTop: 2 }}>Expires {new Date(c.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>}
                          </div>
                          <button onClick={() => eligible && applyCoupon(c.code)} disabled={!eligible || couponLoading}
                            style={{ flexShrink: 0, padding: '8px 16px', background: eligible ? '#1A1A1A' : 'transparent', color: eligible ? '#F5F0E8' : 'var(--dust)', border: eligible ? 'none' : '1px solid var(--border)', fontSize: 11, letterSpacing: '0.10em', textTransform: 'uppercase', cursor: eligible ? 'pointer' : 'default', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, whiteSpace: 'nowrap' }}>
                            {couponLoading && couponInput === c.code ? '...' : 'Apply'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Delivery summary */}
      <div style={{ padding: '14px 16px', background: 'rgba(26,26,26,0.03)', borderLeft: '2px solid #1A1A1A', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <p style={{ fontSize: 12, color: 'var(--dust)', lineHeight: 1.6 }}>
          <strong style={{ color: '#1A1A1A' }}>Delivering to:</strong>{' '}
          {guestMode
            ? `${addrForm.firstName} ${addrForm.lastName} · ${addrForm.line1}, ${addrForm.city} – ${addrForm.pincode}`
            : selectedAddr ? `${selectedAddr.firstName} ${selectedAddr.lastName} · ${selectedAddr.addressLine1}, ${selectedAddr.city} – ${selectedAddr.pincode}` : ''}
        </p>
        <p style={{ fontSize: 12, color: 'var(--dust)' }}>
          <strong style={{ color: '#1A1A1A' }}>Method:</strong>{' '}
          {delivery === 'standard' ? 'Standard (5–7 days)' : 'Cash on Delivery (5–7 days)'}
        </p>
        {guestMode && (
          <p style={{ fontSize: 12, color: 'var(--dust)' }}>
            <strong style={{ color: '#1A1A1A' }}>Email:</strong> {guestEmail}
          </p>
        )}
      </div>

      {orderError && (
        <div style={{ padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderLeft: '4px solid #DC2626', marginBottom: 20 }}>
          <p style={{ fontSize: 13, color: '#DC2626', fontWeight: 500 }}>{orderError}</p>
          {orderError.includes('already exists') && (
            <Link href="/account?redirect=/checkout" style={{ fontSize: 12, color: '#DC2626', textDecoration: 'underline', marginTop: 6, display: 'block' }}>
              Sign in →
            </Link>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={() => setStep(2)} style={{ padding: '14px 20px', background: 'transparent', color: 'var(--black)', border: '1px solid var(--border)', fontSize: 12, letterSpacing: '0.08em', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>← Back</button>
        <button
          onClick={isCOD ? handleCODOrder : handleProceedToPayment}
          disabled={loading}
          style={{ flex: 1, height: 52, background: loading ? '#9E9987' : '#1A1A1A', color: '#F5F0E8', border: 'none', fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 600, fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'background 0.2s' }}>
          {loading ? (
            <><div style={{ width: 16, height: 16, border: '2px solid #F5F0E8', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />{isCOD ? 'Placing Order...' : 'Opening Payment...'}</>
          ) : (
            isCOD ? 'Verify & Place Order →' : `Proceed to Payment · ${formatPrice(grandTotal)}`
          )}
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </button>
      </div>

      <p style={{ fontSize: 11, color: 'var(--dust)', textAlign: 'center', marginTop: 16, lineHeight: 1.6 }}>
        {isCOD ? '📧 An OTP will be sent to your email to confirm the COD order.' : '🔒 Secured by Razorpay · 256-bit SSL · Pay with UPI, Card, Net Banking or Wallets'}
      </p>
    </motion.div>
  );

  // ────────────────────────────────────────────────────────────────────────
  // RENDER — MOBILE
  // ────────────────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <>
        {otpModalOpen && <OTPModal />}
        <div style={{ backgroundColor: 'var(--cream)', minHeight: '100vh', paddingBottom: 100 }}>
          <div style={{ padding: '20px 16px 0' }}>
            {StepIndicator()}
            {step > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(26,26,26,0.04)', marginBottom: 20 }}>
                <span style={{ fontSize: 12, color: 'var(--dust)' }}>{items.length} item{items.length > 1 ? 's' : ''}</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{formatPrice(grandTotal)}</span>
              </div>
            )}
            {step === 1 && AddressStep()}
            {step === 2 && DeliveryStep()}
            {step === 3 && ReviewStep()}
          </div>
        </div>
      </>
    );
  }

  // ────────────────────────────────────────────────────────────────────────
  // RENDER — DESKTOP
  // ────────────────────────────────────────────────────────────────────────
  return (
    <>
      {otpModalOpen && <OTPModal />}
      <div style={{ backgroundColor: 'var(--cream)', minHeight: '100vh', padding: '60px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {StepIndicator()}
          <div style={{ display: 'grid', gridTemplateColumns: step === 3 ? '1fr' : '60% 40%', gap: 48, alignItems: 'start' }}>
            <div style={{ maxWidth: step === 3 ? 680 : undefined, margin: step === 3 ? '0 auto' : undefined, width: step === 3 ? '100%' : undefined }}>
              {step === 1 && AddressStep()}
              {step === 2 && DeliveryStep()}
              {step === 3 && ReviewStep()}
            </div>
            {step !== 3 && (
              <div style={{ border: '1px solid var(--border)', padding: 24, position: 'sticky', top: 80 }}>
                <h3 style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20, color: 'var(--dust)' }}>Order Summary</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                  {items.map(item => (
                    <div key={`${item.product.id}-${item.size}`} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div style={{ position: 'relative', width: 44, height: 56, flexShrink: 0, background: 'var(--raw-cotton)' }}>
                        <Image src={item.product.images[0]} alt={item.product.name} fill style={{ objectFit: 'cover' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 12 }}>{item.product.name}</p>
                        <p style={{ fontSize: 11, color: 'var(--dust)' }}>{item.size} · ×{item.quantity}</p>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{formatPrice(item.product.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: 'var(--dust)' }}>Subtotal</span>
                    <span style={{ fontSize: 12 }}>{formatPrice(totalPrice)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: 'var(--dust)' }}>{isCOD ? 'COD Charge' : 'Delivery'}</span>
                    <span style={{ fontSize: 12 }}>{shippingPaise === 0 ? 'FREE' : formatPrice(shippingPaise)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>Total</span>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{formatPrice(grandTotal)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
