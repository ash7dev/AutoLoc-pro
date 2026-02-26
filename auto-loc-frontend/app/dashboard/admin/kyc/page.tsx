import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { ArrowLeft, BadgeCheck } from 'lucide-react';
import { fetchAdminUsers } from '../../../../lib/nestjs/admin';
import { AdminKycList } from '../../../../features/admin/components/admin-kyc-list';

export default async function AdminKycPage(): Promise<React.ReactElement> {
  const cookieStore = cookies();
  const token = cookieStore.get('nest_access')?.value ?? '';

  let users: Awaited<ReturnType<typeof fetchAdminUsers>> = [];
  try {
    users = await fetchAdminUsers(token, 'EN_ATTENTE');
  } catch {
    // API non disponible — affiche empty state
  }

  return (
    <div className="p-6 lg:p-8">

      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/admin"
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-black/30 hover:text-black/60 transition-colors mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
          Retour
        </Link>

        <div className="flex items-center gap-3 mb-1">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-100 text-amber-600">
            <BadgeCheck className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-black">
              Vérifications KYC
            </h1>
            <p className="text-[13px] font-medium text-black/40">
              {users.length > 0
                ? `${users.length} demande${users.length > 1 ? 's' : ''} en attente`
                : 'Aucune demande en attente'}
            </p>
          </div>
        </div>
      </div>

      <AdminKycList users={users} />
    </div>
  );
}
