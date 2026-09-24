'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Download, X, Share, PlusSquare, Sparkles, CheckCircle2 } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 1. Vérifier si l'application s'exécute déjà en mode PWA autonome
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandaloneMode) {
      setIsStandalone(true);
      return;
    }

    // 2. Détecter si le prompt a été masqué récemment (7 jours)
    const dismissedAt = localStorage.getItem('autoloc_pwa_dismissed_at');
    if (dismissedAt) {
      const elapsed = Date.now() - parseInt(dismissedAt, 10);
      if (elapsed < 7 * 86400000) {
        return; // Ne pas ré-afficher pendant 7 jours
      }
    }

    // 3. Détecter iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !/crios|fxios/.test(userAgent);
    setIsIos(isIosDevice);

    if (isIosDevice) {
      // Délaisser l'apparition pour ne pas perturber l'expérience initiale
      const timer = setTimeout(() => setShowPrompt(true), 4000);
      return () => clearTimeout(timer);
    }

    // 4. Écouter l'événement standard Chrome / Android / Edge
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        console.log('[PWA] Utilisateur a installé le PWA AutoLoc');
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.error('[PWA] Erreur lors de l\'installation:', err);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIosGuide(false);
    localStorage.setItem('autoloc_pwa_dismissed_at', Date.now().toString());
  };

  if (isStandalone || !showPrompt) return null;

  return (
    <>
      {/* Modale d'installation PWA Flottante Luxe Glassmorphism */}
      <div className="fixed bottom-4 inset-x-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 max-w-md w-full animate-in slide-in-from-bottom-6 duration-500">
        <div className="relative overflow-hidden rounded-3xl border border-[#F1DFB6]/30 bg-[#0A3D2E]/95 text-[#FBF6E9] p-5 shadow-[0_20px_50px_rgba(4,25,18,0.5)] backdrop-blur-xl">
          {/* Accent Flou d'Arrière-plan */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#F1DFB6]/20 rounded-full blur-2xl pointer-events-none" />

          {/* Bouton Fermer */}
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Fermer la suggestion d'installation"
            className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-[#F1DFB6]/60 hover:text-[#F1DFB6] hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* En-tête avec Icône Officielle */}
          <div className="flex items-start gap-4 pr-6">
            <div className="relative w-16 h-16 shrink-0 rounded-2xl overflow-hidden border-2 border-[#F1DFB6]/40 shadow-md bg-white p-1 flex items-center justify-center">
              <Image
                src="/icon.png"
                alt="AutoLoc App"
                width={64}
                height={64}
                className="object-contain w-full h-full rounded-xl"
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="font-serif text-lg font-normal leading-tight text-[#FBF6E9]">
                  Installer l'app AutoLoc
                </h4>
                <span className="flex items-center gap-0.5 rounded-full bg-[#F1DFB6] px-2 py-0.5 text-[10px] font-bold text-[#0A3D2E]">
                  <Sparkles className="w-2.5 h-2.5 fill-[#0A3D2E]" />
                  Nouveau
                </span>
              </div>
              <p className="mt-1 text-xs text-[#F1DFB6]/75 leading-relaxed">
                Profitez d'une expérience fluide, des notifications instantanées et du mode hors-ligne.
              </p>
            </div>
          </div>

          {/* Avantages PWA */}
          <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[#F1DFB6]/15 pt-3.5 text-[11px] text-[#FBF6E9]/90">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#F1DFB6] shrink-0" />
              <span>Accès rapide sans store</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#F1DFB6] shrink-0" />
              <span>Alertes réservations</span>
            </span>
          </div>

          {/* Guide d'installation iOS Safari si actif */}
          {showIosGuide && (
            <div className="mt-4 p-3.5 rounded-2xl bg-[#062A20] border border-[#F1DFB6]/30 text-xs space-y-2 animate-in fade-in duration-300">
              <p className="font-semibold text-[#F1DFB6] flex items-center gap-1.5">
                <Share className="w-4 h-4 text-emerald-400" />
                <span>Comment installer sur iPhone / iPad :</span>
              </p>
              <ol className="list-decimal list-inside space-y-1 text-[#FBF6E9]/85 text-[11.5px]">
                <li>Appuyez sur le bouton <strong>Partager</strong> <Share className="inline w-3.5 h-3.5 text-emerald-400" /> au bas de Safari</li>
                <li>Faites défiler et sélectionnez <strong>« Sur l'écran d'accueil »</strong> <PlusSquare className="inline w-3.5 h-3.5 text-[#F1DFB6]" /></li>
                <li>Validez en appuyant sur <strong>Ajouter</strong></li>
              </ol>
            </div>
          )}

          {/* Bouton d'action CTA */}
          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={handleInstallClick}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#F1DFB6] text-[#0A3D2E] font-bold text-xs shadow-lg hover:bg-[#F7E9C9] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isIos ? 'Voir les instructions iOS' : "Installer l'application"}</span>
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="px-4 py-3 rounded-xl border border-[#F1DFB6]/25 text-xs font-semibold text-[#F1DFB6]/80 hover:bg-white/10 transition-colors cursor-pointer"
            >
              Plus tard
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
