'use client';

import { Phone, Clock, MessageSquare } from 'lucide-react';

interface Props {
    telephone?: string;
    dateDebut: string | Date;
    statut: string;
    className?: string;
    showLabel?: boolean;
    name?: string; // Nom de la personne à contacter
    reservationId?: string; // ID pour le message pré-rempli
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
    showLabel = true,
    name = '',
    reservationId = ''
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
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2.5} />
                        <span className="text-[13px] font-black text-black">
                            {telephone}
                        </span>
                    </div>
                    
                    {/* WhatsApp Button */}
                    <span 
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const url = `https://wa.me/${telephone.replace(/\s+/g, '')}?text=${encodeURIComponent(`Bonjour ${name}, je vous contacte concernant la réservation ${reservationId.slice(0, 8).toUpperCase()} sur AutoLoc.`)}`;
                            window.open(url, '_blank', 'noopener,noreferrer');
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                e.stopPropagation();
                                const url = `https://wa.me/${telephone.replace(/\s+/g, '')}?text=${encodeURIComponent(`Bonjour ${name}, je vous contacte concernant la réservation ${reservationId.slice(0, 8).toUpperCase()} sur AutoLoc.`)}`;
                                window.open(url, '_blank', 'noopener,noreferrer');
                            }
                        }}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500 text-white text-[10px] font-bold hover:bg-emerald-600 transition-colors shadow-sm shadow-emerald-500/20 cursor-pointer select-none"
                    >
                        <MessageSquare className="w-3 h-3" strokeWidth={2.5} />
                        WhatsApp
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
