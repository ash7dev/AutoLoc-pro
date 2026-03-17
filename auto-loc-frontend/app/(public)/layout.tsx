import React from 'react';
import { MarketplaceNavbar, MobileBottomNav } from '../../components/layout/marketplace-navbar';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="min-h-screen pb-16 md:pb-0">
      <MarketplaceNavbar />
      {children}
      <MobileBottomNav />
    </div>
  );
}
