'use client';

import { useParams, useRouter } from 'next/navigation';
import { OwnerHeader } from '@/features/dashboard/components/owner-header';

export default function PendingReservationPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();

    return (
        <div className="flex flex-col gap-4 p-3 sm:gap-6 sm:p-6">
            <OwnerHeader
                title="Confirmation de réservation"
                subtitle={`Réservation #${params.id}`}
            />
            <div className="rounded-xl border bg-card p-5 sm:p-8 text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                    <span className="text-2xl">⏳</span>
                </div>
                <h2 className="text-xl font-semibold">En attente de confirmation</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                    Cette réservation est en attente de votre confirmation.
                    Veuillez vérifier les détails avant d&apos;accepter ou de refuser.
                </p>
                <div className="flex gap-3 justify-center pt-2">
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 rounded-md border text-sm font-medium hover:bg-muted transition-colors"
                    >
                        Retour
                    </button>
                </div>
            </div>
        </div>
    );
}
