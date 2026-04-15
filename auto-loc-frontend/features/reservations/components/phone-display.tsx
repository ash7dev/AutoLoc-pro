'use client';

import { Phone, Clock } from 'lucide-react';

interface Props {
    telephone?: string;
    dateDebut: string | Date;
    statut: string;
    className?: string;
    showLabel?: boolean;
}

/**
 * Composant réutilisable pour afficher un numéro de téléphone
 * avec déverrouillage automatique 24h avant la date de début
 */
export function PhoneDisplay({ 
    telephone, 
    dateDebut, 
    statut,
    className = '',
    showLabel = true 
}: Props) {
    // Nouvelle logique de visibilité basée sur le statut et le temps
    const canShow = (() => {
        if (statut === 'ANNULEE' || statut === 'TERMINEE') return false;
        
        if (statut === 'EN_COURS' || statut === 'LITIGE') return true;

        if (statut === 'CONFIRMEE') {
            const debut = new Date(dateDebut);
            const now = new Date();
            const diffMs = debut.getTime() - now.getTime();
            const diffHours = diffMs / (1000 * 60 * 60);
            // On affiche si on est à moins de 24h du début (ou après)
            return diffHours <= 24;
        }

        return false;
    })();

    if (!telephone) {
        return (
            <span className={`text-black/20 font-bold ${className}`}>
                Non renseigné
            </span>
        );
    }

    if (canShow) {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                {showLabel && (
                    <span className="text-[12px] text-black/40 font-black uppercase tracking-wider">Téléphone</span>
                )}
                <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2.5} />
                    <span className="text-[13px] font-black text-black">
                        {telephone}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {showLabel && (
                <span className="text-[12px] text-black/40 font-black uppercase tracking-wider">Téléphone</span>
            )}
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 opacity-30">
                    <Phone className="w-3.5 h-3.5 text-black" strokeWidth={2.5} />
                    <span className="text-[13px] font-black text-black">
                        •••••••
                    </span>
                </div>
                <div className="flex items-center gap-1 bg-black/5 px-2 py-0.5 rounded-lg border border-black/5">
                    <Clock className="w-3 h-3 text-black/40" strokeWidth={2.5} />
                    <span className="text-[9px] text-black/60 font-black uppercase tracking-tight">
                        {statut === 'CONFIRMEE' ? '24h avant' : 'Masqué'}
                    </span>
                </div>
            </div>
        </div>
    );
}
