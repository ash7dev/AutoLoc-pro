'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { MarketplaceNavbar } from '../../components/layout/marketplace-navbar';
import { MobileBottomNav } from '../../components/layout/MobileBottomNav';
import { cn } from '@/lib/utils';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const pathname = usePathname();
  // Pages où MobileBottomNav se masque elle-même (voir MobileBottomNav.tsx) :
  // pas besoin de réserver son espace en bas.
  const hidesBottomNav = pathname.startsWith('/dashboard') || pathname.startsWith('/vehicle/');

  return (
    <div className={cn('min-h-screen md:pb-0', hidesBottomNav ? 'pb-0' : 'pb-20')}>
      <MarketplaceNavbar />
      {children}
      <MobileBottomNav />
    </div>
  );
}
