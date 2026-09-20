import React, { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  AlertTriangle,
  ArrowRight,
  Camera,
  CheckCircle2,
  ImagePlus,
  ShieldAlert,
  X,
} from 'lucide-react-native';
import { apiClient } from '../../../core/api/apiClient';
import { theme } from '../../../core/theme';

const REASONS = [
  { id: 'NON_CONFORMITE', label: 'Non-conforme' },
  { id: 'DEGATS', label: 'Dégâts non signalés' },
  { id: 'ACCES_IMPOSSIBLE', label: 'Véhicule inaccessible' },
  { id: 'AUTRE', label: 'Autre motif' },
];

export const RefuseVehicleEvidenceModal: React.FC<{
  visible: boolean;
  reservationId: string;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (reason: string, comment: string) => Promise<boolean>;
}> = ({ visible, reservationId, submitting, onClose, onSubmit }) => {
  const [motif, setMotif] = useState('NON_CONFORMITE');
  const [comment, setComment] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const selectPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return Alert.alert('Autorisation requise', 'Autorisez l’accès aux photos pour joindre une preuve.');
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const submit = async () => {
    if (comment.trim().length < 15) {
      return Alert.alert('Description insuffisante', 'Décrivez le problème en au moins 15 caractères.');
    }
    if (!imageUri) {
      return Alert.alert('Preuve requise', 'Ajoutez au moins une photo avant de signaler la non-conformité.');
    }
    try {
      setUploading(true);
      const form = new FormData();
      form.append('file', {
        uri: imageUri,
        name: 'preuve-non-conformite.jpg',
        type: 'image/jpeg',
      } as any);

      await apiClient.post(
        `/reservations/${reservationId}/photos-etat?type=CHECKIN&categorie=AUTRE`,
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      const ok = await onSubmit(motif, comment.trim());
      if (ok) {
        setComment('');
        setImageUri(null);
        onClose();
      }
    } catch (e: any) {
      Alert.alert(
        'Envoi impossible',
        e?.response?.data?.message || 'La preuve n’a pas pu être envoyée.'
      );
    } finally {
      setUploading(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Handle bar */}
          <View style={styles.handleContainer}>
            <View style={styles.sheetHandle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconRed}>
                <AlertTriangle size={22} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.badgeRedGlass}>
                  <ShieldAlert size={11} color="#DC2626" />
                  <Text style={styles.badgeRedText}>SIGNALEMENT & REFUS</Text>
                </View>
                <Text style={styles.title}>Véhicule non conforme</Text>
                <Text style={styles.subtitle} numberOfLines={1}>
                  Réf. #{reservationId.slice(0, 8).toUpperCase()}
                </Text>
              </View>
            </View>
            <TouchableOpacity disabled={submitting || uploading} onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            {/* Info alert banner */}
            <View style={styles.infoBanner}>
              <AlertTriangle size={16} color="#B91C1C" />
              <Text style={styles.infoBannerText}>
                Ce signalement refuse la prise en charge et ouvre immédiatement un dossier de litige traité en priorité par notre service support.
              </Text>
            </View>

            {/* Motif selector */}
            <View style={styles.fieldSection}>
              <Text style={styles.label}>MOTIF DU REFUS *</Text>
              <View style={styles.chips}>
                {REASONS.map((item) => {
                  const active = motif === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => setMotif(item.id)}
                      style={[styles.chip, active && styles.chipActive]}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Comment area */}
            <View style={styles.fieldSection}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>DESCRIPTION DÉTAILLÉE</Text>
                <Text style={styles.requiredAsterisk}>*</Text>
              </View>
              <TextInput
                style={styles.input}
                multiline
                numberOfLines={3}
                value={comment}
                onChangeText={setComment}
                placeholder="Décrivez précisément le problème constaté (kilométrage, voyant, rayure non signalée...)"
                placeholderTextColor="#94A3B8"
              />
              <View style={styles.counterRow}>
                {comment.trim().length > 0 && comment.trim().length < 15 ? (
                  <Text style={styles.errorText}>• 15 caractères minimum requis</Text>
                ) : <View />}
                <Text style={styles.counterText}>{comment.length}/500</Text>
              </View>
            </View>

            {/* Evidence Photo Upload */}
            <View style={styles.fieldSection}>
              <Text style={styles.label}>PHOTO DE PREUVE OBLIGATOIRE *</Text>
              <TouchableOpacity onPress={selectPhoto} style={styles.evidenceCard} activeOpacity={0.85}>
                {imageUri ? (
                  <Image source={{ uri: imageUri }} style={styles.preview} />
                ) : (
                  <View style={styles.photoIconBox}>
                    <ImagePlus size={22} color="#059669" />
                  </View>
                )}
                <View style={styles.evidenceCopy}>
                  <Text style={styles.evidenceTitle}>
                    {imageUri ? 'Preuve jointe' : 'Ajouter une photo du problème'}
                  </Text>
                  <Text style={styles.evidenceText}>
                    {imageUri ? 'Appuyez pour remplacer la photo' : 'Photo nette requise pour la prise en charge du dossier'}
                  </Text>
                </View>
                {imageUri ? <CheckCircle2 size={20} color="#059669" /> : null}
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Footer Action Bar */}
          <SafeAreaView style={styles.footer}>
            <TouchableOpacity
              disabled={submitting || uploading}
              onPress={onClose}
              style={styles.cancelBtn}
            >
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={submitting || uploading || comment.trim().length < 15 || !imageUri}
              onPress={submit}
              style={[
                styles.submitBtn,
                (submitting || uploading || comment.trim().length < 15 || !imageUri) && styles.submitBtnDisabled,
              ]}
              activeOpacity={0.85}
            >
              {submitting || uploading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Camera size={18} color="#FFFFFF" />
                  <Text style={styles.submitText}>Envoyer le signalement</Text>
                  <View style={styles.dangerArrowCircle}>
                    <ArrowRight size={13} color="#FECACA" />
                  </View>
                </>
              )}
            </TouchableOpacity>
          </SafeAreaView>
        </View>
      </View>
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
  headerIconRed: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeRedGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.full,
    gap: 4,
    marginBottom: 4,
  },
  badgeRedText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 8.5,
    letterSpacing: 0.6,
    color: '#DC2626',
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
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 16,
    padding: 12,
  },
  infoBannerText: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11.5,
    color: '#991B1B',
    lineHeight: 16,
  },
  fieldSection: {
    gap: 6,
  },
  label: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10.5,
    color: '#475569',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  requiredAsterisk: {
    color: '#DC2626',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
  },
  chipActive: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  chipText: {
    color: '#475569',
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 11,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  input: {
    minHeight: 85,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    padding: 12,
    textAlignVertical: 'top',
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 13,
    color: '#0F172A',
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  errorText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 11,
    color: '#DC2626',
  },
  counterText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11,
    color: '#94A3B8',
  },
  evidenceCard: {
    minHeight: 68,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#A7F3D0',
    backgroundColor: '#ECFDF5',
  },
  photoIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  preview: {
    width: 48,
    height: 48,
    borderRadius: 10,
  },
  evidenceCopy: {
    flex: 1,
  },
  evidenceTitle: {
    color: '#065F46',
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 12.5,
  },
  evidenceText: {
    color: '#047857',
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 10.5,
    marginTop: 2,
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
    backgroundColor: '#DC2626',
    borderWidth: 1,
    borderColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#DC2626',
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
  dangerArrowCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.20)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.30)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
});

