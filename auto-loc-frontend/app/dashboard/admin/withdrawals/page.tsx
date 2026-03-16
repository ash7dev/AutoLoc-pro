import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Banknote, ArrowLeft } from 'lucide-react';
import { AdminWithdrawalsList, type Withdrawal } from '../../../../features/admin/components/admin-withdrawals-list';
import { fetchAdminWithdrawals } from '../../../../lib/nestjs/admin';

function formatPrice(n: number) { return new Intl.NumberFormat('fr-FR').format(n); }

const METHOD_LABELS: Record<string, string> = {
  WAVE: 'Wave',
  ORANGE_MONEY: 'Orange Money',
  VIREMENT: 'Virement',
};

const STATUT_MAP: Record<string, Withdrawal['status']> = {
  EN_ATTENTE: 'pending',
  VALIDE: 'pending',
  EFFECTUE: 'processed',
  REJETE: 'rejected',
};

export default async function AdminWithdrawalsPage(): Promise<React.ReactElement> {
  const token = cookies().get('nest_access')?.value;
  if (!token) redirect('/login');

  let withdrawals: Withdrawal[] = [];
  try {
    const data = await fetchAdminWithdrawals(token);
    withdrawals = data.map((w) => ({
      id: w.id,
      ownerName: w.ownerName,
      amount: w.amount,
      method: METHOD_LABELS[w.method] ?? w.method,
      bankInfo: w.bankInfo,
      requestedAt: new Date(w.demandeeLe).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'short', year: 'numeric',
      }),
      status: STATUT_MAP[w.statut] ?? 'pending',
    }));
  } catch {
    // Afficher liste vide si erreur
  }

  const pendingCount = withdrawals.filter((w) => w.status === 'pending').length;
  const totalPending = withdrawals
    .filter((w) => w.status === 'pending')
    .reduce((s, w) => s + w.amount, 0);

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/dashboard/admin" className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-black/30 hover:text-black/60 transition-colors mb-3">
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} /> Retour
        </Link>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600">
            <Banknote className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-black">Retraits</h1>
            <p className="text-[13px] font-medium text-black/40">
              {pendingCount > 0
                ? `${formatPrice(totalPending)} FCFA en attente · ${pendingCount} demande${pendingCount > 1 ? 's' : ''}`
                : 'Aucune demande en attente'}
            </p>
          </div>
        </div>
      </div>

      <AdminWithdrawalsList withdrawals={withdrawals} />
    </div>
  );
}
