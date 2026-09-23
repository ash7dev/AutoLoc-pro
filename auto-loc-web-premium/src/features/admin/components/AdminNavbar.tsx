'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, UserCheck, LogOut, LayoutDashboard } from 'lucide-react';
import { useUserStore } from '@/src/core/store/useUserStore';

export const AdminNavbar: React.FC = () => {
  const user = useUserStore((s) => s.user);
  const logout = useUserStore((s) => s.logout);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-emerald-900/10 bg-slate-900 text-white backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 group-hover:scale-105 transition-transform">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="font-heading text-lg font-bold tracking-tight text-white">
                AutoLoc <span className="text-emerald-400 font-medium text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">ADMIN</span>
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/50"
          >
            <LayoutDashboard className="h-3.5 w-3.5 text-emerald-400" />
            <span>Mode Hôte</span>
          </Link>

          {user && (
            <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white">{user.prenom} {user.nom}</p>
                <p className="text-[10px] text-emerald-400 font-mono">Administrateur</p>
              </div>
              <button
                onClick={() => logout()}
                title="Déconnexion"
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
