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
        <main>{children}</main>
      </div>
    </OwnerGuard>
  );
}

