import React from 'react';
import { MarketplaceNavbar } from '../../components/layout/marketplace-navbar';
import { MobileBottomNav } from '../../components/layout/MobileBottomNav';
import { PublicLayoutShell } from './PublicLayoutShell';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <PublicLayoutShell>
      <MarketplaceNavbar />
      {children}
      <MobileBottomNav />
    </PublicLayoutShell>
  );
}
