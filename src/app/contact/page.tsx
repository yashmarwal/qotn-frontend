'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, AtSign, MapPin, CheckCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', border: '1px solid var(--border)',
  background: 'var(--cream)', fontSize: 13, outline: 'none', color: 'var(--black)',
  fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box',
};
const labelStyle: React.CSSProperties = {
  fontSize: 11, letterSpacing: '0.10em', textTransform: 'uppercase',
  color: 'var(--dust)', display: 'block', marginBottom: 8, fontWeight: 500,
};

// ─── Top-level so React never remounts them on parent re-render ───────────────

function ContactInfo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dust)', marginBottom: 20 }}>
          Get in Touch
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {[
            { icon: Mail, label: 'Email', value: 'hello@qotn.in' },
            { icon: Phone, label: 'Phone', value: '+91 80000 12345' },
            { icon: AtSign, label: 'Instagram', value: '@shopqotn' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <Icon size={15} strokeWidth={1.5} color="var(--dust)" style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 10, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--dust)', marginBottom: 3 }}>{label}</p>
                <p style={{ fontSize: 14 }}>{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 28 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <MapPin size={15} strokeWidth={1.5} color="var(--dust)" style={{ marginTop: 2, flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: 10, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--dust)', marginBottom: 6 }}>Office</p>
            <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--black)' }}>
              Qotn India Pvt. Ltd.<br />42, Cotton House, Koramangala<br />Bengaluru, Karnataka – 560034<br />India
            </p>
          </div>
        </div>
      </div>
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 28 }}>
        <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--dust)', marginBottom: 10 }}>Response Time</p>
        <p style={{ fontSize: 13, color: 'var(--dust)', lineHeight: 1.8 }}>We typically respond within 24 hours on business days.</p>
      </div>
    </div>
  );
}

interface FormProps {
  name: string; setName: (v: string) => void;
  email: string; setEmail: (v: string) => void;
  subject: string; setSubject: (v: string) => void;
  message: string; setMessage: (v: string) => void;
  status: 'idle' | 'sending' | 'success' | 'error';
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
  isMobile: boolean;
}

function ContactForm({ name, setName, email, setEmail, subject, setSubject, message, setMessage, status, onSubmit, onReset, isMobile }: FormProps) {
  if (status === 'success') {
    return (
      <div style={{ textAlign: 'center', padding: isMobile ? '40px 0' : '60px 0' }}>
        <CheckCircle size={44} strokeWidth={1} style={{ margin: '0 auto 20px' }} />
        <h2 style={{ fontSize: 18, fontWeight: 300, marginBottom: 10 }}>Message Sent</h2>
        <p style={{ fontSize: 14, color: 'var(--dust)', marginBottom: 28 }}>
          Thank you! We will get back to you within 24 hours.
        </p>
        <button onClick={onReset} style={{ padding: '12px 28px', background: 'var(--black)', color: 'var(--cream)', border: 'none', fontSize: 12, letterSpacing: '0.10em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 500, fontFamily: 'DM Sans, sans-serif' }}>
          Send Another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <label style={labelStyle}>Name</label>
        <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} required />
      </div>
      <div>
        <label style={labelStyle}>Email</label>
        <input type="email" style={inputStyle} value={email} onChange={e => setEmail(e.target.value)} required />
      </div>
      <div>
        <label style={labelStyle}>Subject</label>
        <select style={{ ...inputStyle, cursor: 'pointer' }} value={subject} onChange={e => setSubject(e.target.value)} required>
          <option value="">Select a subject</option>
          {['General Inquiry', 'Order Issue', 'Return Request', 'Custom Stitching', 'Other'].map(o => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </div>
      <div>
        <label style={labelStyle}>Message</label>
        <textarea style={{ ...inputStyle, minHeight: 140, resize: 'vertical', height: 'auto' }} value={message} onChange={e => setMessage(e.target.value)} required />
      </div>
      {status === 'error' && (
        <p style={{ fontSize: 12, color: '#991B1B' }}>
          Something went wrong. Please email us at{' '}
          <a href="mailto:hello@qotn.in" style={{ color: '#991B1B' }}>hello@qotn.in</a>
        </p>
      )}
      <button type="submit" disabled={status === 'sending'}
        style={{ padding: '14px', background: status === 'sending' ? '#9E9987' : 'var(--black)', color: 'var(--cream)', border: 'none', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: status === 'sending' ? 'not-allowed' : 'pointer', fontWeight: 500, fontFamily: 'DM Sans, sans-serif' }}>
        {status === 'sending' ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function ContactPage() {
  const isMobile = useIsMobile();
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: '131505da-95fe-467f-ae42-2a3b109ef5ff',
          subject: 'New Contact Form Submission — QOTN',
          from_name: 'QOTN Website',
          name, email, subject_line: subject, message,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
        setName(''); setEmail(''); setSubject(''); setMessage('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--cream)', minHeight: '100vh', padding: isMobile ? '48px 20px' : '80px 40px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: isMobile ? 48 : 64 }}>
          <h1 style={{ fontSize: 13, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 10, color: 'var(--dust)' }}>Contact</h1>
          <p style={{ fontSize: isMobile ? 'clamp(22px, 6vw, 32px)' : 'clamp(28px, 4vw, 44px)', fontWeight: 300, lineHeight: 1.3 }}>
            We&apos;d love to hear from you.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 40 : 72, alignItems: 'start' }}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
            <ContactInfo />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <ContactForm
              name={name} setName={setName}
              email={email} setEmail={setEmail}
              subject={subject} setSubject={setSubject}
              message={message} setMessage={setMessage}
              status={status}
              onSubmit={handleSubmit}
              onReset={() => setStatus('idle')}
              isMobile={isMobile}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
