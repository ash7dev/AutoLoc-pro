import React from 'react';
import { MarketplaceNavbar } from '../../components/layout/marketplace-navbar';
import { MobileBottomNav } from '../../components/layout/MobileBottomNav';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <MarketplaceNavbar />
      {children}
      <MobileBottomNav />
    </div>
  );
}
