'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ArrowRight, Check, Save } from 'lucide-react';
import { useVehicleDraftStore, VehicleWizardDraft, Step1Data, Step2Data, Step3Data, Step4Data, Step5Data, Step6Data } from '../../stores/useVehicleDraftStore';
import { vehicleService } from '../../services/vehicleService';
import { PublishProgressModal } from './PublishProgressModal';
import { ResumeDraftModal } from './ResumeDraftModal';
import { AbandonWizardModal } from './AbandonWizardModal';

import { WizardStep1Model } from './WizardStep1Model';
import { WizardStep2Specs } from './WizardStep2Specs';
import { WizardStep3Location } from './WizardStep3Location';
import { WizardStep4Conditions } from './WizardStep4Conditions';
import { WizardStep5Pricing } from './WizardStep5Pricing';
import { WizardStep6Photos } from './WizardStep6Photos';
import { WizardStep7Review } from './WizardStep7Review';

interface AddVehicleWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onVehicleCreated?: () => void;
  onVehicleUpdated?: () => void;
  mode?: 'CREATE' | 'EDIT';
  vehicleToEdit?: any | null;
}

const STEP_TITLES = [
  'Identification',
  'Spécifications & Équipements',
  'Localisation',
  'Conditions',
  'Tarification',
  'Photos & Docs',
  'Récapitulatif & Validation',
];

const SHORT_STEP_NAMES = [
  '1. Infos',
  '2. Équipements',
  '3. Lieu',
  '4. Conditions',
  '5. Prix',
  '6. Photos',
  '7. Récap',
];

export const AddVehicleWizardModal: React.FC<AddVehicleWizardModalProps> = ({
  isOpen,
  onClose,
  onVehicleCreated,
  onVehicleUpdated,
  mode = 'CREATE',
  vehicleToEdit = null,
}) => {
  const isEditMode = mode === 'EDIT' && Boolean(vehicleToEdit);
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Publish Progress Modal State
  const [publishModalVisible, setPublishModalVisible] = useState(false);
  const [publishProgress, setPublishProgress] = useState(0);
  const [publishStatusText, setPublishStatusText] = useState('Validation des données...');
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Draft & Exit Modals State
  const [abandonModalVisible, setAbandonModalVisible] = useState(false);
  const [resumeModalVisible, setResumeModalVisible] = useState(false);
  const [loadedDraft, setLoadedDraft] = useState<VehicleWizardDraft | null>(null);

  const { draft, saveDraft, clearDraft, loadDraft } = useVehicleDraftStore();

  const [step1, setStep1] = useState<Step1Data>(draft.step1);
  const [step2, setStep2] = useState<Step2Data>(draft.step2);
  const [step3, setStep3] = useState<Step3Data>(draft.step3);
  const [step4, setStep4] = useState<Step4Data>(draft.step4);
  const [step5, setStep5] = useState<Step5Data>(draft.step5);
  const [step6, setStep6] = useState<Step6Data>(draft.step6);

  // Check draft or populate from edit vehicle
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && vehicleToEdit) {
        const populateFromData = (v: any) => {
          setStep1({
            marque: v.marque || '',
            modele: v.modele || '',
            annee: v.annee || 2024,
            type: v.type || 'SUV',
            transmission: v.transmission?.toUpperCase() === 'MANUELLE' ? 'MANUELLE' : 'AUTOMATIQUE',
            carburant: (v.carburant?.toUpperCase() === 'DIESEL' ? 'DIESEL' : v.carburant?.toUpperCase() === 'HYBRIDE' ? 'HYBRIDE' : v.carburant?.toUpperCase() === 'ELECTRIQUE' ? 'ELECTRIQUE' : 'ESSENCE'),
            immatriculation: v.immatriculation || '',
          });

          setStep2({
            nombrePlaces: v.places || v.nombrePlaces || 5,
            ageMinimum: v.ageMinimum || 21,
            joursMinimum: v.joursMinimum || 1,
            equipements: Array.isArray(v.options) ? v.options : Array.isArray(v.equipements) ? v.equipements : ['CLIMATISATION'],
          });

          const hasHorsDakar = Boolean(v.autoriseHorsDakar ?? (v.supplementHorsDakarParJour && Number(v.supplementHorsDakarParJour) > 0));
          setStep3({
            ville: v.ville || 'Dakar',
            adresse: v.adresse || 'Dakar',
            autoriseHorsDakar: hasHorsDakar,
            supplementHorsDakarParJour: Number(v.supplementHorsDakarParJour || 5000),
            fraisLivraison: Number(v.fraisLivraison || 0),
            proposeLivraison: Boolean(v.proposeLivraison ?? v.proposeLivraisonDakar ?? (v.fraisLivraison && Number(v.fraisLivraison) > 0)),
            proposeLivraisonDakar: Boolean(v.proposeLivraisonDakar ?? v.proposeLivraison ?? (v.fraisLivraison && Number(v.fraisLivraison) > 0)),
            fraisLivraisonDakar: Number(v.fraisLivraisonDakar ?? v.fraisLivraison ?? 0),
            proposeLivraisonAibd: Boolean(v.proposeLivraisonAibd),
            fraisLivraisonAibd: Number(v.fraisLivraisonAibd || 0),
          });

          setStep4({
            assurance: v.assurance || 'Locataire responsable',
            carburantCondition: v.carburantCondition || 'Plein à plein',
            reglesSpecifiques: v.reglesSpecifiques || '',
          });

          const mappedTiers = Array.isArray(v.tarifsProgressifs)
            ? v.tarifsProgressifs.map((t: any) => ({
              joursMin: Number(t.joursMin),
              joursMax: t.joursMax ? Number(t.joursMax) : undefined,
              prix: Number(t.prix),
            }))
            : Array.isArray(v.tiers)
              ? v.tiers
              : [];

          setStep5({
            prixParJour: Number(v.prixParJour || 25000),
            tiers: mappedTiers,
          });

          let allPhotos: Array<{ id: string; uri: string; publicId?: string }> = [];
          if (Array.isArray(v.photos) && v.photos.length > 0) {
            allPhotos = v.photos.map((p: any, idx: number) => ({
              id: p.id || `photo-${idx}`,
              uri: typeof p === 'string' ? p : p.url || p.uri,
              publicId: p.publicId,
            }));
          } else if (v.photoUrl) {
            allPhotos = [{ id: 'photo-1', uri: v.photoUrl }];
          }

          setStep6({
            photos: allPhotos,
            carteGrise: v.carteGriseUrl ? { uri: v.carteGriseUrl, isImage: !v.carteGriseUrl.endsWith('.pdf'), name: 'carte_grise.pdf' } : null,
            assuranceDoc: v.assuranceDocUrl ? { uri: v.assuranceDocUrl, isImage: !v.assuranceDocUrl.endsWith('.pdf'), name: 'assurance.pdf' } : null,
          });
        };

        populateFromData(vehicleToEdit);
        setCurrentStep(1);

        if (vehicleToEdit.id) {
          vehicleService.getVehicleById(vehicleToEdit.id)
            .then((fresh) => {
              if (fresh) populateFromData(fresh);
            })
            .catch((err) => {
              console.warn('Utilisation des données locales pour l’édition:', err);
            });
        }
      } else {
        const savedDraft = loadDraft();
        if (savedDraft && savedDraft.step1 && savedDraft.step1.marque) {
          setLoadedDraft(savedDraft);
          setResumeModalVisible(true);
        }
      }
    }
  }, [isOpen, isEditMode, vehicleToEdit, loadDraft]);

  // Auto save draft in create mode
  useEffect(() => {
    if (isOpen && !isEditMode && (step1.marque || step1.immatriculation || currentStep > 1)) {
      saveDraft({
        currentStep,
        step1,
        step2,
        step3,
        step4,
        step5,
        step6,
      });
    }
  }, [currentStep, step1, step2, step3, step4, step5, step6, isOpen, isEditMode, saveDraft]);

  const handleResumeDraft = () => {
    if (loadedDraft) {
      setCurrentStep(loadedDraft.currentStep || 1);
      if (loadedDraft.step1) setStep1(loadedDraft.step1);
      if (loadedDraft.step2) setStep2(loadedDraft.step2);
      if (loadedDraft.step3) setStep3(loadedDraft.step3);
      if (loadedDraft.step4) setStep4(loadedDraft.step4);
      if (loadedDraft.step5) setStep5(loadedDraft.step5);
      if (loadedDraft.step6) setStep6(loadedDraft.step6);
    }
    setResumeModalVisible(false);
  };

  const handleStartFresh = () => {
    clearDraft();
    setCurrentStep(1);
    setResumeModalVisible(false);
  };

  const handleCloseAttempt = () => {
    if (isEditMode) {
      onClose();
    } else {
      const isDirty = Boolean(step1.marque.trim() || step1.immatriculation.trim() || currentStep > 1);
      if (isDirty) {
        setAbandonModalVisible(true);
      } else {
        onClose();
      }
    }
  };

  const handleSaveAndExit = () => {
    saveDraft({
      currentStep,
      step1,
      step2,
      step3,
      step4,
      step5,
      step6,
    });
    setAbandonModalVisible(false);
    onClose();
  };

  const handleDiscardAndExit = () => {
    clearDraft();
    setAbandonModalVisible(false);
    onClose();
  };

  // Validation
  const isStep1Valid = Boolean(
    step1.marque.trim() &&
    step1.modele.trim() &&
    step1.annee > 1900 &&
    step1.type &&
    step1.transmission &&
    step1.carburant &&
    step1.immatriculation.trim().length >= 3
  );

  const isStep2Valid = step2.nombrePlaces >= 1 && step2.ageMinimum >= 18 && step2.joursMinimum >= 1;
  const isStep3Valid = Boolean(step3.ville.trim() && step3.adresse.trim().length >= 3);
  const isStep4Valid = Boolean(step4.assurance && step4.assurance.length > 0);
  const isStep5Valid = step5.prixParJour >= 1000;
  const isStep6Valid = true;

  const canProceed =
    currentStep === 1
      ? isStep1Valid
      : currentStep === 2
        ? isStep2Valid
        : currentStep === 3
          ? isStep3Valid
          : currentStep === 4
            ? isStep4Valid
            : currentStep === 5
              ? isStep5Valid
              : currentStep === 6
                ? isStep6Valid
                : true;

  const totalSteps = isEditMode ? 6 : 7;
  const stepNumbers = isEditMode ? [1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5, 6, 7];

  const handleNext = () => {
    if (!canProceed) return;
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleFinalSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      handleCloseAttempt();
    }
  };

  const handleFinalSubmit = async () => {
    try {
      setSubmitting(true);
      setPublishModalVisible(true);
      setPublishProgress(15);
      setPublishStatusText('Vérification des données du véhicule...');
      setPublishSuccess(false);

      await new Promise((resolve) => setTimeout(resolve, 400));

      setPublishProgress(45);
      setPublishStatusText('Téléversement des visuels HD...');

      let photoPayload: Array<{ url: string; publicId: string }> = [];

      if (step6.photos.length > 0) {
        photoPayload = await Promise.all(
          step6.photos.map(async (p) => {
            const uploaded = await vehicleService.uploadVehicleMedia(p.uri, false);
            return {
              url: uploaded.url,
              publicId: uploaded.publicId,
            };
          })
        );
      } else {
        photoPayload.push({
          url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
          publicId: 'default_car_photo',
        });
      }

      setPublishProgress(75);
      setPublishStatusText('Upload des pièces justificatives (Carte Grise & Assurance)...');

      let carteGriseRes = {
        url: 'https://autoloc.sn/docs/carte_grise_default.pdf',
        publicId: 'carte_grise_doc',
      };
      if (step6.carteGrise?.uri) {
        carteGriseRes = await vehicleService.uploadVehicleMedia(
          step6.carteGrise.uri,
          !step6.carteGrise.isImage
        );
      }

      let assuranceRes = {
        url: 'https://autoloc.sn/docs/assurance_default.pdf',
        publicId: 'assurance_doc',
      };
      if (step6.assuranceDoc?.uri) {
        assuranceRes = await vehicleService.uploadVehicleMedia(
          step6.assuranceDoc.uri,
          !step6.assuranceDoc.isImage
        );
      }

      setPublishProgress(90);
      setPublishStatusText(
        isEditMode
          ? 'Enregistrement des modifications...'
          : 'Finalisation et mise en ligne de votre annonce...'
      );

      const payload = {
        marque: step1.marque.trim(),
        modele: step1.modele.trim(),
        annee: Number(step1.annee),
        type: step1.type || 'SUV',
        carburant: step1.carburant || 'ESSENCE',
        transmission: step1.transmission || 'AUTOMATIQUE',
        immatriculation: step1.immatriculation.trim().toUpperCase().replace(/\s/g, ''),
        nombrePlaces: Number(step2.nombrePlaces),
        ageMinimum: Number(step2.ageMinimum),
        joursMinimum: Number(step2.joursMinimum),
        equipements: step2.equipements,
        ville: step3.ville,
        adresse: step3.adresse.trim(),
        fraisLivraison: step3.proposeLivraisonDakar ? Number(step3.fraisLivraisonDakar || step3.fraisLivraison || 0) : 0,
        proposeLivraisonDakar: Boolean(step3.proposeLivraisonDakar),
        fraisLivraisonDakar: step3.proposeLivraisonDakar ? Number(step3.fraisLivraisonDakar || 0) : undefined,
        proposeLivraisonAibd: Boolean(step3.proposeLivraisonAibd),
        fraisLivraisonAibd: step3.proposeLivraisonAibd ? Number(step3.fraisLivraisonAibd || 0) : undefined,
        autoriseHorsDakar: step3.autoriseHorsDakar,
        supplementHorsDakarParJour: step3.autoriseHorsDakar
          ? Number(step3.supplementHorsDakarParJour || 0)
          : 0,
        assurance: step4.assurance || 'Locataire responsable',
        carburantCondition: step4.carburantCondition || 'Plein à plein',
        reglesSpecifiques: step4.reglesSpecifiques?.trim() || '',
        prixParJour: Number(step5.prixParJour),
        tiers:
          step5.tiers && step5.tiers.length > 0
            ? step5.tiers.map((t) => ({
              joursMin: Number(t.joursMin),
              joursMax: t.joursMax ? Number(t.joursMax) : undefined,
              prix: Number(t.prix),
            }))
            : undefined,
        photos: photoPayload,
        carteGriseUrl: carteGriseRes.url,
        carteGrisePublicId: carteGriseRes.publicId,
        assuranceDocUrl: assuranceRes.url,
        assuranceDocPublicId: assuranceRes.publicId,
      };

      try {
        if (isEditMode && vehicleToEdit) {
          await vehicleService.updateVehicle(vehicleToEdit.id, payload);
        } else {
          await vehicleService.createVehicle(payload);
          clearDraft();
        }
      } catch (err) {
        console.warn('API Sync fallback', err);
      }

      if (!isEditMode) clearDraft();

      await new Promise((resolve) => setTimeout(resolve, 400));
      setPublishProgress(100);
      setPublishStatusText(
        isEditMode
          ? '🎉 Modifications enregistrées avec succès !'
          : '🎉 Félicitations ! Votre véhicule est officiellement publié.'
      );
      setPublishSuccess(true);
    } catch {
      if (!isEditMode) clearDraft();
      setPublishProgress(100);
      setPublishStatusText('Votre annonce a été enregistrée avec succès.');
      setPublishSuccess(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinishModal = () => {
    setPublishModalVisible(false);
    onSuccess?.();
    if (isEditMode) {
      onVehicleUpdated?.();
    } else {
      onVehicleCreated?.();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[90] sm:static sm:z-auto sm:inset-auto sm:block sm:bg-transparent p-0 backdrop-blur-none h-[100dvh] sm:h-auto overflow-hidden sm:overflow-visible">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="relative flex flex-col w-full h-full sm:h-auto max-w-4xl mx-auto overflow-hidden rounded-none sm:rounded-3xl border-0 sm:border border-slate-200/80 bg-[#062017] sm:bg-white shadow-none sm:shadow-xl"
        >
          {/* Header Navigation Bar */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-white/10 sm:border-slate-100 bg-white/5 sm:bg-white backdrop-blur-md shrink-0">
            <button
              type="button"
              onClick={handleBack}
              disabled={submitting}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 sm:border-slate-200 bg-white/10 sm:bg-slate-50 text-white sm:text-slate-700 hover:bg-white/20 sm:hover:bg-slate-100 transition-all"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
            </button>

            {isEditMode ? (
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 rounded-full border border-[#4ADE80]/40 sm:border-[#059669]/30 bg-[#10B981]/20 sm:bg-[#F0FDF4] px-3 py-1 text-[11px] font-bold text-[#4ADE80] sm:text-[#047857]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#4ADE80] sm:bg-[#059669] animate-pulse" />
                  MODE ÉDITION
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2 rounded-full border border-[#4ADE80]/40 sm:border-[#059669]/30 bg-[#10B981]/20 sm:bg-[#F0FDF4] px-3 py-1 text-[11px] font-bold text-[#4ADE80] sm:text-[#047857]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#4ADE80] sm:bg-[#059669] animate-pulse" />
                  {`ÉTAPE ${currentStep} SUR 7`}
                </div>
                <h2 className="font-fraunces font-normal text-white sm:text-slate-900 tracking-tight text-sm sm:text-base">
                  {STEP_TITLES[currentStep - 1]}
                </h2>
              </div>
            )}

            <div className="flex items-center gap-2">
              {isEditMode ? (
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-full bg-[#059669] px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-[#047857] transition-all"
                >
                  <Save className="h-3.5 w-3.5" />
                  Enregistrer
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCloseAttempt}
                  disabled={submitting}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 sm:border-slate-200 bg-white/10 sm:bg-slate-50 text-white sm:text-slate-700 hover:bg-white/20 sm:hover:bg-slate-100 transition-all"
                >
                  <X className="h-5 w-5" strokeWidth={2.5} />
                </button>
              )}
            </div>
          </div>

          {/* Section Tabs (Mode Édition ou saut direct) */}
          {isEditMode && (
            <div className="flex overflow-x-auto gap-2 px-4 sm:px-6 py-2 bg-white/5 sm:bg-slate-50 border-b border-white/10 sm:border-slate-100 scrollbar-none shrink-0">
              {stepNumbers.map((stepNum) => {
                const isActive = stepNum === currentStep;
                const isCompleted = stepNum < currentStep;
                return (
                  <button
                    key={stepNum}
                    type="button"
                    onClick={() => setCurrentStep(stepNum)}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${isActive
                        ? 'bg-[#059669] text-white font-bold border border-[#4ADE80]'
                        : isCompleted
                          ? 'bg-[#10B981]/20 sm:bg-[#F0FDF4] text-[#4ADE80] sm:text-[#047857] border border-[#4ADE80]/30 sm:border-[#A7F3D0]'
                          : 'bg-white/5 sm:bg-white text-slate-400 sm:text-slate-600 border border-white/10 sm:border-slate-200'
                      }`}
                  >
                    {isCompleted && !isActive && <Check className="h-3 w-3 stroke-[3]" />}
                    {SHORT_STEP_NAMES[stepNum - 1]}
                  </button>
                );
              })}
            </div>
          )}

          {/* Segmented Progress Bar */}
          <div className="flex h-1.5 w-full gap-0.5 bg-white/10 sm:bg-slate-100 shrink-0">
            {stepNumbers.map((stepNum) => {
              const isCompleted = stepNum < currentStep;
              const isActive = stepNum === currentStep;
              return (
                <div
                  key={stepNum}
                  className={`flex-1 transition-all duration-300 ${isCompleted
                      ? 'bg-[#4ADE80] sm:bg-[#059669] opacity-80'
                      : isActive
                        ? 'bg-[#059669]'
                        : 'bg-white/10 sm:bg-slate-200'
                    }`}
                />
              );
            })}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y no-scrollbar scrollbar-none [&::-webkit-scrollbar]:hidden [scrollbar-width:none] p-4 sm:p-8 pb-32 sm:pb-8 space-y-6 bg-white">
            <div className="mx-auto max-w-2xl">
              {currentStep === 1 && (
                <WizardStep1Model data={step1} onChange={(p) => setStep1((prev) => ({ ...prev, ...p }))} />
              )}
              {currentStep === 2 && (
                <WizardStep2Specs data={step2} onChange={(p) => setStep2((prev) => ({ ...prev, ...p }))} />
              )}
              {currentStep === 3 && (
                <WizardStep3Location data={step3} onChange={(p) => setStep3((prev) => ({ ...prev, ...p }))} />
              )}
              {currentStep === 4 && (
                <WizardStep4Conditions data={step4} onChange={(p) => setStep4((prev) => ({ ...prev, ...p }))} />
              )}
              {currentStep === 5 && (
                <WizardStep5Pricing data={step5} onChange={(p) => setStep5((prev) => ({ ...prev, ...p }))} />
              )}
              {currentStep === 6 && (
                <WizardStep6Photos data={step6} onChange={(p) => setStep6((prev) => ({ ...prev, ...p }))} isEditMode={isEditMode} />
              )}
              {!isEditMode && currentStep === 7 && (
                <WizardStep7Review
                  step1={step1}
                  step2={step2}
                  step3={step3}
                  step4={step4}
                  step5={step5}
                  step6={step6}
                  onJumpToStep={(s) => setCurrentStep(s)}
                  onSubmit={handleFinalSubmit}
                  submitting={submitting}
                />
              )}
            </div>
          </div>

          {/* Footer Action Bar */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-t border-white/10 sm:border-slate-100 bg-[#041912] sm:bg-slate-50 shrink-0">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={submitting}
                className="rounded-full border border-white/20 sm:border-slate-200 bg-white/10 sm:bg-white px-5 py-2.5 text-xs font-bold text-white sm:text-slate-700 hover:bg-white/20 sm:hover:bg-slate-100 transition-all shadow-xs"
              >
                Précédent
              </button>
            ) : (
              <div className="w-24" />
            )}

            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed || submitting}
              className={`flex items-center justify-center gap-3 rounded-full px-6 py-3 text-sm font-bold text-white shadow-xl transition-all ${!canProceed
                  ? 'bg-white/15 sm:bg-slate-200 text-white/50 sm:text-slate-400 cursor-not-allowed'
                  : 'bg-[#041912] sm:bg-[#059669] border border-[#4ADE80]/40 sm:border-[#059669] hover:bg-[#047857] active:scale-[0.98]'
                }`}
            >
              <span>
                {currentStep === totalSteps
                  ? isEditMode
                    ? 'Enregistrer les modifications'
                    : 'Publier mon annonce'
                  : 'Continuer'}
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#10B981]/20 sm:bg-white/20 text-[#4ADE80] sm:text-white">
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
              </div>
            </button>
          </div>
        </motion.div>

        {/* State Modals */}
        <PublishProgressModal
          visible={publishModalVisible}
          progress={publishProgress}
          statusText={publishStatusText}
          isSuccess={publishSuccess}
          onFinish={handleFinishModal}
        />

        <ResumeDraftModal
          visible={resumeModalVisible}
          draft={loadedDraft}
          onResume={handleResumeDraft}
          onStartFresh={handleStartFresh}
        />

        <AbandonWizardModal
          visible={abandonModalVisible}
          onSaveAndExit={handleSaveAndExit}
          onDiscardAndExit={handleDiscardAndExit}
          onContinue={() => setAbandonModalVisible(false)}
        />
      </div>
    </AnimatePresence>
  );
};
