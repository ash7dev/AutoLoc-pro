import React, { useState, useRef } from 'react';
import { ShieldCheck, Camera, UserCheck, ArrowRight, ChevronLeft, CheckCircle2, FileText, Upload, RefreshCw, X } from 'lucide-react';
import { KycService } from '../../../kyc/services/kycService';
import { useUserStore } from '../../../../core/store/useUserStore';

interface GateStepKycIdentityProps {
  onSuccess: () => void;
}

type KycSubStep = 1 | 2 | 3;

export const GateStepKycIdentity: React.FC<GateStepKycIdentityProps> = ({ onSuccess }) => {
  const updateProfilePartial = useUserStore((state) => state.updateProfilePartial);

  const [subStep, setSubStep] = useState<KycSubStep>(1);

  const [frontFile, setFrontFile] = useState<File | string | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);

  const [backFile, setBackFile] = useState<File | string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);

  const [selfieFile, setSelfieFile] = useState<File | string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');

  const [webcamOpen, setWebcamOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);

  const handleApplyFile = (file: File | string) => {
    const previewUrl = typeof file === 'string' ? file : URL.createObjectURL(file);

    if (subStep === 1) {
      setFrontFile(file);
      setFrontPreview(previewUrl);
    } else if (subStep === 2) {
      setBackFile(file);
      setBackPreview(previewUrl);
    } else if (subStep === 3) {
      setSelfieFile(file);
      setSelfiePreview(previewUrl);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleApplyFile(e.target.files[0]);
    }
  };

  const startWebcam = async () => {
    try {
      const isSelfie = subStep === 3;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: isSelfie ? 'user' : 'environment' },
      });
      setWebcamStream(stream);
      setWebcamOpen(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      console.warn('Webcam permission denied or unavailable:', err);
      alert("Impossible d'accéder à la caméra. Veuillez sélectionner un fichier.");
    }
  };

  const stopWebcam = () => {
    if (webcamStream) {
      webcamStream.getTracks().forEach((track) => track.stop());
      setWebcamStream(null);
    }
    setWebcamOpen(false);
  };

  const captureWebcamPhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 1280;
    canvas.height = videoRef.current.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      handleApplyFile(dataUrl);
    }
    stopWebcam();
  };

  const handleNextSubStep = () => {
    if (subStep === 1) {
      if (!frontFile) {
        alert('Veuillez ajouter la photo du Recto avant de continuer.');
        return;
      }
      setSubStep(2);
    } else if (subStep === 2) {
      if (!backFile) {
        alert('Veuillez ajouter la photo du Verso avant de continuer.');
        return;
      }
      setSubStep(3);
    }
  };

  const handlePrevSubStep = () => {
    if (subStep > 1) {
      setSubStep((prev) => (prev - 1) as KycSubStep);
    }
  };

  const handleSubmitFinal = async () => {
    if (!selfieFile) {
      alert('Veuillez prendre une photo selfie pour valider la concordance faciale.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setProgressLabel('Initialisation du transfert sécurisé...');

    try {
      await KycService.submitKycLinksWithProgress(
        frontFile!,
        backFile!,
        selfieFile!,
        (percent, label) => {
          setUploadProgress(percent);
          setProgressLabel(label);
        }
      );

      updateProfilePartial({
        statutKyc: 'EN_ATTENTE',
      });

      onSuccess();
    } catch (error: any) {
      console.error('Erreur soumission KYC:', error);
      alert('Échec de l\'envoi de votre dossier. Vérifiez votre connexion et réessayez.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto py-2 px-1 animate-in fade-in zoom-in-95 duration-200">
      <div className="relative">
        {/* Layer 1: Back Accent Card - Decalé 3px à gauche */}
        <div className="absolute inset-0 -left-[3px] top-[3px] rounded-[28px] bg-brand-dark border border-brand-main/80 pointer-events-none shadow-md" />

        {/* Layer 2: Front Glass Card */}
        <div className="relative bg-white border border-white/80 rounded-[28px] p-6 sm:p-7 pb-7 shadow-2xl">
          {/* Header Box */}
          <div className="flex flex-col items-center text-center mb-4">
            <div className="w-15 h-15 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-3">
              <ShieldCheck className="w-8 h-8 text-emerald-600" />
            </div>

            <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-[9px] font-medium tracking-wider text-emerald-700 uppercase mb-2">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>CONTRÔLE D'IDENTITÉ</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-normal text-brand-dark font-fraunces tracking-tight">
              Pièce d'Identité & <span className="italic text-emerald-700">Selfie.</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
              Transmission sécurisée conforme aux normes de sécurité AutoLoc.
            </p>
          </div>

          {/* SubStep Pill Track */}
          {!uploading && (
            <div className="flex items-center justify-between gap-1.5 bg-slate-50 p-1.5 rounded-2xl mb-4 border border-slate-200/80">
              {[1, 2, 3].map((stepNum) => {
                const isCompleted = stepNum < subStep;
                const isActive = stepNum === subStep;
                const stepLabel = stepNum === 1 ? '1. Recto' : stepNum === 2 ? '2. Verso' : '3. Selfie';

                return (
                  <button
                    key={stepNum}
                    type="button"
                    onClick={() => {
                      if (stepNum === 1) setSubStep(1);
                      if (stepNum === 2 && frontFile) setSubStep(2);
                      if (stepNum === 3 && frontFile && backFile) setSubStep(3);
                    }}
                    className={`flex-1 py-2 px-1 rounded-xl text-xs flex items-center justify-center gap-1 transition-all ${
                      isActive
                        ? 'bg-brand-dark text-white font-medium shadow-md'
                        : isCompleted
                        ? 'bg-emerald-600 text-white font-medium'
                        : 'text-slate-500 font-medium hover:text-slate-800'
                    }`}
                  >
                    {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    <span>{stepLabel}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Upload Progress Gauge */}
          {uploading ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center mb-4">
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Transfert de votre dossier KYC
              </h3>
              <p className="text-2xl font-black text-emerald-600 mb-3 tabular-nums">
                {uploadProgress}%
              </p>

              <div className="h-2.5 w-full bg-emerald-100 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>

              <p className="text-xs text-slate-500 font-medium">{progressLabel}</p>
            </div>
          ) : (
            /* Active SubStep Content */
            <div className="mb-4">
              {subStep === 1 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
                    <FileText className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <p className="text-xs font-medium text-slate-900">
                      Prenez le recto de votre CNI ou la page principale du Passeport.
                    </p>
                  </div>

                  <div className="relative h-44 rounded-2xl border-2 border-dashed border-emerald-300 bg-slate-50 overflow-hidden flex items-center justify-center">
                    {frontPreview ? (
                      <div className="relative w-full h-full">
                        <img src={frontPreview} alt="Recto CNI" className="w-full h-full object-cover" />
                        <div className="absolute bottom-3 right-3 bg-brand-dark border border-emerald-400/40 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Recto capturé</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-4 text-center">
                        <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-2">
                          <Camera className="w-6 h-6 text-emerald-600" />
                        </div>
                        <p className="text-sm font-medium text-slate-900">Ajouter la photo Recto</p>
                        <p className="text-xs text-slate-500 mt-0.5">Parcourir les fichiers ou utiliser la caméra</p>

                        <div className="flex items-center gap-2 mt-3">
                          <label className="cursor-pointer bg-brand-dark hover:bg-[#06291e] text-white text-xs font-medium px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Choisir un fichier</span>
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={handleFileChange}
                              className="sr-only"
                            />
                          </label>

                          <button
                            type="button"
                            onClick={startWebcam}
                            className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-medium px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>Caméra</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {subStep === 2 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
                    <FileText className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <p className="text-xs font-medium text-slate-900">
                      Prenez le verso de votre CNI ou la deuxième page du Passeport.
                    </p>
                  </div>

                  <div className="relative h-44 rounded-2xl border-2 border-dashed border-emerald-300 bg-slate-50 overflow-hidden flex items-center justify-center">
                    {backPreview ? (
                      <div className="relative w-full h-full">
                        <img src={backPreview} alt="Verso CNI" className="w-full h-full object-cover" />
                        <div className="absolute bottom-3 right-3 bg-brand-dark border border-emerald-400/40 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Verso capturé</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-4 text-center">
                        <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-2">
                          <Camera className="w-6 h-6 text-emerald-600" />
                        </div>
                        <p className="text-sm font-medium text-slate-900">Ajouter la photo Verso</p>
                        <p className="text-xs text-slate-500 mt-0.5">Parcourir les fichiers ou utiliser la caméra</p>

                        <div className="flex items-center gap-2 mt-3">
                          <label className="cursor-pointer bg-brand-dark hover:bg-[#06291e] text-white text-xs font-medium px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Choisir un fichier</span>
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={handleFileChange}
                              className="sr-only"
                            />
                          </label>

                          <button
                            type="button"
                            onClick={startWebcam}
                            className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-medium px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>Caméra</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {subStep === 3 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
                    <UserCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <p className="text-xs font-medium text-slate-900">
                      Prenez un selfie bien éclairé de votre visage sans lunettes de soleil.
                    </p>
                  </div>

                  <div className="relative h-44 rounded-2xl border-2 border-dashed border-emerald-300 bg-slate-50 overflow-hidden flex items-center justify-center">
                    {selfiePreview ? (
                      <div className="relative w-full h-full">
                        <img src={selfiePreview} alt="Selfie" className="w-full h-full object-cover" />
                        <div className="absolute bottom-3 right-3 bg-brand-dark border border-emerald-400/40 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Selfie capturé</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-4 text-center">
                        <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-2">
                          <UserCheck className="w-6 h-6 text-emerald-600" />
                        </div>
                        <p className="text-sm font-medium text-slate-900">Prendre un Selfie visuel</p>
                        <p className="text-xs text-slate-500 mt-0.5">Ouvrir la caméra frontale ou joindre une photo</p>

                        <div className="flex items-center gap-2 mt-3">
                          <button
                            type="button"
                            onClick={startWebcam}
                            className="bg-brand-dark hover:bg-[#06291e] text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>Prendre le selfie</span>
                          </button>

                          <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1 transition-all">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Fichier</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="sr-only"
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SubStep Nav Actions */}
          {!uploading && (
            <div className="flex items-center justify-between gap-3 pt-1">
              {subStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevSubStep}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-900 hover:text-emerald-700 px-2 py-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Précédent</span>
                </button>
              ) : (
                <div />
              )}

              {subStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNextSubStep}
                  disabled={subStep === 1 ? !frontFile : !backFile}
                  className={`h-11 px-5 rounded-full font-semibold text-xs flex items-center justify-center transition-all ml-auto ${
                    (subStep === 1 && !frontFile) || (subStep === 2 && !backFile)
                      ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                      : 'bg-brand-dark hover:bg-[#06291e] text-white shadow-lg active:scale-[0.98]'
                  }`}
                >
                  <span>Suivant</span>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ml-2 transition-all ${
                    (subStep === 1 && !frontFile) || (subStep === 2 && !backFile)
                      ? 'bg-slate-200 text-slate-400'
                      : 'bg-emerald-500/20 border border-emerald-400/35 text-emerald-400'
                  }`}>
                    <ArrowRight className="w-3 h-3" strokeWidth={2.5} />
                  </div>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitFinal}
                  disabled={!selfieFile}
                  className={`h-11 px-5 rounded-full font-semibold text-xs flex items-center justify-center transition-all ml-auto ${
                    !selfieFile
                      ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                      : 'bg-brand-dark hover:bg-[#06291e] text-white shadow-lg active:scale-[0.98]'
                  }`}
                >
                  <span>Soumettre mon KYC</span>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ml-2 transition-all ${
                    !selfieFile
                      ? 'bg-slate-200 text-slate-400'
                      : 'bg-emerald-500/20 border border-emerald-400/35 text-emerald-400'
                  }`}>
                    <CheckCircle2 className="w-3 h-3" strokeWidth={2.5} />
                  </div>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Webcam Modal Overlay */}
      {webcamOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-4 max-w-md w-full text-center relative">
            <button
              type="button"
              onClick={stopWebcam}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-base font-bold text-slate-900 mb-3">
              {subStep === 3 ? 'Selfie en direct' : 'Prise de photo CNI'}
            </h3>
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video mb-4">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            </div>
            <button
              type="button"
              onClick={captureWebcamPhoto}
              className="w-full h-12 rounded-full bg-brand-dark text-white font-bold text-sm flex items-center justify-center gap-2"
            >
              <Camera className="w-4 h-4 text-emerald-400" />
              <span>Prendre la photo</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
