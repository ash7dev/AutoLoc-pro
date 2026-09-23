import React from 'react';
import { AdminGuard } from '@/src/core/auth/AdminGuard';
import { AdminSidebar } from '@/src/features/admin/components/AdminSidebar';
import { AdminHeader } from '@/src/features/admin/components/AdminHeader';

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
          <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
