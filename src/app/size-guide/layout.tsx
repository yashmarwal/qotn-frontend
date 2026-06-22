import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Size Guide — Find Your Perfect Cotton Fit | QOTN',
  description:
    'Use our size guide to find the perfect fit for men, women and kids cotton clothing at QOTN. Detailed measurement tips and size charts for every garment.',
  alternates: { canonical: 'https://qotn.in/size-guide' },
  openGraph: {
    title: 'Size Guide — Find Your Perfect Cotton Fit | QOTN',
    description: 'Detailed size charts and measurement tips for QOTN pure cotton clothing — men, women and kids.',
    url: 'https://qotn.in/size-guide',
  },
};

export default function SizeGuideLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
