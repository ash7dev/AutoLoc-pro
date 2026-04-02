import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { AdminUserDetail } from '@/features/admin/components/admin-user-detail';
import { fetchAdminUserDetail } from '@/lib/nestjs/admin';
import { fetchMe } from '@/lib/nestjs/auth';

export const metadata = {
  title: 'Détail Utilisateur | AutoLoc Admin',
};

export default async function AdminUserPage({ params }: { params: { id: string } }) {
  const token = cookies().get('nest_access')?.value;
  
  if (!token) {
    redirect('/login');
  }

  // Vérification du rôle Admin
  const profile = await fetchMe(token).catch(() => null);
  if (!profile || profile.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  let user = null;
  try {
    user = await fetchAdminUserDetail(token, params.id);
  } catch (error) {
    console.error('Failed to fetch user:', error);
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center">
        <h2 className="text-xl font-bold mb-2">Utilisateur introuvable</h2>
        <p className="text-black/50">L'utilisateur demandé n'existe pas ou vous n'avez pas les permissions pour le voir.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <AdminUserDetail user={user} />
    </div>
  );
}
