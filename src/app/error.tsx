'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: 'var(--cream)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px', textAlign: 'center',
    }}>
      <span className="brand-wordmark" style={{ fontSize: 22, letterSpacing: '0.2em', marginBottom: 40 }}>QOTN</span>

      <h1 style={{ fontSize: 24, fontWeight: 400, letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 12px' }}>
        Something Went Wrong
      </h1>
      <p style={{ fontSize: 14, color: 'var(--dust)', margin: '0 0 40px', maxWidth: 340, lineHeight: 1.6 }}>
        An unexpected error occurred. Try refreshing the page or go back home.
      </p>

      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={reset}
          style={{
            padding: '14px 28px', background: 'var(--black)', color: 'var(--cream)',
            border: 'none', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase',
            cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 500,
          }}
        >
          Try Again
        </button>
        <Link href="/">
          <button style={{
            padding: '14px 28px', background: 'transparent', color: 'var(--black)',
            border: '1px solid var(--border)', fontSize: 12, letterSpacing: '0.12em',
            textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
          }}>
            Go Home
          </button>
        </Link>
      </div>
    </div>
  );
}
