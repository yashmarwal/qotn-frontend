import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: '404 — Page Not Found · QOTN' };

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', backgroundColor: 'var(--cream)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px', textAlign: 'center',
    }}>
      <span className="brand-wordmark" style={{ fontSize: 22, letterSpacing: '0.2em', marginBottom: 40 }}>QOTN</span>

      <p style={{ fontSize: 96, fontWeight: 200, lineHeight: 1, color: 'var(--black)', margin: '0 0 16px', letterSpacing: '-0.02em' }}>404</p>

      <h1 style={{ fontSize: 18, fontWeight: 400, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 12px' }}>
        Page Not Found
      </h1>
      <p style={{ fontSize: 14, color: 'var(--dust)', margin: '0 0 40px', maxWidth: 340, lineHeight: 1.6 }}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      <Link href="/">
        <button style={{
          padding: '14px 36px', background: 'var(--black)', color: 'var(--cream)',
          border: 'none', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase',
          cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 500,
        }}>
          Go Home →
        </button>
      </Link>
    </div>
  );
}
