import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { ArrowLeft, Users } from 'lucide-react';
import { fetchAdminUsers } from '../../../../lib/nestjs/admin';
import { AdminUsersList } from '../../../../features/admin/components/admin-users-list';

export default async function AdminUsersPage(): Promise<React.ReactElement> {
  const cookieStore = cookies();
  const token = cookieStore.get('nest_access')?.value ?? '';

  let users: Awaited<ReturnType<typeof fetchAdminUsers>> = [];
  try {
    users = await fetchAdminUsers(token);
  } catch {
    // API non disponible — affiche empty state
  }

  const bannedCount = users.filter((u) => u.isBanned).length;
  const kycPendingCount = users.filter((u) => u.kycStatus === 'EN_ATTENTE').length;

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

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 text-slate-600">
              <Users className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-black">Utilisateurs</h1>
              <p className="text-[13px] font-medium text-black/40">
                {users.length} utilisateur{users.length > 1 ? 's' : ''} au total
              </p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex items-center gap-2">
            {kycPendingCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                bg-amber-50 border border-amber-200/60 text-[12px] font-bold text-amber-700">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                {kycPendingCount} KYC en attente
              </span>
            )}
            {bannedCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                bg-red-50 border border-red-200/60 text-[12px] font-bold text-red-600">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                {bannedCount} banni{bannedCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      <AdminUsersList users={users} />
    </div>
  );
}
