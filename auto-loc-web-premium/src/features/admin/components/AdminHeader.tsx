'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  Bell,
  ChevronRight,
  LogOut,
  Command,
  CheckCircle2,
} from 'lucide-react';
import { useUserStore } from '@/src/core/store/useUserStore';

const PATH_TITLE_MAP: Record<string, { title: string; category: string }> = {
  '/admin': { title: 'Tableau de bord', category: 'Vue d’ensemble' },
  '/admin/stats': { title: 'Revenus & Stats Auto loc', category: 'Vue d’ensemble' },
  '/admin/kyc': { title: 'Vérification KYC', category: 'Modération & Contrôle' },
  '/admin/vehicles/moderation': { title: 'Modération Annonces', category: 'Modération & Contrôle' },
  '/admin/disputes': { title: 'Litiges & Arbitrage', category: 'Modération & Contrôle' },
  '/admin/users': { title: 'Tous les Utilisateurs', category: 'Gestion & Supervision' },
  '/admin/hosts': { title: 'Hôtes & Propriétaires', category: 'Gestion & Supervision' },
  '/admin/tenants': { title: 'Locataires & Voyageurs', category: 'Gestion & Supervision' },
  '/admin/vehicles': { title: 'Tous les véhicules', category: 'Gestion & Supervision' },
  '/admin/reservations': { title: 'Réservations', category: 'Gestion & Supervision' },
  '/admin/payouts': { title: 'Retraits & Finances', category: 'Gestion & Supervision' },
  '/admin/broadcast': { title: 'Notifications Broadcast', category: 'Système & Diffusion' },
  '/admin/equipment': { title: 'Catalogue Équipements', category: 'Système & Diffusion' },
  '/admin/settings': { title: 'Paramètres Admin', category: 'Système & Diffusion' },
};

const FRAUNCES_STYLE = { fontFamily: 'var(--font-fraunces), Georgia, serif' };

export const AdminHeader: React.FC = () => {
  const pathname = usePathname();
  const user = useUserStore((s) => s.user);
  const logout = useUserStore((s) => s.logout);

  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  // Résolution du titre et de la catégorie courante
  const currentNav = PATH_TITLE_MAP[pathname] || {
    title: 'Espace Administration',
    category: 'Suite Admin',
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 backdrop-blur-xl border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 pt-[calc(0.875rem+env(safe-area-inset-top))] pb-3.5 transition-all">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        
        {/* 1. Fil d'Ariane & Titre de la page active en Typographie Fraunces */}
        <div className="flex flex-col gap-0.5 min-w-0">
          <div
            className="flex items-center gap-1.5 text-xs font-fraunces font-normal text-slate-400"
            style={FRAUNCES_STYLE}
          >
            <span className="hover:text-slate-600 transition-colors">Admin</span>
            <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
            <span className="text-emerald-700 font-normal">{currentNav.category}</span>
          </div>

          <h1
            className="text-lg sm:text-2xl font-fraunces font-normal tracking-tight text-brand-dark truncate flex items-center gap-2"
            style={FRAUNCES_STYLE}
          >
            <span>{currentNav.title}</span>
            <span
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-fraunces font-normal"
              style={FRAUNCES_STYLE}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </h1>
        </div>

        {/* 2. Barre de recherche globale en Typographie Fraunces */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher membre, réservation, véhicule..."
              className="w-full pl-10 pr-12 py-2 rounded-2xl bg-slate-100/80 border border-slate-200/80 text-xs font-fraunces font-normal text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all shadow-inner"
              style={FRAUNCES_STYLE}
            />
            <div
              className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] text-slate-400 font-fraunces font-normal shadow-xs"
              style={FRAUNCES_STYLE}
            >
              <Command className="w-3 h-3" />
              <span>K</span>
            </div>
          </div>
        </div>

        {/* 3. Actions Rapides & Profil Administrateur en Fraunces */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Bouton de Notification avec Popover */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-2xl bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200/80 text-slate-600 transition-all active:scale-95"
              title="Notifications système"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
            </button>

            {/* Menu Popover Notifications */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-3xl bg-white border border-slate-200 shadow-2xl p-4 text-slate-800 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-fraunces font-normal text-slate-900" style={FRAUNCES_STYLE}>
                    Notifications Admin
                  </span>
                  <span className="text-[10px] font-fraunces font-normal text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200" style={FRAUNCES_STYLE}>
                    Système actif
                  </span>
                </div>
                <div className="py-4 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto opacity-80" />
                  <p className="text-xs font-fraunces font-normal text-slate-700" style={FRAUNCES_STYLE}>
                    Toutes les notifications sont lues
                  </p>
                  <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto font-fraunces font-normal" style={FRAUNCES_STYLE}>
                    Aucune alerte critique en attente de traitement.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Séparateur Vertical */}
          <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

          {/* Capsule Profil Administrateur en Fraunces */}
          {user && (
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 p-1.5 pr-3 rounded-2xl shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-brand-dark text-champagne font-fraunces font-normal flex items-center justify-center text-xs shadow-sm shrink-0" style={FRAUNCES_STYLE}>
                {user.prenom?.[0] || 'A'}
              </div>

              <div className="hidden sm:block text-left truncate max-w-[130px]">
                <p className="text-xs font-fraunces font-normal text-slate-900 truncate leading-tight" style={FRAUNCES_STYLE}>
                  {user.prenom} {user.nom}
                </p>
                <p className="text-[10px] font-fraunces font-normal text-emerald-700 truncate" style={FRAUNCES_STYLE}>
                  Super Admin
                </p>
              </div>

              <button
                onClick={() => logout()}
                title="Déconnexion Administrateur"
                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

      </div>
    </header>
  );
};
