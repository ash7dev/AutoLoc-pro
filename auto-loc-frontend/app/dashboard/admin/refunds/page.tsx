import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DollarSign, ArrowLeft } from 'lucide-react';
import { AdminRefundsList } from '@/features/admin/components/admin-refunds-list';
import { fetchAdminRefunds, type AdminRefund } from '@/lib/nestjs/admin';

function formatPrice(n: number) { return new Intl.NumberFormat('fr-FR').format(n); }

export default async function AdminRefundsPage(): Promise<React.ReactElement> {
  const token = cookies().get('nest_access')?.value;
  if (!token) redirect('/login');

  let refunds: AdminRefund[] = [];
  try {
    refunds = await fetchAdminRefunds(token);
  } catch (error) {
    console.error('Failed to fetch refunds:', error);
  }

  const pendingCount = refunds.length;
  const totalPending = refunds.reduce((s, r) => s + r.montantRembourse, 0);

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/dashboard/admin" className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-black/30 hover:text-black/60 transition-colors mb-3">
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} /> Retour
        </Link>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 text-blue-600">
            <DollarSign className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-black">Remboursements</h1>
            <p className="text-[13px] font-medium text-black/40">
              {pendingCount > 0
                ? `${formatPrice(totalPending)} FCFA à rembourser · ${pendingCount} remboursement${pendingCount > 1 ? 's' : ''}`
                : 'Aucun remboursement en attente'}
            </p>
          </div>
        </div>
      </div>

      <AdminRefundsList refunds={refunds} />
    </div>
  );
}
