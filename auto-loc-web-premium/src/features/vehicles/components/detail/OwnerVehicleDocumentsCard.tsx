'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Eye,
  X,
} from 'lucide-react';

export interface OwnerVehicleDocumentsCardProps {
  carteGriseUrl?: string;
  assuranceDocUrl?: string;
  hasCarteGrise?: boolean;
  hasAssuranceDoc?: boolean;
  statut?: string;
}

interface DocumentRow {
  icon: React.ElementType;
  label: string;
  description: string;
  isOk: boolean;
  okLabel: string;
  missingLabel: string;
  url?: string;
}

export const OwnerVehicleDocumentsCard: React.FC<OwnerVehicleDocumentsCardProps> = ({
  carteGriseUrl,
  assuranceDocUrl,
  hasCarteGrise = false,
  hasAssuranceDoc = false,
  statut,
}) => {
  const [activeDoc, setActiveDoc] = useState<{ title: string; url: string } | null>(null);

  const documents: DocumentRow[] = [
    {
      icon: FileText,
      label: 'Carte grise',
      description: "Certificat d'immatriculation officiel du véhicule au Sénégal.",
      isOk: hasCarteGrise || Boolean(carteGriseUrl),
      okLabel: 'Fournie',
      missingLabel: 'Manquante',
      url: carteGriseUrl,
    },
    {
      icon: ShieldCheck,
      label: "Attestation d'assurance",
      description: 'Assurance responsabilité civile automobile en cours de validité.',
      isOk: hasAssuranceDoc || Boolean(assuranceDocUrl),
      okLabel: 'Valide',
      missingLabel: 'À transmettre',
      url: assuranceDocUrl,
    },
  ];

  const missingCount = documents.filter((d) => !d.isOk).length;

  const isPdfUrl = (url: string) => {
    return url.toLowerCase().includes('.pdf') || url.toLowerCase().includes('/raw/upload/');
  };

  return (
    <>
      <div className="rounded-3xl border border-brand-dark/8 bg-white p-6 shadow-[0_1px_2px_rgba(4,25,18,0.04),0_12px_28px_-14px_rgba(4,25,18,0.14)] sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="font-fraunces text-xl leading-tight text-brand-dark">
              Documents & conformité
            </h3>
            <p className="mt-1 max-w-md text-[13px] text-slate-500">
              Pièces justificatives vérifiées par les équipes d'AutoLoc pour valider la mise en location.
            </p>
          </div>

          {missingCount === 0 ? (
            <span className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full bg-brand-main/8 px-3 py-1 text-[11px] font-semibold text-brand-main">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Dossier complet
            </span>
          ) : (
            <span className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-700">
              <AlertTriangle className="h-3.5 w-3.5" />
              {missingCount} document{missingCount > 1 ? 's' : ''} en attente
            </span>
          )}
        </div>

        <div className="mt-5 divide-y divide-slate-100 border-y border-slate-100">
          {documents.map((doc) => {
            const Icon = doc.icon;
            return (
              <div key={doc.label} className="flex items-start gap-3.5 py-4">
                <div
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    doc.isOk ? 'bg-brand-main/8 text-brand-main' : 'bg-amber-50 text-amber-600'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[13.5px] font-semibold text-brand-dark">{doc.label}</span>
                    {doc.isOk ? (
                      <span className="inline-flex shrink-0 items-center gap-1 text-[11.5px] font-semibold text-brand-main">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {doc.okLabel}
                      </span>
                    ) : (
                      <span className="inline-flex shrink-0 items-center gap-1 text-[11.5px] font-semibold text-amber-600">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        {doc.missingLabel}
                      </span>
                    )}
                  </div>

                  <p className="mt-0.5 text-[12px] leading-relaxed text-slate-500">
                    {doc.description}
                  </p>

                  {doc.url ? (
                    <button
                      type="button"
                      onClick={() => setActiveDoc({ title: doc.label, url: doc.url! })}
                      className="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-[12px] font-semibold text-brand-main transition-colors hover:border-brand-main/40 hover:bg-brand-main/5 cursor-pointer shadow-2xs"
                    >
                      <Eye className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Visualiser le document</span>
                    </button>
                  ) : (
                    <span className="mt-1.5 inline-block text-[12px] text-slate-400">
                      Aucun fichier reçu pour le moment
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox Modal Document Visualizer */}
      <AnimatePresence>
        {activeDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative flex h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
            >
              {/* Header Modal */}
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-brand-dark text-white">
                <div className="flex items-center gap-2.5">
                  <FileText className="h-5 w-5 text-emerald-400" />
                  <h3 className="font-fraunces text-lg font-normal text-white">
                    {activeDoc.title}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveDoc(null)}
                    aria-label="Fermer"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Body Modal : Visualiseur Image ou PDF */}
              <div className="relative flex-1 bg-slate-900/90 p-4 flex items-center justify-center overflow-auto">
                {isPdfUrl(activeDoc.url) ? (
                  <iframe
                    src={activeDoc.url}
                    title={activeDoc.title}
                    className="h-full w-full rounded-xl bg-white border-0"
                  />
                ) : (
                  <img
                    src={activeDoc.url}
                    alt={activeDoc.title}
                    className="max-h-full max-w-full rounded-xl object-contain shadow-lg"
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};