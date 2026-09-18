import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import {
  Camera,
  CheckCircle2,
  DollarSign,
  Eye,
  FileCheck,
  ImagePlus,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react-native';
import { theme } from '../../../../core/theme';
import { formatCurrency } from '../../../../core/utils/currency';
import { ownerApi } from '../../api/ownerApi';

interface OwnerCheckinModalProps {
  visible: boolean;
  loading: boolean;
  reservationId: string;
  modePaiement?: string;
  montantSoldeCheckin?: number | string;
  existingPhotos?: Array<{ id: string; url: string; type: string; categorie?: string }>;
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
  const [checkedTerms, setCheckedTerms] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // Parallel Upload Progress State
  const [uploadProgress, setUploadProgress] = useState<{
    isUploading: boolean;
    current: number;
    total: number;
    percent: number;
    statusText: string;
  } | null>(null);

  const checkinPhotos = existingPhotos.filter((p) => p.type === 'CHECKIN');

  const handlePickAndUploadPhotos = async (source: 'camera' | 'library') => {
    try {
      let selectedUris: string[] = [];

      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          return Alert.alert('Permission requise', 'Accès à l’appareil photo nécessaire.');
        }
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.85,
        });
        if (!result.canceled && result.assets?.[0]?.uri) {
          selectedUris = [result.assets[0].uri];
        }
      } else {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.85,
          allowsMultipleSelection: true,
          selectionLimit: 10,
        });
        if (!result.canceled && result.assets && result.assets.length > 0) {
          selectedUris = result.assets.map((a) => a.uri).filter(Boolean);
        }
      }

      if (selectedUris.length === 0) return;

      const total = selectedUris.length;
      let completedCount = 0;

      setUploadProgress({
        isUploading: true,
        current: 0,
        total,
        percent: 0,
        statusText: `Préparation de l'envoi de ${total} photo${total > 1 ? 's' : ''}...`,
      });

      // Upload photos IN PARALLEL using Promise.all while tracking completed progress
      const uploadTasks = selectedUris.map(async (uri, index) => {
        try {
          // 1. Upload file to Cloudinary over HTTPS (removes file:/// local URI)
          const uploaded = await ownerApi.uploadVehicleMedia(uri);
          
          // 2. Link photo DB record via NestJS API (makes it instantly available on Web & Mobile)
          await onLinkPhoto(uploaded.url, uploaded.publicId, 'CHECKIN');

          completedCount++;
          const currentPercent = Math.round((completedCount / total) * 100);

          setUploadProgress({
            isUploading: true,
            current: completedCount,
            total,
            percent: currentPercent,
            statusText: `Upload en cours : ${completedCount} / ${total} (${currentPercent}%)`,
          });
        } catch (err) {
          console.error(`Erreur upload photo #${index + 1}:`, err);
          throw err;
        }
      });

      await Promise.all(uploadTasks);

      setUploadProgress({
        isUploading: false,
        current: total,
        total,
        percent: 100,
        statusText: `✓ ${total} photo${total > 1 ? 's' : ''} transférée${total > 1 ? 's' : ''} avec succès !`,
      });

      setTimeout(() => {
        setUploadProgress(null);
      }, 1500);

    } catch (err: any) {
      Alert.alert(
        'Erreur lors de l’upload',
        err?.message || 'Certaines photos n’ont pas pu être envoyées. Veuillez réétenter.'
      );
      setUploadProgress(null);
    }
  };

  const handleConfirmCheckin = async () => {
    if (!checkedTerms) {
      return Alert.alert('Inspection requise', 'Veuillez attester avoir effectué l’état des lieux et la vérification des pièces.');
    }

    let parsedSolde: number | undefined = undefined;
    if (isAcompte && balanceToCollect > 0) {
      parsedSolde = Number(soldeRecuInput);
      if (isNaN(parsedSolde) || parsedSolde < 0) {
        return Alert.alert('Montant invalide', 'Veuillez saisir un montant valide pour le solde perçu.');
      }
    }

    try {
      await onConfirm(parsedSolde);
    } catch (err: any) {
      Alert.alert('Erreur validation', err?.message || 'La validation du check-in a échoué.');
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Handle bar */}
          <View style={styles.handleContainer}>
            <View style={styles.sheetHandle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconBox}>
                <FileCheck size={22} color="#059669" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>Check-in & Remise des clés</Text>
                <Text style={styles.subtitle}>État des lieux de départ & validation locataire</Text>
              </View>
            </View>
            <TouchableOpacity disabled={loading} onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            {/* Cash Balance Encasement Box (If Acompte) */}
            {isAcompte && balanceToCollect > 0 ? (
              <View style={styles.cashBox}>
                <View style={styles.cashHeader}>
                  <View style={styles.cashIconCircle}>
                    <DollarSign size={18} color="#D97706" />
                  </View>
                  <View style={styles.cashTitles}>
                    <Text style={styles.cashTitle}>Solde à encaisser au check-in</Text>
                    <Text style={styles.cashSub}>
                      Le locataire doit vous remettre le solde restant ({formatCurrency(balanceToCollect)}) en main propre.
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
                    placeholder="0"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              </View>
            ) : null}

            {/* Photos Section */}
            <View style={styles.photosSection}>
              <View style={styles.photosHeaderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sectionTitle}>Photos de l’état du véhicule (Départ)</Text>
                  <Text style={styles.sectionSub}>
                    Prenez au moins 4 photos sous différents angles.
                  </Text>
                </View>
                <View
                  style={[
                    styles.counterBadge,
                    checkinPhotos.length >= 4 ? styles.counterBadgeOk : styles.counterBadgeWarn,
                  ]}
                >
                  <Text
                    style={[
                      styles.counterText,
                      checkinPhotos.length >= 4 ? styles.counterTextOk : styles.counterTextWarn,
                    ]}
                  >
                    {checkinPhotos.length} / 4 Recommandées
                  </Text>
                </View>
              </View>

              {/* Angles Suggestion Chips */}
              <View style={styles.anglesRow}>
                {['Face avant', 'Arrière', 'Côté Gauche', 'Côté Droit', 'Compteur KM'].map((angle, i) => (
                  <View key={i} style={styles.angleChip}>
                    <Text style={styles.angleChipText}>✓ {angle}</Text>
                  </View>
                ))}
              </View>

              {/* Parallel Upload Progress Bar Component */}
              {uploadProgress && (
                <View style={styles.progressCard}>
                  <View style={styles.progressHeaderRow}>
                    <View style={styles.progressStatusLeft}>
                      <ActivityIndicator size="small" color="#059669" />
                      <Text style={styles.progressStatusText}>{uploadProgress.statusText}</Text>
                    </View>
                    <Text style={styles.progressPercentText}>{uploadProgress.percent}%</Text>
                  </View>
                  <View style={styles.progressBarTrack}>
                    <View style={[styles.progressBarFill, { width: `${uploadProgress.percent}%` }]} />
                  </View>
                </View>
              )}

              {/* Photo Thumbnails Scroll */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.photosScrollContent}
              >
                {checkinPhotos.map((photo, index) => (
                  <TouchableOpacity
                    key={photo.id || index}
                    activeOpacity={0.85}
                    onPress={() => setPreviewImageUrl(photo.url)}
                    style={styles.photoThumbCard}
                  >
                    <Image source={{ uri: photo.url }} style={styles.photoImg} contentFit="cover" />
                    <View style={styles.photoOverlayHint}>
                      <Eye size={10} color="#FFFFFF" />
                    </View>
                  </TouchableOpacity>
                ))}

                {/* Pick / Upload Action Buttons */}
                <View style={styles.uploadButtonsGroup}>
                  <TouchableOpacity
                    disabled={uploadProgress?.isUploading}
                    onPress={() => handlePickAndUploadPhotos('camera')}
                    style={[styles.addPhotoBtn, uploadProgress?.isUploading && styles.addPhotoBtnDisabled]}
                  >
                    <Camera size={18} color="#059669" />
                    <Text style={styles.addPhotoText}>Appareil Photo</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    disabled={uploadProgress?.isUploading}
                    onPress={() => handlePickAndUploadPhotos('library')}
                    style={[styles.addPhotoBtn, styles.addPhotoBtnGallery, uploadProgress?.isUploading && styles.addPhotoBtnDisabled]}
                  >
                    <ImagePlus size={18} color="#047857" />
                    <Text style={[styles.addPhotoText, { color: '#047857' }]}>Galerie (Batch)</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>

            {/* Verification Checkbox Card */}
            <TouchableOpacity
              onPress={() => setCheckedTerms((v) => !v)}
              activeOpacity={0.85}
              style={styles.checkboxCard}
            >
              <View style={[styles.checkbox, checkedTerms && styles.checkboxChecked]}>
                {checkedTerms ? <CheckCircle2 size={15} color="#FFFFFF" /> : null}
              </View>
              <Text style={styles.checkboxText}>
                J’atteste avoir vérifié la pièce d’identité du locataire, son permis de conduire original et avoir réalisé l’état des lieux de départ avec lui.
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Footer Action Bar */}
          <View style={styles.footer}>
            <TouchableOpacity disabled={loading} onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={!checkedTerms || loading || uploadProgress?.isUploading}
              onPress={handleConfirmCheckin}
              style={[
                styles.submitBtn,
                (!checkedTerms || loading || uploadProgress?.isUploading) && styles.submitBtnDisabled,
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <CheckCircle2 size={18} color="#FFFFFF" />
                  <Text style={styles.submitText}>Valider le Check-in</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Fullscreen Photo Preview Modal */}
      {previewImageUrl && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setPreviewImageUrl(null)}>
          <View style={styles.previewBackdrop}>
            <TouchableOpacity style={styles.previewCloseBtn} onPress={() => setPreviewImageUrl(null)}>
              <X size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <Image source={{ uri: previewImageUrl }} style={styles.previewImage} contentFit="contain" />
          </View>
        </Modal>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(4, 25, 18, 0.72)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '92%',
    paddingBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 10,
  },
  headerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: theme.typography.fontFamily.displayBold,
    fontSize: 17,
    color: '#072A20',
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: 18,
    gap: 16,
  },

  /* Cash Collection Box */
  cashBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 20,
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
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cashTitles: {
    flex: 1,
  },
  cashTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 13.5,
    color: '#92400E',
  },
  cashSub: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: '#B45309',
    marginTop: 1,
    lineHeight: 15,
  },
  cashInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
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
    fontSize: 17,
    color: '#92400E',
    textAlign: 'right',
    minWidth: 100,
  },

  /* Photos Section */
  photosSection: {
    gap: 10,
  },
  photosHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
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
    marginTop: 1,
  },
  counterBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  counterBadgeOk: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  counterBadgeWarn: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  counterText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10.5,
  },
  counterTextOk: { color: '#047857' },
  counterTextWarn: { color: '#B45309' },

  anglesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  angleChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  angleChipText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 10,
    color: '#475569',
  },

  /* Parallel Upload Progress Bar Card */
  progressCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 16,
    padding: 12,
    gap: 8,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressStatusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  progressStatusText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 12,
    color: '#047857',
  },
  progressPercentText: {
    fontFamily: theme.typography.fontFamily.displayBold,
    fontSize: 13,
    color: '#059669',
  },
  progressBarTrack: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DCFCE7',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#059669',
    borderRadius: 4,
  },

  /* Photos Horizontal Scroll */
  photosScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  photoThumbCard: {
    width: 84,
    height: 84,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    position: 'relative',
  },
  photoImg: {
    width: '100%',
    height: '100%',
  },
  photoOverlayHint: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  uploadButtonsGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  addPhotoBtn: {
    width: 90,
    height: 84,
    borderRadius: 14,
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 6,
  },
  addPhotoBtnGallery: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  addPhotoBtnDisabled: {
    opacity: 0.5,
  },
  addPhotoText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
    color: '#059669',
    textAlign: 'center',
  },

  /* Checkbox Card */
  checkboxCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  checkboxText: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11.5,
    color: '#334155',
    lineHeight: 16.5,
  },

  /* Footer */
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 10,
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
    backgroundColor: '#072A20',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#072A20',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitBtnDisabled: {
    opacity: 0.45,
  },
  submitText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13.5,
    color: '#FFFFFF',
  },

  /* Fullscreen Preview */
  previewBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  previewImage: {
    width: '94%',
    height: '80%',
  },
});
