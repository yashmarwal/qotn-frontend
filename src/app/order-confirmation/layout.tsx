import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Order Confirmed — QOTN',
  robots: { index: false, follow: false },
};

export default function OrderConfirmationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
