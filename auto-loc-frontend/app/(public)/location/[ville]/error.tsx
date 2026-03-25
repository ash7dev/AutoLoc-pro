"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Search } from "lucide-react";

export default function LocationError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.error("[LocationError]", error);
    }
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-16">
      <div className="w-full max-w-md text-center">

        <div className="mx-auto mb-6 w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-amber-400" strokeWidth={1.75} />
        </div>

        <h2 className="text-[22px] font-black tracking-tight text-slate-900 mb-2">
          Impossible de charger les véhicules
        </h2>
        <p className="text-[13px] text-slate-400 leading-relaxed mb-8 max-w-sm mx-auto">
          Une erreur est survenue. Réessaie ou explore tous les véhicules disponibles.
        </p>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3.5 text-[13px] font-bold text-white hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" strokeWidth={2.5} />
            Réessayer
          </button>

          <Link
            href="/explorer"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors"
          >
            <Search className="w-4 h-4" strokeWidth={2} />
            Explorer tous les véhicules
          </Link>
        </div>

        {error.digest && (
          <p className="mt-8 text-[11px] text-slate-300 font-mono">
            Réf. : {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
