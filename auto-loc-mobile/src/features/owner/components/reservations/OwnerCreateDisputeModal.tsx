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
import { AlertTriangle, ArrowRight, Check, DollarSign, ShieldAlert, Sparkles, X } from 'lucide-react-native';
import { theme } from '../../../../core/theme';

interface OwnerCreateDisputeModalProps {
  visible: boolean;
  loading: boolean;
  onClose: () => void;
  onConfirm: (motif: string, description: string, coutEstime?: number) => Promise<void>;
}

interface DisputeMotifOption {
  key: string;
  label: string;
  icon: string;
}

const DISPUTE_MOTIFS: DisputeMotifOption[] = [
  { key: 'DEGRADATION', label: 'Dommage / Rayure carrosserie', icon: '🚗' },
  { key: 'PROPRETE', label: 'Intérieur sale / Nettoyage requis', icon: '🧼' },
  { key: 'RETARD_RESTITUTION', label: 'Retard important au retour', icon: '⏱️' },
  { key: 'KILOMETRAGE', label: 'Dépassement de forfait kilométrique', icon: '🛣️' },
  { key: 'DISPUTE_AUTRE', label: 'Autre non-conformité constatée', icon: '⚠️' },
];

export const OwnerCreateDisputeModal: React.FC<OwnerCreateDisputeModalProps> = ({
  visible,
  loading,
  onClose,
  onConfirm,
}) => {
  const [selectedMotif, setSelectedMotif] = useState<string>('DEGRADATION');
  const [description, setDescription] = useState<string>('');
  const [coutEstimeStr, setCoutEstimeStr] = useState<string>('');

  const isDescriptionValid = description.trim().length >= 10;
  const canSubmit = Boolean(selectedMotif) && isDescriptionValid && !loading;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const cost = coutEstimeStr.trim() ? Number(coutEstimeStr.replace(/\D/g, '')) : undefined;
    try {
      await onConfirm(selectedMotif, description.trim(), cost || undefined);
    } catch (err: any) {
      Alert.alert('Erreur', err?.message || 'L’enregistrement du litige a échoué.');
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Sheet Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.sheetHandle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <AlertTriangle size={22} color="#DC2626" />
            </View>
            <View style={styles.titles}>
              <View style={styles.badgeRedGlass}>
                <ShieldAlert size={11} color="#DC2626" />
                <Text style={styles.badgeRedText}>GESTION DE LITIGE · SÉCURISÉ</Text>
              </View>
              <Text style={styles.title}>Déclarer un litige</Text>
              <Text style={styles.subtitle}>Ouverture d’un dossier auprès d’AutoLoc</Text>
            </View>
            <TouchableOpacity disabled={loading} onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            {/* Warning / Support Card */}
            <View style={styles.warningBox}>
              <View style={styles.warningHeader}>
                <ShieldAlert size={16} color="#B91C1C" />
                <Text style={styles.warningTitle}>Procédure de gestion des litiges</Text>
              </View>
              <Text style={styles.warningText}>
                L’ouverture d’un litige gèle temporairement le versement jusqu’à l’analyse des pièces justificatives (photos d’état des lieux) par l’équipe AutoLoc.
              </Text>
            </View>

            {/* Motif Selector Chips */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionLabel}>Motif principal du litige</Text>
              <Text style={styles.requiredAsterisk}>*</Text>
            </View>

            <View style={styles.motifsGrid}>
              {DISPUTE_MOTIFS.map((item) => {
                const isSelected = selectedMotif === item.key;
                return (
                  <TouchableOpacity
                    key={item.key}
                    activeOpacity={0.8}
                    onPress={() => setSelectedMotif(item.key)}
                    style={[styles.motifChip, isSelected && styles.motifChipSelected]}
                  >
                    <Text style={styles.motifIcon}>{item.icon}</Text>
                    <Text style={[styles.motifLabel, isSelected && styles.motifLabelSelected]}>
                      {item.label}
                    </Text>
                    {isSelected && (
                      <View style={styles.checkIconBadge}>
                        <Check size={11} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Estimated Cost (Optional) */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>Frais / Cout estimé du préjudice (FCFA)</Text>
                <Text style={styles.optionalTag}>Optionnel</Text>
              </View>
              <View style={styles.costInputWrapper}>
                <DollarSign size={16} color="#64748B" />
                <TextInput
                  value={coutEstimeStr}
                  onChangeText={setCoutEstimeStr}
                  placeholder="ex: 25000"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  style={styles.costInput}
                />
              </View>
            </View>

            {/* Description Text Area */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>Description détaillée des faits</Text>
                <Text style={styles.requiredAsterisk}>*</Text>
              </View>
              <View style={styles.textAreaWrapper}>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Décrivez précisément les dégâts ou le problème constaté lors de la restitution..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                  style={styles.textArea}
                />
                <View style={styles.textAreaFooter}>
                  {!isDescriptionValid && description.trim().length > 0 ? (
                    <Text style={styles.validationErrorText}>
                      • 10 caractères minimum requis ({10 - description.trim().length} manquants)
                    </Text>
                  ) : (
                    <View />
                  )}
                  <Text style={styles.charCounter}>{description.length}/500</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity disabled={loading} onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={!canSubmit}
              onPress={handleSubmit}
              style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <AlertTriangle size={16} color="#FFFFFF" />
              )}
              <Text style={styles.submitText}>
                {loading ? 'Soumission…' : 'Soumettre le litige'}
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
    maxHeight: '90%',
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
    gap: 14,
    paddingBottom: 10,
  },
  warningBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 16,
    padding: 14,
    gap: 6,
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
    fontSize: 11.5,
    color: '#7F1D1D',
    lineHeight: 16.5,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  sectionLabel: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11.5,
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  requiredAsterisk: {
    color: '#DC2626',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13,
  },
  motifsGrid: {
    gap: 8,
  },
  motifChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  motifChipSelected: {
    backgroundColor: '#ECFDF5',
    borderColor: theme.colors.brand.main,
  },
  motifIcon: {
    fontSize: 16,
  },
  motifLabel: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 12.5,
    color: '#334155',
  },
  motifLabelSelected: {
    color: '#072A20',
    fontFamily: theme.typography.fontFamily.bold,
  },
  checkIconBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.brand.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldGroup: {
    gap: 6,
    marginTop: 2,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldLabel: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 12,
    color: '#334155',
  },
  optionalTag: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 10.5,
    color: '#64748B',
  },
  costInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 46,
  },
  costInput: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14,
    color: '#0F172A',
  },
  textAreaWrapper: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    overflow: 'hidden',
  },
  textArea: {
    minHeight: 84,
    padding: 12,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 13,
    color: '#0F172A',
    textAlignVertical: 'top',
  },
  textAreaFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  validationErrorText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11,
    color: '#DC2626',
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
    backgroundColor: '#94A3B8',
    borderColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
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
