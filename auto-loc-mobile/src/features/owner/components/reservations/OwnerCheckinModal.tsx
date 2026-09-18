import React, { useState } from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { Camera, CheckCircle2, DollarSign, ImagePlus, ShieldAlert, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../../../../core/theme';
import { formatCurrency } from '../../../../core/utils/currency';
import { ownerApi } from '../../api/ownerApi';

interface OwnerCheckinModalProps {
  visible: boolean;
  loading: boolean;
  reservationId: string;
  modePaiement?: string;
  montantSoldeCheckin?: number | string;
  existingPhotos?: Array<{ id: string; url: string; type: string }>;
  onClose: () => void;
  onConfirm: (soldeRecu?: number) => Promise<void>;
  onLinkPhoto: (url: string, publicId: string, type: 'CHECKIN', categorie?: string) => Promise<void>;
}

export const OwnerCheckinModal: React.FC<OwnerCheckinModalProps> = ({
  visible,
  loading,
  reservationId,
  modePaiement,
  montantSoldeCheckin = 0,
  existingPhotos = [],
  onClose,
  onConfirm,
  onLinkPhoto,
}) => {
  const isAcompte = modePaiement === 'ACOMPTE_SOLDE_CHECKIN';
  const balanceToCollect = Number(montantSoldeCheckin || 0);
  const [soldeRecuInput, setSoldeRecuInput] = useState<string>(String(balanceToCollect));
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [checkedTerms, setCheckedTerms] = useState(false);

  const checkinPhotos = existingPhotos.filter((p) => p.type === 'CHECKIN');

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
        await onLinkPhoto(uploaded.url, uploaded.publicId, 'CHECKIN');
      }
    } catch (err: any) {
      Alert.alert('Erreur upload', err?.message || 'L’envoi de la photo a échoué.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleConfirmCheckin = async () => {
    if (!checkedTerms) {
      return Alert.alert('Inspection requise', 'Veuillez cocher la case d’inspection du véhicule.');
    }

    let parsedSolde: number | undefined = undefined;
    if (isAcompte && balanceToCollect > 0) {
      parsedSolde = Number(soldeRecuInput);
      if (isNaN(parsedSolde) || parsedSolde < 0) {
        return Alert.alert('Montant invalide', 'Saisissez un montant valide pour le solde perçu.');
      }
    }

    try {
      await onConfirm(parsedSolde);
    } catch (err: any) {
      Alert.alert('Erreur', err?.message || 'La validation du check-in a échoué.');
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Check-in & Remise des clés</Text>
              <Text style={styles.subtitle}>Validez la prise en charge par le locataire</Text>
            </View>
            <TouchableOpacity disabled={loading} onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            {/* Cash Balance Box (If Acompte) */}
            {isAcompte && balanceToCollect > 0 ? (
              <View style={styles.cashBox}>
                <View style={styles.cashHeader}>
                  <View style={styles.cashIconCircle}>
                    <DollarSign size={16} color="#D97706" />
                  </View>
                  <View style={styles.cashTitles}>
                    <Text style={styles.cashTitle}>Solde à encaisser au check-in</Text>
                    <Text style={styles.cashSub}>
                      Acompte payé en ligne. Le locataire doit vous remettre le solde.
                    </Text>
                  </View>
                </View>

                <View style={styles.cashInputRow}>
                  <Text style={styles.cashLabel}>Montant perçu (FCFA) :</Text>
                  <TextInput
                    value={soldeRecuInput}
                    onChangeText={setSoldeRecuInput}
                    keyboardType="numeric"
                    style={styles.cashInput}
                  />
                </View>
              </View>
            ) : null}

            {/* Photos Etat des lieux (CHECKIN) */}
            <View style={styles.photosSection}>
              <Text style={styles.sectionTitle}>Photos de l’état du véhicule (Départ)</Text>
              <Text style={styles.sectionSub}>
                Prenez au moins 4 photos (Face, Arrière, Côtés, Compteur).
              </Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photosScroll}>
                {checkinPhotos.map((photo) => (
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

            {/* Verification Checkbox */}
            <TouchableOpacity
              onPress={() => setCheckedTerms((v) => !v)}
              activeOpacity={0.8}
              style={styles.checkboxRow}
            >
              <View style={[styles.checkbox, checkedTerms && styles.checkboxChecked]}>
                {checkedTerms ? <CheckCircle2 size={14} color="#FFFFFF" /> : null}
              </View>
              <Text style={styles.checkboxText}>
                J’atteste avoir vérifié l’identité du locataire, son permis et effectué l’état des lieux de départ.
              </Text>
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity disabled={loading} onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={!checkedTerms || loading}
              onPress={handleConfirmCheckin}
              style={[styles.submitBtn, (!checkedTerms || loading) && styles.submitBtnDisabled]}
            >
              <CheckCircle2 size={16} color="#FFFFFF" />
              <Text style={styles.submitText}>{loading ? 'Validation…' : 'Valider le Check-in'}</Text>
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
  cashBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 14,
    gap: 12,
  },
  cashHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cashIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cashTitles: {
    flex: 1,
  },
  cashTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 14,
    color: '#92400E',
  },
  cashSub: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: '#B45309',
    marginTop: 1,
  },
  cashInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  cashLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: '#78350F',
  },
  cashInput: {
    fontFamily: theme.typography.fontFamily.displayBold,
    fontSize: 16,
    color: '#92400E',
    textAlign: 'right',
    minWidth: 100,
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
