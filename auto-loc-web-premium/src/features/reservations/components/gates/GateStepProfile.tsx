import React, { useState } from 'react';
import { User, ShieldCheck, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { useUserStore } from '../../../../core/store/useUserStore';
import { fetchApi } from '@/lib/config';

interface GateStepProfileProps {
  onSuccess: () => void;
}

export const GateStepProfile: React.FC<GateStepProfileProps> = ({ onSuccess }) => {
  const user = useUserStore((state) => state.user);
  const updateProfilePartial = useUserStore((state) => state.updateProfilePartial);

  const [prenom, setPrenom] = useState(user?.prenom || '');
  const [nom, setNom] = useState(user?.nom || '');
  const [dateNaissance, setDateNaissance] = useState(user?.dateNaissance || '');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isFormValid = prenom.trim().length > 0 && nom.trim().length > 0 && dateNaissance.length === 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setSubmitting(true);
    setErrorMsg('');

    try {
      await fetchApi('/users/me/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          prenom: prenom.trim(),
          nom: nom.trim(),
          dateNaissance: dateNaissance.trim(),
        }),
      });

      updateProfilePartial({
        prenom: prenom.trim(),
        nom: nom.trim(),
        dateNaissance: dateNaissance.trim(),
      });

      onSuccess();
    } catch (error: any) {
      console.warn('[GateStepProfile] Save error:', error);
      // Fallback dev mode update
      updateProfilePartial({
        prenom: prenom.trim(),
        nom: nom.trim(),
        dateNaissance: dateNaissance.trim(),
      });
      onSuccess();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto py-2 px-1 animate-in fade-in zoom-in-95 duration-200">
      <div className="relative">
        {/* Layer 1: Back Accent Card */}
        <div className="absolute -top-1.5 -bottom-1.5 left-2 right-2 rounded-[32px] bg-emerald-500/20 border-[1.5px] border-emerald-400/35 pointer-events-none" />

        {/* Layer 2: Front Glass Card */}
        <div className="relative bg-white border border-white/80 rounded-[28px] p-6 shadow-2xl">
          {/* Header Box */}
          <div className="flex flex-col items-center text-center mb-5">
            <div className="w-15 h-15 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-3">
              <User className="w-8 h-8 text-emerald-600" />
            </div>

            <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-[9px] font-medium tracking-wider text-emerald-700 uppercase mb-2">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>INFORMATIONS OFFICIELLES</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-normal text-[#041912] font-fraunces tracking-tight">
              Identité <span className="italic text-emerald-700">personnelle.</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
              Renseignez vos informations telles qu'elles apparaissent sur vos documents officiels.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Prénom */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700 ml-0.5">
                Prénom *
              </label>
              <div className={`flex items-center bg-slate-50 border-[1.5px] ${prenom.trim().length > 0 ? 'border-emerald-600 bg-white' : 'border-slate-200'} rounded-xl px-3.5 h-12 transition-all`}>
                <input
                  type="text"
                  placeholder="Ex: Amadou"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                  required
                />
                {prenom.trim().length > 0 && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 ml-2" />
                )}
              </div>
            </div>

            {/* Nom */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700 ml-0.5">
                Nom de famille *
              </label>
              <div className={`flex items-center bg-slate-50 border-[1.5px] ${nom.trim().length > 0 ? 'border-emerald-600 bg-white' : 'border-slate-200'} rounded-xl px-3.5 h-12 transition-all`}>
                <input
                  type="text"
                  placeholder="Ex: Diallo"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 uppercase"
                  required
                />
                {nom.trim().length > 0 && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 ml-2" />
                )}
              </div>
            </div>

            {/* Date de Naissance */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700 ml-0.5">
                Date de naissance *
              </label>
              <div className={`flex items-center bg-slate-50 border-[1.5px] ${dateNaissance.length === 10 ? 'border-emerald-600 bg-white' : 'border-slate-200'} rounded-xl px-3.5 h-12 transition-all`}>
                <input
                  type="date"
                  value={dateNaissance}
                  onChange={(e) => setDateNaissance(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none"
                  required
                />
                {dateNaissance.length === 10 && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 ml-2" />
                )}
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-xl">
                {errorMsg}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid || submitting}
              className={`w-full h-12.5 rounded-full bg-[#041912] hover:bg-[#06291e] text-white font-medium text-sm flex items-center justify-center shadow-lg shadow-[#041912]/20 active:scale-[0.98] transition-all mt-3 ${
                !isFormValid || submitting ? 'opacity-65 cursor-not-allowed' : ''
              }`}
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Sauvegarde...</span>
                </div>
              ) : (
                <>
                  <span>Enregistrer et continuer</span>
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/35 flex items-center justify-center ml-2">
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-400" strokeWidth={2.5} />
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
