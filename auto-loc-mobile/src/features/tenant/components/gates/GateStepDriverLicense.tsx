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
import { Award, Camera, CheckCircle2, ArrowRight } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { kycService } from '../../../kyc/services/kycService';
import { useAppStore } from '../../../../core/store/useAppStore';
import { ImageSourcePickerModal } from '../../../../shared/components/ImageSourcePickerModal';
import { theme } from '../../../../core/theme';

interface GateStepDriverLicenseProps {
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

export const GateStepDriverLicense: React.FC<GateStepDriverLicenseProps> = ({ onSuccess }) => {
  const updateUserProfile = useAppStore((state) => state.updateUserProfile);
  const [permisUri, setPermisUri] = useState<string | null>(null);

  // Jauge de progression
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');

  const [pickerModalVisible, setPickerModalVisible] = useState(false);

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
      setPermisUri(result.assets[0].uri);
    }
  };

  // Option 2 : Appareil photo
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

  // Option 3 : Choisir les fichiers
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
    setProgressLabel('Initialisation...');

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
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.iconCircle}>
          <Award size={32} color={COLORS.accent} />
        </View>

        <Text style={styles.title}>Permis de conduire</Text>
        <Text style={styles.subtitle}>
          Ajoutez une photo lisible de votre permis de conduire valide.
        </Text>

        {/* Jauge de Progression d'Upload */}
        {uploading && (
          <View style={styles.progressGaugeCard}>
            <View style={styles.progressGaugeHeader}>
              <Text style={styles.progressGaugeTitle}>Envoi du permis...</Text>
              <Text style={styles.progressGaugePercent}>{uploadProgress}%</Text>
            </View>

            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${uploadProgress}%` }]} />
            </View>

            <Text style={styles.progressGaugeLabel}>{progressLabel}</Text>
          </View>
        )}

        <View style={styles.uploadCard}>
          <Pressable 
            style={styles.uploadBox} 
            onPress={() => !uploading && setPickerModalVisible(true)}
            disabled={uploading}
          >
            {permisUri ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: permisUri }} style={styles.previewImage} />
                <View style={styles.completedBadge}>
                  <CheckCircle2 size={16} color="#FFFFFF" />
                  <Text style={styles.completedBadgeText}>Permis ajouté</Text>
                </View>
              </View>
            ) : (
              <View style={styles.placeholderContainer}>
                <Camera size={32} color={COLORS.inkMuted} />
                <Text style={styles.placeholderText}>Ajouter mon permis de conduire</Text>
                <Text style={styles.placeholderSubtext}>Photothèque, Appareil photo ou Fichiers</Text>
              </View>
            )}
          </Pressable>
        </View>
      </ScrollView>

      {/* Modal Sur-Mesure Sélection Source */}
      <ImageSourcePickerModal
        visible={pickerModalVisible}
        onClose={() => setPickerModalVisible(false)}
        onSelectLibrary={handleSelectLibrary}
        onSelectCamera={handleSelectCamera}
        onSelectDocument={handleSelectDocument}
      />

      {/* Bouton de confirmation */}
      <View style={styles.footer}>
        <Pressable
          style={[styles.submitButton, uploading && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={uploading}
        >
          {uploading ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <ActivityIndicator color="#FFFFFF" />
              <Text style={styles.submitButtonText}>Envoi en cours ({uploadProgress}%)...</Text>
            </View>
          ) : (
            <>
              <Text style={styles.submitButtonText}>Enregistrer mon permis</Text>
              <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.5} />
            </>
          )}
        </Pressable>
      </View>
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
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    alignSelf: 'center',
  },
  title: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 22,
    color: theme.primitives.forest[800],
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 13.5,
    color: COLORS.inkMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  progressGaugeCard: {
    backgroundColor: COLORS.accentLight,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    marginBottom: 20,
  },
  progressGaugeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressGaugeTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13.5,
    color: COLORS.ink,
  },
  progressGaugePercent: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14,
    color: COLORS.accent,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#DCFCE7',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 4,
  },
  progressGaugeLabel: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    color: COLORS.inkMuted,
  },
  uploadCard: {
    marginBottom: 16,
  },
  uploadBox: {
    height: 180,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
  },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  placeholderText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13.5,
    color: COLORS.ink,
  },
  placeholderSubtext: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    color: COLORS.inkMuted,
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
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
  submitButton: {
    backgroundColor: COLORS.accent,
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonText: {
    fontFamily: theme.typography.fontFamily.bold,
    color: '#FFFFFF',
    fontSize: 15.5,
  },
});
