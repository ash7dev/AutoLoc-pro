'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, ChevronRight, Loader2, PartyPopper } from 'lucide-react';
import { apiFetch } from '@/lib/nestjs/api-client';
import { supabase } from '@/lib/supabase/client';

type Status = 'loading' | 'confirmed' | 'timeout';

export default function PaymentSuccessPage() {
    const [status, setStatus] = useState<Status>('loading');
    const [reservationId, setReservationId] = useState<string | null>(null);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        const id = sessionStorage.getItem('pending_reservation_id');
        setReservationId(id);

        if (!id) {
            setStatus('timeout');
            return;
        }

        let attempts = 0;
        const MAX_ATTEMPTS = 12; // 12 × 5s = 60s
        let timeoutId: ReturnType<typeof setTimeout>;

        const poll = async () => {
            if (!isMounted.current) return;
            try {
                // Récupérer le token Supabase pour l'appel authentifié
                const { data: { session } } = await supabase.auth.getSession();
                const res = await apiFetch<{ statut: string }>(`/reservations/${id}`, {
                    accessToken: session?.access_token,
                });
                if (res.statut === 'PAYEE' || res.statut === 'CONFIRMEE' || res.statut === 'EN_COURS') {
                    sessionStorage.removeItem('pending_reservation_id');
                    if (isMounted.current) setStatus('confirmed');
                    return;
                }
            } catch { /* continuer le polling */ }

            attempts++;
            if (attempts >= MAX_ATTEMPTS) {
                if (isMounted.current) setStatus('timeout');
                return;
            }
            timeoutId = setTimeout(poll, 5000);
        };

        poll();

        return () => {
            isMounted.current = false;
            clearTimeout(timeoutId);
        };
    }, []);

    if (status === 'loading') {
        return (
            <main className="min-h-screen bg-[#F8FAFB] flex flex-col items-center justify-center gap-5 px-4">
                <div className="w-20 h-20 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                </div>
                <div className="text-center">
                    <p className="text-[16px] font-black text-slate-800">Confirmation du paiement…</p>
                    <p className="text-[13px] text-slate-400 mt-1">Nous vérifions votre paiement, merci de patienter.</p>
                </div>
            </main>
        );
    }

    if (status === 'confirmed') {
        return (
            <main className="min-h-screen bg-[#F8FAFB] flex flex-col items-center justify-center px-4">
                <div className="w-full max-w-sm text-center space-y-6">
                    <div className="mx-auto w-20 h-20 rounded-full bg-emerald-100 border-4 border-emerald-200 flex items-center justify-center">
                        <PartyPopper className="w-9 h-9 text-emerald-600" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h1 className="text-[26px] font-black text-slate-900 tracking-tight">Paiement confirmé !</h1>
                        <p className="mt-2 text-[14px] text-slate-400 leading-relaxed">
                            Votre réservation est confirmée. Consultez votre contrat dès maintenant.
                        </p>
                    </div>
                    <div className="flex flex-col gap-3">
                        {reservationId && (
                            <Link
                                href={`/dashboard/reservations/${reservationId}/contrat`}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl py-3.5 px-5 text-[14px] font-black text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl hover:-translate-y-px"
                                style={{ background: 'linear-gradient(135deg, #34D399, #059669, #047857)' }}
                            >
                                Voir mon contrat
                                <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
                            </Link>
                        )}
                        <Link
                            href="/reservations"
                            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-3.5 px-5 text-[14px] font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                        >
                            Mes réservations
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    // pending or timeout
    return (
        <main className="min-h-screen bg-[#F8FAFB] flex flex-col items-center justify-center px-4">
            <div className="w-full max-w-sm text-center space-y-6">
                <div className="mx-auto w-20 h-20 rounded-full bg-amber-100 border-4 border-amber-200 flex items-center justify-center">
                    <CheckCircle2 className="w-9 h-9 text-amber-500" strokeWidth={1.5} />
                </div>
                <div>
                    <h1 className="text-[22px] font-black text-slate-900 tracking-tight">Paiement reçu</h1>
                    <p className="mt-2 text-[14px] text-slate-400 leading-relaxed">
                        Votre paiement a bien été reçu. La confirmation peut prendre quelques instants.
                        Vérifiez vos réservations.
                    </p>
                </div>
                <Link
                    href="/reservations"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl py-3.5 px-5 text-[14px] font-black text-white shadow-lg shadow-emerald-500/25"
                    style={{ background: 'linear-gradient(135deg, #34D399, #059669, #047857)' }}
                >
                    Voir mes réservations
                    <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
                </Link>
            </div>
        </main>
    );
}
