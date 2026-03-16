import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Scale, ArrowLeft } from 'lucide-react';
import { AdminDisputesList, type Dispute } from '../../../../features/admin/components/admin-disputes-list';
import { fetchAdminDisputes } from '../../../../lib/nestjs/admin';

function derivePriority(amount: number | null): Dispute['priority'] {
  if (amount === null) return 'medium';
  if (amount >= 100_000) return 'high';
  if (amount >= 30_000) return 'medium';
  return 'low';
}

const STATUT_MAP: Record<string, Dispute['status']> = {
  EN_ATTENTE: 'open',
  FONDE: 'resolved',
  NON_FONDE: 'dismissed',
};

export default async function AdminDisputesPage(): Promise<React.ReactElement> {
  const token = cookies().get('nest_access')?.value;
  if (!token) redirect('/login');

  let disputes: Dispute[] = [];
  try {
    const data = await fetchAdminDisputes(token);
    disputes = data.map((d) => ({
      id: d.id,
      reservationId: `#${d.reservationId.slice(0, 6).toUpperCase()}`,
      renterName: d.renterName,
      ownerName: d.ownerName,
      vehicle: d.vehicle,
      reason: d.description.length > 60 ? d.description.slice(0, 57) + '…' : d.description,
      description: d.description,
      amount: d.amount,
      openedAt: new Date(d.openedAt).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'short', year: 'numeric',
      }),
      status: STATUT_MAP[d.statut] ?? 'open',
      priority: derivePriority(d.amount),
    }));
  } catch {
    // Afficher liste vide si erreur
  }

  const activeCount = disputes.filter((d) => d.status === 'open' || d.status === 'investigating').length;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/dashboard/admin" className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-black/30 hover:text-black/60 transition-colors mb-3">
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} /> Retour
        </Link>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-100 text-red-600">
            <Scale className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-black">Litiges</h1>
            <p className="text-[13px] font-medium text-black/40">
              {activeCount > 0
                ? `${activeCount} litige${activeCount > 1 ? 's' : ''} actif${activeCount > 1 ? 's' : ''}`
                : 'Aucun litige actif'}
            </p>
          </div>
        </div>
      </div>

      <AdminDisputesList disputes={disputes} />
    </div>
  );
}
