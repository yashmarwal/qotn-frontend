'use client';

import { usePathname } from 'next/navigation';
import { useIsMobile } from '@/hooks/useIsMobile';
import DesktopNavbar from '@/components/desktop/Navbar';
import DesktopFooter from '@/components/desktop/Footer';
import CartDrawer from '@/components/desktop/CartDrawer';
import MobileNavbar from '@/components/mobile/Navbar';
import MobileFooter from '@/components/mobile/Footer';
import MobileBottomNav from '@/components/mobile/BottomNav';
import AnnouncementBar from '@/components/shared/AnnouncementBar';
import CouponPopup from '@/components/shared/CouponPopup';

export default function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const isAdmin = pathname.startsWith('/admin');
  // Bottom nav is hidden on checkout + cart (pages have their own action bars) and admin
  const showBottomNav = isMobile && !isAdmin && pathname !== '/checkout' && pathname !== '/cart';

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <AnnouncementBar />
      {isMobile ? <MobileNavbar /> : <DesktopNavbar />}
      <main>
        {children}
      </main>
      {isMobile ? <MobileFooter /> : <DesktopFooter />}
      {/* Spacer so the footer clears whatever fixed bar is at the bottom */}
      {isMobile && (
        <div style={{
          height: pathname === '/cart'
            ? 'calc(110px + env(safe-area-inset-bottom, 0px))'
            : showBottomNav
              ? 'calc(56px + env(safe-area-inset-bottom, 0px))'
              : '0',
        }} />
      )}
      {/* Cart drawer is desktop-only; mobile uses the cart page */}
      {!isMobile && <CartDrawer />}
      {showBottomNav && <MobileBottomNav />}
      <CouponPopup />
    </>
  );
}
