import React from 'react';
import { MarketplaceNavbar } from '../../components/layout/marketplace-navbar';
import { GlobalRoleSync } from '../../features/auth/components/global-role-sync';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="min-h-screen">
      <GlobalRoleSync />
      <MarketplaceNavbar />
      {children}
    </div>
  );
}
