import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
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

type KycSubStep = 1 | 2 | 3;
type TargetField = 'FRONT' | 'BACK' | 'SELFIE';

export const GateStepKycIdentity: React.FC<GateStepKycIdentityProps> = ({ onSuccess }) => {
  const updateUserProfile = useAppStore((state) => state.updateUserProfile);

  const [subStep, setSubStep] = useState<KycSubStep>(1);
  const [frontUri, setFrontUri] = useState<string | null>(null);
  const [backUri, setBackUri] = useState<string | null>(null);
  const [selfieUri, setSelfieUri] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');

  const [pickerModalVisible, setPickerModalVisible] = useState(false);

  const handleApplyUri = (uri: string) => {
    if (subStep === 1) setFrontUri(uri);
    else if (subStep === 2) setBackUri(uri);
    else if (subStep === 3) setSelfieUri(uri);
  };

  const handleSelectLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission requise', 'L\'accès aux photos est nécessaire.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      quality: 0.8,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      handleApplyUri(result.assets[0].uri);
    }
  };

  const handleSelectCamera = async () => {
    try {
      let permission = await ImagePicker.getCameraPermissionsAsync();
      if (!permission.granted && permission.canAskAgain) {
        permission = await ImagePicker.requestCameraPermissionsAsync();
      }

      if (!permission.granted) {
        Alert.alert(
          'Accès à l\'appareil photo requis',
          'L\'accès à l\'appareil photo est désactivé. Vous pouvez l\'activer dans vos Réglages, ou choisir une photo depuis votre galerie.',
          [
            { text: 'Choisir depuis la galerie', onPress: handleSelectLibrary },
            { text: 'Annuler', style: 'cancel' },
          ]
        );
        return;
      }

      const cameraType = subStep === 3 ? ImagePicker.CameraType.front : ImagePicker.CameraType.back;
      const result = await ImagePicker.launchCameraAsync({
        cameraType,
        quality: 0.8,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        handleApplyUri(result.assets[0].uri);
      }
    } catch (error: any) {
      console.warn('Erreur ouverture caméra:', error);
      Alert.alert(
        'Appareil photo indisponible',
        'Impossible d\'ouvrir l\'appareil photo direct. Souhaitez-vous sélectionner une photo depuis votre galerie ?',
        [
          { text: 'Ouvrir la galerie', onPress: handleSelectLibrary },
          { text: 'Annuler', style: 'cancel' },
        ]
      );
    }
  };

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
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.cardStackWrapper}>
        <View style={styles.backAccentCard} />

        <View style={styles.frontGlassCard}>
          {/* Header Box */}
          <View style={styles.cardHeaderBox}>
            <View style={styles.iconCircle}>
              <ShieldCheck size={30} color="#059669" />
            </View>

            <View style={styles.badgeKycGlass}>
              <ShieldCheck size={12} color="#059669" />
              <Text style={styles.badgeKycText}>CONTRÔLE D'IDENTITÉ</Text>
            </View>

            <Text style={styles.mainTitle}>Pièce d'Identité & Selfie</Text>
            <Text style={styles.subtitle}>
              Transmission sécurisée conforme aux normes de sécurité AutoLoc.
            </Text>
          </View>

          {/* SubStep Pill Track */}
          {!uploading && (
            <View style={styles.subStepTrack}>
              {[1, 2, 3].map((stepNum) => {
                const isCompleted = stepNum < subStep;
                const isActive = stepNum === subStep;
                const stepLabel = stepNum === 1 ? '1. Recto' : stepNum === 2 ? '2. Verso' : '3. Selfie';

                return (
                  <TouchableOpacity
                    key={stepNum}
                    style={[
                      styles.subStepPill,
                      isActive && styles.subStepPillActive,
                      isCompleted && styles.subStepPillCompleted,
                    ]}
                    onPress={() => {
                      if (stepNum === 1) setSubStep(1);
                      if (stepNum === 2 && frontUri) setSubStep(2);
                      if (stepNum === 3 && frontUri && backUri) setSubStep(3);
                    }}
                    activeOpacity={0.8}
                  >
                    {isCompleted ? (
                      <CheckCircle2 size={13} color="#FFFFFF" />
                    ) : null}
                    <Text
                      style={[
                        styles.subStepPillText,
                        isActive && styles.subStepPillTextActive,
                        isCompleted && styles.subStepPillTextCompleted,
                      ]}
                    >
                      {stepLabel}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Upload Progress Gauge */}
          {uploading ? (
            <View style={styles.progressGaugeCard}>
              <Text style={styles.progressGaugeTitle}>Transfert de votre dossier KYC</Text>
              <Text style={styles.progressGaugePercent}>{uploadProgress}%</Text>

              <View style={styles.progressBarTrack}>
                <View style={[styles.progressBarFill, { width: `${uploadProgress}%` }]} />
              </View>

              <Text style={styles.progressGaugeLabel}>{progressLabel}</Text>
            </View>
          ) : (
            /* Active SubStep Content */
            <View style={styles.stepContentBox}>
              {subStep === 1 && (
                <View style={styles.subStepInner}>
                  <View style={styles.instructionBox}>
                    <FileText size={16} color="#059669" />
                    <Text style={styles.instructionText}>
                      Prenez le recto de votre CNI ou la page principale du Passeport.
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.captureFrame}
                    onPress={() => setPickerModalVisible(true)}
                    activeOpacity={0.85}
                  >
                    {frontUri ? (
                      <View style={styles.previewContainer}>
                        <Image source={{ uri: frontUri }} style={styles.previewImage} />
                        <View style={styles.completedBadge}>
                          <CheckCircle2 size={15} color="#FFFFFF" />
                          <Text style={styles.completedBadgeText}>Recto capturé</Text>
                        </View>
                      </View>
                    ) : (
                      <View style={styles.placeholderContainer}>
                        <View style={styles.cameraCircleIcon}>
                          <Camera size={26} color="#059669" />
                        </View>
                        <Text style={styles.placeholderMainText}>Ajouter la photo Recto</Text>
                        <Text style={styles.placeholderSubText}>Photothèque, Appareil photo ou Fichiers</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              {subStep === 2 && (
                <View style={styles.subStepInner}>
                  <View style={styles.instructionBox}>
                    <FileText size={16} color="#059669" />
                    <Text style={styles.instructionText}>
                      Prenez le verso de votre CNI ou la deuxième page du Passeport.
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.captureFrame}
                    onPress={() => setPickerModalVisible(true)}
                    activeOpacity={0.85}
                  >
                    {backUri ? (
                      <View style={styles.previewContainer}>
                        <Image source={{ uri: backUri }} style={styles.previewImage} />
                        <View style={styles.completedBadge}>
                          <CheckCircle2 size={15} color="#FFFFFF" />
                          <Text style={styles.completedBadgeText}>Verso capturé</Text>
                        </View>
                      </View>
                    ) : (
                      <View style={styles.placeholderContainer}>
                        <View style={styles.cameraCircleIcon}>
                          <Camera size={26} color="#059669" />
                        </View>
                        <Text style={styles.placeholderMainText}>Ajouter la photo Verso</Text>
                        <Text style={styles.placeholderSubText}>Photothèque, Appareil photo ou Fichiers</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              {subStep === 3 && (
                <View style={styles.subStepInner}>
                  <View style={styles.instructionBox}>
                    <UserCheck size={16} color="#059669" />
                    <Text style={styles.instructionText}>
                      Prenez un selfie bien éclairé de votre visage sans lunettes de soleil.
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.captureFrame}
                    onPress={handleSelectCamera}
                    activeOpacity={0.85}
                  >
                    {selfieUri ? (
                      <View style={styles.previewContainer}>
                        <Image source={{ uri: selfieUri }} style={styles.previewImage} />
                        <View style={styles.completedBadge}>
                          <CheckCircle2 size={15} color="#FFFFFF" />
                          <Text style={styles.completedBadgeText}>Selfie capturé</Text>
                        </View>
                      </View>
                    ) : (
                      <View style={styles.placeholderContainer}>
                        <View style={styles.cameraCircleIcon}>
                          <UserCheck size={26} color="#059669" />
                        </View>
                        <Text style={styles.placeholderMainText}>Prendre un Selfie visuel</Text>
                        <Text style={styles.placeholderSubText}>Ouvrir directement l'appareil photo avant</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* SubStep Navigation Actions */}
          {!uploading && (
            <View style={styles.navRow}>
              {subStep > 1 ? (
                <TouchableOpacity
                  style={styles.prevBtn}
                  onPress={handlePrevSubStep}
                  activeOpacity={0.7}
                >
                  <ChevronLeft size={18} color="#041912" />
                  <Text style={styles.prevBtnText}>Précédent</Text>
                </TouchableOpacity>
              ) : (
                <View style={{ width: 80 }} />
              )}

              {subStep < 3 ? (
                <TouchableOpacity
                  style={styles.nextBtn}
                  onPress={handleNextSubStep}
                  activeOpacity={0.85}
                >
                  <Text style={styles.nextBtnText}>Suivant</Text>
                  <View style={styles.emeraldArrowCircle}>
                    <ArrowRight size={13} color="#4ADE80" strokeWidth={2.5} />
                  </View>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.nextBtn}
                  onPress={handleSubmitFinal}
                  activeOpacity={0.85}
                >
                  <Text style={styles.nextBtnText}>Soumettre mon KYC</Text>
                  <View style={styles.emeraldArrowCircle}>
                    <CheckCircle2 size={13} color="#4ADE80" strokeWidth={2.5} />
                  </View>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>

      <ImageSourcePickerModal
        visible={pickerModalVisible}
        onClose={() => setPickerModalVisible(false)}
        onSelectLibrary={handleSelectLibrary}
        onSelectCamera={handleSelectCamera}
        onSelectDocument={handleSelectDocument}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: theme.spacing[4],
    paddingBottom: theme.spacing[4],
    flexGrow: 1,
    justifyContent: 'center',
  },
  cardStackWrapper: {
    position: 'relative',
    marginVertical: theme.spacing[2],
  },
  backAccentCard: {
    position: 'absolute',
    top: -6,
    left: 8,
    right: 8,
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
    padding: theme.spacing[5],
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 10,
  },
  cardHeaderBox: {
    alignItems: 'center',
    marginBottom: theme.spacing[3],
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing[2],
  },
  badgeKycGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: theme.radius.full,
    gap: 6,
    marginBottom: theme.spacing[2],
  },
  badgeKycText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 9,
    letterSpacing: 0.8,
    color: '#059669',
  },
  mainTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 22,
    lineHeight: 28,
    color: '#041912',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  subStepTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 4,
    marginBottom: theme.spacing[3],
  },
  subStepPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 12,
  },
  subStepPillActive: {
    backgroundColor: '#041912',
  },
  subStepPillCompleted: {
    backgroundColor: '#059669',
  },
  subStepPillText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11,
    color: '#64748B',
  },
  subStepPillTextActive: {
    fontFamily: theme.typography.fontFamily.bold,
    color: '#FFFFFF',
  },
  subStepPillTextCompleted: {
    fontFamily: theme.typography.fontFamily.bold,
    color: '#FFFFFF',
  },
  stepContentBox: {
    marginBottom: theme.spacing[3],
  },
  subStepInner: {
    gap: 12,
  },
  instructionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  instructionText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: '#041912',
    flex: 1,
  },
  captureFrame: {
    height: 180,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#A7F3D0',
    borderStyle: 'dashed',
    backgroundColor: '#F9FAFB',
    overflow: 'hidden',
  },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  cameraCircleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  placeholderMainText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14,
    color: '#041912',
    textAlign: 'center',
  },
  placeholderSubText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11.5,
    color: '#64748B',
    textAlign: 'center',
  },
  previewContainer: {
    flex: 1,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  completedBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#041912',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.40)',
  },
  completedBadgeText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    color: '#FFFFFF',
    fontSize: 11.5,
  },
  progressGaugeCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    alignItems: 'center',
    marginBottom: theme.spacing[3],
  },
  progressGaugeTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 15,
    color: '#041912',
    textAlign: 'center',
    marginBottom: 4,
  },
  progressGaugePercent: {
    fontFamily: theme.typography.fontFamily.extraBold,
    fontSize: 26,
    color: '#059669',
    marginBottom: 10,
  },
  progressBarTrack: {
    height: 8,
    width: '100%',
    backgroundColor: '#DCFCE7',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#059669',
    borderRadius: 4,
  },
  progressGaugeLabel: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing[1],
    gap: 6,
  },
  prevBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 10,
    paddingHorizontal: 8,
    flexShrink: 0,
  },
  prevBtnText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 13,
    color: '#041912',
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    paddingHorizontal: 14,
    borderRadius: 23,
    backgroundColor: '#041912',
    borderWidth: 1,
    borderColor: 'rgba(4, 25, 18, 0.90)',
    shadowColor: '#041912',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
    flexShrink: 1,
  },
  nextBtnText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  emeraldArrowCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(16, 185, 129, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
});

