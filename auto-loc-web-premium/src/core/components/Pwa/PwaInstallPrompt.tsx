'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Download, X, Share, PlusSquare, Sparkles, CheckCircle2, ShieldCheck, ArrowUpRight } from 'lucide-react';

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
      const timer = setTimeout(() => setShowPrompt(true), 3500);
      return () => clearTimeout(timer);
    }

    // 4. Écouter l'événement standard Chrome / Android / Edge
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowPrompt(true), 2500);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosGuide((prev) => !prev);
      return;
    }

    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        console.log('[PWA] Application AutoLoc installée');
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.error('[PWA] Erreur installation PWA:', err);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIosGuide(false);
    localStorage.getItem('autoloc_pwa_dismissed_at');
    localStorage.setItem('autoloc_pwa_dismissed_at', Date.now().toString());
  };

  if (isStandalone || !showPrompt) return null;

  return (
    <aside
      aria-label="Installation de l'application AutoLoc"
      className="fixed bottom-4 inset-x-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 max-w-md w-full animate-in slide-in-from-bottom-6 duration-500"
    >
      {/* Carte PWA Flottante — Palette & Styles directement inspirés du Hero Section */}
      <div className="relative overflow-hidden rounded-[28px] border border-champagne/30 bg-brand-main/95 text-champagne-light p-5 sm:p-6 shadow-[0_24px_50px_rgba(4,25,18,0.55)] backdrop-blur-xl">
        
        {/* Halo Lumineux (Hero Glow) */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-champagne/20 rounded-full blur-2xl pointer-events-none" />

        {/* Bouton Fermer */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Fermer"
          className="absolute top-4 right-4 p-1.5 rounded-full text-champagne/60 hover:text-champagne hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Badge (comme dans le Hero Section) */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/90 border border-emerald-300 text-emerald-900 text-[10.5px] font-bold tracking-wide uppercase mb-3 shadow-xs">
          <Sparkles className="w-3 h-3 text-emerald-700 shrink-0" />
          <span>APPLICATION MOBILE & DESKTOP</span>
        </div>

        {/* En-tête : Logo HD & Titre Fraunces */}
        <div className="flex items-start gap-4">
          {/* Logo officiel HD dans un conteneur épuré */}
          <div className="relative w-16 h-16 shrink-0 rounded-2xl overflow-hidden border-2 border-champagne/40 shadow-md bg-white p-1 flex items-center justify-center">
            <Image
              src="/icon.png"
              alt="AutoLoc Logo"
              width={64}
              height={64}
              className="object-contain w-full h-full rounded-xl"
              priority
            />
          </div>

          <div className="min-w-0 pr-6">
            <h3
              className="text-xl sm:text-2xl font-fraunces font-normal leading-tight text-champagne-light tracking-tight"
            >
              Installer l'application{' '}
              <span className="italic text-champagne">AutoLoc.</span>
            </h3>

            <p className="mt-1 text-xs text-champagne/80 font-medium leading-relaxed">
              Accédez directement à vos réservations avec notifications instantanées & mode hors-ligne.
            </p>
          </div>
        </div>

        {/* Value Props Chips (Assorties au Hero Section) */}
        <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-champagne/15 text-[11px] font-bold text-champagne-light">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-champagne/20 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-champagne" />
            <span>Sans téléchargement Store</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-champagne/20 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-champagne" />
            <span>Accès 100% sécurisé</span>
          </div>
        </div>

        {/* Guide d'installation iOS Safari si actif */}
        {showIosGuide && (
          <div className="mt-4 p-3.5 rounded-2xl bg-[#062A20] border border-champagne/30 text-xs space-y-2 animate-in fade-in duration-300">
            <p className="font-semibold text-champagne flex items-center gap-1.5">
              <Share className="w-4 h-4 text-emerald-400" />
              <span>Guide d'installation iOS (Safari) :</span>
            </p>
            <ol className="list-decimal list-inside space-y-1 text-champagne-light/85 text-[11.5px]">
              <li>Appuyez sur l'icône <strong>Partager</strong> <Share className="inline w-3.5 h-3.5 text-emerald-400" /> dans la barre Safari</li>
              <li>Faites défiler puis touchez <strong>« Sur l'écran d'accueil »</strong> <PlusSquare className="inline w-3.5 h-3.5 text-champagne" /></li>
              <li>Confirmez en cliquant sur <strong>Ajouter</strong></li>
            </ol>
          </div>
        )}

        {/* Actions : Bouton Principal Arrondi (comme dans le Hero Section) */}
        <div className="mt-4 flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleInstallClick}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-champagne text-brand-main font-bold text-xs shadow-lg hover:bg-[#F7E9C9] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isIos ? 'Instructions iOS' : "Installer l'application"}</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className="px-4 py-3 rounded-full border border-champagne/30 text-xs font-semibold text-champagne/80 hover:bg-white/10 transition-colors cursor-pointer"
          >
            Plus tard
          </button>
        </div>
      </div>
    </aside>
  );
}
