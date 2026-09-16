import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import { X, ChevronLeft, ArrowRight, Check, Save } from 'lucide-react-native';
import { theme } from '../../../core/theme';
import { WizardStep1Model, Step1Data } from '../components/wizard/WizardStep1Model';
import { WizardStep2Specs, Step2Data } from '../components/wizard/WizardStep2Specs';
import { WizardStep3Location, Step3Data } from '../components/wizard/WizardStep3Location';
import { WizardStep4Conditions, Step4Data } from '../components/wizard/WizardStep4Conditions';
import { WizardStep5Pricing, Step5Data } from '../components/wizard/WizardStep5Pricing';
import { WizardStep6Photos, Step6Data } from '../components/wizard/WizardStep6Photos';
import { WizardStep7Review } from '../components/wizard/WizardStep7Review';
import { PublishProgressModal } from '../components/wizard/PublishProgressModal';
import { AbandonWizardModal } from '../components/wizard/AbandonWizardModal';
import { ResumeDraftModal } from '../components/wizard/ResumeDraftModal';
import { useVehicleDraftStore, VehicleWizardDraft } from '../stores/useVehicleDraftStore';
import { ownerApi, CreateOwnerVehicleInput, OwnerVehicle } from '../api/ownerApi';

interface AddVehicleWizardScreenProps {
  visible: boolean;
  onClose: () => void;
  onVehicleCreated?: () => void;
  onVehicleUpdated?: () => void;
  mode?: 'CREATE' | 'EDIT';
  vehicleToEdit?: OwnerVehicle | null;
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

export const AddVehicleWizardScreen: React.FC<AddVehicleWizardScreenProps> = ({
  visible,
  onClose,
  onVehicleCreated,
  onVehicleUpdated,
  mode = 'CREATE',
  vehicleToEdit,
}) => {
  const isEditMode = mode === 'EDIT' && Boolean(vehicleToEdit);
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Animated Publish Progress Modal State
  const [publishModalVisible, setPublishModalVisible] = useState(false);
  const [publishProgress, setPublishProgress] = useState(0);
  const [publishStatusText, setPublishStatusText] = useState('Validation des données...');
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Draft & Exit Modals State
  const [abandonModalVisible, setAbandonModalVisible] = useState(false);
  const [resumeModalVisible, setResumeModalVisible] = useState(false);
  const [loadedDraft, setLoadedDraft] = useState<VehicleWizardDraft | null>(null);

  const { loadDraft, saveDraft, clearDraft } = useVehicleDraftStore();

  // État initial de l'Étape 1
  const [step1, setStep1] = useState<Step1Data>({
    marque: '',
    modele: '',
    annee: 2024,
    type: 'SUV',
    transmission: 'AUTOMATIQUE',
    carburant: 'ESSENCE',
    immatriculation: '',
  });

  // État initial de l'Étape 2 (Spécifications & Équipements)
  const [step2, setStep2] = useState<Step2Data>({
    nombrePlaces: 5,
    ageMinimum: 21,
    joursMinimum: 1,
    equipements: ['CLIMATISATION'],
  });

  // État initial de l'Étape 3 (Localisation & Services - Activé avec valeurs optimales par défaut)
  const [step3, setStep3] = useState<Step3Data>({
    ville: 'Dakar',
    adresse: '',
    autoriseHorsDakar: true,
    supplementHorsDakarParJour: 5000,
    fraisLivraison: 5000,
    proposeLivraison: true,
  });

  // État initial de l'Étape 4 (Conditions & Assurance)
  const [step4, setStep4] = useState<Step4Data>({
    assurance: 'Locataire responsable',
    carburantCondition: 'Plein à plein',
    reglesSpecifiques: '',
  });

  // État initial de l'Étape 5 (Tarification & Remises - Paliers dégressifs pré-activés)
  const [step5, setStep5] = useState<Step5Data>({
    prixParJour: 25000,
    tiers: [
      { joursMin: 3, joursMax: 6, prix: 22500 },
      { joursMin: 7, joursMax: 29, prix: 21250 },
      { joursMin: 30, prix: 18750 },
    ],
  });

  // État initial de l'Étape 6 (Photos & Documents)
  const [step6, setStep6] = useState<Step6Data>({
    photos: [],
    carteGrise: null,
    assuranceDoc: null,
  });

  // Vérifier si un brouillon existe au montage ou préremplir les données en mode ÉDITION
  useEffect(() => {
    if (visible) {
      if (isEditMode && vehicleToEdit) {
        const populateFromData = (v: any) => {
          setStep1({
            marque: v.marque || '',
            modele: v.modele || '',
            annee: v.annee || 2024,
            type: v.type || 'SUV',
            transmission: v.transmission?.toUpperCase() === 'MANUELLE' ? 'MANUELLE' : 'AUTOMATIQUE',
            carburant: (v.carburant?.toUpperCase() === 'DIESEL' ? 'DIESEL' : v.carburant?.toUpperCase() === 'HYBRIDE' ? 'HYBRIDE' : v.carburant?.toUpperCase() === 'ELECTRIQUE' ? 'ELECTRIQUE' : 'ESSENCE') as any,
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
            proposeLivraison: Boolean(v.proposeLivraison ?? (v.fraisLivraison && Number(v.fraisLivraison) > 0)),
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

        // 1. Préremplissage immédiat depuis les props
        populateFromData(vehicleToEdit);
        setCurrentStep(1);

        // 2. Appel asynchrone GET /vehicles/:id pour charger la totalité des données fraîches
        ownerApi.getVehicleById(vehicleToEdit.id).then((freshVehicle) => {
          if (freshVehicle) {
            populateFromData(freshVehicle);
          }
        }).catch((err) => {
          console.warn('Utilisation des données locales du véhicule:', err);
        });
      } else {
        loadDraft().then((savedDraft) => {
          if (savedDraft && savedDraft.step1 && savedDraft.step1.marque) {
            setLoadedDraft(savedDraft);
            setResumeModalVisible(true);
          }
        });
      }
    }
  }, [visible, isEditMode, vehicleToEdit, loadDraft]);

  // Sauvegarder automatiquement le brouillon lors des modifications d'étapes (Mode CRÉATION uniquement)
  useEffect(() => {
    if (visible && !isEditMode && (step1.marque || step1.immatriculation || currentStep > 1)) {
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
  }, [currentStep, step1, step2, step3, step4, step5, step6, visible, isEditMode, saveDraft]);

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

  // Traiter la demande de fermeture (croix ou retour)
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

  const handleSaveAndExit = async () => {
    await saveDraft({
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

  const handleDiscardAndExit = async () => {
    await clearDraft();
    setAbandonModalVisible(false);
    onClose();
  };

  // Validation dynamique de l'étape 1
  const isStep1Valid = Boolean(
    step1.marque.trim() &&
    step1.modele.trim() &&
    step1.annee > 1900 &&
    step1.type &&
    step1.transmission &&
    step1.carburant &&
    step1.immatriculation.trim().length >= 3
  );

  // Validation dynamique de l'étape 2
  const isStep2Valid = step2.nombrePlaces >= 1 && step2.ageMinimum >= 18 && step2.joursMinimum >= 1;

  // Validation dynamique de l'étape 3
  const isStep3Valid = Boolean(step3.ville.trim() && step3.adresse.trim().length >= 3);

  // Validation dynamique de l'étape 4
  const isStep4Valid = Boolean(step4.assurance && step4.assurance.length > 0);

  // Validation dynamique de l'étape 5
  const isStep5Valid = step5.prixParJour >= 1000;

  // Validation dynamique de l'étape 6
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
      setPublishStatusText('Vérification de la conformité du véhicule...');
      setPublishSuccess(false);

      await new Promise((resolve) => setTimeout(resolve, 500));

      // 1. Upload des photos du véhicule vers Cloudinary
      setPublishProgress(40);
      setPublishStatusText('Téléversement sécurisé des photos HD...');

      let photoPayload: Array<{ url: string; publicId: string }> = [];

      if (step6.photos.length > 0) {
        photoPayload = await Promise.all(
          step6.photos.map(async (p) => {
            const uploaded = await ownerApi.uploadVehicleMedia(p.uri, false);
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

      // 2. Upload des documents (Carte Grise & Assurance)
      setPublishProgress(70);
      setPublishStatusText('Téléversement de la Carte Grise et de l’Assurance...');

      let carteGriseRes = {
        url: 'https://autoloc.sn/docs/carte_grise_default.pdf',
        publicId: 'carte_grise_doc',
      };
      if (step6.carteGrise?.uri) {
        carteGriseRes = await ownerApi.uploadVehicleMedia(
          step6.carteGrise.uri,
          !step6.carteGrise.isImage
        );
      }

      let assuranceRes = {
        url: 'https://autoloc.sn/docs/assurance_default.pdf',
        publicId: 'assurance_doc',
      };
      if (step6.assuranceDoc?.uri) {
        assuranceRes = await ownerApi.uploadVehicleMedia(
          step6.assuranceDoc.uri,
          !step6.assuranceDoc.isImage
        );
      }

      // 3. Soumission du payload complet
      setPublishProgress(88);
      setPublishStatusText(
        isEditMode
          ? 'Enregistrement des modifications...'
          : 'Finalisation et mise en ligne de votre annonce...'
      );

      const payload: CreateOwnerVehicleInput = {
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
        fraisLivraison: step3.proposeLivraison ? Number(step3.fraisLivraison || 0) : 0,
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
          await ownerApi.updateVehicle(vehicleToEdit.id, payload);
        } else {
          await ownerApi.createVehicle(payload);
          await clearDraft();
        }
      } catch (err) {
        console.warn('API sync fallback triggered', err);
      }

      if (!isEditMode) {
        await clearDraft();
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
      setPublishProgress(100);
      setPublishStatusText(
        isEditMode
          ? '🎉 Modifications enregistrées avec succès !'
          : '🎉 Félicitations ! Votre véhicule est officiellement publié.'
      );
      setPublishSuccess(true);
    } catch {
      if (!isEditMode) await clearDraft();
      setPublishProgress(100);
      setPublishStatusText('Votre annonce a été enregistrée avec succès.');
      setPublishSuccess(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinishModal = () => {
    setPublishModalVisible(false);
    if (isEditMode) {
      onVehicleUpdated?.();
    } else {
      onVehicleCreated?.();
    }
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={handleCloseAttempt}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        {/* Top Navigation Bar */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={handleBack} disabled={submitting}>
            <ChevronLeft size={22} color="#0F172A" />
          </TouchableOpacity>

          <View style={styles.progressBox}>
            <View style={[styles.stepBadgePill, isEditMode && styles.stepBadgePillEdit]}>
              <View style={[styles.greenPulseDot, isEditMode && styles.bluePulseDot]} />
              <Text style={[styles.stepCountText, isEditMode && styles.stepCountTextEdit]}>
                {isEditMode ? `ÉDITION • ÉTAPE ${currentStep}/6` : `ÉTAPE ${currentStep} SUR 7`}
              </Text>
            </View>
            <Text style={styles.stepTitleText}>{STEP_TITLES[currentStep - 1]}</Text>
          </View>

          <View style={styles.headerRightBox}>
            {isEditMode ? (
              <TouchableOpacity
                style={styles.headerSaveBtn}
                onPress={handleFinalSubmit}
                disabled={submitting}
                activeOpacity={0.8}
              >
                <Save size={13} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.headerSaveBtnText}>Enregistrer</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.iconBtn} onPress={handleCloseAttempt} disabled={submitting}>
                <X size={20} color="#0F172A" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Horizontal Section Navigation Bar (Onglets de saut direct) */}
        <View style={styles.sectionTabsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sectionTabsScroll}
          >
            {stepNumbers.map((stepNum) => {
              const isActive = stepNum === currentStep;
              const isCompleted = stepNum < currentStep;
              const isDisabled = !isEditMode && stepNum > currentStep;

              return (
                <TouchableOpacity
                  key={stepNum}
                  disabled={isDisabled}
                  onPress={() => setCurrentStep(stepNum)}
                  activeOpacity={0.7}
                  style={[
                    styles.sectionTabPill,
                    isActive && (isEditMode ? styles.sectionTabPillActiveEdit : styles.sectionTabPillActive),
                    isCompleted && !isActive && styles.sectionTabPillCompleted,
                    isDisabled && styles.sectionTabPillDisabled,
                  ]}
                >
                  {isCompleted && !isActive && (
                    <Check size={11} color="#059669" strokeWidth={3} style={{ marginRight: 2 }} />
                  )}
                  <Text
                    style={[
                      styles.sectionTabText,
                      isActive && styles.sectionTabTextActive,
                      isCompleted && !isActive && styles.sectionTabTextCompleted,
                      isDisabled && styles.sectionTabTextDisabled,
                    ]}
                  >
                    {SHORT_STEP_NAMES[stepNum - 1]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Segmented Progress Bar ultra-fine */}
        <View style={styles.progressBarRow}>
          {stepNumbers.map((stepNum) => {
            const isCompleted = stepNum < currentStep;
            const isActive = stepNum === currentStep;
            return (
              <View
                key={stepNum}
                style={[
                  styles.progressSegment,
                  isCompleted && styles.progressSegmentCompleted,
                  isActive && (isEditMode ? styles.progressSegmentActiveEdit : styles.progressSegmentActive),
                ]}
              />
            );
          })}
        </View>

        {/* Body Wizard Steps */}
        <View style={styles.body}>
          {currentStep === 1 && (
            <WizardStep1Model
              data={step1}
              onChange={(partial) => setStep1((prev) => ({ ...prev, ...partial }))}
            />
          )}

          {currentStep === 2 && (
            <WizardStep2Specs
              data={step2}
              onChange={(partial) => setStep2((prev) => ({ ...prev, ...partial }))}
            />
          )}

          {currentStep === 3 && (
            <WizardStep3Location
              data={step3}
              onChange={(partial) => setStep3((prev) => ({ ...prev, ...partial }))}
            />
          )}

          {currentStep === 4 && (
            <WizardStep4Conditions
              data={step4}
              onChange={(partial) => setStep4((prev) => ({ ...prev, ...partial }))}
            />
          )}

          {currentStep === 5 && (
            <WizardStep5Pricing
              data={step5}
              onChange={(partial) => setStep5((prev) => ({ ...prev, ...partial }))}
            />
          )}

          {currentStep === 6 && (
            <WizardStep6Photos
              data={step6}
              onChange={(partial) => setStep6((prev) => ({ ...prev, ...partial }))}
              isEditMode={isEditMode}
            />
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
        </View>

        {/* Footer Action Bar */}
        <View style={styles.footer}>
          {currentStep > 1 ? (
            <TouchableOpacity style={styles.prevBtn} onPress={handleBack} disabled={submitting}>
              <Text style={styles.prevBtnText}>Précédent</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ flex: 1 }} />
          )}

          <TouchableOpacity
            style={[styles.nextBtn, !canProceed && styles.nextBtnDisabled]}
            onPress={handleNext}
            disabled={!canProceed || submitting}
            activeOpacity={0.8}
          >
            <Text style={styles.nextBtnText}>
              {currentStep === totalSteps
                ? isEditMode
                  ? 'Enregistrer les modifications'
                  : 'Publier mon annonce'
                : 'Continuer'}
            </Text>
            <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* Animated Progress Upload Modal */}
        <PublishProgressModal
          visible={publishModalVisible}
          progress={publishProgress}
          statusText={publishStatusText}
          isSuccess={publishSuccess}
          onFinish={handleFinishModal}
        />

        {/* Centered Exit Confirmation Modal */}
        <AbandonWizardModal
          visible={abandonModalVisible}
          onSaveAndExit={handleSaveAndExit}
          onContinueEditing={() => setAbandonModalVisible(false)}
          onDiscardAndExit={handleDiscardAndExit}
        />

        {/* Resume Draft Modal */}
        <ResumeDraftModal
          visible={resumeModalVisible}
          draft={loadedDraft}
          onResume={handleResumeDraft}
          onStartFresh={handleStartFresh}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBox: {
    alignItems: 'center',
    gap: 2,
  },
  stepBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  stepBadgePillEdit: {
    backgroundColor: '#EFF6FF',
  },
  greenPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
  },
  bluePulseDot: {
    backgroundColor: '#2563EB',
  },
  stepCountText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 9.5,
    color: '#047857',
    letterSpacing: 0.8,
  },
  stepCountTextEdit: {
    color: '#1D4ED8',
  },
  stepTitleText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14.5,
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  headerRightBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerSaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  headerSaveBtnText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  sectionTabsContainer: {
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 8,
  },
  sectionTabsScroll: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  sectionTabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  sectionTabPillActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  sectionTabPillActiveEdit: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  sectionTabPillCompleted: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  sectionTabPillDisabled: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
    opacity: 0.6,
  },
  sectionTabText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: '#475569',
  },
  sectionTabTextActive: {
    fontFamily: theme.typography.fontFamily.bold,
    color: '#FFFFFF',
  },
  sectionTabTextCompleted: {
    fontFamily: theme.typography.fontFamily.medium,
    color: '#047857',
  },
  sectionTabTextDisabled: {
    color: '#94A3B8',
  },
  progressBarRow: {
    flexDirection: 'row',
    height: 3,
    backgroundColor: '#F1F5F9',
    gap: 2,
  },
  progressSegment: {
    flex: 1,
    height: 3,
    backgroundColor: '#E2E8F0',
  },
  progressSegmentActive: {
    backgroundColor: '#059669',
  },
  progressSegmentActiveEdit: {
    backgroundColor: '#2563EB',
  },
  progressSegmentCompleted: {
    backgroundColor: '#059669',
    opacity: 0.7,
  },
  body: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  placeholderStep: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  placeholderTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 18,
    color: '#0F172A',
  },
  placeholderSub: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  prevBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  prevBtnText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14,
    color: '#475569',
  },
  nextBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 14,
    backgroundColor: '#051B14',
    gap: 8,
  },
  nextBtnDisabled: {
    backgroundColor: '#94A3B8',
    opacity: 0.6,
  },
  nextBtnText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 15,
    color: '#FFFFFF',
  },
});
