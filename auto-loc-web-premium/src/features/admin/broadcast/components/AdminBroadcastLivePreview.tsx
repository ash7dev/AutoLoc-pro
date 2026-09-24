'use client';

import React, { useState } from 'react';
import { Smartphone, Mail, Bell, ExternalLink, Shield, Car } from 'lucide-react';
import type { TargetAudience, BroadcastChannel } from '../../../../core/api/adminBroadcastApi';

interface AdminBroadcastLivePreviewProps {
  payload: {
    title: string;
    message: string;
    targetAudience: TargetAudience;
    channels: BroadcastChannel[];
    url: string;
    imageUrl: string;
  };
}

export function AdminBroadcastLivePreview({ payload }: AdminBroadcastLivePreviewProps) {
  const [activeTab, setActiveTab] = useState<'MOBILE' | 'EMAIL'>('MOBILE');

  const { title, message, url, imageUrl, targetAudience, channels } = payload;
  const displayTitle = title.trim() || 'Titre de la notification';
  const displayMessage =
    message.trim() ||
    'Le contenu de votre notification s’affichera ici en temps réel au fur et à mesure de votre saisie.';

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 flex flex-col h-full">
      {/* Header Tabs */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-100">
        <div>
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest bg-emerald-100 px-2.5 py-0.5 rounded-full">
            Simulateur Temps Réel
          </span>
          <h3 className="text-lg font-bold text-gray-900 mt-1">Aperçu en direct</h3>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-gray-100 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('MOBILE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'MOBILE'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile Push</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('EMAIL')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'EMAIL'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Luxe</span>
          </button>
        </div>
      </div>

      {/* Simulator Content Area */}
      <div className="flex-1 flex items-center justify-center p-4 bg-gray-50/70 rounded-2xl border border-gray-100 min-h-[420px]">
        {activeTab === 'MOBILE' ? (
          /* iPhone / Android Lockscreen Frame */
          <div className="w-full max-w-[320px] bg-slate-900 rounded-[40px] p-4 shadow-2xl border-4 border-slate-800 relative overflow-hidden text-white">
            {/* Dynamic Island / Camera Notch */}
            <div className="w-28 h-5 bg-black rounded-full mx-auto mb-6 flex items-center justify-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
            </div>

            {/* Lockscreen Clock */}
            <div className="text-center mb-6">
              <div className="text-4xl font-light tracking-tight font-mono text-slate-100">
                09:41
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                Jeudi 24 Septembre
              </div>
            </div>

            {/* Push Banner Notification Card */}
            <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-3.5 shadow-lg transition-all animate-fade-in">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#0A3D2E] flex items-center justify-center text-[#F1DFB6] font-bold text-[10px] shadow">
                    AL
                  </div>
                  <span className="text-xs font-bold text-slate-200">AutoLoc Dakar</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Maintenant</span>
              </div>

              <h4 className="text-xs font-bold text-white mb-1 line-clamp-1">{displayTitle}</h4>
              <p className="text-[11px] text-slate-300 leading-snug line-clamp-3">
                {displayMessage}
              </p>

              {imageUrl && (
                <div className="mt-2.5 rounded-xl overflow-hidden max-h-28 border border-slate-700">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl} alt="Notification media" className="w-full h-full object-cover" />
                </div>
              )}

              {url && (
                <div className="mt-2.5 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[10px] text-emerald-400 font-medium">
                  <span>Appuyer pour ouvrir</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              )}
            </div>

            {/* Lockscreen Home Bar */}
            <div className="w-24 h-1 bg-slate-600 rounded-full mx-auto mt-12" />
          </div>
        ) : (
          /* Email HTML Luxe Mockup View */
          <div className="w-full max-w-[380px] bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden text-gray-800 text-xs">
            {/* Email Header */}
            <div className="bg-gradient-to-r from-[#0A3D2E] to-[#0D4B39] text-white p-5 text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#F1DFB6]/20 text-[#F1DFB6] mb-2">
                <Car className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-white tracking-wide">AUTOLOC</h3>
              <p className="text-[10px] text-emerald-200 uppercase tracking-widest mt-0.5">
                Location de Véhicules Premium Sénégal
              </p>
            </div>

            {/* Email Body */}
            <div className="p-5 space-y-3">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0A3D2E]/10 text-[#0A3D2E]">
                COMMUNICATION OFFICIELLE
              </span>
              <h4 className="text-sm font-bold text-gray-900">{displayTitle}</h4>
              <p className="text-gray-600 text-xs leading-relaxed whitespace-pre-line">
                {displayMessage}
              </p>

              {imageUrl && (
                <div className="rounded-xl overflow-hidden max-h-36 my-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl} alt="Email Header" className="w-full h-full object-cover" />
                </div>
              )}

              {/* Call-to-action button */}
              <div className="pt-2 text-center">
                <a
                  href={url || '#'}
                  onClick={(e) => e.preventDefault()}
                  className="inline-block px-5 py-2.5 rounded-xl bg-[#0A3D2E] text-white font-bold text-xs shadow-md hover:bg-[#0D4B39]"
                >
                  Accéder à la plateforme
                </a>
              </div>
            </div>

            {/* Email Footer */}
            <div className="bg-gray-50 p-4 border-t border-gray-100 text-[10px] text-gray-400 text-center space-y-1">
              <p>© 2026 AutoLoc Sénégal — Tous droits réservés.</p>
              <p>Dakar, Corniche Ouest, Sénégal | support@autoloc.sn</p>
            </div>
          </div>
        )}
      </div>

      {/* Simulator Footer metadata */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
        <div className="flex items-center gap-1.5">
          <Bell className="w-3.5 h-3.5 text-emerald-600" />
          <span>Audience sélectionnée : <strong className="text-gray-700">{targetAudience}</strong></span>
        </div>
        <span>Canaux : <strong className="text-gray-700">{channels.length} actif(s)</strong></span>
      </div>
    </div>
  );
}
