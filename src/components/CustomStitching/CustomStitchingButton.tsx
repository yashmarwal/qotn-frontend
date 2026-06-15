'use client';
import { useState } from 'react';
import { Scissors } from 'lucide-react';
import CustomStitchingModal from './CustomStitchingModal';

interface Props {
  productId: string;
  productCategory: string;
  onStitchingAdded: (stitchingId: string) => void;
  savedStitchingId?: string;
  selectedSize?: string;
}

export default function CustomStitchingButton({
  productId, productCategory, onStitchingAdded, savedStitchingId,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          width: '100%', padding: '14px 20px',
          border: '1px solid var(--ink)',
          background: savedStitchingId ? 'var(--ink)' : 'transparent',
          color: savedStitchingId ? 'var(--cream)' : 'var(--ink)',
          borderRadius: 8, cursor: 'pointer', fontSize: 13, letterSpacing: '0.06em',
          fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 8, marginTop: 8, transition: 'all 0.2s',
        }}
      >
        <Scissors size={14} strokeWidth={1.5} />
        {savedStitchingId ? '✓ Measurements Saved — Edit' : 'Custom Stitch This — ₹249'}
      </button>

      <CustomStitchingModal
        isOpen={open}
        onClose={() => setOpen(false)}
        productId={productId}
        productCategory={productCategory}
        onSaved={(id) => {
          onStitchingAdded(id);
          setOpen(false);
        }}
      />
    </>
  );
}
