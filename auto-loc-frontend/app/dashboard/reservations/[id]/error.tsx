"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";

export default function TenantReservationError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.error("[ReservationError]", error);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center">

        <div className="mx-auto mb-6 w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-amber-400" strokeWidth={1.75} />
        </div>

        <h2 className="text-[22px] font-black tracking-tight text-slate-900 mb-2">
          Impossible de charger la réservation
        </h2>
        <p className="text-[13px] text-slate-400 leading-relaxed mb-8 max-w-sm mx-auto">
          Une erreur est survenue lors du chargement de cette réservation. Réessaie ou reviens à la liste.
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
            href="/reservations"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            Mes réservations
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
