import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us — QOTN',
  description:
    'Get in touch with QOTN. We are here to help with orders, custom stitching, returns and all things cotton. Email: Helloqotn@gmail.com | Instagram: @qotn.in',
  alternates: { canonical: 'https://qotn.in/contact' },
  openGraph: {
    title: 'Contact Us — QOTN',
    description: 'Reach QOTN for order support, custom stitching enquiries, and all things cotton.',
    url: 'https://qotn.in/contact',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
