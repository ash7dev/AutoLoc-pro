'use client';

import { useState } from 'react';
import { BadgeCheck, AlertTriangle, X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { KycSubmitForm } from './KycSubmitForm';
import type { ProfileResponse } from '@/lib/nestjs/auth';

type KycStatus = ProfileResponse['kycStatus'];

export function KycProfileButton({ kycStatus }: { kycStatus: KycStatus }) {
    const [open, setOpen] = useState(false);

    if (kycStatus === 'VERIFIE' || kycStatus === 'EN_ATTENTE') return null;

    const isRejected = kycStatus === 'REJETE';

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className={cn(
                    'w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border font-semibold text-[13.5px] transition-all',
                    isRejected
                        ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                )}
            >
                {isRejected
                    ? <AlertTriangle className="w-5 h-5 flex-shrink-0" strokeWidth={2} />
                    : <BadgeCheck className="w-5 h-5 flex-shrink-0" strokeWidth={2} />
                }
                <div className="text-left">
                    <p className="font-black text-[13px]">
                        {isRejected ? 'Vérification refusée — resoumettre' : 'Vérifier mon identité (KYC)'}
                    </p>
                    <p className={cn(
                        'text-[11px] font-medium mt-0.5',
                        isRejected ? 'text-red-500' : 'text-emerald-500'
                    )}>
                        {isRejected
                            ? 'Votre dossier a été refusé. Soumettez de nouveaux documents.'
                            : 'Obligatoire pour recevoir des réservations en tant que propriétaire.'}
                    </p>
                </div>
            </button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="p-0 overflow-hidden gap-0 bg-slate-950 border border-white/8 max-w-md w-full rounded-3xl shadow-2xl shadow-black/60 max-h-[85vh] overflow-y-auto">
                    <div className="flex items-center justify-between px-6 pt-6 pb-4">
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                'w-9 h-9 rounded-xl flex items-center justify-center border',
                                isRejected ? 'bg-red-400/10 border-red-400/20' : 'bg-emerald-400/10 border-emerald-400/20'
                            )}>
                                {isRejected
                                    ? <AlertTriangle className="w-4.5 h-4.5 text-red-400" strokeWidth={1.75} />
                                    : <BadgeCheck className="w-4.5 h-4.5 text-emerald-400" strokeWidth={1.75} />
                                }
                            </div>
                            <div>
                                <p className={cn(
                                    'text-[10px] font-black uppercase tracking-[0.16em]',
                                    isRejected ? 'text-red-400/70' : 'text-emerald-400/70'
                                )}>
                                    {isRejected ? 'Action requise' : 'Vérification d\'identité'}
                                </p>
                                <h2 className="text-[16px] font-black text-white leading-tight">
                                    {isRejected ? 'Resoumettre mes documents' : 'Vérifier mon identité'}
                                </h2>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="w-8 h-8 rounded-full bg-white/8 border border-white/10 flex items-center justify-center hover:bg-white/15 transition-colors"
                        >
                            <X className="w-4 h-4 text-white/50" strokeWidth={2} />
                        </button>
                    </div>

                    <div className="px-6 pb-6">
                        <div className="rounded-2xl bg-white p-4">
                            <KycSubmitForm initialStatus={kycStatus} />
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
