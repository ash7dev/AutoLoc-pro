'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { XCircle, ChevronRight } from 'lucide-react';

export default function PaymentCancelPage() {
    const [reservationId, setReservationId] = useState<string | null>(null);

    useEffect(() => {
        const id = sessionStorage.getItem('paytech_pending_reservation_id');
        setReservationId(id);
        // Ne pas supprimer l'id ici — l'utilisateur peut vouloir réessayer
    }, []);

    return (
        <main className="min-h-screen bg-[#F8FAFB] flex flex-col items-center justify-center px-4">
            <div className="w-full max-w-sm text-center space-y-6">
                <div className="mx-auto w-20 h-20 rounded-full bg-red-100 border-4 border-red-200 flex items-center justify-center">
                    <XCircle className="w-9 h-9 text-red-500" strokeWidth={1.5} />
                </div>
                <div>
                    <h1 className="text-[22px] font-black text-slate-900 tracking-tight">Paiement annulé</h1>
                    <p className="mt-2 text-[14px] text-slate-400 leading-relaxed">
                        Votre paiement a été annulé. Aucun montant n&apos;a été débité.
                        {reservationId && ' Votre réservation a été créée mais reste en attente de paiement.'}
                    </p>
                </div>
                <div className="flex flex-col gap-3">
                    {reservationId && (
                        <Link
                            href="/reservations"
                            className="inline-flex items-center justify-center gap-2 rounded-2xl py-3.5 px-5 text-[14px] font-black text-white shadow-lg shadow-emerald-500/25"
                            style={{ background: 'linear-gradient(135deg, #34D399, #059669, #047857)' }}
                        >
                            Voir mes réservations
                            <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
                        </Link>
                    )}
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-3.5 px-5 text-[14px] font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                    >
                        Retour à l&apos;accueil
                    </Link>
                </div>
            </div>
        </main>
    );
}
