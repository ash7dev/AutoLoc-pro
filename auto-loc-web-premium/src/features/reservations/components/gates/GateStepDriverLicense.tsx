import React, { useState } from 'react';
import { Award, Camera, CheckCircle2, ArrowRight, ShieldCheck, Upload, Loader2 } from 'lucide-react';
import { KycService } from '../../../kyc/services/kycService';
import { useUserStore } from '../../../../core/store/useUserStore';

interface GateStepDriverLicenseProps {
  onSuccess: () => void;
}

export const GateStepDriverLicense: React.FC<GateStepDriverLicenseProps> = ({ onSuccess }) => {
  const updateProfilePartial = useUserStore((state) => state.updateProfilePartial);

  const [permisData, setPermisData] = useState<File | string | null>(null);
  const [permisPreview, setPermisPreview] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPermisData(file);
      setPermisPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!permisData) {
      alert('Veuillez ajouter une photo nette de votre permis de conduire.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setProgressLabel('Initialisation du fichier...');

    try {
      const res = await KycService.submitPermisLinkWithProgress(
        permisData,
        (percent, label) => {
          setUploadProgress(percent);
          setProgressLabel(label);
        }
      );

      updateProfilePartial({
        permisUrl: res.permisUrl || (typeof permisData === 'string' ? permisData : permisPreview!),
      });

      onSuccess();
    } catch (error: any) {
      console.error('Erreur upload permis:', error);
      alert('Échec de l\'envoi du permis. Réessayez.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto py-2 px-1 animate-in fade-in zoom-in-95 duration-200">
      <div className="relative">
        {/* Layer 1: Back Accent Card - Decalé 3px à gauche */}
        <div className="absolute inset-0 -left-[3px] top-[3px] rounded-[28px] bg-[#041912] border border-[#0A3D2E]/80 pointer-events-none shadow-md" />

        {/* Layer 2: Front Glass Card */}
        <div className="relative bg-white border border-white/80 rounded-[28px] p-6 sm:p-7 pb-7 shadow-2xl">
          {/* Header Box */}
          <div className="flex flex-col items-center text-center mb-4">
            <div className="w-15 h-15 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-3">
              <Award className="w-8 h-8 text-emerald-600" />
            </div>

            <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-[9px] font-medium tracking-wider text-emerald-700 uppercase mb-2">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>PERMIS DE CONDUIRE</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-normal text-[#041912] font-fraunces tracking-tight">
              Permis de <span className="italic text-emerald-700">conduire.</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
              Ajoutez une photo claire et lisible du recto de votre permis de conduire valide.
            </p>
          </div>

          {/* Progress Gauge */}
          {uploading && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-1">
                <span>Transfert sécurisé du permis</span>
                <span className="text-emerald-600 font-extrabold tabular-nums">{uploadProgress}%</span>
              </div>
              <div className="h-2 w-full bg-emerald-100 rounded-full overflow-hidden mb-1.5">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500">{progressLabel}</p>
            </div>
          )}

          {/* Upload Dropzone */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative h-44 rounded-2xl border-2 border-dashed border-emerald-300 bg-slate-50 overflow-hidden flex items-center justify-center">
              {permisPreview ? (
                <div className="relative w-full h-full">
                  <img src={permisPreview} alt="Permis" className="w-full h-full object-cover" />
                  <div className="absolute bottom-3 right-3 bg-[#041912] border border-emerald-400/40 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Permis ajouté</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-2">
                    <Camera className="w-6 h-6 text-emerald-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-900">Ajouter mon permis de conduire</p>
                  <p className="text-xs text-slate-500 mt-0.5">Glissez un fichier ou cliquez pour parcourir</p>

                  <label className="cursor-pointer bg-[#041912] hover:bg-[#06291e] text-white text-xs font-medium px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all mt-3 shadow-md">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choisir une photo</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!permisData || uploading}
              className={`w-full h-12 rounded-full font-semibold text-sm flex items-center justify-center transition-all ${
                !permisData || uploading
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  : 'bg-[#041912] hover:bg-[#06291e] text-white shadow-lg shadow-[#041912]/20 active:scale-[0.98]'
              }`}
            >
              {uploading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>Envoi en cours ({uploadProgress}%)...</span>
                </div>
              ) : (
                <>
                  <span>Enregistrer mon permis</span>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ml-2 transition-all ${
                    !permisData
                      ? 'bg-slate-200 text-slate-400'
                      : 'bg-emerald-500/20 border border-emerald-400/35 text-emerald-400'
                  }`}>
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                  </div>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
