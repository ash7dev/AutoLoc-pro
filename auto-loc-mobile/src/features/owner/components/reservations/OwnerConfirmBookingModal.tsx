import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { AlertTriangle, CheckCircle2, Clock, Info, X } from 'lucide-react-native';
import { theme } from '../../../../core/theme';

interface OwnerConfirmBookingModalProps {
  visible: boolean;
  loading: boolean;
  dateDebut?: string;
  onClose: () => void;
  onConfirm: (heureDebut: string) => Promise<void>;
}

export const OwnerConfirmBookingModal: React.FC<OwnerConfirmBookingModalProps> = ({
  visible,
  loading,
  dateDebut,
  onClose,
  onConfirm,
}) => {
  const [heureDebut, setHeureDebut] = useState('09:00');
  const [isPastTime, setIsPastTime] = useState(false);

  useEffect(() => {
    if (visible) {
      // Set default time to current time or 09:00
      const now = new Date();
      const defaultHours = String(now.getHours()).padStart(2, '0');
      const defaultMins = '00';
      setHeureDebut(`${defaultHours}:${defaultMins}`);
      setIsPastTime(false);
    }
  }, [visible]);

  useEffect(() => {
    if (!heureDebut || !dateDebut) {
      setIsPastTime(false);
      return;
    }

    const [hours, minutes] = heureDebut.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return;

    const selectedDateTime = new Date(dateDebut);
    selectedDateTime.setHours(hours, minutes, 0, 0);

    const now = new Date();
    setIsPastTime(selectedDateTime < now);
  }, [heureDebut, dateDebut]);

  const isValidFormat = /^([01]\d|2[0-3]):([0-5]\d)$/.test(heureDebut);
  const canConfirm = isValidFormat && !isPastTime && !loading;

  const handleSubmit = async () => {
    if (!canConfirm) return;
    try {
      await onConfirm(heureDebut);
    } catch (err: any) {
      Alert.alert('Erreur', err?.message || 'Impossible de confirmer la réservation.');
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Confirmer la réservation</Text>
              <Text style={styles.subtitle}>Définissez l’heure de remise des clés avec le locataire</Text>
            </View>
            <TouchableOpacity disabled={loading} onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            {/* Hour Picker Input Box */}
            <View style={styles.timeCard}>
              <View style={styles.timeCardHeader}>
                <View style={styles.iconCircle}>
                  <Clock size={16} color="#059669" />
                </View>
                <View style={styles.timeCardTitles}>
                  <Text style={styles.timeCardTitle}>Heure de prise en charge</Text>
                  <Text style={styles.timeCardSub}>À quelle heure le véhicule sera-t-il disponible ?</Text>
                </View>
              </View>

              <View style={styles.timeInputContainer}>
                <TextInput
                  value={heureDebut}
                  onChangeText={setHeureDebut}
                  placeholder="09:00"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                  style={[styles.timeInput, isPastTime && styles.timeInputError]}
                />
                <Text style={styles.formatHint}>Format 24h (ex: 09:00, 14:30)</Text>
                {isPastTime && (
                  <Text style={styles.errorText}>
                    L’heure sélectionnée est déjà passée. Choisissez une heure future.
                  </Text>
                )}
              </View>
            </View>

            {/* Notice Important */}
            <View style={styles.noticeBox}>
              <View style={styles.noticeHeader}>
                <Info size={14} color="#047857" />
                <Text style={styles.noticeTitle}>IMPORTANT</Text>
              </View>
              <Text style={styles.noticeText}>
                Cette heure détermine le début officiel de la location et active la garantie AutoLoc.
              </Text>
            </View>

            {/* Notice Courtesy Hour */}
            <View style={styles.courtesyBox}>
              <AlertTriangle size={15} color="#D97706" style={styles.courtesyIcon} />
              <Text style={styles.courtesyText}>
                L’heure de retour du véhicule sera automatiquement ajustée à{' '}
                <Text style={styles.boldText}>l’heure de remise + 1h de courtoisie</Text>.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity disabled={loading} onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={!canConfirm}
              onPress={handleSubmit}
              style={[styles.submitBtn, !canConfirm && styles.submitBtnDisabled]}
            >
              <CheckCircle2 size={16} color="#FFFFFF" />
              <Text style={styles.submitText}>{loading ? 'Validation…' : 'Confirmer la location'}</Text>
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
    maxHeight: '85%',
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
    gap: 14,
  },
  timeCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  timeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeCardTitles: {
    flex: 1,
  },
  timeCardTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 14,
    color: '#072A20',
  },
  timeCardSub: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  timeInputContainer: {
    padding: 16,
    alignItems: 'center',
  },
  timeInput: {
    fontSize: 34,
    fontFamily: theme.typography.fontFamily.displayBold,
    color: '#072A20',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    textAlign: 'center',
    minWidth: 160,
  },
  timeInputError: {
    borderColor: '#EF4444',
  },
  formatHint: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11,
    color: '#64748B',
    marginTop: 6,
  },
  errorText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 12,
    color: '#DC2626',
    marginTop: 6,
    textAlign: 'center',
  },
  noticeBox: {
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    padding: 14,
    gap: 4,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  noticeTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
    color: '#047857',
    letterSpacing: 0.5,
  },
  noticeText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    color: '#065F46',
    lineHeight: 17,
  },
  courtesyBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 14,
  },
  courtesyIcon: {
    marginTop: 2,
  },
  courtesyText: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    color: '#92400E',
    lineHeight: 17,
  },
  boldText: {
    fontFamily: theme.typography.fontFamily.bold,
    color: '#78350F',
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
