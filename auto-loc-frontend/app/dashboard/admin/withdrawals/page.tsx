import React from 'react';
import Link from 'next/link';
import { Banknote, ArrowLeft } from 'lucide-react';
import { AdminWithdrawalsList, type Withdrawal } from '../../../../features/admin/components/admin-withdrawals-list';

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_WITHDRAWALS: Withdrawal[] = [
  { id: 'w1', ownerName: 'Moussa Diop', amount: 350000, method: 'Virement', bankInfo: 'BOA •• 4521', requestedAt: 'Il y a 1h', status: 'pending' },
  { id: 'w2', ownerName: 'Fatou Sow', amount: 180000, method: 'Wave', bankInfo: '+221 77 ••• 67', requestedAt: 'Il y a 4h', status: 'pending' },
  { id: 'w3', ownerName: 'Amadou Ba', amount: 520000, method: 'Virement', bankInfo: 'CBAO •• 7832', requestedAt: 'Hier', status: 'pending' },
  { id: 'w4', ownerName: 'Ousmane Diallo', amount: 95000, method: 'Orange Money', bankInfo: '+221 76 ••• 12', requestedAt: 'Hier', status: 'pending' },
  { id: 'w5', ownerName: 'Aissatou Ndiaye', amount: 275000, method: 'Virement', bankInfo: 'SGBS •• 1290', requestedAt: 'Il y a 2j', status: 'processed' },
  { id: 'w6', ownerName: 'Ibrahima Fall', amount: 45000, method: 'Wave', bankInfo: '+221 78 ••• 90', requestedAt: 'Il y a 3j', status: 'rejected' },
];

function formatPrice(n: number) { return new Intl.NumberFormat('fr-FR').format(n); }

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminWithdrawalsPage(): React.ReactElement {
  const totalPending = MOCK_WITHDRAWALS
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
              {formatPrice(totalPending)} FCFA en attente · {MOCK_WITHDRAWALS.filter((w) => w.status === 'pending').length} demande{MOCK_WITHDRAWALS.filter((w) => w.status === 'pending').length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      <AdminWithdrawalsList withdrawals={MOCK_WITHDRAWALS} />
    </div>
  );
}
