'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ExternalLink, Loader2, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
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

  // Titres selon le type de document
  const isCarteGrise = docType === 'carte-grise';
  const modalTitle = isCarteGrise ? 'Carte Grise' : 'Attestation d\'assurance';
  const modalSubtitle = isCarteGrise 
    ? "Visualisez ou mettez à jour la carte grise de votre véhicule."
    : "Visualisez ou mettez à jour votre attestation d'assurance.";

  // Ouvre le modal et récupère l'URL
  async function handleOpen() {
    setIsOpen(true);
    if (docUrl) return; // Déjà chargé

    setLoadingView(true);
    setViewError(null);
    try {
      const { url } = await authFetch<{ url: string }>(`/vehicles/${vehicleId}/documents/${docType}/view`);
      setDocUrl(url);
    } catch (err) {
      setViewError("Impossible de charger le document.");
    } finally {
      setLoadingView(false);
    }
  }

  // Déclenche l'input file caché
  function handleTriggerUpload() {
    fileInputRef.current?.click();
  }

  // Gère l'upload complet
  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // reset
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      // 1. Demande la signature
      const sig = await authFetch<{ signature: string; timestamp: number; apiKey: string; cloudName: string; folder: string }>(
        VEHICLE_PATHS.documentUploadSignature(vehicleId, docType),
      );
      
      // 2. Upload vers Cloudinary
      const { url, publicId } = await uploadDocumentToCloudinary(file, sig);
      
      // 3. Attache au véhicule
      const linkPath = isCarteGrise 
        ? VEHICLE_PATHS.linkCarteGrise(vehicleId)
        : VEHICLE_PATHS.linkAssurance(vehicleId);
        
      await authFetch(linkPath, { method: "POST", body: { url, publicId } as unknown as undefined });

      // Succès ! On ferme, on reset, et on demande un refresh (pour MAJ la date "misAJourLe")
      setDocUrl(null); // Force reload next time
      setIsOpen(false);
      router.refresh();
      
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Erreur lors de la mise à jour du document.");
    } finally {
      setUploading(false);
    }
  }

  const isPdf = docUrl?.toLowerCase().endsWith('.pdf');

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
          contentClassName="p-6 overflow-y-auto max-h-[85vh] w-full max-w-2xl"
        >
          {loadingView ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-600" strokeWidth={2} />
                </div>
                <div className="absolute -inset-2 rounded-2xl bg-emerald-400/10 animate-pulse" />
              </div>
              <p className="mt-6 text-sm font-medium text-slate-600">Vérification sécurisée du document...</p>
              <p className="text-xs text-slate-400 mt-1">Un instant, nous protégeons vos données</p>
            </div>
          ) : viewError ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" strokeWidth={2} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Impossible de charger le document</h3>
              <p className="text-sm text-slate-600 max-w-md">{viewError}</p>
              <button
                type="button"
                onClick={handleOpen}
                className="mt-4 px-4 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
              >
                Réessayer
              </button>
            </div>
          ) : docUrl ? (
            <div className="space-y-8">
              
              {/* Header avec informations */}
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center">
                      {isPdf ? (
                        <FileText className="w-6 h-6 text-slate-600" strokeWidth={2} />
                      ) : (
                        <img src="/icon-image.svg" alt="Image" className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">{modalTitle}</h3>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {isPdf ? 'Document PDF' : 'Document image'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" strokeWidth={2} />
                    <span className="text-sm font-medium text-emerald-600">Document valide</span>
                  </div>
                </div>
              </div>
              
              {/* Document viewer */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-lg">
                <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                  <a
                    href={docUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm"
                  >
                    <ExternalLink className="w-4 h-4" strokeWidth={2} />
                    Ouvrir
                  </a>
                </div>
                {isPdf ? (
                  <iframe 
                    src={docUrl} 
                    className="w-full h-[600px] border-none bg-white"
                    title={modalTitle}
                  />
                ) : (
                  <img
                    src={docUrl}
                    alt={modalTitle}
                    className="w-full object-contain max-h-[700px] bg-white"
                  />
                )}
              </div>

              {/* Upload section */}
              {uploading ? (
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8 border border-slate-200">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="relative mb-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center">
                        <Upload className="w-6 h-6 text-white animate-bounce" strokeWidth={2} />
                      </div>
                      <div className="absolute -inset-1 rounded-full bg-emerald-400/20 animate-ping" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Mise à jour en cours</h3>
                    <p className="text-sm text-slate-600 max-w-sm">Votre document est en cours de traitement. Ne fermez pas cette page.</p>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-2xl p-6 border border-emerald-200">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-emerald-200 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-emerald-600" strokeWidth={2} />
                      </div>
                      <div>
                        <h4 className="text-base font-semibold text-slate-900 mb-1">Mettre à jour le document</h4>
                        <p className="text-sm text-slate-600">Téléversez une nouvelle version pour remplacer l'actuelle</p>
                        {uploadError && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-xs font-medium text-red-600">{uploadError}</p>
                          </div>
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
                    
                    <Button 
                      onClick={handleTriggerUpload}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-lg hover:shadow-xl hover:-translate-y-px transition-all duration-200"
                      size="lg"
                    >
                      <Upload className="w-4 h-4 mr-2" strokeWidth={2} />
                      Choisir un fichier
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </ModalShell>
      )}
    </>
  );
}
