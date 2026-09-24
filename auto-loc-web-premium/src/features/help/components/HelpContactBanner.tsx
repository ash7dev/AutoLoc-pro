'use client';

import React from 'react';
import { MessageCircle, Mail, Phone, ExternalLink, Clock } from 'lucide-react';

export const HelpContactBanner: React.FC = () => {
  return (
    <section className="rounded-3xl border border-[#041912]/8 bg-white p-6 sm:p-8 shadow-xs">
      <div className="mb-5">
        <h2
          className="font-fraunces text-xl font-normal text-[#041912]"
          style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
        >
          Vous ne trouvez pas votre réponse ?
        </h2>
        <p className="mt-1 text-[13px] text-slate-500">
          Notre équipe basée à Dakar est disponible 7j/7 pour vous aider.
        </p>
      </div>

      <div className="space-y-3">
        {/* WhatsApp */}
        <a
          href="https://wa.me/221786637705?text=Bonjour%20AutoLoc%2C%20j%27ai%20besoin%20d%27aide."
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-4 rounded-2xl border border-green-100 bg-green-50/50 p-4 transition-all hover:border-green-200 hover:shadow-sm"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-600 shadow-sm">
            <MessageCircle className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-[14px] font-semibold text-[#041912]">WhatsApp</p>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-100 text-green-700 uppercase tracking-wide">
                Recommandé
              </span>
            </div>
            <p className="text-[12px] text-slate-400 mt-0.5">Réponse rapide garantie en moins de 2h</p>
          </div>
          <span className="text-[12px] font-semibold text-green-600 group-hover:text-green-700 flex items-center gap-1">
            Écrire <ExternalLink className="h-3 w-3" />
          </span>
        </a>

        {/* Téléphone */}
        <a
          href="tel:+221786637705"
          className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 transition-all hover:border-[#0A3D2E]/20 hover:shadow-sm"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0A3D2E] shadow-sm">
            <Phone className="h-5 w-5 text-[#F1DFB6]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-[#041912]">+221 78 663 77 05</p>
            <p className="text-[12px] text-slate-400 mt-0.5">7j/7 — 8h à 22h (GMT)</p>
          </div>
          <span className="text-[12px] font-semibold text-[#0A3D2E]">
            Appeler
          </span>
        </a>

        {/* Email */}
        <a
          href="mailto:support@autoloc.sn?subject=Support%20AutoLoc"
          className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 transition-all hover:border-blue-200 hover:shadow-sm"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
            <Mail className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-[#041912]">support@autoloc.sn</p>
            <p className="text-[12px] text-slate-400 mt-0.5">Réponse sous 24h ouvrées</p>
          </div>
          <span className="text-[12px] font-semibold text-blue-600">
            Envoyer
          </span>
        </a>
      </div>

      {/* Availability */}
      <div className="mt-5 flex items-center gap-3 rounded-2xl bg-[#0A3D2E]/5 border border-[#0A3D2E]/10 p-4">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse" />
          <span className="text-[11px] font-bold text-[#0A3D2E]">En ligne</span>
        </div>
        <div className="h-3 w-px bg-[#0A3D2E]/15" />
        <div className="flex items-center gap-1.5">
          <Clock className="h-3 w-3 text-[#0A3D2E]/60" strokeWidth={2} />
          <span className="text-[11px] text-[#0A3D2E]/70 font-medium">Support disponible — Lun–Dim · 8h00 – 22h00 (GMT)</span>
        </div>
      </div>
    </section>
  );
};
