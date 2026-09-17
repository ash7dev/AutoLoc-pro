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
import { Award, Camera, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { kycService } from '../../../kyc/services/kycService';
import { useAppStore } from '../../../../core/store/useAppStore';
import { ImageSourcePickerModal } from '../../../../shared/components/ImageSourcePickerModal';
import { theme } from '../../../../core/theme';

interface GateStepDriverLicenseProps {
  onSuccess: () => void;
}

export const GateStepDriverLicense: React.FC<GateStepDriverLicenseProps> = ({ onSuccess }) => {
  const updateUserProfile = useAppStore((state) => state.updateUserProfile);
  const [permisUri, setPermisUri] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');

  const [pickerModalVisible, setPickerModalVisible] = useState(false);

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
      setPermisUri(result.assets[0].uri);
    }
  };

  const handleSelectCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission requise', 'L\'accès à l\'appareil photo est nécessaire.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setPermisUri(result.assets[0].uri);
    }
  };

  const handleSelectDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        setPermisUri(result.assets[0].uri);
      }
    } catch (error) {
      console.warn('Erreur sélection document:', error);
    }
  };

  const handleSubmit = async () => {
    if (!permisUri) {
      Alert.alert('Permis manquant', 'Veuillez ajouter une photo nette de votre permis de conduire.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setProgressLabel('Initialisation du fichier...');

    try {
      const res = await kycService.submitPermisLinkWithProgress(
        permisUri,
        (percent, label) => {
          setUploadProgress(percent);
          setProgressLabel(label);
        }
      );
      
      await updateUserProfile({
        permisUrl: res.permisUrl || permisUri,
      });

      onSuccess();
    } catch (error: any) {
      console.error('Erreur upload permis:', error);
      Alert.alert('Erreur', 'Échec de l\'envoi du permis. Réessayez.');
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
          <View style={styles.cardHeaderBox}>
            <View style={styles.iconCircle}>
              <Award size={30} color="#059669" />
            </View>

            <View style={styles.badgeKycGlass}>
              <ShieldCheck size={12} color="#059669" />
              <Text style={styles.badgeKycText}>PERMIS DE CONDUIRE</Text>
            </View>

            <Text style={styles.mainTitle}>Permis de Conduire</Text>
            <Text style={styles.subtitle}>
              Ajoutez une photo claire et lisible du recto de votre permis de conduire valide.
            </Text>
          </View>

          {/* Jauge d'Upload en cours */}
          {uploading && (
            <View style={styles.progressGaugeCard}>
              <View style={styles.progressGaugeHeader}>
                <Text style={styles.progressGaugeTitle}>Transfert sécurisé du permis</Text>
                <Text style={styles.progressGaugePercent}>{uploadProgress}%</Text>
              </View>

              <View style={styles.progressBarTrack}>
                <View style={[styles.progressBarFill, { width: `${uploadProgress}%` }]} />
              </View>

              <Text style={styles.progressGaugeLabel}>{progressLabel}</Text>
            </View>
          )}

          {/* Capture Zone Dropzone */}
          <TouchableOpacity
            style={styles.uploadBox}
            onPress={() => !uploading && setPickerModalVisible(true)}
            disabled={uploading}
            activeOpacity={0.85}
          >
            {permisUri ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: permisUri }} style={styles.previewImage} />
                <View style={styles.completedBadge}>
                  <CheckCircle2 size={15} color="#FFFFFF" />
                  <Text style={styles.completedBadgeText}>Permis ajouté</Text>
                </View>
              </View>
            ) : (
              <View style={styles.placeholderContainer}>
                <View style={styles.cameraCircleIcon}>
                  <Camera size={26} color="#059669" />
                </View>
                <Text style={styles.placeholderMainText}>Ajouter mon permis de conduire</Text>
                <Text style={styles.placeholderSubText}>Photothèque, Appareil photo ou Fichiers</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Submit Button Action */}
          <TouchableOpacity
            style={[styles.submitBtn, (!permisUri || uploading) && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={!permisUri || uploading}
            activeOpacity={0.85}
          >
            {uploading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#FFFFFF" size="small" />
                <Text style={styles.submitBtnText}>Envoi en cours ({uploadProgress}%)...</Text>
              </View>
            ) : (
              <>
                <Text style={styles.submitBtnText}>Enregistrer mon permis</Text>
                <View style={styles.emeraldArrowCircle}>
                  <ArrowRight size={13} color="#4ADE80" strokeWidth={2.5} />
                </View>
              </>
            )}
          </TouchableOpacity>
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
  progressGaugeCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: theme.spacing[3],
  },
  progressGaugeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressGaugeTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12.5,
    color: '#041912',
  },
  progressGaugePercent: {
    fontFamily: theme.typography.fontFamily.extraBold,
    fontSize: 13,
    color: '#059669',
  },
  progressBarTrack: {
    height: 7,
    backgroundColor: '#DCFCE7',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#059669',
    borderRadius: 4,
  },
  progressGaugeLabel: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: '#64748B',
  },
  uploadBox: {
    height: 180,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#A7F3D0',
    borderStyle: 'dashed',
    backgroundColor: '#F9FAFB',
    overflow: 'hidden',
    marginBottom: theme.spacing[4],
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
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 25,
    backgroundColor: '#041912',
    borderWidth: 1,
    borderColor: 'rgba(4, 25, 18, 0.90)',
    shadowColor: '#041912',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  btnDisabled: {
    opacity: 0.60,
  },
  submitBtnText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14.5,
    color: '#FFFFFF',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    marginLeft: 8,
  },
});

