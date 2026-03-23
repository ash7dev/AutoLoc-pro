'use client';

import { useState } from 'react';
import { ExternalLink, Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/nestjs/api-client';

interface Props {
  vehicleId: string;
  docType: 'carte-grise' | 'assurance';
  label?: string;
}

export function DocumentViewButton({ vehicleId, docType, label = 'Voir' }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const { url } = await apiFetch<{ url: string }>(
        `/vehicles/${vehicleId}/documents/${docType}/view`,
      );
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      // silently fail — l'utilisateur verra que rien ne s'ouvre
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="ml-auto inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 disabled:opacity-50 transition-colors"
    >
      {loading
        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
        : <ExternalLink className="w-3.5 h-3.5" strokeWidth={2} />}
      {loading ? '...' : label}
    </button>
  );
}
