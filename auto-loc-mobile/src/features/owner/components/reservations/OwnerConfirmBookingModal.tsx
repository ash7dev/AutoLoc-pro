import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
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
  Calendar,
  CheckCircle2,
  Clock,
  Info,
  Minus,
  Plus,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react-native';
import { theme } from '../../../../core/theme';

interface OwnerConfirmBookingModalProps {
  visible: boolean;
  loading: boolean;
  dateDebut?: string;
  creeLe?: string;
  tacitCheckinDeadlineLe?: string;
  onClose: () => void;
  onConfirm: (heureDebut: string) => Promise<void>;
}

const formatConfirmationDeadline = (
  creeLe?: string,
  dateDebut?: string,
  tacitDeadline?: string
): string => {
  let target: Date | null = null;

  if (tacitDeadline) {
    const d = new Date(tacitDeadline);
    if (!isNaN(d.getTime())) target = d;
  }

  if (!target && creeLe && dateDebut) {
    const createdDate = new Date(creeLe);
    const startDate = new Date(dateDebut);

    if (!isNaN(createdDate.getTime()) && !isNaN(startDate.getTime())) {
      const createdDay =
        createdDate.getUTCFullYear() * 10000 +
        (createdDate.getUTCMonth() + 1) * 100 +
        createdDate.getUTCDate();
      const startDay =
        startDate.getUTCFullYear() * 10000 +
        (startDate.getUTCMonth() + 1) * 100 +
        startDate.getUTCDate();
      const isSameDay = createdDay === startDay;

      if (isSameDay) {
        const diffMs = startDate.getTime() - createdDate.getTime();
        if (diffMs <= 3 * 3600 * 1000) {
          target = new Date(
            Math.min(
              createdDate.getTime() + 30 * 60 * 1000,
              Math.max(createdDate.getTime() + 15 * 60 * 1000, startDate.getTime() - 15 * 60 * 1000)
            )
          );
        } else {
          target = new Date(startDate.getTime() - 2 * 3600 * 1000);
        }
      } else {
        const date24h = new Date(createdDate.getTime() + 24 * 3600 * 1000);
        const startMinus2h = new Date(startDate.getTime() - 2 * 3600 * 1000);
        target = date24h.getTime() < startMinus2h.getTime() ? date24h : startMinus2h;
      }
    }
  }

  if (!target && dateDebut) {
    const startDate = new Date(dateDebut);
    if (!isNaN(startDate.getTime())) {
      target = new Date(startDate.getTime() - 2 * 3600 * 1000);
    }
  }

  if (!target) {
    return 'dans un délai restreint';
  }

  try {
    const formatted = target.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const hours = target.getHours().toString().padStart(2, '0');
    const minutes = target.getMinutes().toString().padStart(2, '0');
    const capitalizedDay = formatted.charAt(0).toUpperCase() + formatted.slice(1);
    return `${capitalizedDay} à ${hours}:${minutes}`;
  } catch {
    return 'dans un délai restreint';
  }
};

const QUICK_HOURS = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
];

export const OwnerConfirmBookingModal: React.FC<OwnerConfirmBookingModalProps> = ({
  visible,
  loading,
  dateDebut,
  creeLe,
  tacitCheckinDeadlineLe,
  onClose,
  onConfirm,
}) => {
  const [heureDebut, setHeureDebut] = useState('09:00');
  const [isPastTime, setIsPastTime] = useState(false);

  useEffect(() => {
    if (visible) {
      const now = new Date();
      // Si la date de début est aujourd'hui, proposer l'heure courante arrondie à la demi-heure supérieure
      if (dateDebut) {
        const dDebut = new Date(dateDebut);
        const isToday =
          dDebut.getDate() === now.getDate() &&
          dDebut.getMonth() === now.getMonth() &&
          dDebut.getFullYear() === now.getFullYear();

        if (isToday) {
          const currentHours = now.getHours();
          const currentMins = now.getMinutes();
          const roundedMins = currentMins > 30 ? 0 : 30;
          const roundedHours = currentMins > 30 ? (currentHours + 1) % 24 : currentHours;
          setHeureDebut(
            `${String(roundedHours).padStart(2, '0')}:${String(roundedMins).padStart(2, '0')}`
          );
        } else {
          setHeureDebut('09:00');
        }
      } else {
        setHeureDebut('09:00');
      }
      setIsPastTime(false);
    }
  }, [visible, dateDebut]);

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

  const adjustTime = (deltaMinutes: number) => {
    const [hStr, mStr] = heureDebut.split(':');
    let h = parseInt(hStr || '9', 10);
    let m = parseInt(mStr || '0', 10);
    if (isNaN(h)) h = 9;
    if (isNaN(m)) m = 0;

    let totalMins = h * 60 + m + deltaMinutes;
    if (totalMins < 0) totalMins += 24 * 60;
    totalMins = totalMins % (24 * 60);

    const newH = Math.floor(totalMins / 60);
    const newM = totalMins % 60;
    const formatted = `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
    setHeureDebut(formatted);
  };

  const getCourtesyDeadline = () => {
    if (!isValidFormat) return '--:--';
    const [hStr, mStr] = heureDebut.split(':');
    let h = parseInt(hStr, 10);
    let m = parseInt(mStr, 10);
    let totalMins = h * 60 + m + 60; // +1h courtoisie
    totalMins = totalMins % (24 * 60);
    const newH = Math.floor(totalMins / 60);
    const newM = totalMins % 60;
    return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
  };

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
          {/* Sheet Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.sheetHandle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconBox}>
                <CheckCircle2 size={22} color="#059669" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.badgeKycGlass}>
                  <ShieldCheck size={11} color="#059669" />
                  <Text style={styles.badgeKycText}>ESPACE PROPRIÉTAIRE · SÉCURISÉ</Text>
                </View>
                <Text style={styles.title}>Confirmer la réservation</Text>
                <Text style={styles.subtitle}>Fixez l’heure de mise à disposition du véhicule</Text>
              </View>
            </View>
            <TouchableOpacity disabled={loading} onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            {/* Time Picker Digital Display & Stepper Card */}
            <View style={styles.timeCard}>
              <View style={styles.timeCardHeader}>
                <View style={styles.iconCircle}>
                  <Clock size={16} color="#059669" />
                </View>
                <View style={styles.timeCardTitles}>
                  <Text style={styles.timeCardTitle}>Heure de prise en charge</Text>
                  <Text style={styles.timeCardSub}>À quelle heure le véhicule sera-t-il remis au locataire ?</Text>
                </View>
              </View>

              {/* Digital Time Picker Display & Adjuster Buttons */}
              <View style={styles.timePickerRow}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => adjustTime(-30)}
                  style={styles.adjusterBtn}
                >
                  <Minus size={18} color="#047857" />
                  <Text style={styles.adjusterBtnText}>- 30m</Text>
                </TouchableOpacity>

                <View style={styles.digitalClockBox}>
                  <TextInput
                    value={heureDebut}
                    onChangeText={setHeureDebut}
                    placeholder="09:00"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numbers-and-punctuation"
                    maxLength={5}
                    style={[styles.digitalClockInput, isPastTime && styles.digitalClockError]}
                  />
                  <Text style={styles.formatHint}>Format 24h</Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => adjustTime(30)}
                  style={styles.adjusterBtn}
                >
                  <Plus size={18} color="#047857" />
                  <Text style={styles.adjusterBtnText}>+ 30m</Text>
                </TouchableOpacity>
              </View>

              {isPastTime && (
                <View style={styles.errorBanner}>
                  <AlertTriangle size={14} color="#DC2626" />
                  <Text style={styles.errorText}>
                    L’heure sélectionnée est déjà passée. Veuillez choisir une heure future.
                  </Text>
                </View>
              )}

              {/* Quick Preset Time Pills */}
              <View style={styles.presetsSection}>
                <Text style={styles.presetsTitle}>Sélection rapide :</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.presetsScroll}
                >
                  {QUICK_HOURS.map((time) => {
                    const isSelected = heureDebut === time;
                    return (
                      <TouchableOpacity
                        key={time}
                        activeOpacity={0.8}
                        onPress={() => setHeureDebut(time)}
                        style={[styles.presetPill, isSelected && styles.presetPillActive]}
                      >
                        <Text style={[styles.presetPillText, isSelected && styles.presetPillTextActive]}>
                          {time}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>

            {/* Confirmation Deadline Warning Card */}
            <View style={styles.courtesyBox}>
              <View style={styles.courtesyHeader}>
                <Clock size={16} color="#D97706" />
                <Text style={styles.courtesyTitle}>Délai d'acceptation obligatoire</Text>
              </View>
              <Text style={styles.courtesyText}>
                Vous devez valider la réservation avant le{' '}
                <Text style={styles.boldText}>
                  {formatConfirmationDeadline(creeLe, dateDebut, tacitCheckinDeadlineLe)}
                </Text>
                . Passé ce délai, le dossier sera automatiquement expiré et annulé sans frais.
              </Text>
            </View>

            {/* Courtesy Hour Information Card */}
            <View style={styles.courtesyBox}>
              <View style={styles.courtesyHeader}>
                <Sparkles size={16} color="#D97706" />
                <Text style={styles.courtesyTitle}>Heure de courtoisie AutoLoc</Text>
              </View>
              <Text style={styles.courtesyText}>
                Pour faciliter la restitution, l’heure limite de check-in sera fixée à{' '}
                <Text style={styles.boldText}>{getCourtesyDeadline()}</Text> (+1h de courtoisie).
              </Text>
            </View>

            {/* Important Contract Information Notice */}
            <View style={styles.noticeBox}>
              <View style={styles.noticeHeader}>
                <Info size={14} color="#047857" />
                <Text style={styles.noticeTitle}>ACTUATION DU CONTRAT</Text>
              </View>
              <Text style={styles.noticeText}>
                La confirmation enclenche l’assurance AutoLoc et déverrouille l’accès au numéro du locataire 24h avant la prise en charge.
              </Text>
            </View>
          </ScrollView>

          {/* Footer Action Bar */}
          <View style={styles.footer}>
            <TouchableOpacity disabled={loading} onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={!canConfirm}
              onPress={handleSubmit}
              style={[styles.submitBtn, !canConfirm && styles.submitBtnDisabled]}
              activeOpacity={0.85}
            >
              <CheckCircle2 size={18} color="#FFFFFF" />
              <Text style={styles.submitText}>
                {loading ? 'Validation…' : `Confirmer à ${isValidFormat ? heureDebut : ''}`}
              </Text>
              <View style={styles.emeraldArrowCircle}>
                <ArrowRight size={13} color="#4ADE80" />
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
    maxHeight: '90%',
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
  badgeKycGlass: {
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
  badgeKycText: {
    fontFamily: theme.typography.fontFamily.medium,
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
    gap: 14,
  },

  /* Time Card */
  timeCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  timeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
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
    fontSize: 13.5,
    color: '#072A20',
  },
  timeCardSub: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },

  /* Time Picker Stepper Row */
  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 16,
    gap: 12,
  },
  adjusterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  adjusterBtnText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12,
    color: '#047857',
  },
  digitalClockBox: {
    alignItems: 'center',
  },
  digitalClockInput: {
    fontSize: 32,
    fontFamily: theme.typography.fontFamily.displayBold,
    color: '#072A20',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#059669',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 6,
    textAlign: 'center',
    minWidth: 130,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  digitalClockError: {
    borderColor: '#DC2626',
    color: '#DC2626',
  },
  formatHint: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 14,
    marginBottom: 10,
    borderRadius: 10,
  },
  errorText: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11,
    color: '#DC2626',
  },

  /* Presets Section */
  presetsSection: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
  },
  presetsTitle: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11,
    color: '#64748B',
    marginBottom: 8,
  },
  presetsScroll: {
    gap: 8,
  },
  presetPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  presetPillActive: {
    backgroundColor: '#072A20',
    borderColor: '#072A20',
  },
  presetPillText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12,
    color: '#475569',
  },
  presetPillTextActive: {
    color: '#FFFFFF',
  },

  /* Courtesy Box */
  courtesyBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 12,
    gap: 4,
  },
  courtesyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  courtesyTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11.5,
    color: '#92400E',
  },
  courtesyText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11.5,
    color: '#B45309',
    lineHeight: 16,
  },
  boldText: {
    fontFamily: theme.typography.fontFamily.bold,
    color: '#78350F',
  },

  /* Notice Box */
  noticeBox: {
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    padding: 12,
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
    fontSize: 11.5,
    color: '#065F46',
    lineHeight: 16,
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
    borderColor: 'rgba(52, 211, 153, 0.30)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
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
    backgroundColor: 'rgba(16, 185, 129, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
});
