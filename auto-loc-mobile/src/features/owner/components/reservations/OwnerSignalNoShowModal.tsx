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
import { AlertOctagon, AlertTriangle, ArrowRight, Clock, ShieldAlert, Sparkles, X } from 'lucide-react-native';
import { theme } from '../../../../core/theme';

interface OwnerSignalNoShowModalProps {
  visible: boolean;
  loading: boolean;
  onClose: () => void;
  onConfirm: (commentaire?: string) => Promise<void>;
}

const PRESET_TAGS = [
  "Appels et SMS sans réponse",
  "Attente 45 min au lieu de rdv",
  "Locataire injoignable",
  "Aucune nouvelle après 2h",
];

export const OwnerSignalNoShowModal: React.FC<OwnerSignalNoShowModalProps> = ({
  visible,
  loading,
  onClose,
  onConfirm,
}) => {
  const [comment, setComment] = useState('');

  const handleTagPress = (tag: string) => {
    if (!comment) {
      setComment(tag);
    } else if (!comment.includes(tag)) {
      setComment((prev) => `${prev}. ${tag}`);
    }
  };

  const handleSubmit = async () => {
    try {
      await onConfirm(comment.trim() || undefined);
    } catch (err: any) {
      Alert.alert('Erreur', err?.message || 'Le signalement no-show a échoué.');
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Top drag handle indicator */}
          <View style={styles.handleContainer}>
            <View style={styles.sheetHandle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <AlertOctagon size={22} color="#DC2626" />
            </View>
            <View style={styles.titles}>
              <View style={styles.badgeRedGlass}>
                <ShieldAlert size={11} color="#DC2626" />
                <Text style={styles.badgeRedText}>SIGNALEMENT URGENT · SÉCURISÉ</Text>
              </View>
              <Text style={styles.title}>Signaler l’absence du locataire</Text>
              <View style={styles.timingBadge}>
                <Clock size={12} color="#B91C1C" />
                <Text style={styles.timingBadgeText}>Délai de grâce dépassé (T+2h)</Text>
              </View>
            </View>
            <TouchableOpacity disabled={loading} onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            {/* Financial & Policy Notice */}
            <View style={styles.warningCard}>
              <View style={styles.warningHeader}>
                <ShieldAlert size={16} color="#B91C1C" />
                <Text style={styles.warningTitle}>Conséquences du signalement No-show</Text>
              </View>

              <Text style={styles.warningText}>
                Ce signalement certifie que le locataire ne s’est pas présenté au lieu de rendez-vous après 2h d’attente.
              </Text>

              <View style={styles.breakdownGrid}>
                <View style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>Dédommagement Hôte</Text>
                  <Text style={styles.breakdownValueGreen}>50% versés</Text>
                </View>
                <View style={styles.breakdownDivider} />
                <View style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>Remboursement Locataire</Text>
                  <Text style={styles.breakdownValueAmber}>30% restitués</Text>
                </View>
              </View>
            </View>

            {/* Quick Reason Preset Pills */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionLabel}>Ajouter une précision rapide</Text>
              <Sparkles size={13} color={theme.colors.brand.main} />
            </View>

            <View style={styles.presetTagsRow}>
              {PRESET_TAGS.map((tag, idx) => (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.7}
                  onPress={() => handleTagPress(tag)}
                  style={styles.presetPill}
                >
                  <Text style={styles.presetPillText}>+ {tag}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom Comment Field */}
            <View style={styles.inputContainer}>
              <TextInput
                value={comment}
                onChangeText={setComment}
                placeholder="Décrivez les démarches effectuées (ex: tentatives d'appel WhatsApp, attente sur place...)"
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={3}
                maxLength={400}
                style={styles.textInput}
              />
              <View style={styles.inputFooter}>
                <Text style={styles.charCounter}>{comment.length}/400</Text>
              </View>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity disabled={loading} onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={loading}
              onPress={handleSubmit}
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <AlertOctagon size={16} color="#FFFFFF" />
              )}
              <Text style={styles.submitText}>
                {loading ? 'Traitement…' : 'Confirmer le No-show'}
              </Text>
              <View style={styles.dangerArrowCircle}>
                <ArrowRight size={13} color="#FECACA" />
              </View>
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
    backgroundColor: 'rgba(4, 25, 18, 0.72)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 10,
    gap: 16,
    maxHeight: '88%',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  sheetHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  titles: {
    flex: 1,
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
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 8.5,
    letterSpacing: 0.6,
    color: '#DC2626',
  },
  title: {
    fontFamily: theme.typography.fontFamily.displayBold,
    fontSize: 18,
    color: '#072A20',
    lineHeight: 24,
  },
  timingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  timingBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
    color: '#991B1B',
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
    gap: 14,
    paddingBottom: 10,
  },
  warningCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 18,
    padding: 14,
    gap: 10,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  warningTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 13,
    color: '#991B1B',
  },
  warningText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    color: '#7F1D1D',
    lineHeight: 17,
  },
  breakdownGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    marginTop: 2,
  },
  breakdownItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  breakdownDivider: {
    width: 1,
    height: 26,
    backgroundColor: '#FECACA',
  },
  breakdownLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 10.5,
    color: '#64748B',
  },
  breakdownValueGreen: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13,
    color: '#059669',
  },
  breakdownValueAmber: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13,
    color: '#D97706',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  sectionLabel: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11.5,
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  presetTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetPill: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 14,
  },
  presetPillText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11.5,
    color: '#334155',
  },
  inputContainer: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
  },
  textInput: {
    minHeight: 78,
    padding: 14,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 13,
    color: '#0F172A',
    textAlignVertical: 'top',
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  charCounter: {
    fontFamily: theme.typography.fontFamily.mono,
    fontSize: 10,
    color: '#94A3B8',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 8,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
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
    opacity: 0.6,
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
