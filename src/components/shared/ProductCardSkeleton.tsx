export default function ProductCardSkeleton({ variant = 'desktop' }: { variant?: 'desktop' | 'mobile' }) {
  if (variant === 'mobile') {
    return (
      <div style={{ border: '1px solid var(--border)', overflow: 'hidden', backgroundColor: 'var(--cream)' }}>
        <div className="skeleton" style={{ aspectRatio: '3/4', width: '100%' }} />
        <div style={{ padding: '10px 10px 12px' }}>
          <div className="skeleton" style={{ height: 12, width: '75%', marginBottom: 8, borderRadius: 2 }} />
          <div className="skeleton" style={{ height: 12, width: '40%', borderRadius: 2 }} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="skeleton" style={{ aspectRatio: '3/4', width: '100%' }} />
      <div style={{ paddingTop: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <div className="skeleton" style={{ height: 14, width: '55%', borderRadius: 2 }} />
          <div className="skeleton" style={{ height: 14, width: '20%', borderRadius: 2 }} />
        </div>
        <div className="skeleton" style={{ height: 11, width: '35%', borderRadius: 2 }} />
      </div>
    </div>
  );
}
