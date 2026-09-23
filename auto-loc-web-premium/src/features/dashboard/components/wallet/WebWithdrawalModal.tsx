'use client';

import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, ShieldCheck, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { walletApi, type WalletData, type SavedAccountsResponse } from '../../../../core/api/walletApi';
import { useCacheInvalidator } from '@/src/core/hooks/useCacheInvalidator';

interface WebWithdrawalModalProps {
  isOpen: boolean;
  initialProvider?: 'WAVE' | 'ORANGE_MONEY';
  walletData?: WalletData;
  savedAccounts?: SavedAccountsResponse;
  onClose: () => void;
  onSuccess: () => void;
}

const PHONE_REGEX = /^(?:\+221|221)?(77|78|70|76|75)\d{7}$/;

export const WebWithdrawalModal: React.FC<WebWithdrawalModalProps> = ({
  isOpen,
  initialProvider = 'WAVE',
  walletData,
  savedAccounts,
  onClose,
  onSuccess,
}) => {
  const { invalidateWallet, invalidateAnalytics } = useCacheInvalidator();
  const [step, setStep] = useState<1 | 2>(1);
  const [provider, setProvider] = useState<'WAVE' | 'ORANGE_MONEY'>(initialProvider);
  const [amount, setAmount] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync initial provider & saved phone
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setError(null);
      setSuccessMessage(null);
      setProvider(initialProvider);

      // Fill phone number from saved accounts
      const defaultPhone =
        initialProvider === 'WAVE'
          ? savedAccounts?.lastWaveNumber || ''
          : savedAccounts?.lastOmNumber || '';
      setPhone(defaultPhone);
    }
  }, [isOpen, initialProvider, savedAccounts]);

  // Update phone default when provider changes
  const handleProviderChange = (newProvider: 'WAVE' | 'ORANGE_MONEY') => {
    setProvider(newProvider);
    setError(null);
    const newPhone =
      newProvider === 'WAVE'
        ? savedAccounts?.lastWaveNumber || ''
        : savedAccounts?.lastOmNumber || '';
    setPhone(newPhone);
  };

  if (!isOpen || !walletData) return null;

  const soldeRetirableGlobal = parseFloat(walletData.balance.soldeRetirable || '0');
  const soldeWave = parseFloat(walletData.balance.soldeWave || '0');
  const soldeOm = parseFloat(walletData.balance.soldeOrangeMoney || '0');

  // Lock 3: Max balance for selected provider
  const selectedProviderSolde = provider === 'WAVE' ? soldeWave : soldeOm;
  // Effective max allowed amount = min(global retirable, provider solde)
  const maxAllowedAmount = Math.min(soldeRetirableGlobal, selectedProviderSolde);

  // Quick percentage handler
  const handleSetPercentage = (percent: number) => {
    const calc = Math.floor((maxAllowedAmount * percent) / 100);
    setAmount(calc > 0 ? calc.toString() : '');
    setError(null);
  };

  // Step 1 Validation (All 5 Locks)
  const validateStep1 = (): boolean => {
    setError(null);
    const numericAmount = parseFloat(amount.replace(/\s/g, ''));

    // Lock 1: Amount > 0
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Veuillez saisir un montant supérieur à 0 FCFA.');
      return false;
    }

    // Lock 2: Min amount 1 000 FCFA
    if (numericAmount < 1000) {
      setError('Le montant minimum de retrait est de 1 000 FCFA.');
      return false;
    }

    // Lock 3 & 4: Max retirable check
    if (numericAmount > maxAllowedAmount) {
      setError(
        `Montant supérieur au solde disponible pour ${provider === 'WAVE' ? 'Wave' : 'Orange Money'
        } (${formatCurrency(maxAllowedAmount)} FCFA).`
      );
      return false;
    }

    // Lock 5: Senegal Phone Regex
    const cleanPhone = phone.replace(/\s/g, '');
    if (!PHONE_REGEX.test(cleanPhone)) {
      setError('Veuillez entrer un numéro valide au Sénégal (+221 77/78/70/76/75).');
      return false;
    }

    return true;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const cleanPhoneFormatted = (raw: string) => {
    let clean = raw.replace(/\s/g, '');
    if (!clean.startsWith('+221') && !clean.startsWith('221')) {
      clean = `+221${clean}`;
    } else if (clean.startsWith('221')) {
      clean = `+${clean}`;
    }
    return clean;
  };

  // Lock 6: Confirmation API Execution
  const handleSubmitWithdrawal = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      const numericAmount = parseFloat(amount.replace(/\s/g, ''));
      const formattedPhone = cleanPhoneFormatted(phone);

      const res = await walletApi.requestWithdrawal({
        montant: numericAmount,
        methode: provider,
        numeroDestinataire: formattedPhone,
      });

      if (res.ok || res.success) {
        await invalidateWallet();
        await invalidateAnalytics();
        setSuccessMessage(
          `Virement de ${formatCurrency(numericAmount)} FCFA envoyé vers ${provider === 'WAVE' ? 'Wave' : 'Orange Money'
          } (${formattedPhone}) avec succès.`
        );
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        setError(res.message || 'Une erreur est survenue lors de la demande de virement.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Erreur lors de la demande de virement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const numericAmount = parseFloat(amount.replace(/\s/g, '')) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white text-slate-900 shadow-2xl ring-1 ring-black/5">
        {/* Header */}
        <div className="border-b border-slate-100 px-6 pb-4 pt-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-fraunces text-xl leading-tight text-[#041912]">
                Demande de virement
              </h3>
              <p className="mt-0.5 text-[12.5px] text-slate-500">Transfert instantané vers mobile money</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {!successMessage && (
            <div className="mt-4 flex items-center gap-1.5">
              <span className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-[#0A3D2E]' : 'bg-slate-150'}`} />
              <span className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-[#0A3D2E]' : 'bg-slate-150'}`} />
            </div>
          )}
        </div>

        {/* Success Banner */}
        {successMessage ? (
          <div className="space-y-4 p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#0A3D2E]/8 text-[#0A3D2E]">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h4 className="font-fraunces text-xl text-[#041912]">Virement confirmé</h4>
            <p className="text-[13px] leading-relaxed text-slate-600">{successMessage}</p>
          </div>
        ) : (
          <div className="space-y-5 p-6">
            {/* Error Banner */}
            {error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-rose-100 bg-rose-50 p-3.5 text-[12.5px] font-medium text-rose-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            {step === 1 ? (
              /* STEP 1: CHOICE & AMOUNT & PHONE */
              <div className="space-y-5">
                {/* Operator Selector */}
                <div className="space-y-2">
                  <label className="text-[12.5px] font-semibold text-[#041912]">
                    Service de réception
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleProviderChange('WAVE')}
                      className={`relative flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-all ${provider === 'WAVE'
                          ? 'border-[#00C3FF]/60 bg-[#00C3FF]/5 ring-1 ring-[#00C3FF]/30'
                          : 'border-slate-200 hover:border-slate-300'
                        }`}
                    >
                      <div className="h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-white p-1 ring-1 ring-slate-200">
                        <img src="/wave.png" alt="Wave" className="h-full w-full object-contain" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12.5px] font-semibold text-slate-900">Wave</p>
                        <p className="truncate text-[11px] text-slate-500">{formatCurrency(soldeWave)} FCFA</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleProviderChange('ORANGE_MONEY')}
                      className={`relative flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-all ${provider === 'ORANGE_MONEY'
                          ? 'border-[#FF6600]/60 bg-[#FF6600]/5 ring-1 ring-[#FF6600]/30'
                          : 'border-slate-200 hover:border-slate-300'
                        }`}
                    >
                      <div className="h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-black p-1">
                        <img src="/orange.png" alt="Orange Money" className="h-full w-full object-contain" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12.5px] font-semibold text-slate-900">Orange Money</p>
                        <p className="truncate text-[11px] text-slate-500">{formatCurrency(soldeOm)} FCFA</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[12.5px] font-semibold text-[#041912]">Montant à retirer</label>
                    <span className="text-[11.5px] text-slate-400">
                      Max {formatCurrency(maxAllowedAmount)} FCFA
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value);
                        setError(null);
                      }}
                      placeholder="25 000"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-16 font-fraunces text-lg text-[#041912] placeholder:font-sans placeholder:text-slate-300 focus:border-[#0A3D2E] focus:outline-none focus:ring-2 focus:ring-[#0A3D2E]/10"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11.5px] font-semibold text-slate-400">
                      FCFA
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-0.5">
                    {[
                      { label: '25%', val: 25 },
                      { label: '50%', val: 50 },
                      { label: '75%', val: 75 },
                      { label: 'Max', val: 100 },
                    ].map((chip) => (
                      <button
                        key={chip.label}
                        type="button"
                        onClick={() => handleSetPercentage(chip.val)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-[11.5px] font-semibold text-slate-600 transition-colors hover:border-[#0A3D2E]/40 hover:bg-[#0A3D2E]/5 hover:text-[#0A3D2E]"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Destination Phone Input */}
                <div className="space-y-2">
                  <label className="text-[12.5px] font-semibold text-[#041912]">
                    Numéro de réception (Sénégal)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setError(null);
                    }}
                    placeholder="+221 77 123 45 67"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[13.5px] font-medium text-[#041912] placeholder:text-slate-300 focus:border-[#0A3D2E] focus:outline-none focus:ring-2 focus:ring-[#0A3D2E]/10"
                  />
                  <p className="text-[11px] text-slate-400">
                    Numéros acceptés : 77, 78, 70, 76, 75 — ex. 771234567
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#041912] px-6 py-3.5 text-[13.5px] font-semibold text-[#F1DFB6] transition-colors hover:bg-[#0A3D2E]"
                >
                  Continuer vers le récapitulatif
                  <ArrowRight className="h-4 w-4 text-[#4ADE80]" />
                </button>
              </div>
            ) : (
              /* STEP 2: RECAP & CONFIRMATION */
              <div className="space-y-5">
                <div>
                  <h4 className="text-[12.5px] font-semibold text-[#041912]">Récapitulatif</h4>
                  <div className="mt-2 divide-y divide-slate-100 border-y border-slate-100">
                    <div className="flex items-center justify-between py-2.5 text-[13px]">
                      <span className="text-slate-500">Opérateur</span>
                      <span className="flex items-center gap-2 font-semibold text-[#041912]">
                        <img
                          src={provider === 'WAVE' ? '/wave.png' : '/orange.png'}
                          alt={provider}
                          className="h-4 w-4 object-contain"
                        />
                        {provider === 'WAVE' ? 'Wave Sénégal' : 'Orange Money'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2.5 text-[13px]">
                      <span className="text-slate-500">Numéro destinataire</span>
                      <span className="font-semibold text-[#041912]">{cleanPhoneFormatted(phone)}</span>
                    </div>

                    <div className="flex items-center justify-between py-2.5 text-[13px]">
                      <span className="text-slate-500">Montant demandé</span>
                      <span className="font-semibold text-[#041912]">{formatCurrency(numericAmount)} FCFA</span>
                    </div>

                    <div className="flex items-center justify-between py-2.5 text-[13px]">
                      <span className="text-slate-500">Frais de retrait</span>
                      <span className="font-semibold text-[#0A3D2E]">Offerts</span>
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <span className="text-[13.5px] font-semibold text-[#041912]">Montant net versé</span>
                      <span className="font-fraunces text-xl text-[#0A3D2E]">
                        {formatCurrency(numericAmount)} FCFA
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-[12px] text-slate-500">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#0A3D2E]" />
                  <span>
                    En confirmant, le montant sera instantanément débité de votre solde et transféré sur votre compte mobile money.
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-4 py-3 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Retour
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmitWithdrawal}
                    disabled={isSubmitting}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#041912] px-6 py-3 text-[13.5px] font-semibold text-[#F1DFB6] transition-colors hover:bg-[#0A3D2E] disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-[#4ADE80]" />
                        Traitement en cours...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-[#4ADE80]" />
                        Confirmer le virement
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};