import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  ChevronRight,
  Eye,
  FileCheck,
  Fuel,
  Gauge,
  ImagePlus,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react-native';
import { theme } from '../../../core/theme';

interface TenantCheckinConfirmationModalProps {
  visible: boolean;
  loading: boolean;
  reservationId: string;
  vehicleName?: string;
  hostName?: string;
  photosEtatLieu?: Array<{ id: string; url: string; type: string; categorie?: string }>;
  onClose: () => void;
  onConfirm: () => Promise<boolean | void>;
}

export const TenantCheckinConfirmationModal: React.FC<TenantCheckinConfirmationModalProps> = ({
  visible,
  loading,
  reservationId,
  vehicleName,
  hostName,
  photosEtatLieu = [],
  onClose,
  onConfirm,
}) => {
  const [checkedState, setCheckedState] = useState(false);
  const [checkedKmFuel, setCheckedKmFuel] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const checkinPhotos = photosEtatLieu.filter((p) => p.type === 'CHECKIN');
  const canSubmit = checkedState && checkedKmFuel && !loading;

  const handleConfirm = async () => {
    if (!canSubmit) return;
    try {
      const ok = await onConfirm();
      if (ok !== false) {
        onClose();
      }
    } catch (err: any) {
      Alert.alert('Erreur', err?.message || 'La confirmation du check-in a échoué.');
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
              <View style={styles.headerIconEmerald}>
                <CheckCircle2 size={22} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.badgeGreenGlass}>
                  <ShieldCheck size={11} color="#059669" />
                  <Text style={styles.badgeGreenText}>ESPACE LOCATAIRE · CHECK-IN SÉCURISÉ</Text>
                </View>
                <Text style={styles.title}>Confirmer la prise en charge</Text>
                <Text style={styles.subtitle} numberOfLines={1}>
                  {vehicleName ? `Remise des clés · ${vehicleName}` : `Réf. #${reservationId.slice(0, 8).toUpperCase()}`}
                </Text>
              </View>
            </View>
            <TouchableOpacity disabled={loading} onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            {/* Host Photos Verification Section */}
            <View style={styles.photosCard}>
              <View style={styles.photosCardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.photosTitle}>État des lieux transmis par l’hôte</Text>
                  <Text style={styles.photosSub}>
                    {hostName ? `Photos vérifiées par ${hostName}` : 'Inspectez les visuels avant de valider.'}
                  </Text>
                </View>
                <View style={[styles.photoBadge, checkinPhotos.length > 0 ? styles.photoBadgeOk : styles.photoBadgeWarn]}>
                  <Text style={[styles.photoBadgeText, checkinPhotos.length > 0 ? styles.photoBadgeTextOk : styles.photoBadgeTextWarn]}>
                    {checkinPhotos.length} photo{checkinPhotos.length > 1 ? 's' : ''}
                  </Text>
                </View>
              </View>

              {checkinPhotos.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photosScroll}>
                  {checkinPhotos.map((photo, idx) => (
                    <TouchableOpacity
                      key={photo.id || idx}
                      onPress={() => setPreviewImageUrl(photo.url)}
                      style={styles.thumbCard}
                      activeOpacity={0.85}
                    >
                      <Image source={{ uri: photo.url }} style={styles.thumbImg} contentFit="cover" />
                      <View style={styles.eyeHint}>
                        <Eye size={10} color="#FFFFFF" />
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.noPhotosNotice}>
                  <Sparkles size={16} color="#059669" />
                  <Text style={styles.noPhotosText}>
                    Aucune photo spécifique enregistrée par l’hôte. Assurez-vous d’avoir vérifié le véhicule de visu.
                  </Text>
                </View>
              )}
            </View>

            {/* Inspection Checks */}
            <View style={styles.checklistSection}>
              <Text style={styles.sectionLabel}>POINTS D’INSPECTION SÉCURISÉS</Text>

              {/* Check 1 */}
              <TouchableOpacity
                onPress={() => setCheckedState((v) => !v)}
                style={[styles.checkRow, checkedState && styles.checkRowActive]}
                activeOpacity={0.85}
              >
                <View style={[styles.checkbox, checkedState && styles.checkboxChecked]}>
                  {checkedState ? <CheckCircle2 size={15} color="#FFFFFF" /> : null}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.checkTitle}>Inspection carrosserie & intérieur</Text>
                  <Text style={styles.checkSub}>
                    J’ai vérifié l’état général du véhicule et confirmé l’absence de nouveaux dégâts non signalés.
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Check 2 */}
              <TouchableOpacity
                onPress={() => setCheckedKmFuel((v) => !v)}
                style={[styles.checkRow, checkedKmFuel && styles.checkRowActive]}
                activeOpacity={0.85}
              >
                <View style={[styles.checkbox, checkedKmFuel && styles.checkboxChecked]}>
                  {checkedKmFuel ? <CheckCircle2 size={15} color="#FFFFFF" /> : null}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.checkTitle}>Kilométrage & Carburant</Text>
                  <Text style={styles.checkSub}>
                    J’ai contrôlé le compteur de kilométrage et la jauge d’essence au tableau de bord.
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Footer Action Bar */}
          <SafeAreaView style={styles.footer}>
            <TouchableOpacity disabled={loading} onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={!canSubmit}
              onPress={handleConfirm}
              style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <CheckCircle2 size={18} color="#FFFFFF" />
                  <Text style={styles.submitText}>Valider la prise en charge</Text>
                  <View style={styles.emeraldArrowCircle}>
                    <ArrowRight size={13} color="#A7F3D0" />
                  </View>
                </>
              )}
            </TouchableOpacity>
          </SafeAreaView>
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
    maxHeight: '90%',
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
  headerIconEmerald: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeGreenGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.full,
    gap: 4,
    marginBottom: 4,
  },
  badgeGreenText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 8.5,
    letterSpacing: 0.6,
    color: '#059669',
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
  photosCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 10,
  },
  photosCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  photosTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 13.5,
    color: '#072A20',
  },
  photosSub: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  photoBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  photoBadgeOk: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  photoBadgeWarn: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  photoBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10.5,
  },
  photoBadgeTextOk: { color: '#059669' },
  photoBadgeTextWarn: { color: '#B45309' },

  photosScroll: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 4,
  },
  thumbCard: {
    width: 80,
    height: 80,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    position: 'relative',
  },
  thumbImg: {
    width: '100%',
    height: '100%',
  },
  eyeHint: {
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
  noPhotosNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  noPhotosText: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11,
    color: '#047857',
    lineHeight: 15,
  },

  checklistSection: {
    gap: 8,
  },
  sectionLabel: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10.5,
    color: '#475569',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  checkRowActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
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
  checkTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 13,
    color: '#072A20',
  },
  checkSub: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 15,
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 20,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 25,
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
    height: 50,
    borderRadius: 25,
    backgroundColor: '#041912',
    borderWidth: 1,
    borderColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#041912',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitBtnDisabled: {
    opacity: 0.45,
  },
  submitText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13.5,
    color: '#FFFFFF',
  },
  emeraldArrowCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(5, 150, 105, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(167, 243, 208, 0.40)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },

  /* Preview backdrop */
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
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: '94%',
    height: '80%',
  },
});
