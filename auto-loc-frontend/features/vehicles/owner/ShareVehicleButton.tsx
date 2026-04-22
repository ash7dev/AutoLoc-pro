'use client';

import React from 'react';
import { Share2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface ShareVehicleButtonProps {
    vehicleId: string;
    marque: string;
    modele: string;
}

export function ShareVehicleButton({ vehicleId, marque, modele }: ShareVehicleButtonProps) {
    const [shared, setShared] = React.useState(false);

    const handleShare = async () => {
        const url = `${window.location.origin}/vehicle/${vehicleId}`;
        const title = `Louez ma ${marque} ${modele} sur AutoLoc !`;
        const text = `Découvrez ma ${marque} ${modele} disponible à la location sur AutoLoc. Réservez-la facilement en ligne !`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text,
                    url,
                });
                return;
            } catch (err) {
                // L'utilisateur a annulé le partage, on ignore
                if ((err as Error).name !== 'AbortError') {
                    console.error('Error sharing:', err);
                }
            }
        }

        // Fallback: copier le lien dans le presse-papier
        try {
            await navigator.clipboard.writeText(url);
            setShared(true);
            toast.success("Lien copié !", {
                description: "Le lien de votre véhicule a été copié dans le presse-papier.",
            });
            setTimeout(() => setShared(false), 2000);
        } catch (err) {
            toast.error("Erreur", {
                description: "Impossible de copier le lien.",
            });
        }
    };

    return (
        <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-[12px] font-bold text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 transition-all"
        >
            {shared ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2.5} />
            ) : (
                <Share2 className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2.5} />
            )}
            Partager
        </button>
    );
}
