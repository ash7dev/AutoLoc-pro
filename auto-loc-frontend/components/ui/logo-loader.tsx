import React from 'react';
import Image from 'next/image';

export function LogoLoader() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6">
        
        {/* Logo central avec léger effet dynamique */}
        <div className="relative w-[120px] h-[120px] bg-white shadow-xl shadow-emerald-900/5 rounded-3xl flex items-center justify-center overflow-hidden border border-emerald-50">
          <Image
            src="/logoAutoLoc.jpg"
            alt="Chargement AutoLoc..."
            width={90}
            height={90}
            priority
            className="object-contain animate-pulse"
          />
        </div>

        {/* Barre de progression horizontale Émeraude */}
        <div className="w-48 h-1.5 bg-emerald-50 rounded-full overflow-hidden relative">
          <div 
            className="absolute top-0 bottom-0 left-0 bg-emerald-500 rounded-full"
            style={{
              animation: 'indeterminate 1.8s ease-in-out infinite'
            }}
          />
        </div>
        
        {/* Texte de statut */}
        <p className="text-[12px] font-bold text-emerald-700 tracking-[0.2em] uppercase animate-pulse">
          Chargement...
        </p>

      </div>

      <style>{`
        @keyframes indeterminate {
          0% {
            left: -35%;
            right: 100%;
          }
          60% {
            left: 100%;
            right: -90%;
          }
          100% {
            left: 100%;
            right: -90%;
          }
        }
      `}</style>
    </div>
  );
}
