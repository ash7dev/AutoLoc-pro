'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function PublicLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hidesBottomNav =
    pathname.startsWith('/dashboard') || pathname.startsWith('/vehicle/');
  return (
    <div className={cn('min-h-screen md:pb-0', hidesBottomNav ? 'pb-0' : 'pb-20')}>
      {children}
    </div>
  );
}
