import React from 'react';
import { OwnerGuard } from '../../src/core/auth/OwnerGuard';
import { OwnerNavbar } from '../../src/features/dashboard/components/OwnerNavbar';

export default function OwnerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OwnerGuard>
      <div className="min-h-screen bg-slate-50">
        <OwnerNavbar />
        <main className="mx-auto w-full max-w-7xl px-4 pb-4 sm:pb-16 pt-[calc(4.5rem+env(safe-area-inset-top))] sm:pt-20 lg:pt-22 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </OwnerGuard>
  );
}

