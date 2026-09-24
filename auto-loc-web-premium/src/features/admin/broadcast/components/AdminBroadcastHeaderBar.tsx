'use client';

import React from 'react';
import {
  Users,
  ShieldCheck,
  Smartphone,
  Mail,
  MessageSquare,
  Radio,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import type { AdminAudienceStats } from '../../../../core/api/adminBroadcastApi';

interface AdminBroadcastHeaderBarProps {
  stats?: AdminAudienceStats;
  isLoading?: boolean;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

export function AdminBroadcastHeaderBar({
  stats,
  isLoading = false,
  isRefreshing = false,
  onRefresh,
}: AdminBroadcastHeaderBarProps) {
  const totalUsers = stats?.totalUsers ?? 0;
  const totalHotes = stats?.totalHotes ?? 0;
  const totalLocataires = stats?.totalLocataires ?? 0;
  const totalKycVerifies = stats?.totalKycVerifies ?? 0;
  const pushMobile = stats?.reach.pushMobileExpo ?? 0;
  const webPush = stats?.reach.webPushVapid ?? 0;

  return (
    <div className="bg-gradient-to-r from-[#0A3D2E] via-[#0D4B39] to-[#0A3D2E] text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden mb-8 border border-emerald-800/40">
      {/* Decorative Glow Elements */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#F1DFB6]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Top Header Title & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F1DFB6]/15 backdrop-blur-md border border-[#F1DFB6]/30 flex items-center justify-center text-[#F1DFB6] shadow-inner">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#F1DFB6]/20 text-[#F1DFB6] uppercase tracking-widest border border-[#F1DFB6]/30">
                  Centre de Communication Multi-Canal
                </span>
                <span className="flex items-center gap-1 text-xs text-emerald-300 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Live Broadcast Active
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
                Admin Broadcast Studio & Push Center
              </h1>
            </div>
          </div>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="self-start md:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-xs font-semibold text-emerald-100 border border-white/10 backdrop-blur-md"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Actualiser Audience</span>
          </button>
        </div>

        {/* Audience KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Users */}
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 transition-all hover:bg-white/15">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-emerald-200">Audience Totale Active</span>
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">
              {isLoading ? '...' : totalUsers.toLocaleString('fr-FR')}
            </div>
            <p className="text-[11px] text-emerald-300/80 mt-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#F1DFB6]" />
              Base globale AutoLoc Sénégal
            </p>
          </div>

          {/* Card 2: Hôtes & Propriétaires */}
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 transition-all hover:bg-white/15">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-emerald-200">Propriétaires (Hôtes)</span>
              <div className="p-2 rounded-xl bg-[#F1DFB6]/20 text-[#F1DFB6]">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#F1DFB6]">
              {isLoading ? '...' : totalHotes.toLocaleString('fr-FR')}
            </div>
            <p className="text-[11px] text-emerald-300/80 mt-1">
              Hôtes avec véhicules en ligne
            </p>
          </div>

          {/* Card 3: Locataires Actifs */}
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 transition-all hover:bg-white/15">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-emerald-200">Locataires Requis</span>
              <div className="p-2 rounded-xl bg-blue-500/20 text-blue-300">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">
              {isLoading ? '...' : totalLocataires.toLocaleString('fr-FR')}
            </div>
            <p className="text-[11px] text-emerald-300/80 mt-1">
              {isLoading ? '...' : `${totalKycVerifies} vérifiés KYC (Permis validé)`}
            </p>
          </div>

          {/* Card 4: Push Reach (Expo & Web) */}
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 transition-all hover:bg-white/15">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-emerald-200">Portée Push Mobile & Web</span>
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
                <Smartphone className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">
              {isLoading ? '...' : (pushMobile + webPush).toLocaleString('fr-FR')}
            </div>
            <div className="flex items-center gap-2 text-[10px] text-emerald-200 mt-1">
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/30 text-emerald-100 font-mono">
                Mobile Expo: {pushMobile}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-100 font-mono">
                Web: {webPush}
              </span>
            </div>
          </div>
        </div>

        {/* Channel Health Status Bar */}
        <div className="mt-6 pt-4 border-t border-emerald-800/60 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-200">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-[#F1DFB6]">État des serveurs d'envoi :</span>
            <div className="flex items-center gap-1.5 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-700/50">
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Expo Mobile Push :</span>
              <span className="font-bold text-emerald-300">Opérationnel (100%)</span>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-700/50">
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              <span>Email Resend HTML :</span>
              <span className="font-bold text-blue-300">Connecté</span>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-700/50">
              <MessageSquare className="w-3.5 h-3.5 text-green-400" />
              <span>WhatsApp / SMS Twilio :</span>
              <span className="font-bold text-green-300">Actif</span>
            </div>
          </div>

          <span className="text-[11px] text-emerald-300/70 italic">
            Broadcast certifié conformité RGPD & Protection des données personnelles
          </span>
        </div>
      </div>
    </div>
  );
}
