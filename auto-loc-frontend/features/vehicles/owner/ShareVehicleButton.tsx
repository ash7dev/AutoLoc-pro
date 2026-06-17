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
            title="Partager l'annonce"
            className="w-9 h-9 sm:w-auto sm:px-3.5 rounded-xl border border-slate-200 bg-white inline-flex items-center justify-center gap-1.5 text-[12px] font-semibold text-slate-500 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition-all"
        >
            {shared ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" strokeWidth={2.5} />
            ) : (
                <Share2 className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2} />
            )}
            <span className="hidden sm:inline">{shared ? 'Copié !' : 'Partager'}</span>
        </button>
    );
}
