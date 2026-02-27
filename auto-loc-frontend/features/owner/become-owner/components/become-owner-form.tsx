'use client';

import { useEffect, useRef } from 'react';
import { Car, CheckCircle, Loader2 } from 'lucide-react';
import { useBecomeOwner } from '../hooks/use-become-owner';

const BENEFITS = [
  { label: 'Publiez vos véhicules en 5 minutes' },
  { label: 'Recevez des paiements sécurisés' },
  { label: 'Gérez vos réservations en temps réel' },
  { label: 'Accédez aux statistiques de votre flotte' },
];

export function BecomeOwnerForm({ autoActivate = false }: { autoActivate?: boolean }) {
  const { become, loading, error } = useBecomeOwner();
  const autoRef = useRef(false);

  useEffect(() => {
    if (!autoActivate || autoRef.current) return;
    autoRef.current = true;
    void become();
  }, [autoActivate, become]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center flex-shrink-0">
          <Car className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h2 className="autoloc-hero text-2xl text-gray-900">Devenir propriétaire</h2>
          <p className="autoloc-body text-sm text-gray-500">
            Commencez à louer vos véhicules dès aujourd'hui
          </p>
        </div>
      </div>

      {/* Benefits */}
      <ul className="space-y-3">
        {BENEFITS.map(({ label }) => (
          <li key={label} className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <span className="autoloc-body text-sm text-gray-700">{label}</span>
          </li>
        ))}
      </ul>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="autoloc-body text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* CTA */}
      <button
        type="button"
        onClick={become}
        disabled={loading}
        className="autoloc-body w-full bg-gray-900 text-white py-3 px-4 rounded-xl font-semibold hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" />Activation en cours…</>
        ) : (
          <>Activer mon espace propriétaire</>
        )}
      </button>

      <p className="autoloc-body text-xs text-center text-gray-400">
        Vous pourrez ajouter vos véhicules et compléter votre KYC depuis votre espace.
      </p>
    </div>
  );
}
