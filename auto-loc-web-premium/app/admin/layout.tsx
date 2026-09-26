import React from 'react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

import { AdminGuard } from '@/src/core/auth/AdminGuard';
import { AdminSidebar } from '@/src/features/admin/components/AdminSidebar';
import { AdminHeader } from '@/src/features/admin/components/AdminHeader';

export const metadata: Metadata = {
  title: "Administration",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
        {/* Sidebar Administrateur Luxe (Sombre/Émeraude) */}
        <AdminSidebar />

        {/* Espace de Contenu Principal Administrateur avec Header */}
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader />
          <main className="flex-1 px-3 sm:px-6 py-4 sm:py-6 w-full max-w-[1920px] mx-auto">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
