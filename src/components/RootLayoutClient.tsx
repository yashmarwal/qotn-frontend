'use client';

import { usePathname } from 'next/navigation';
import { useIsMobile } from '@/hooks/useIsMobile';
import DesktopNavbar from '@/components/desktop/Navbar';
import DesktopFooter from '@/components/desktop/Footer';
import CartDrawer from '@/components/desktop/CartDrawer';
import MobileNavbar from '@/components/mobile/Navbar';
import MobileFooter from '@/components/mobile/Footer';
import AnnouncementBar from '@/components/shared/AnnouncementBar';
import CouponPopup from '@/components/shared/CouponPopup';

export default function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <AnnouncementBar />
      {isMobile ? <MobileNavbar /> : <DesktopNavbar />}
      <main>{children}</main>
      {isMobile ? <MobileFooter /> : <DesktopFooter />}
      {/* Cart drawer is desktop-only; mobile uses the cart page */}
      {!isMobile && <CartDrawer />}
      <CouponPopup />
    </>
  );
}
