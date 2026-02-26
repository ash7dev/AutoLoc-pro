"use client";

import React, { useEffect } from 'react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('[ADMIN_ERROR]', error);
  }, [error]);

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <h2 className="text-[16px] font-black text-red-700 mb-2">
          Une erreur est survenue
        </h2>
        <p className="text-[13px] font-medium text-red-700/80">
          Impossible de charger la page admin. Réessaie ou vérifie le backend.
        </p>
        {error.message && (
          <p className="mt-2 text-[12px] font-medium text-red-700/70">
            {error.message}
          </p>
        )}
        <button
          type="button"
          onClick={reset}
          className="mt-4 inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-[12px] font-bold text-white hover:bg-red-700 transition-colors"
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}
