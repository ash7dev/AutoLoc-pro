import React, { useState } from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { Camera, CheckCircle2, ImagePlus, ShieldCheck, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../../../../core/theme';
import { ownerApi } from '../../api/ownerApi';

interface OwnerCheckoutModalProps {
  visible: boolean;
  loading: boolean;
  reservationId: string;
  existingPhotos?: Array<{ id: string; url: string; type: string }>;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  onLinkPhoto: (url: string, publicId: string, type: 'CHECKOUT', categorie?: string) => Promise<void>;
}

export const OwnerCheckoutModal: React.FC<OwnerCheckoutModalProps> = ({
  visible,
  loading,
  reservationId,
  existingPhotos = [],
  onClose,
  onConfirm,
  onLinkPhoto,
}) => {
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [checkedTerms, setCheckedTerms] = useState(false);

  const checkoutPhotos = existingPhotos.filter((p) => p.type === 'CHECKOUT');

  const handlePickAndUploadPhoto = async (source: 'camera' | 'library') => {
    try {
      let result: ImagePicker.ImagePickerResult;

      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          return Alert.alert('Permission requise', 'Accès à l’appareil photo nécessaire.');
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets?.[0]?.uri) {
        setUploadingPhoto(true);
        const uploaded = await ownerApi.uploadVehicleMedia(result.assets[0].uri);
        await onLinkPhoto(uploaded.url, uploaded.publicId, 'CHECKOUT');
      }
    } catch (err: any) {
      Alert.alert('Erreur upload', err?.message || 'L’envoi de la photo a échoué.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleConfirmCheckout = async () => {
    if (!checkedTerms) {
      return Alert.alert('Vérification requise', 'Veuillez cocher la case d’inspection du véhicule au retour.');
    }

    try {
      await onConfirm();
    } catch (err: any) {
      Alert.alert('Erreur', err?.message || 'La clôture de la location a échoué.');
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Check-out & Restitution</Text>
              <Text style={styles.subtitle}>Clôturez la location et validez l’état de retour</Text>
            </View>
            <TouchableOpacity disabled={loading} onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            {/* Photos Etat des lieux (CHECKOUT) */}
            <View style={styles.photosSection}>
              <Text style={styles.sectionTitle}>Photos de l’état du véhicule (Retour)</Text>
              <Text style={styles.sectionSub}>
                Prenez des photos de l’état final (Carrosserie, Carburant, Compteur).
              </Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photosScroll}>
                {checkoutPhotos.map((photo) => (
                  <View key={photo.id} style={styles.photoThumb}>
                    <Image source={{ uri: photo.url }} style={styles.photoImg} />
                  </View>
                ))}

                {uploadingPhoto ? (
                  <View style={[styles.addPhotoBtn, styles.uploadingBox]}>
                    <ActivityIndicator color={theme.colors.brand.main} />
                    <Text style={styles.uploadingText}>Envoi…</Text>
                  </View>
                ) : (
                  <View style={styles.addPhotoActions}>
                    <TouchableOpacity
                      onPress={() => handlePickAndUploadPhoto('camera')}
                      style={styles.addPhotoBtn}
                    >
                      <Camera size={20} color="#059669" />
                      <Text style={styles.addPhotoText}>Photo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handlePickAndUploadPhoto('library')}
                      style={styles.addPhotoBtn}
                    >
                      <ImagePlus size={20} color="#059669" />
                      <Text style={styles.addPhotoText}>Galerie</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            </View>

            {/* Checkbox confirmation */}
            <TouchableOpacity
              onPress={() => setCheckedTerms((v) => !v)}
              activeOpacity={0.8}
              style={styles.checkboxRow}
            >
              <View style={[styles.checkbox, checkedTerms && styles.checkboxChecked]}>
                {checkedTerms ? <CheckCircle2 size={14} color="#FFFFFF" /> : null}
              </View>
              <Text style={styles.checkboxText}>
                J’atteste avoir récupéré le véhicule, vérifié le niveau de carburant et l’état général au retour.
              </Text>
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity disabled={loading} onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={!checkedTerms || loading}
              onPress={handleConfirmCheckout}
              style={[styles.submitBtn, (!checkedTerms || loading) && styles.submitBtnDisabled]}
            >
              <CheckCircle2 size={16} color="#FFFFFF" />
              <Text style={styles.submitText}>{loading ? 'Clôture en cours…' : 'Finaliser le Check-out'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(4, 25, 18, 0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  title: {
    fontFamily: theme.typography.fontFamily.displayBold,
    fontSize: 19,
    color: '#072A20',
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: 20,
    gap: 16,
  },
  photosSection: {
    gap: 8,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 14,
    color: '#072A20',
  },
  sectionSub: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: '#64748B',
  },
  photosScroll: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 6,
  },
  photoThumb: {
    width: 72,
    height: 72,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
  },
  photoImg: {
    width: '100%',
    height: '100%',
  },
  addPhotoActions: {
    flexDirection: 'row',
    gap: 8,
  },
  addPhotoBtn: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addPhotoText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
    color: '#059669',
  },
  uploadingBox: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
  },
  uploadingText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 9,
    color: '#64748B',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.brand.main,
    borderColor: theme.colors.brand.main,
  },
  checkboxText: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: '#334155',
    lineHeight: 17,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 13,
    color: '#475569',
  },
  submitBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.brand.main,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitBtnDisabled: {
    opacity: 0.45,
  },
  submitText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13,
    color: '#FFFFFF',
  },
});
