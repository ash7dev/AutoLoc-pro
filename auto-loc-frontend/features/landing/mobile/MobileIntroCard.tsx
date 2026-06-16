'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Clock, Zap, ArrowRight } from 'lucide-react';

export function MobileIntroCard(): React.ReactElement {
  return (
    <div className="px-4 py-2">
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 border border-white/5 shadow-xl shadow-slate-950/20">
        {/* Glow effect */}
        <div
          className="absolute -top-16 -right-16 w-36 h-36 rounded-full opacity-30 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 70%)' }}
        />
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/20 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">AutoLoc Sénégal</span>
          </div>

          <h2 className="text-xl font-black text-white tracking-tight leading-tight">
            Louez en toute confiance et <span className="text-emerald-400">sans compromis</span>
          </h2>
          <p className="mt-2 text-[12px] font-medium text-white/50 leading-relaxed">
            Trouvez et réservez des véhicules de propriétaires vérifiés à Dakar et partout au Sénégal en quelques clics.
          </p>

          <Link
            href="/explorer"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-black text-[12px] font-bold transition-all active:scale-[0.97]"
          >
            Explorer les véhicules
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
          </Link>

          <div className="mt-5 grid grid-cols-3 gap-3 border-t border-white/5 pt-4">
            <div className="flex flex-col items-center text-center">
              <span className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
              </span>
              <p className="text-[10px] font-bold text-white leading-tight">100% vérifiés</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-1.5">
                <Clock className="h-4 w-4 text-emerald-400" />
              </span>
              <p className="text-[10px] font-bold text-white leading-tight">Support 24/7</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-1.5">
                <Zap className="h-4 w-4 text-emerald-400" />
              </span>
              <p className="text-[10px] font-bold text-white leading-tight">Zéro stress</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
