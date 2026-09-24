'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { WifiOff, RefreshCw, Car, Home, PhoneCall } from 'lucide-react';

export default function OfflinePage() {
  const [isRetrying, setIsRetrying] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      if (navigator.onLine) {
        window.location.reload();
      } else {
        setIsRetrying(false);
      }
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-[#0A3D2E] text-[#FBF6E9] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Badge Icone Offline */}
        <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-[#062A20] border border-[#F1DFB6]/20 shadow-2xl mx-auto">
          <WifiOff className="w-10 h-10 text-[#F1DFB6] animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-rose-500 border-2 border-[#0A3D2E]"></span>
          </span>
        </div>

        {/* Titre & Description */}
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-[#F1DFB6]/15 border border-[#F1DFB6]/30 text-[#F1DFB6] text-xs font-semibold uppercase tracking-wider">
            Mode Hors-Ligne
          </span>
          <h1
            className="text-3xl sm:text-4xl font-normal tracking-tight text-[#FBF6E9]"
            style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
          >
            Connexion réseau interrompue
          </h1>
          <p className="text-sm text-[#F1DFB6]/70 max-w-md mx-auto leading-relaxed">
            Vous n'êtes actuellement pas connecté à Internet. Vérifiez votre Wi-Fi ou vos données mobiles pour continuer à explorer nos véhicules au Sénégal.
          </p>
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#F1DFB6] text-[#0A3D2E] font-bold text-sm shadow-lg shadow-black/20 hover:bg-[#F7E9C9] transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? 'Vérification...' : 'Réessayer la connexion'}</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#062A20] text-[#F1DFB6] border border-[#F1DFB6]/30 font-semibold text-sm hover:bg-[#041912] transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Accueil</span>
          </Link>
        </div>

        {/* Info box & Support */}
        <div className="pt-6 border-t border-[#F1DFB6]/15 text-xs text-[#F1DFB6]/60 flex items-center justify-center gap-2">
          <PhoneCall className="w-3.5 h-3.5 text-[#F1DFB6]" />
          <span>Support AutoLoc 24/7 : <strong>+221 78 663 77 05</strong></span>
        </div>
      </div>
    </main>
  );
}
