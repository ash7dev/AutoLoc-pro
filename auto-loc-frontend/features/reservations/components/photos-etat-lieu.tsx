'use client';

import Image from 'next/image';
import { Camera } from 'lucide-react';
import type { PhotoEtatLieu } from '@/lib/nestjs/reservations';

const LABEL: Record<string, string> = {
    AVANT:       'Avant',
    ARRIERE:     'Arrière',
    COTE_GAUCHE: 'Côté gauche',
    COTE_DROIT:  'Côté droit',
    COMPTEUR_KM: 'Compteur km',
    CARBURANT:   'Carburant',
};

interface Props {
    photos: PhotoEtatLieu[];
}

function PhotoGrid({ photos, title }: { photos: PhotoEtatLieu[]; title: string }) {
    if (photos.length === 0) return null;
    return (
        <div className="space-y-2.5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{title}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {photos.map(p => (
                    <a
                        key={p.id}
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 bg-slate-100 block"
                    >
                        <Image
                            src={p.url}
                            alt={LABEL[p.categorie ?? ''] ?? p.categorie ?? 'Photo'}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 640px) 50vw, 33vw"
                        />
                        {p.categorie && (
                            <div className="absolute bottom-0 inset-x-0 px-2 py-1 bg-black/50 backdrop-blur-sm">
                                <span className="text-[10px] font-bold text-white/90">
                                    {LABEL[p.categorie] ?? p.categorie}
                                </span>
                            </div>
                        )}
                    </a>
                ))}
            </div>
        </div>
    );
}

export function PhotosEtatLieu({ photos }: Props) {
    const checkin  = photos.filter(p => p.type === 'CHECKIN');
    const checkout = photos.filter(p => p.type === 'CHECKOUT');

    if (checkin.length === 0 && checkout.length === 0) return null;

    return (
        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50/40">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-600">
                    <Camera className="w-3.5 h-3.5" strokeWidth={1.75} />
                </div>
                <h3 className="text-[10.5px] font-black uppercase tracking-[0.14em] text-slate-400">
                    Photos état des lieux
                </h3>
            </div>
            <div className="px-5 py-4 space-y-5">
                <PhotoGrid photos={checkin}  title={`Check-in · ${checkin.length} photo${checkin.length > 1 ? 's' : ''}`} />
                <PhotoGrid photos={checkout} title={`Check-out · ${checkout.length} photo${checkout.length > 1 ? 's' : ''}`} />
            </div>
        </div>
    );
}
