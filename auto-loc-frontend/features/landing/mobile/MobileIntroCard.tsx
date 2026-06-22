'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Clock, Zap, ArrowRight } from 'lucide-react';

export function MobileIntroCard(): React.ReactElement {
  return (
    <div className="px-4 py-2">
      <div className="relative overflow-hidden rounded-3xl bg-black p-6 border border-white/5 shadow-xl shadow-black/25">
        {/* Floating premium vehicle image (Option 2 - Neon 3D) */}
        <div className="absolute right-0 bottom-0 top-0 w-[48%] pointer-events-none overflow-hidden select-none z-0">
          <div className="absolute right-[-6%] bottom-[-2%] w-[115%] h-[82%] flex items-end justify-end">
            <Image
              src="/images/premium_car_banner.png"
              alt="AutoLoc Premium Car"
              width={260}
              height={260}
              priority
              className="object-contain object-right-bottom mix-blend-lighten opacity-85 transition-all duration-700 hover:scale-105"
            />
          </div>
          {/* Subtle dark to transparent gradient mask to merge with black on the left */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
        </div>
        
        <div className="relative z-10">
          <div className="max-w-[62%] sm:max-w-[65%] flex flex-col items-start">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/20 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">AutoLoc Sénégal</span>
            </div>

            <h2 className="text-[21px] font-extrabold text-white tracking-tight leading-[1.15]">
              Louez en toute confiance <span className="block mt-0.5 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-300 font-black">sans compromis</span>
            </h2>
            <p className="mt-2 text-[11px] font-medium text-white/40 leading-relaxed">
              Des véhicules vérifiés à Dakar et partout au Sénégal.
            </p>

            <Link
              href="/explorer"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-black text-[12px] font-bold transition-all active:scale-[0.97]"
            >
              Explorer les véhicules
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
            </Link>
          </div>

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
