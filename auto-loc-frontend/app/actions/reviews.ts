'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { apiFetch } from '@/lib/nestjs/api-client';

export async function createReviewAction(data: {
    reservationId: string;
    note: number;
    commentaire?: string;
}) {
    try {
        // Récupérer le token Supabase côté serveur
        const supabase = createSupabaseServerClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.access_token) {
            return { success: false, error: 'Non authentifié. Veuillez vous reconnecter.' };
        }

        // Appeler l'API avec le token
        await apiFetch('/reviews', {
            method: 'POST',
            body: data,
            accessToken: session.access_token,
        });

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
