'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useUserStore } from '../store/useUserStore';

interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminSkeleton: React.FC = () => {
  return (
    <div aria-hidden="true" className="mx-auto w-full max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8 animate-pulse">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <div className="h-9 w-64 rounded-2xl bg-brand-main/[0.08]" />
          <div className="h-4 w-40 rounded-xl bg-brand-main/[0.05]" />
        </div>
      </div>
      <div className="h-96 w-full rounded-3xl bg-brand-main/[0.05]" />
    </div>
  );
};

export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const isInitialized = useUserStore((s) => s.isInitialized);
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const user = useUserStore((s) => s.user);
  const capabilities = useUserStore((s) => s.capabilities);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && isInitialized && !isAuthenticated) {
      router.push(`/login?redirectUrl=${encodeURIComponent(pathname || '/admin')}`);
    }
  }, [isMounted, isInitialized, isAuthenticated, pathname, router]);

  if (!isMounted || !isInitialized) {
    return <AdminSkeleton />;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center animate-pulse">
        <div className="h-12 w-12 rounded-2xl bg-brand-main/[0.08]" />
        <div className="mt-4 h-4 w-48 rounded-xl bg-brand-main/[0.05]" />
      </div>
    );
  }

  // Si l'utilisateur n'est pas Admin/Support (Note: en démo, on peut aussi autoriser si l'utilisateur est authentifié pour inspection, mais avec avertissement)
  if (!capabilities.isAdmin && user?.role !== 'ADMIN') {
    return (
      <div className="mx-auto flex min-h-[75vh] max-w-xl flex-col items-center justify-center px-4 py-12 text-center">
        <div className="rounded-3xl border border-amber-900/20 bg-slate-900 p-8 text-white shadow-2xl">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <ShieldAlert className="h-7 w-7" />
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Accès Restreint Admin
          </h2>

          <p className="mt-3 text-sm text-slate-300 leading-relaxed">
            Cet espace d&apos;administration est réservé aux administrateurs et membres de l&apos;équipe support d&apos;AutoLoc.
          </p>

          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 text-sm font-bold text-slate-950 transition-all hover:bg-amber-400 active:scale-98"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour au Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
