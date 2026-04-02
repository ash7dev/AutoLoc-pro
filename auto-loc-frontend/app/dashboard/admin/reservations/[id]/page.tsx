import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { AdminReservationDetail } from '@/features/admin/components/admin-reservation-detail';
import { fetchAdminReservationDetail } from '@/lib/nestjs/admin';
import { fetchMe } from '@/lib/nestjs/auth';

export const metadata = {
  title: 'Détail Réservation | AutoLoc Admin',
};

export default async function AdminReservationPage({ params }: { params: { id: string } }) {
  const token = cookies().get('nest_access')?.value;
  
  if (!token) {
    redirect('/login');
  }

  // Vérification du rôle Admin
  const profile = await fetchMe(token).catch(() => null);
  if (!profile || profile.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  let reservation = null;
  try {
    reservation = await fetchAdminReservationDetail(token, params.id);
  } catch (error) {
    console.error('Failed to fetch reservation:', error);
  }

  if (!reservation) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
            <span className="text-2xl font-bold text-red-500">?</span>
        </div>
        <div className="space-y-1">
            <h2 className="text-xl font-black text-black tracking-tight">Réservation introuvable</h2>
            <p className="text-[14px] font-medium text-slate-400">Le dossier demandé n'existe pas ou vous n'avez pas les permissions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-10 bg-slate-50/30 min-h-screen">
      <AdminReservationDetail 
        reservation={reservation} 
        accessToken={token} 
      />
    </div>
  );
}
