import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';

export const metadata: Metadata = {
  title: 'QOTN — Pure Cotton. Nothing Else.',
  description: 'Premium pure cotton apparel from India. We only make one thing. We make it purely.',
  keywords: 'cotton, pure cotton, apparel, India, QOTN, t-shirts, kurtas, dresses',
  openGraph: {
    title: 'QOTN — Pure Cotton. Nothing Else.',
    description: 'Premium pure cotton apparel from India.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <WishlistProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
            <CartDrawer />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
