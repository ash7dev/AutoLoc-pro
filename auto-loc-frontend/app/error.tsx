'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('[RootError]', error);
    }
  }, [error]);

  return (
    <main className="min-h-screen bg-[#F8FAFB] flex flex-col items-center justify-center px-4 py-16">

      {/* Logo */}
      <Link href="/" className="mb-12 text-[20px] font-black tracking-tight text-slate-900 hover:text-emerald-600 transition-colors">
        AutoLoc
      </Link>

      <div className="w-full max-w-md text-center">

        {/* Icon */}
        <div className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-amber-400" strokeWidth={1.5} />
        </div>

        {/* Text */}
        <h1 className="text-[24px] font-black tracking-tight text-slate-900 mb-3">
          Une erreur inattendue est survenue
        </h1>
        <p className="text-[14px] text-slate-400 leading-relaxed mb-10 max-w-sm mx-auto">
          Quelque chose s&apos;est mal passé. Vous pouvez réessayer ou revenir à l&apos;accueil.
        </p>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-4 text-[14px] font-bold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4" strokeWidth={2.5} />
            Réessayer
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-[14px] font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
          >
            <Home className="w-4 h-4" strokeWidth={2} />
            Retour à l&apos;accueil
          </Link>
        </div>

        {/* Error digest for support */}
        {error.digest && (
          <p className="mt-8 text-[11px] text-slate-300 font-mono">
            Référence : {error.digest}
          </p>
        )}

      </div>

      <p className="mt-16 text-[12px] text-slate-300 font-medium">
        AutoLoc — Location de véhicules au Sénégal
      </p>

    </main>
  );
}
