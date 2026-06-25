import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { XCircle } from 'lucide-react';
import { AdminCancellationsList } from '@/features/admin/components/admin-cancellations-list';
import { fetchAdminCancellations } from '@/lib/nestjs/admin';
import { fetchMe } from '@/lib/nestjs/auth';

export const metadata = {
  title: 'Annulations | AutoLoc Admin',
};

export default async function AdminCancellationsPage() {
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
  const initialData = await fetchAdminCancellations(token);

  // Filtrer les annulations avec paiements échoués
  const validCancellations = initialData.data.filter((c) => {
    if (c.paiement?.statut === 'ECHOUE' || c.paiement?.statut === 'EN_ATTENTE_PAIEMENT') {
      return false;
    }
    return true;
  });

  const totalValidCancellations = validCancellations.length;
  const totalValidPenalties = validCancellations.filter((c) => Number(c.penalite) > 0).length;

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 text-red-500 mb-1">
            <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
            <span className="text-[12px] font-black uppercase tracking-[0.2em]">Monitoring</span>
          </div>
          <h1 className="text-[32px] font-black text-black tracking-tight leading-tight">
            Annulations <span className="text-slate-200">/</span> <span className="text-slate-400">Gestion & Pénalités</span>
          </h1>
          <p className="text-[14px] font-medium text-slate-400 max-w-md">
            Superviser toutes les annulations, pénalités appliquées et remboursements en attente de traitement.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-100 rounded-2xl px-5 py-3 shadow-sm">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Total</p>
            <p className="text-[20px] font-black text-black leading-none">{totalValidCancellations}</p>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-100 rounded-2xl px-5 py-3 shadow-sm">
            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-0.5">Pénalités</p>
            <p className="text-[20px] font-black text-red-600 leading-none">{totalValidPenalties}</p>
          </div>
        </div>
      </div>

      {/* Main List */}
      <AdminCancellationsList
        accessToken={token}
        initialData={initialData}
      />
    </div>
  );
}
