import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { ArrowLeft, History } from 'lucide-react';
import { fetchAdminActivity } from '../../../../lib/nestjs/admin';
import { AdminAuditLog } from '../../../../features/admin/components/admin-audit-log';

export default async function AdminAuditPage(): Promise<React.ReactElement> {
  const cookieStore = cookies();
  const token = cookieStore.get('nest_access')?.value ?? '';

  let items: Awaited<ReturnType<typeof fetchAdminActivity>> = [];
  try {
    items = await fetchAdminActivity(token);
  } catch {
    // empty state si API indisponible
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

        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 text-slate-500">
            <History className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-black">Journal d&apos;audit</h1>
            <p className="text-[13px] font-medium text-black/40">
              {items.length > 0
                ? `${items.length} événement${items.length > 1 ? 's' : ''} enregistré${items.length > 1 ? 's' : ''}`
                : 'Aucun événement enregistré'}
            </p>
          </div>
        </div>
      </div>

      <AdminAuditLog items={items} />
    </div>
  );
}
