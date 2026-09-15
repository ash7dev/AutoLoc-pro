import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { ShieldCheck, Camera, UserCheck, ArrowRight, ChevronLeft, CheckCircle2, FileText } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { kycService } from '../../../kyc/services/kycService';
import { useAppStore } from '../../../../core/store/useAppStore';
import { ImageSourcePickerModal } from '../../../../shared/components/ImageSourcePickerModal';
import { theme } from '../../../../core/theme';

interface GateStepKycIdentityProps {
  onSuccess: () => void;
}

const COLORS = {
  bg: '#FFFFFF',
  accent: '#16A34A',
  accentLight: '#F0FDF4',
  ink: '#041912',
  inkMuted: '#64748B',
  border: '#E2E8F0',
  surface: '#F8FAFC',
};

type KycSubStep = 1 | 2 | 3;
type TargetField = 'FRONT' | 'BACK' | 'SELFIE';

export const GateStepKycIdentity: React.FC<GateStepKycIdentityProps> = ({ onSuccess }) => {
  const updateUserProfile = useAppStore((state) => state.updateUserProfile);

  const [subStep, setSubStep] = useState<KycSubStep>(1);
  const [frontUri, setFrontUri] = useState<string | null>(null);
  const [backUri, setBackUri] = useState<string | null>(null);
  const [selfieUri, setSelfieUri] = useState<string | null>(null);

  // État de la jauge de progression d'upload (0-100%)
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');

  // Modal sur-mesure de sélection de source photo / fichier
  const [pickerModalVisible, setPickerModalVisible] = useState(false);

  const activeTarget: TargetField = subStep === 1 ? 'FRONT' : subStep === 2 ? 'BACK' : 'SELFIE';

  const handleApplyUri = (uri: string) => {
    if (subStep === 1) setFrontUri(uri);
    else if (subStep === 2) setBackUri(uri);
    else if (subStep === 3) setSelfieUri(uri);
  };

  // Option 1 : Photothèque
  const handleSelectLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission requise', 'L\'accès aux photos est nécessaire.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      handleApplyUri(result.assets[0].uri);
    }
  };

  // Option 2 : Appareil photo
  const handleSelectCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission requise', 'L\'accès à l\'appareil photo est nécessaire.');
      return;
    }
    const cameraType = subStep === 3 ? ImagePicker.CameraType.front : ImagePicker.CameraType.back;
    const result = await ImagePicker.launchCameraAsync({
      cameraType,
      quality: 0.8,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      handleApplyUri(result.assets[0].uri);
    }
  };

  // Option 3 : Choisir les fichiers
  const handleSelectDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        handleApplyUri(result.assets[0].uri);
      }
    } catch (error) {
      console.warn('Erreur sélection document:', error);
    }
  };

  const handleNextSubStep = () => {
    if (subStep === 1) {
      if (!frontUri) {
        Alert.alert('Photo requise', 'Veuillez ajouter la photo du Recto avant de continuer.');
        return;
      }
      setSubStep(2);
    } else if (subStep === 2) {
      if (!backUri) {
        Alert.alert('Photo requise', 'Veuillez ajouter la photo du Verso avant de continuer.');
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
    if (!selfieUri) {
      Alert.alert('Selfie manquant', 'Veuillez prendre une photo selfie pour valider la concordance faciale.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setProgressLabel('Initialisation du transfert sécurisé...');

    try {
      await kycService.submitKycLinksWithProgress(
        frontUri!,
        backUri!,
        selfieUri,
        (percent, label) => {
          setUploadProgress(percent);
          setProgressLabel(label);
        }
      );

      await updateUserProfile({
        statutKyc: 'EN_ATTENTE',
      });

      Alert.alert(
        'Dossier transmis avec succès !',
        'Votre dossier d\'identité est en cours d\'examen. Vous pouvez continuer votre réservation.',
        [{ text: 'Continuer', onPress: onSuccess }]
      );
    } catch (error: any) {
      console.error('Erreur soumission KYC:', error);
      Alert.alert('Erreur', 'Échec de l\'envoi de votre dossier. Vérifiez votre connexion et réessayez.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* En-tête des Sous-Étapes (1/3, 2/3, 3/3) */}
        {!uploading && (
          <View style={styles.subStepHeader}>
            <View style={styles.subStepIndicatorRow}>
              {[1, 2, 3].map((stepNum) => {
                const isCompleted = stepNum < subStep;
                const isActive = stepNum === subStep;
                return (
                  <View key={stepNum} style={styles.subStepIndicatorItem}>
                    <View
                      style={[
                        styles.subStepCircle,
                        isCompleted && styles.subStepCircleCompleted,
                        isActive && styles.subStepCircleActive,
                      ]}
                    >
                      {isCompleted ? (
                        <CheckCircle2 size={16} color="#FFFFFF" />
                      ) : (
                        <Text style={[styles.subStepCircleText, isActive && styles.subStepCircleTextActive]}>
                          {stepNum}
                        </Text>
                      )}
                    </View>
                    <Text style={[styles.subStepLabel, isActive && styles.subStepLabelActive]}>
                      {stepNum === 1 ? 'Recto' : stepNum === 2 ? 'Verso' : 'Selfie'}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Jauge de Progression d'Upload (Si soumission en cours) */}
        {uploading ? (
          <View style={styles.progressGaugeCard}>
            <View style={styles.iconCircle}>
              <ShieldCheck size={36} color={COLORS.accent} />
            </View>
            <Text style={styles.progressGaugeTitle}>Transfert sécurisé de votre dossier</Text>
            <Text style={styles.progressGaugePercent}>{uploadProgress}%</Text>

            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${uploadProgress}%` }]} />
            </View>

            <Text style={styles.progressGaugeLabel}>{progressLabel}</Text>
          </View>
        ) : (
          /* Sous-Étapes Guidées 1, 2 ou 3 */
          <View>
            {/* SOUS-ÉTAPE 1 : RECTO CNI / PASSEPORT */}
            {subStep === 1 && (
              <View style={styles.stepContentCard}>
                <View style={styles.stepTitleRow}>
                  <FileText size={24} color={COLORS.accent} />
                  <Text style={styles.stepTitle}>1. Pièce d'identité (Recto)</Text>
                </View>
                <Text style={styles.stepInstruction}>
                  Prenez en photo le recto de votre CNI ou la page principale de votre Passeport. Veillez à éviter les reflets.
                </Text>

                <Pressable style={styles.captureFrame} onPress={() => setPickerModalVisible(true)}>
                  {frontUri ? (
                    <View style={styles.previewContainer}>
                      <Image source={{ uri: frontUri }} style={styles.previewImage} />
                      <View style={styles.completedBadge}>
                        <CheckCircle2 size={16} color="#FFFFFF" />
                        <Text style={styles.completedBadgeText}>Recto capturé</Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.placeholderContainer}>
                      <Camera size={36} color={COLORS.inkMuted} />
                      <Text style={styles.placeholderMainText}>Ajouter la photo Recto</Text>
                      <Text style={styles.placeholderSubText}>Photothèque, Appareil photo ou Fichiers</Text>
                    </View>
                  )}
                </Pressable>
              </View>
            )}

            {/* SOUS-ÉTAPE 2 : VERSO CNI / PASSEPORT */}
            {subStep === 2 && (
              <View style={styles.stepContentCard}>
                <View style={styles.stepTitleRow}>
                  <FileText size={24} color={COLORS.accent} />
                  <Text style={styles.stepTitle}>2. Pièce d'identité (Verso)</Text>
                </View>
                <Text style={styles.stepInstruction}>
                  Prenez en photo le verso de votre CNI (ou la deuxième page de votre Passeport).
                </Text>

                <Pressable style={styles.captureFrame} onPress={() => setPickerModalVisible(true)}>
                  {backUri ? (
                    <View style={styles.previewContainer}>
                      <Image source={{ uri: backUri }} style={styles.previewImage} />
                      <View style={styles.completedBadge}>
                        <CheckCircle2 size={16} color="#FFFFFF" />
                        <Text style={styles.completedBadgeText}>Verso capturé</Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.placeholderContainer}>
                      <Camera size={36} color={COLORS.inkMuted} />
                      <Text style={styles.placeholderMainText}>Ajouter la photo Verso</Text>
                      <Text style={styles.placeholderSubText}>Photothèque, Appareil photo ou Fichiers</Text>
                    </View>
                  )}
                </Pressable>
              </View>
            )}

            {/* SOUS-ÉTAPE 3 : SELFIE BIOMÉTRIQUE */}
            {subStep === 3 && (
              <View style={styles.stepContentCard}>
                <View style={styles.stepTitleRow}>
                  <UserCheck size={24} color={COLORS.accent} />
                  <Text style={styles.stepTitle}>3. Selfie de vérification</Text>
                </View>
                <Text style={styles.stepInstruction}>
                  Prenez un selfie clair de votre visage pour valider la concordance avec la pièce d'identité.
                </Text>

                <Pressable style={styles.captureFrame} onPress={() => setPickerModalVisible(true)}>
                  {selfieUri ? (
                    <View style={styles.previewContainer}>
                      <Image source={{ uri: selfieUri }} style={styles.previewImage} />
                      <View style={styles.completedBadge}>
                        <CheckCircle2 size={16} color="#FFFFFF" />
                        <Text style={styles.completedBadgeText}>Selfie capturé</Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.placeholderContainer}>
                      <UserCheck size={36} color={COLORS.inkMuted} />
                      <Text style={styles.placeholderMainText}>Prendre un selfie de votre visage</Text>
                      <Text style={styles.placeholderSubText}>Positionnez votre visage au centre</Text>
                    </View>
                  )}
                </Pressable>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Modal Sur-Mesure Sélection Source */}
      <ImageSourcePickerModal
        visible={pickerModalVisible}
        onClose={() => setPickerModalVisible(false)}
        onSelectLibrary={handleSelectLibrary}
        onSelectCamera={handleSelectCamera}
        onSelectDocument={handleSelectDocument}
      />

      {/* Barre d'Action Inférieure (Navigation entre sous-étapes) */}
      {!uploading && (
        <View style={styles.footer}>
          <View style={styles.navRow}>
            {subStep > 1 ? (
              <Pressable style={styles.prevButton} onPress={handlePrevSubStep}>
                <ChevronLeft size={20} color={COLORS.ink} />
                <Text style={styles.prevButtonText}>Retour</Text>
              </Pressable>
            ) : (
              <View style={{ width: 80 }} />
            )}

            {subStep < 3 ? (
              <Pressable style={styles.nextButton} onPress={handleNextSubStep}>
                <Text style={styles.nextButtonText}>Suivant</Text>
                <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.5} />
              </Pressable>
            ) : (
              <Pressable style={styles.nextButton} onPress={handleSubmitFinal}>
                <Text style={styles.nextButtonText}>Soumettre mon KYC</Text>
                <CheckCircle2 size={18} color="#FFFFFF" strokeWidth={2.5} />
              </Pressable>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  subStepHeader: {
    marginBottom: 20,
  },
  subStepIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  subStepIndicatorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subStepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subStepCircleActive: {
    backgroundColor: COLORS.accent,
  },
  subStepCircleCompleted: {
    backgroundColor: COLORS.accent,
  },
  subStepCircleText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.inkMuted,
  },
  subStepCircleTextActive: {
    color: '#FFFFFF',
  },
  subStepLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.inkMuted,
  },
  subStepLabelActive: {
    fontWeight: '800',
    color: COLORS.ink,
  },
  stepContentCard: {
    backgroundColor: COLORS.bg,
  },
  stepTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  stepTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 20,
    color: theme.primitives.forest[800],
  },
  stepInstruction: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 13.5,
    color: COLORS.inkMuted,
    lineHeight: 20,
    marginBottom: 20,
  },
  captureFrame: {
    height: 220,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
  },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 20,
  },
  placeholderMainText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 15,
    color: COLORS.ink,
    textAlign: 'center',
  },
  placeholderSubText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    color: COLORS.inkMuted,
    textAlign: 'center',
  },
  previewContainer: {
    flex: 1,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover' as const,
  },
  completedBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: COLORS.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  completedBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    color: '#FFFFFF',
    fontSize: 12,
  },
  progressGaugeCard: {
    backgroundColor: COLORS.accentLight,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  progressGaugeTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 16,
    color: COLORS.ink,
    textAlign: 'center',
    marginBottom: 8,
  },
  progressGaugePercent: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 28,
    color: COLORS.accent,
    marginBottom: 16,
  },
  progressBarTrack: {
    height: 10,
    width: '100%',
    backgroundColor: '#DCFCE7',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 5,
  },
  progressGaugeLabel: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12.5,
    color: COLORS.inkMuted,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  prevButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  prevButtonText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14.5,
    color: COLORS.ink,
  },
  nextButton: {
    backgroundColor: COLORS.accent,
    height: 50,
    paddingHorizontal: 22,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nextButtonText: {
    fontFamily: theme.typography.fontFamily.bold,
    color: '#FFFFFF',
    fontSize: 15,
  },
});
