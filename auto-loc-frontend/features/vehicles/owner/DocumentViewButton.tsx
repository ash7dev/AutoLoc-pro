'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ExternalLink, Loader2, Upload, FileText, CheckCircle2, AlertCircle, Image as ImageIcon, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModalShell } from '@/features/shared/ModalShell';
import { useAuthFetch } from '@/features/auth/hooks/use-auth-fetch';
import { uploadDocumentToCloudinary, VEHICLE_PATHS } from '@/lib/nestjs/vehicles';

interface Props {
  vehicleId: string;
  docType: 'carte-grise' | 'assurance';
  label?: string;
}

export function DocumentViewButton({ vehicleId, docType, label = 'Voir' }: Props) {
  const router = useRouter();
  const { authFetch } = useAuthFetch();

  const [isOpen, setIsOpen] = useState(false);
  const [loadingView, setLoadingView] = useState(false);
  const [docUrl, setDocUrl] = useState<string | null>(null);
  const [viewError, setViewError] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isCarteGrise = docType === 'carte-grise';
  const modalTitle = isCarteGrise ? 'Carte Grise' : "Attestation d'assurance";
  const modalSubtitle = isCarteGrise
    ? "Visualisez ou mettez à jour la carte grise de votre véhicule."
    : "Visualisez ou mettez à jour votre attestation d'assurance.";

  async function handleOpen() {
    setIsOpen(true);
    if (docUrl) return;

    setLoadingView(true);
    setViewError(null);
    try {
      const vehicle = await authFetch<{ carteGriseUrl?: string; assuranceDocUrl?: string }>(`/vehicles/${vehicleId}`);
      const url = isCarteGrise ? vehicle.carteGriseUrl : vehicle.assuranceDocUrl;
      setDocUrl(url || null);
    } catch {
      setViewError("Impossible de charger le document.");
    } finally {
      setLoadingView(false);
    }
  }

  function handleTriggerUpload() {
    fileInputRef.current?.click();
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      const sig = await authFetch<{ signature: string; timestamp: number; apiKey: string; cloudName: string; folder: string }>(
        VEHICLE_PATHS.documentUploadSignature(vehicleId, docType),
      );
      const { url, publicId } = await uploadDocumentToCloudinary(file, sig);
      const body = isCarteGrise
        ? { carteGriseUrl: url, carteGrisePublicId: publicId }
        : { assuranceDocUrl: url, assuranceDocPublicId: publicId };

      await authFetch(`/vehicles/${vehicleId}`, {
        method: "PATCH",
        body: body as unknown as undefined
      });

      setDocUrl(null);
      setIsOpen(false);
      router.refresh();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Erreur lors de la mise à jour du document.");
    } finally {
      setUploading(false);
    }
  }

  const isPdf = docUrl?.toLowerCase().split('?')[0].endsWith('.pdf');

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        disabled={loadingView}
        className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline disabled:opacity-50 transition-colors"
      >
        <ExternalLink className="w-3.5 h-3.5" strokeWidth={2.5} />
        {label}
      </button>

      {isOpen && (
        <ModalShell
          title={modalTitle}
          subtitle={modalSubtitle}
          tag="Auto Loc · Propriétaire"
          onClose={() => setIsOpen(false)}
          contentClassName="px-4 pt-4 pb-6 sm:px-6 sm:pt-5 sm:pb-6 overflow-y-auto space-y-4"
        >
          {loadingView ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center">
                  <Loader2 className="w-7 h-7 animate-spin text-emerald-600" strokeWidth={2} />
                </div>
                <div className="absolute -inset-2 rounded-2xl bg-emerald-400/10 animate-pulse" />
              </div>
              <p className="mt-5 text-sm font-medium text-slate-600">Chargement sécurisé…</p>
            </div>

          ) : viewError ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                <AlertCircle className="w-7 h-7 text-red-500" strokeWidth={2} />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-1">Impossible de charger</h3>
              <p className="text-sm text-slate-500">{viewError}</p>
              <button
                type="button"
                onClick={handleOpen}
                className="mt-4 px-4 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
              >
                Réessayer
              </button>
            </div>

          ) : docUrl ? (
            <>
              {/* Barre d'actions rapides — bien visible sur mobile */}
              <div className="flex items-center justify-between gap-3 px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                    {isPdf
                      ? <FileText className="w-4 h-4 text-slate-500" strokeWidth={2} />
                      : <ImageIcon className="w-4 h-4 text-slate-500" strokeWidth={2} />
                    }
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-slate-800 leading-tight">{modalTitle}</p>
                    <p className="text-[11px] text-slate-400">{isPdf ? 'PDF' : 'Image'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" strokeWidth={2.5} />
                  <a
                    href={docUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[12px] font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" strokeWidth={2.5} />
                    Ouvrir
                  </a>
                </div>
              </div>

              {/* Document viewer */}
              {isPdf ? (
                <>
                  {/* Mobile : pas d'iframe — carte d'action */}
                  <div className="sm:hidden flex flex-col items-center gap-3 py-6 px-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center">
                      <FileText className="w-7 h-7 text-slate-400" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Document PDF</p>
                      <p className="text-[12px] text-slate-500 mt-0.5">Les PDF ne s'affichent pas dans le modal sur mobile.</p>
                    </div>
                    <a
                      href={docUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-colors shadow-md"
                    >
                      <ExternalLink className="w-4 h-4" strokeWidth={2.5} />
                      Ouvrir le PDF
                    </a>
                  </div>
                  {/* Desktop : iframe */}
                  <div className="hidden sm:block rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
                    <iframe
                      src={docUrl}
                      className="w-full h-[500px] border-none"
                      title={modalTitle}
                    />
                  </div>
                </>
              ) : (
                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm">
                  <img
                    src={docUrl}
                    alt={modalTitle}
                    className="w-full object-contain max-h-[45vh] sm:max-h-[400px]"
                  />
                </div>
              )}

              {/* Upload */}
              {uploading ? (
                <div className="flex items-center gap-3 px-4 py-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                      <Upload className="w-4 h-4 text-white animate-bounce" strokeWidth={2} />
                    </div>
                    <div className="absolute -inset-1 rounded-full bg-emerald-400/20 animate-ping" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Mise à jour en cours…</p>
                    <p className="text-[12px] text-slate-500">Ne fermez pas cette page</p>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/60 rounded-2xl p-4 border border-emerald-200/60">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-white shadow-sm border border-emerald-100 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-emerald-600" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-slate-900">Mettre à jour le document</p>
                      <p className="text-[12px] text-slate-500">Téléversez une nouvelle version pour remplacer l'actuelle</p>
                      {uploadError && (
                        <p className="mt-1 text-[11px] font-medium text-red-600">{uploadError}</p>
                      )}
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={handleFileSelected}
                  />
                  <button
                    type="button"
                    onClick={handleTriggerUpload}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-semibold rounded-xl transition-colors shadow-md"
                  >
                    <Upload className="w-4 h-4" strokeWidth={2} />
                    Choisir un fichier
                  </button>
                </div>
              )}
            </>

          ) : (
            /* État vide */
            <>
              <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-4 relative">
                  <div className="absolute inset-0 bg-emerald-500/5 rounded-2xl animate-pulse" />
                  <FileText className="w-8 h-8 text-slate-300" strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Document manquant</h3>
                <p className="text-[12.5px] text-slate-500 max-w-[220px] mx-auto mb-5">
                  Aucun fichier n'a encore été associé. Téléversez-en un pour continuer.
                </p>
                {uploading ? (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                    Envoi en cours…
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleTriggerUpload}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-md"
                  >
                    <Upload className="w-4 h-4" strokeWidth={2.2} />
                    Ajouter le document
                  </button>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={handleFileSelected}
              />
            </>
          )}
        </ModalShell>
      )}
    </>
  );
}
