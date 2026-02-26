import React from 'react';
import Link from 'next/link';
import { Scale, ArrowLeft } from 'lucide-react';
import { AdminDisputesList, type Dispute } from '../../../../features/admin/components/admin-disputes-list';

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_DISPUTES: Dispute[] = [
  { id: 'd1', reservationId: '#4521', renterName: 'Ibrahima Fall', ownerName: 'Moussa Diop', vehicle: 'Toyota Land Cruiser', reason: 'Dommage signalé', description: 'Rayure sur le pare-chocs avant non déclarée par le locataire.', amount: 125000, openedAt: 'Il y a 2h', status: 'open', priority: 'high' },
  { id: 'd2', reservationId: '#4498', renterName: 'Fatou Sow', ownerName: 'Amadou Ba', vehicle: 'Renault Duster', reason: 'Annulation tardive', description: 'Locataire a annulé 1h avant la prise en charge.', amount: 18000, openedAt: 'Hier', status: 'investigating', priority: 'medium' },
  { id: 'd3', reservationId: '#4475', renterName: 'Ousmane Diallo', ownerName: 'Aissatou Ndiaye', vehicle: 'Peugeot 308', reason: 'Véhicule non conforme', description: 'Le véhicule ne correspondait pas aux photos de l\'annonce.', amount: null, openedAt: 'Il y a 3j', status: 'open', priority: 'high' },
  { id: 'd4', reservationId: '#4430', renterName: 'Mariama Sy', ownerName: 'Ibrahima Fall', vehicle: 'Mercedes Classe C', reason: 'Retard de remise', description: 'Propriétaire a livré le véhicule 2h en retard.', amount: 10000, openedAt: 'Il y a 5j', status: 'resolved', priority: 'low' },
  { id: 'd5', reservationId: '#4412', renterName: 'Cheikh Ndoye', ownerName: 'Fatou Sow', vehicle: 'Ford Ranger', reason: 'Problème mécanique', description: 'Panne moteur à 3h de la location. Dépanneuse nécessaire.', amount: 85000, openedAt: 'Il y a 1 sem.', status: 'dismissed', priority: 'medium' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminDisputesPage(): React.ReactElement {
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
              {MOCK_DISPUTES.filter((d) => d.status === 'open' || d.status === 'investigating').length} litige{MOCK_DISPUTES.filter((d) => d.status === 'open' || d.status === 'investigating').length > 1 ? 's' : ''} actif{MOCK_DISPUTES.filter((d) => d.status === 'open' || d.status === 'investigating').length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      <AdminDisputesList disputes={MOCK_DISPUTES} />
    </div>
  );
}
