'use client';

import { useState } from 'react';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { RefuseVehicleModal } from './refuse-vehicle-modal';

interface Props {
    reservationId: string;
}

export function TenantDisputeButton({ reservationId }: Props) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="group flex items-center gap-3 rounded-xl px-4 py-3 border text-left w-full sm:w-auto
                    bg-white text-orange-600 border-orange-200
                    hover:bg-orange-500 hover:text-white hover:border-orange-500
                    shadow-sm hover:shadow-md hover:shadow-orange-500/15
                    hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
                <div className="w-7 h-7 rounded-lg bg-orange-50 group-hover:bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-3.5 h-3.5" strokeWidth={2} />
                </div>
                <div className="flex flex-col gap-0.5">
                    <span className="text-[13px] font-bold leading-none">Signaler un problème</span>
                    <span className="text-[11px] font-medium leading-none text-orange-400">
                        Véhicule non conforme — je refuse la prise en charge
                    </span>
                </div>
                <ChevronRight className="w-4 h-4 ml-auto flex-shrink-0 opacity-40" strokeWidth={2.5} />
            </button>

            <RefuseVehicleModal 
                reservationId={reservationId} 
                open={open} 
                onClose={() => setOpen(false)} 
            />
        </>
    );
}
