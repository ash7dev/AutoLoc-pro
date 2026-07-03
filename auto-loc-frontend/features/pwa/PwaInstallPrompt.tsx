'use client';

import React, { useState, useEffect } from 'react';
import { X, Share, PlusSquare, Car } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed', platform: string }>;
}

export function PwaInstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // 1. Vérifier si l'app est déjà installée (Standalone)
    const isStandAloneMatch = window.matchMedia('(display-mode: standalone)').matches;
    const isNavStandalone = (navigator as any).standalone === true;
    if (isStandAloneMatch || isNavStandalone) {
      setIsStandalone(true);
      return;
    }

    // 2. Détection iOS
    const ua = window.navigator.userAgent;
    const webkit = !!ua.match(/WebKit/i);
    const isIPad = !!ua.match(/iPad/i);
    const isIPhone = !!ua.match(/iPhone/i);
    const isIOSDevice = isIPad || isIPhone;
    const isSafari = isIOSDevice && webkit && !ua.match(/CriOS/i);

    if (isIOSDevice && isSafari) {
      setIsIOS(true);
    }

    // 3. Récupération de l'event d'installation sur Android/Chrome
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 4. Afficher après un délai si non ignoré récemment
    const dismissedAt = localStorage.getItem('autoloc_pwa_dismissed');
    // On ne montre pas si l'utilisateur a fermé il y a moins de 7 jours
    const isDismissedRecently = dismissedAt && (Date.now() - parseInt(dismissedAt, 10)) < 7 * 24 * 60 * 60 * 1000;

    let timer: ReturnType<typeof setTimeout> | undefined;
    if (!isDismissedRecently) {
      timer = setTimeout(() => {
        setShowPrompt(true);
      }, 4000); // Délai de 4s pour ne pas agresser l'utilisateur au chargement
    }

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Ne rien afficher si installé, ou pas le bon moment, ou pas supporté
  if (isStandalone || !showPrompt || (!isIOS && !deferredPrompt)) {
    return null;
  }

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('autoloc_pwa_dismissed', Date.now().toString());
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] p-4 pointer-events-none">
      <div className="pointer-events-auto mx-auto max-w-sm rounded-2xl bg-[#0F172A] border border-white/10 p-5 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.8)] backdrop-blur-xl text-white relative animate-in slide-in-from-bottom-8 fade-in duration-500">
        
        {/* Bouton fermer */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-white/30 hover:text-white transition-colors p-1"
          aria-label="Plus tard"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          {/* Icône App (Fallback en attendant le vrai logo) */}
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
            <Car className="w-7 h-7 text-black" strokeWidth={2} />
          </div>

          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className="text-[16px] font-black tracking-tight leading-none mb-1.5">Installer AutoLoc</h3>
            <p className="text-[12px] text-white/50 leading-relaxed pr-6 mb-4">
              Réservez vos véhicules plus rapidement en un seul clic.
            </p>

            {isIOS ? (
              <div className="space-y-2.5 bg-white/5 rounded-xl p-3 border border-white/5">
                <p className="text-[11px] font-semibold text-white/80">Pour installer l'application :</p>
                <div className="flex items-center gap-2 text-[12px] text-white/70">
                  <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">1</span>
                  Appuyez sur <Share className="w-4 h-4 mx-0.5 text-emerald-400" /> (Partager)
                </div>
                <div className="flex items-center gap-2 text-[12px] text-white/70">
                  <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">2</span>
                  Sur l'écran d'accueil <PlusSquare className="w-4 h-4 mx-0.5 text-emerald-400" />
                </div>
              </div>
            ) : (
              <button
                onClick={handleInstall}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] transition-all text-black text-[13px] font-bold shadow-lg shadow-emerald-500/20"
              >
                Installer maintenant
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
