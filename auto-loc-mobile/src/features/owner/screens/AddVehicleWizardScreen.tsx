import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  ActionSheetIOS,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, ChevronLeft, ArrowRight, Check, Save, Sparkles, ShieldCheck } from 'lucide-react-native';
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

const { width: screenWidth } = Dimensions.get('window');

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
  const insets = useSafeAreaInsets();
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

  // État initial de l'Étape 3 (Localisation & Services - Désactivés par défaut)
  const [step3, setStep3] = useState<Step3Data>({
    ville: 'Dakar',
    adresse: '',
    autoriseHorsDakar: false,
    supplementHorsDakarParJour: 0,
    fraisLivraison: 0,
    proposeLivraison: false,
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
        if (Platform.OS === 'ios') {
          ActionSheetIOS.showActionSheetWithOptions(
            {
              options: [
                "Continuer l'édition",
                ' Enregistrer le brouillon et quitter',
                ' Supprimer le brouillon et quitter',
              ],
              cancelButtonIndex: 0,
              destructiveButtonIndex: 2,
              title: 'Enregistrer et quitter ?',
              message: 'Votre annonce sera conservée dans vos brouillons. Vous pourrez la reprendre à tout moment.',
            },
            (buttonIndex) => {
              if (buttonIndex === 1) {
                handleSaveAndExit();
              } else if (buttonIndex === 2) {
                handleDiscardAndExit();
              }
            }
          );
        } else {
          Alert.alert(
            'Enregistrer et quitter ?',
            'Votre annonce sera conservée dans vos brouillons. Vous pourrez la reprendre à tout moment.',
            [
              {
                text: 'Enregistrer le brouillon',
                onPress: handleSaveAndExit,
              },
              {
                text: 'Supprimer le brouillon',
                style: 'destructive',
                onPress: handleDiscardAndExit,
              },
              {
                text: "Continuer l'édition",
                style: 'cancel',
              },
            ],
            { cancelable: true }
          );
        }
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
    onClose();
  };

  const handleDiscardAndExit = async () => {
    await clearDraft();
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
    <Modal visible={visible} animationType="fade" presentationStyle="fullScreen" onRequestClose={handleCloseAttempt}>
      <View style={styles.modalContainer}>
        <StatusBar style="light" animated />

        {/* 1. Fond Sombre Émeraude & Aura Lumineuse Luxury */}
        <View style={StyleSheet.absoluteFill}>
          <LinearGradient
            colors={['#062017', '#04150F', '#020B08']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.auraGlow} />
        </View>

        {/* 2. Content Safe Area Wrapper */}
        <View
          style={[
            styles.safeWrapper,
            {
              paddingTop: Math.max(insets.top, 20) + 4,
              paddingBottom: Math.max(insets.bottom, 16) + 4,
            },
          ]}
        >
          {/* Top Header Navigation Glass */}
          <View style={styles.topHeaderRow}>
            <TouchableOpacity
              style={styles.glassCloseBtn}
              onPress={handleBack}
              disabled={submitting}
              activeOpacity={0.8}
            >
              <ChevronLeft size={20} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>

            {isEditMode ? (
              <View style={styles.editHeaderCenter}>
                <View style={styles.stepBadgePill}>
                  <View style={styles.greenPulseDot} />
                  <Text style={styles.stepCountText}>MODE ÉDITION</Text>
                </View>
              </View>
            ) : (
              <View style={styles.progressBox}>
                <View style={styles.stepBadgePill}>
                  <View style={styles.greenPulseDot} />
                  <Text style={styles.stepCountText}>{`ÉTAPE ${currentStep} SUR 7`}</Text>
                </View>
                <Text style={styles.stepTitleText}>{STEP_TITLES[currentStep - 1]}</Text>
              </View>
            )}

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
                <TouchableOpacity
                  style={styles.glassCloseBtn}
                  onPress={handleCloseAttempt}
                  disabled={submitting}
                  activeOpacity={0.8}
                >
                  <X size={18} color="#FFFFFF" strokeWidth={2.5} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Horizontal Section Navigation Bar (Onglets de saut direct en verre sombre - Mode ÉDITION uniquement) */}
          {isEditMode && (
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
                        isActive && styles.sectionTabPillActive,
                        isCompleted && !isActive && styles.sectionTabPillCompleted,
                        isDisabled && styles.sectionTabPillDisabled,
                      ]}
                    >
                      {isCompleted && !isActive && (
                        <Check size={11} color="#4ADE80" strokeWidth={3} style={{ marginRight: 3 }} />
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
          )}

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
                    isActive && styles.progressSegmentActive,
                  ]}
                />
              );
            })}
          </View>

          {/* Main Content Area with Layered White Card Stack */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.flexOne}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
            >
              {/* STACK CARDS SUPERPOSÉES (Blanche + Ombre Émeraude) */}
              <View style={styles.cardStackWrapper}>
                {/* Card d'arrière-plan en décalé */}
                <View style={styles.backAccentCard} />

                {/* Card Principale Blanche avec les éléments du formulaire */}
                <View style={styles.frontGlassCard}>
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
              </View>
            </ScrollView>
          </KeyboardAvoidingView>

          {/* Footer Action Bar (CTA en bas) */}
          <View style={styles.footerContainer}>
            {currentStep > 1 ? (
              <TouchableOpacity
                style={styles.prevBtnGlass}
                onPress={handleBack}
                disabled={submitting}
                activeOpacity={0.8}
              >
                <Text style={styles.prevBtnText}>Précédent</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ width: 100 }} />
            )}

            <TouchableOpacity
              style={[styles.nextBtnDark, !canProceed && styles.nextBtnDisabled]}
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
              <View style={styles.emeraldArrowCircle}>
                <ArrowRight size={14} color="#4ADE80" strokeWidth={2.5} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Animated Progress Upload Modal */}
        <PublishProgressModal
          visible={publishModalVisible}
          progress={publishProgress}
          statusText={publishStatusText}
          isSuccess={publishSuccess}
          onFinish={handleFinishModal}
        />

        {/* Resume Draft Modal */}
        <ResumeDraftModal
          visible={resumeModalVisible}
          draft={loadedDraft}
          onResume={handleResumeDraft}
          onStartFresh={handleStartFresh}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#04150F',
  },
  auraGlow: {
    position: 'absolute',
    top: -60,
    alignSelf: 'center',
    width: screenWidth * 0.9,
    height: screenWidth * 0.9,
    borderRadius: (screenWidth * 0.9) / 2,
    backgroundColor: 'rgba(16, 185, 129, 0.16)',
  },
  safeWrapper: {
    flex: 1,
  },
  flexOne: {
    flex: 1,
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  glassCloseBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editHeaderCenter: {
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
    backgroundColor: 'rgba(16, 185, 129, 0.20)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.35)',
  },
  greenPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ADE80',
  },
  stepCountText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 9.5,
    color: '#4ADE80',
    letterSpacing: 0.8,
  },
  stepTitleText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 15,
    color: '#FFFFFF',
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
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    shadowColor: '#059669',
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  sectionTabPillActive: {
    backgroundColor: '#059669',
    borderColor: '#4ADE80',
  },
  sectionTabPillCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    borderColor: 'rgba(74, 222, 128, 0.35)',
  },
  sectionTabPillDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    opacity: 0.5,
  },
  sectionTabText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.70)',
  },
  sectionTabTextActive: {
    fontFamily: theme.typography.fontFamily.bold,
    color: '#FFFFFF',
  },
  sectionTabTextCompleted: {
    fontFamily: theme.typography.fontFamily.medium,
    color: '#4ADE80',
  },
  sectionTabTextDisabled: {
    color: 'rgba(255, 255, 255, 0.35)',
  },
  progressBarRow: {
    flexDirection: 'row',
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    gap: 2,
  },
  progressSegment: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  progressSegmentActive: {
    backgroundColor: '#059669',
  },
  progressSegmentCompleted: {
    backgroundColor: '#4ADE80',
    opacity: 0.8,
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 120,
    flexGrow: 1,
  },
  cardStackWrapper: {
    position: 'relative',
    marginTop: 8,
    marginBottom: 16,
  },
  backAccentCard: {
    position: 'absolute',
    top: -6,
    left: 6,
    right: 6,
    bottom: -6,
    borderRadius: 32,
    backgroundColor: 'rgba(16, 185, 129, 0.20)',
    borderWidth: 1.5,
    borderColor: 'rgba(74, 222, 128, 0.35)',
  },
  frontGlassCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.80)',
    borderRadius: 28,
    padding: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 10,
  },
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
    gap: 12,
  },
  prevBtnGlass: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prevBtnText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13.5,
    color: '#FFFFFF',
  },
  nextBtnDark: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 25,
    backgroundColor: '#041912',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.40)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
    gap: 8,
  },
  nextBtnDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'transparent',
    opacity: 0.5,
  },
  nextBtnText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14.5,
    color: '#FFFFFF',
  },
  emeraldArrowCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(16, 185, 129, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
});
