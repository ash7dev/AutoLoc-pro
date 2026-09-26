'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Clock, AlertTriangle, XCircle, FileText, ArrowRight, Info, CheckCircle2 } from 'lucide-react';
import type { UserProfileData } from '../../../core/api/userApi';

export interface TenantKycStatusCardProps {
  profile: UserProfileData;
}

export const TenantKycStatusCard: React.FC<TenantKycStatusCardProps> = ({ profile }) => {
  const status = profile.statutKyc || 'NON_VERIFIE';

  const getStatusConfig = () => {
    switch (status) {
      case 'VALIDE':
      case 'VERIFIE':
        return {
          title: 'Identité certifiée',
          description:
            'Votre profil de conducteur est certifié conforme. Vous êtes éligible à la réservation immédiate de tous les véhicules sur AutoLoc.',
          iconBg: 'bg-brand-main/8 text-brand-main',
          badge: 'bg-brand-main/8 text-brand-main',
          icon: <ShieldCheck className="h-5 w-5" />,
          label: 'Certifié conforme',
        };
      case 'EN_ATTENTE':
        return {
          title: 'Vérification en cours',
          description:
            "Vos pièces justificatives (permis & carte d'identité) sont actuellement sous examen par notre équipe de sécurité.",
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
            "Votre dossier de vérification a été rejeté. Veuillez transmettre une photo lisible de votre permis et d'une pièce d'identité en cours de validité.",
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
            'Pour pouvoir réserver et prendre le volant d’un véhicule sur AutoLoc, vous devez transmettre votre permis de conduire et votre pièce d’identité.',
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
      label: "Pièce d'identité (CNI / Passeport)",
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
    <div className="rounded-3xl border border-brand-dark/8 bg-white p-6 sm:p-8 shadow-xs">
      {/* En-tête */}
      <div>
        <h3 className="font-fraunces text-xl leading-tight text-brand-dark">
          Vérification d'identité (KYC)
        </h3>
        <p className="mt-1 text-[13px] text-slate-500">
          Conformité et pièces justificatives requises pour la conduite
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
              <h4 className="text-[15px] font-semibold text-brand-dark">{config.title}</h4>
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
            href="/kyc"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-dark px-4 py-2.5 text-[12.5px] font-semibold text-champagne transition-colors hover:bg-brand-main cursor-pointer shadow-sm"
          >
            {status === 'EN_ATTENTE' ? 'Voir mon dossier' : 'Vérifier mon identité'}
            <ArrowRight className="h-3.5 w-3.5 text-emerald-400" />
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
              <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-brand-main">
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
          <strong className="font-semibold">Note légale :</strong> vos documents d'identité et de permis de conduire sont chiffrés et vérifiés conformément aux exigences d'assurance pour la location de véhicules.
        </p>
      </div>
    </div>
  );
};
