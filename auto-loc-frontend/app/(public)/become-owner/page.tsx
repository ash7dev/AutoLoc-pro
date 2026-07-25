import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { decodeValidNestJwt } from '@/lib/nestjs/jwt';
import { BecomeOwnerClient } from '@/features/owner/become-owner/components/become-owner-client';

/**
 * /become-owner — Accessible aux utilisateurs qui ne sont pas encore propriétaires.
 * - Non connecté → /login
 * - Déjà PROPRIETAIRE → /dashboard/owner
 * - ADMIN → /dashboard/admin
 * - LOCATAIRE → affiche le flow de transition
 */
export default function BecomeOwnerPage() {
  const payload = decodeValidNestJwt(cookies().get('nest_access')?.value);

  if (payload?.role === 'PROPRIETAIRE') {
    redirect('/dashboard/owner');
  }

  if (payload?.role === 'ADMIN' || payload?.role === 'SUPPORT') {
    redirect('/dashboard/admin');
  }

  return (
    <div className="min-h-[calc(100vh-60px)] bg-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
        <BecomeOwnerClient />
      </div>
    </div>
  );
}
