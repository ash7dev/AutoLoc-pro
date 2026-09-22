'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Clock, AlertTriangle, XCircle, FileText, ArrowRight, Info, CheckCircle2 } from 'lucide-react';
import type { UserProfileData } from '../../../../core/api/userApi';

export interface KycStatusCardProps {
  profile: UserProfileData;
}

export const KycStatusCard: React.FC<KycStatusCardProps> = ({ profile }) => {
  const status = profile.statutKyc || 'NON_VERIFIE';

  const getStatusConfig = () => {
    switch (status) {
      case 'VALIDE':
      case 'VERIFIE':
        return {
          title: 'Identité vérifiée',
          description:
            "Votre compte est certifié conforme. Vous bénéficiez de l'assurance premium et de la confiance maximale sur AutoLoc.",
          iconBg: 'bg-[#0A3D2E]/8 text-[#0A3D2E]',
          badge: 'bg-[#0A3D2E]/8 text-[#0A3D2E]',
          icon: <ShieldCheck className="h-5 w-5" />,
          label: 'Certifié conforme',
        };
      case 'EN_ATTENTE':
        return {
          title: 'Vérification en cours',
          description:
            "Vos pièces justificatives ont bien été transmises et sont actuellement en cours d'examen par notre équipe de modération.",
          iconBg: 'bg-amber-50 text-amber-600',
          badge: 'bg-amber-50 text-amber-700',
          icon: <Clock className="h-5 w-5" />,
          label: 'Dossier en examen',
        };
      case 'REFUSE':
      case 'REJETE':
        return {
          title: 'Vérification non conforme',
          description:
            "Votre dossier d'identité a été refusé. Veuillez transmettre des pièces d'identité lisibles et en cours de validité.",
          iconBg: 'bg-rose-50 text-rose-600',
          badge: 'bg-rose-50 text-rose-700',
          icon: <XCircle className="h-5 w-5" />,
          label: 'Dossier refusé',
        };
      case 'NON_VERIFIE':
      default:
        return {
          title: 'Identité non vérifiée',
          description:
            'Pour publier des véhicules ou finaliser des réservations, vous devez certifier votre identité (CNI / passeport et permis de conduire).',
          iconBg: 'bg-slate-100 text-slate-500',
          badge: 'bg-slate-100 text-slate-600',
          icon: <AlertTriangle className="h-5 w-5" />,
          label: 'Non vérifié',
        };
    }
  };

  const config = getStatusConfig();
  const isVerified = status === 'VALIDE' || status === 'VERIFIE';

  const documents = [
    {
      label: "Pièce d'identité",
      isDone: Boolean(profile.kycDocumentUrl),
      doneLabel: 'Déposée',
      missingLabel: 'Manquante',
    },
    {
      label: 'Permis de conduire',
      isDone: Boolean(profile.permisUrl),
      doneLabel: 'Déposé',
      missingLabel: 'Manquant',
    },
    {
      label: 'Selfie de sécurité',
      isDone: Boolean(profile.kycSelfieUrl),
      doneLabel: 'Validé',
      missingLabel: 'Non requis',
    },
  ];

  return (
    <div className="rounded-3xl border border-[#041912]/8 bg-white p-6 sm:p-8">
      {/* En-tête */}
      <div>
        <h3 className="font-fraunces text-xl leading-tight text-[#041912]">
          Statut de vérification KYC
        </h3>
        <p className="mt-1 text-[13px] text-slate-500">
          Conformité et pièces justificatives d'identité
        </p>
      </div>

      {/* Bannière de statut */}
      <div className="mt-5 flex flex-col gap-4 border-y border-slate-100 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.iconBg}`}>
            {config.icon}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-[15px] font-semibold text-[#041912]">{config.title}</h4>
              <span className={`rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold ${config.badge}`}>
                {config.label}
              </span>
            </div>
            <p className="mt-1 max-w-md text-[12.5px] leading-relaxed text-slate-500">
              {config.description}
            </p>
          </div>
        </div>

        {!isVerified && (
          <Link
            href="/dashboard/kyc"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#041912] px-4 py-2.5 text-[12.5px] font-semibold text-[#F1DFB6] transition-colors hover:bg-[#0A3D2E]"
          >
            {status === 'EN_ATTENTE' ? 'Voir mon dossier' : 'Vérifier mon identité'}
            <ArrowRight className="h-3.5 w-3.5 text-[#4ADE80]" />
          </Link>
        )}
      </div>

      {/* Checklist des pièces */}
      <div className="divide-y divide-slate-100">
        {documents.map((doc) => (
          <div key={doc.label} className="flex items-center justify-between gap-3 py-3">
            <span className="flex items-center gap-2.5 text-[13px] font-medium text-slate-700">
              <FileText className="h-4 w-4 text-slate-300" />
              {doc.label}
            </span>
            {doc.isDone ? (
              <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#0A3D2E]">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {doc.doneLabel}
              </span>
            ) : (
              <span className="text-[12px] font-medium text-slate-400">{doc.missingLabel}</span>
            )}
          </div>
        ))}
      </div>

      {/* Note de sécurité */}
      <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-amber-50/70 p-3.5 text-amber-800">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
        <p className="text-[12px] leading-relaxed">
          <strong className="font-semibold">Important :</strong> toute modification ultérieure de vos informations d'identité officielles (prénom, nom ou date de naissance) réinitialisera automatiquement votre statut KYC pour des raisons de conformité légale et d'assurance.
        </p>
      </div>
    </div>
  );
};