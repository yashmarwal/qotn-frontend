import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About QOTN — Pure Cotton. Nothing Else. | Made in India',
  description:
    'QOTN is an Indian D2C pure cotton brand. We make 100% cotton clothing for men, women and kids. No blends. No shortcuts. Just pure fabric.',
  alternates: { canonical: 'https://qotn.in/about' },
  openGraph: {
    title: 'About QOTN — Pure Cotton. Nothing Else.',
    description: 'QOTN is an Indian D2C pure cotton brand. No blends. No shortcuts.',
    url: 'https://qotn.in/about',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
