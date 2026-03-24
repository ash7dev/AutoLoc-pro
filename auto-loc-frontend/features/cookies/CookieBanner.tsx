'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, X, ChevronRight } from 'lucide-react';
import { getConsent, setConsent } from './cookie-consent';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // N'affiche le banner que si l'utilisateur n'a jamais répondu
    if (getConsent() === null) setVisible(true);
  }, []);

  function accept() {
    setConsent('accepted');
    setVisible(false);
  }

  function refuse() {
    setConsent('refused');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Gestion des cookies"
      className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 sm:px-6 sm:pb-6"
    >
      <div className="max-w-3xl mx-auto">
        {/* Card */}
        <div className="relative rounded-2xl bg-white border border-slate-200/80 shadow-[0_-4px_32px_-4px_rgba(0,0,0,0.10)] overflow-hidden">

          {/* Ligne d'accentuation verte en haut */}
          <div className="h-[3px] w-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400" />

          <div className="px-5 py-4 sm:px-6 sm:py-5">

            {/* En-tête */}
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" strokeWidth={2} />
              </div>
              <div>
                <p className="text-[13px] font-black text-slate-900 tracking-tight">
                  Nous respectons votre vie privée
                </p>
                <p className="text-[12px] text-slate-500 mt-0.5 leading-relaxed max-w-xl">
                  AutoLoc utilise des cookies pour assurer le bon fonctionnement de la plateforme
                  (authentification, paiement sécurisé, session) et, avec votre accord, des cookies
                  analytiques pour améliorer nos services. Aucun cookie publicitaire n&apos;est utilisé.
                </p>
              </div>
            </div>

            {/* Détail des cookies */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 ml-11">
              <div className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                <div>
                  <p className="text-[11px] font-bold text-slate-700">Cookies essentiels</p>
                  <p className="text-[10.5px] text-slate-400">Toujours actifs · Nécessaires au service</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0" />
                <div>
                  <p className="text-[11px] font-bold text-slate-700">Cookies analytiques</p>
                  <p className="text-[10.5px] text-slate-400">Avec votre consentement uniquement</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 ml-11">
              <Link
                href="/politique-de-confidentialite"
                className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-slate-400 hover:text-emerald-600 transition-colors"
              >
                Politique de confidentialité
                <ChevronRight className="w-3 h-3" strokeWidth={2.5} />
              </Link>

              <div className="flex items-center gap-2">
                <button
                  onClick={refuse}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-[12px] font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                  Refuser les optionnels
                </button>
                <button
                  onClick={accept}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-[12px] font-bold text-white transition-all shadow-sm shadow-emerald-500/25"
                >
                  <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2.5} />
                  Tout accepter
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
