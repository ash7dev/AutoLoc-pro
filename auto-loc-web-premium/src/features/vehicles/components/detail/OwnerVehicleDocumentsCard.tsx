'use client';

import React from 'react';
import { FileText, ShieldCheck, CheckCircle2, AlertTriangle, ExternalLink, Lock } from 'lucide-react';

export interface OwnerVehicleDocumentsCardProps {
  carteGriseUrl?: string;
  assuranceDocUrl?: string;
  hasCarteGrise?: boolean;
  hasAssuranceDoc?: boolean;
  statut?: string;
}

export const OwnerVehicleDocumentsCard: React.FC<OwnerVehicleDocumentsCardProps> = ({
  carteGriseUrl,
  assuranceDocUrl,
  hasCarteGrise = false,
  hasAssuranceDoc = false,
  statut,
}) => {
  const isVerifie = statut === 'VERIFIE' || statut === 'DISPONIBLE';

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs sm:p-8">
      <div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-[#059669]" />
          <h3 className="font-fraunces text-xl font-normal text-[#041912]">
            Documents administratifs & Conformité
          </h3>
        </div>
        <p className="mt-1 text-xs text-slate-500 sm:text-sm">
          Pièces justificatives vérifiées par les équipes d'AutoLoc pour valider la mise en location.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Carte Grise Document Box */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 transition-colors hover:border-slate-300">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#0A3D2E]" />
                <span className="text-xs font-bold text-slate-900">Carte Grise</span>
              </div>
              {hasCarteGrise || carteGriseUrl ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  Fournie
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                  <AlertTriangle className="h-3 w-3 text-amber-600" />
                  Manquante
                </span>
              )}
            </div>

            <p className="text-[11px] leading-relaxed text-slate-500">
              Certificat d'immatriculation officiel du véhicule au Sénégal.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
            {carteGriseUrl ? (
              <a
                href={carteGriseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#059669] hover:underline"
              >
                <span>Consulter le document</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
                <Lock className="h-3 w-3" />
                <span>URL non disponible</span>
              </span>
            )}
          </div>
        </div>

        {/* Assurance Auto Document Box */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 transition-colors hover:border-slate-300">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#0A3D2E]" />
                <span className="text-xs font-bold text-slate-900">Attestation d'Assurance</span>
              </div>
              {hasAssuranceDoc || assuranceDocUrl ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  Valide
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                  <AlertTriangle className="h-3 w-3 text-amber-600" />
                  À transmettre
                </span>
              )}
            </div>

            <p className="text-[11px] leading-relaxed text-slate-500">
              Assurance responsabilité civile automobile en cours de validité.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
            {assuranceDocUrl ? (
              <a
                href={assuranceDocUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#059669] hover:underline"
              >
                <span>Consulter le document</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
                <Lock className="h-3 w-3" />
                <span>URL non disponible</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
