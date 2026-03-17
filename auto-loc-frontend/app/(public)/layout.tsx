import React from 'react';
import { MarketplaceNavbar } from '../../components/layout/marketplace-navbar';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="min-h-screen">
      <MarketplaceNavbar />
      {children}
    </div>
  );
}
