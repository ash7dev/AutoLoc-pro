'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ShieldOff, Search, X, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgeRestrictionModalProps {
  open: boolean;
  onClose: () => void;
  ageMinimum: number;
  userAge: number;
}

export function AgeRestrictionModal({
  open,
  onClose,
  ageMinimum,
  userAge,
}: AgeRestrictionModalProps) {
  const router = useRouter();

  if (!open) return null;

  const deficit = ageMinimum - userAge;
  const yearsLabel = deficit > 1 ? `${deficit} ans` : `${deficit} an`;

  return (
    /* ── Backdrop ────────────────────────────────────────────── */
    <div
      className={cn(
        'fixed inset-0 z-[300]',
        'flex items-end sm:items-center justify-center',
        'bg-black/50 backdrop-blur-[3px]',
        'px-0 sm:px-4',
        'animate-in fade-in duration-200',
      )}
      onClick={onClose}
    >
      {/* ── Sheet / Card ────────────────────────────────────── */}
      <div
        className={cn(
          'w-full sm:max-w-[400px]',
          'flex flex-col overflow-hidden',
          'rounded-t-3xl sm:rounded-2xl',
          'border border-slate-200/60 bg-white',
          'shadow-[0_-8px_40px_rgba(0,0,0,0.20)] sm:shadow-[0_24px_64px_rgba(0,0,0,0.24)]',
          'animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-300',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Drag handle (mobile only) ───────────────────── */}
        <div className="sm:hidden flex justify-center pt-3 pb-0.5">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        {/* ── Close button (desktop) ──────────────────────── */}
        <div className="flex justify-end px-5 pt-4 sm:px-6 sm:pt-5 sm:pb-0">
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className={cn(
              'w-8 h-8 flex items-center justify-center rounded-full',
              'border border-slate-100 text-slate-400',
              'hover:text-slate-700 hover:bg-slate-50 transition-colors',
            )}
          >
            <X className="w-3.5 h-3.5" strokeWidth={2.5} />
          </button>
        </div>

        {/* ── Body ───────────────────────────────────────────── */}
        <div className="px-5 sm:px-6 pt-2 pb-7 space-y-5">

          {/* Icon + headline */}
          <div className="flex flex-col items-center text-center gap-3">
            {/* Animated icon container */}
            <div className={cn(
              'relative w-16 h-16 rounded-2xl',
              'bg-gradient-to-br from-red-50 to-red-100',
              'border border-red-200/60',
              'flex items-center justify-center',
              'shadow-md shadow-red-100/60',
            )}>
              <ShieldOff className="w-7 h-7 text-red-500" strokeWidth={1.75} />
              {/* Subtle pulse ring */}
              <span className="absolute inset-0 rounded-2xl ring-2 ring-red-300/30 animate-ping" />
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400 mb-1">
                Restriction · Âge
              </p>
              <h2 className="text-[19px] font-black text-slate-900 tracking-tight leading-tight">
                Âge minimum non atteint
              </h2>
              <p className="text-[13px] text-slate-500 mt-1.5 leading-relaxed max-w-[280px] mx-auto">
                Le propriétaire de ce véhicule a défini une limite d&apos;âge pour les conducteurs.
              </p>
            </div>
          </div>

          {/* Age comparison */}
          <div className="grid grid-cols-2 gap-3">
            <div className={cn(
              'rounded-xl border border-red-100 bg-gradient-to-b from-red-50 to-red-50/40',
              'p-4 flex flex-col items-center gap-1',
            )}>
              <p className="text-[9.5px] font-black uppercase tracking-widest text-red-400">Requis</p>
              <p className="text-[32px] font-black text-red-600 leading-none tabular-nums">{ageMinimum}</p>
              <p className="text-[11px] font-semibold text-red-500">ans minimum</p>
            </div>
            <div className={cn(
              'rounded-xl border border-slate-100 bg-gradient-to-b from-slate-50 to-slate-50/50',
              'p-4 flex flex-col items-center gap-1',
            )}>
              <p className="text-[9.5px] font-black uppercase tracking-widest text-slate-400">Votre âge</p>
              <p className="text-[32px] font-black text-slate-700 leading-none tabular-nums">{userAge}</p>
              <p className="text-[11px] font-semibold text-slate-500">{yearsLabel} de moins</p>
            </div>
          </div>

          {/* Info note */}
          <div className={cn(
            'rounded-xl border border-amber-100 bg-amber-50/70',
            'px-4 py-3.5',
            'flex items-start gap-3',
          )}>
            <div className="flex-shrink-0 w-6 h-6 mt-0.5 rounded-full bg-amber-100 flex items-center justify-center">
              <Search className="w-3 h-3 text-amber-600" strokeWidth={2.5} />
            </div>
            <p className="text-[12px] text-amber-800 leading-relaxed">
              <strong>Bonne nouvelle :</strong> d&apos;autres véhicules sur AutoLoc sont disponibles pour les conducteurs dès <strong>{userAge} ans</strong>.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => {
                onClose();
                router.push('/explorer');
              }}
              className={cn(
                'w-full flex items-center justify-center gap-2.5',
                'rounded-xl px-5 py-4',
                'bg-slate-900 hover:bg-emerald-500',
                'text-white text-[14px] font-bold tracking-tight',
                'shadow-md shadow-slate-900/20',
                'hover:shadow-xl hover:shadow-emerald-500/20 hover:-translate-y-0.5',
                'active:translate-y-0 active:shadow-md',
                'transition-all duration-200',
              )}
            >
              <Search className="w-4 h-4" strokeWidth={2} />
              Explorer d&apos;autres véhicules
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className={cn(
                'w-full px-5 py-3 rounded-xl',
                'border border-slate-200',
                'text-[13px] font-semibold text-slate-500',
                'hover:text-slate-800 hover:bg-slate-50 hover:border-slate-300',
                'transition-all',
              )}
            >
              Rester sur cette page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
