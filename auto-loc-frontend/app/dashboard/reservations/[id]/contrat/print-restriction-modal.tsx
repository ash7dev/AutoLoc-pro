'use client';

import { Clock, Lock, X, Shield, Calendar } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    dateDebut: string;
}

export function PrintRestrictionModal({ isOpen, onClose, dateDebut }: Props) {
    if (!isOpen) return null;

    const debutDate = new Date(dateDebut);
    const unlockDate = new Date(debutDate.getTime() - 24 * 60 * 60 * 1000);
    
    const formattedDebut = debutDate.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    const formattedUnlock = unlockDate.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full mx-4">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
                            <Lock className="w-4 h-4 text-amber-600" strokeWidth={2} />
                        </div>
                        <h3 className="text-[15px] font-black text-slate-900">
                            Impression restreinte
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
                    >
                        <X className="w-4 h-4 text-slate-400" strokeWidth={2} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                    {/* Main message */}
                    <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Clock className="w-3 h-3 text-blue-600" strokeWidth={2} />
                        </div>
                        <div>
                            <p className="text-[13px] font-medium text-slate-900 mb-1">
                                Disponible 24h avant le début
                            </p>
                            <p className="text-[12px] text-slate-600 leading-relaxed">
                                Pour protéger la vie privée des utilisateurs, le contrat ne peut être imprimé que 24 heures avant le début de la location.
                            </p>
                        </div>
                    </div>

                    {/* Date info */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-slate-500" strokeWidth={1.5} />
                            <p className="text-[11px] text-slate-500 font-medium">Début de la location</p>
                        </div>
                        <p className="text-[13px] font-bold text-slate-800">
                            {formattedDebut}
                        </p>
                        <div className="mt-3 pt-3 border-t border-slate-200">
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-emerald-500" strokeWidth={1.5} />
                                <p className="text-[12px] text-emerald-600 font-medium">
                                    Impression disponible à partir du :
                                </p>
                            </div>
                            <p className="text-[13px] font-bold text-emerald-700 mt-1">
                                {formattedUnlock}
                            </p>
                        </div>
                    </div>

                    {/* Security notice */}
                    <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3">
                        <div className="flex items-start gap-2">
                            <Shield className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                            <p className="text-[11px] font-medium text-blue-700 leading-relaxed">
                                Cette mesure garantit la sécurité des coordonnées personnelles tout en permettant une communication appropriée avant la location.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-4 border-t border-slate-100">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[13px] rounded-xl transition-colors"
                    >
                        J'ai compris
                    </button>
                </div>
            </div>
        </div>
    );
}
