'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Banknote, Receipt, ArrowRight } from 'lucide-react';
import { PrintRestrictionModal } from './contrat/print-restriction-modal';

interface ContratActionsProps {
    reservationId: string;
    canPrint: boolean;
    dateDebut: string;
}

export function ContratActions({ reservationId, canPrint, dateDebut }: ContratActionsProps) {
    const [showModal, setShowModal] = useState(false);

    const handleActionClick = (e: React.MouseEvent) => {
        if (!canPrint) {
            e.preventDefault();
            setShowModal(true);
        }
    };

    return (
        <div className="flex items-center gap-2 flex-shrink-0">
            {/* PDF Button */}
            <a
                href={`/api/nest/reservations/${reservationId}/contrat`}
                download={`contrat-${reservationId.slice(0, 8)}.pdf`}
                onClick={handleActionClick}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[12px] font-bold text-slate-600 transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-sm"
            >
                <Banknote className="w-3.5 h-3.5" strokeWidth={2.5} />
                PDF
            </a>

            {/* Voir Button */}
            <Link
                href={`/dashboard/reservations/${reservationId}/contrat`}
                onClick={handleActionClick}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-[12px] font-bold text-white transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-sm"
            >
                <Receipt className="w-3.5 h-3.5" strokeWidth={2.5} />
                Voir
                <ArrowRight className="w-3 h-3" strokeWidth={2.5} />
            </Link>

            {/* Modal de restriction */}
            <PrintRestrictionModal 
                isOpen={showModal} 
                onClose={() => setShowModal(false)} 
                dateDebut={dateDebut}
            />
        </div>
    );
}
