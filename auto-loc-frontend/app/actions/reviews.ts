'use server';

import { revalidatePath } from 'next/cache';
import { createReview as apiCreateReview } from '@/lib/nestjs/reviews';

export async function createReviewAction(data: {
    reservationId: string;
    note: number;
    commentaire?: string;
}) {
    try {
        // Appeler l'API pour créer l'avis
        await apiCreateReview(data);

        // Invalider le cache des pages de réservation
        revalidatePath(`/dashboard/owner/reservations/${data.reservationId}`);
        revalidatePath(`/dashboard/reservations/${data.reservationId}`);
        revalidatePath('/dashboard/owner/reviews');
        revalidatePath('/dashboard/owner');

        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Une erreur est survenue. Réessayez.';
        return { success: false, error: message };
    }
}
