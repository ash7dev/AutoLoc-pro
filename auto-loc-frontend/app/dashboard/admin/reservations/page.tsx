import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { Calendar } from 'lucide-react';
import { AdminReservationsList } from '@/features/admin/components/admin-reservations-list';
import { fetchAdminReservations } from '@/lib/nestjs/admin';
import { fetchMe } from '@/lib/nestjs/auth';

export const metadata = {
  title: 'Gestion des Réservations | AutoLoc Admin',
};

export default async function AdminReservationsPage() {
  const token = cookies().get('nest_access')?.value;
  
  if (!token) {
    redirect('/login');
  }

  // Vérification du rôle Admin
  const profile = await fetchMe(token).catch(() => null);
  if (!profile || profile.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  // Initial data fetch for SEO / SSR
  const initialData = await fetchAdminReservations(token);

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 text-emerald-500 mb-1">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="text-[12px] font-black uppercase tracking-[0.2em]">Live Control</span>
          </div>
          <h1 className="text-[32px] font-black text-black tracking-tight leading-tight">
            Réservations <span className="text-slate-200">/</span> <span className="text-slate-400">Flux Global</span>
          </h1>
          <p className="text-[14px] font-medium text-slate-400 max-w-md">
            Superviser, filtrer et gérer toutes les transactions de location actives sur la plateforme AutoLoc.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-100 rounded-2xl px-5 py-3 shadow-sm">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Volume Total</p>
            <p className="text-[20px] font-black text-black leading-none">{initialData.total}</p>
          </div>
        </div>
      </div>

      {/* Main List */}
      <AdminReservationsList 
        accessToken={token} 
        initialData={initialData} 
      />
    </div>
  );
}
