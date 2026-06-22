import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Addresses — QOTN',
  robots: { index: false, follow: false },
};

export default function AddressesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
