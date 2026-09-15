import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal } from 'react-native';
import { Calendar as CalendarIcon, ChevronRight, Clock, Info } from 'lucide-react-native';
import { theme } from '../../../../core/theme';
import { AutoCalendar, BlockedRange } from '../../../../shared/components/AutoCalendar';
import { AutoButton } from '../../../../shared/components/AutoButton';

interface BookingDateSelectorProps {
  vehicleId?: string;
  blockedRanges?: BlockedRange[];
  dateDebut?: string;
  dateFin?: string;
  joursMinimum?: number;
  onDatesChange: (start: string, end?: string) => void;
}

export const BookingDateSelector: React.FC<BookingDateSelectorProps> = ({
  vehicleId,
  blockedRanges,
  dateDebut,
  dateFin,
  joursMinimum = 1,
  onDatesChange,
}) => {
  const [calendarModalVisible, setCalendarModalVisible] = useState(false);
  const [tempStart, setTempStart] = useState<string | undefined>(dateDebut);
  const [tempEnd, setTempEnd] = useState<string | undefined>(dateFin);

  const formatDateDisplay = (isoStr?: string) => {
    if (!isoStr) return 'Sélectionner une date';
    const d = new Date(`${isoStr}T00:00:00`);
    const formatted = d.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  const calculateDays = (start?: string, end?: string): number => {
    if (!start || !end) return joursMinimum;
    const s = new Date(`${start}T00:00:00`).getTime();
    const e = new Date(`${end}T00:00:00`).getTime();
    const diff = Math.max(1, Math.round((e - s) / (1000 * 3600 * 24)));
    return diff;
  };

  const durationDays = calculateDays(dateDebut, dateFin);

  const handleOpenCalendar = () => {
    setTempStart(dateDebut);
    setTempEnd(dateFin);
    setCalendarModalVisible(true);
  };

  const handleApplyDates = () => {
    if (tempStart) {
      onDatesChange(tempStart, tempEnd);
    }
    setCalendarModalVisible(false);
  };

  return (
    <View style={styles.cardContainer}>
      {/* En-tête : Titre & Badge Durée */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Dates de réservation</Text>

        <View style={styles.durationChip}>
          <Clock size={12} color={theme.colors.brand.main} />
          <Text style={styles.durationChipText}>
            {durationDays} jour{durationDays > 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {/* Carte des Dates Clean & Minimaliste */}
      <TouchableOpacity
        style={styles.datesBox}
        onPress={handleOpenCalendar}
        activeOpacity={0.85}
      >
        {/* Ligne Départ */}
        <View style={styles.dateItemRow}>
          <View style={styles.iconCircle}>
            <CalendarIcon size={16} color={theme.colors.brand.main} />
          </View>
          <View style={styles.dateTextGroup}>
            <Text style={styles.dateLabel}>Départ</Text>
            <Text style={styles.dateValue}>{formatDateDisplay(dateDebut)}</Text>
          </View>
        </View>

        <View style={styles.dateLineDivider} />

        {/* Ligne Retour */}
        <View style={styles.dateItemRow}>
          <View style={styles.iconCircle}>
            <CalendarIcon size={16} color={theme.colors.brand.main} />
          </View>
          <View style={styles.dateTextGroup}>
            <Text style={styles.dateLabel}>Retour</Text>
            <Text style={styles.dateValue}>{formatDateDisplay(dateFin)}</Text>
          </View>
          <ChevronRight size={18} color="#7D8975" />
        </View>
      </TouchableOpacity>

      {/* Durée minimale */}
      {joursMinimum > 1 && (
        <View style={styles.minInfoRow}>
          <Info size={13} color={theme.colors.brand.main} />
          <Text style={styles.minInfoText}>
            Durée minimum fixée par le propriétaire : {joursMinimum} jours.
          </Text>
        </View>
      )}

      {/* Modal du Calendrier AutoCalendar */}
      <Modal
        visible={calendarModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCalendarModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.dragHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Modifier les dates de réservation</Text>
              <Text style={styles.modalSubtitle}>
                Sélectionnez votre date de départ et de retour
              </Text>
            </View>

            <View style={styles.calendarWrap}>
              <AutoCalendar
                vehicleId={vehicleId}
                blockedRanges={blockedRanges}
                startDate={tempStart}
                endDate={tempEnd}
                onSelectDates={(start, end) => {
                  setTempStart(start);
                  setTempEnd(end);
                }}
              />
            </View>

            <View style={styles.modalFooter}>
              <AutoButton
                title="Valider ces dates"
                variant="action"
                onPress={handleApplyDates}
                disabled={!tempStart}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: '#E4EBDB',
    padding: theme.spacing[4],
    gap: theme.spacing[3],
    ...theme.elevation.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 16,
    color: theme.primitives.forest[800],
  },
  durationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: theme.colors.brand.subtle,
    borderWidth: 1,
    borderColor: theme.colors.brand.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
  },
  durationChipText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
    color: theme.colors.brand.main,
  },
  datesBox: {
    backgroundColor: '#F8FBF4',
    borderWidth: 1,
    borderColor: '#E4EBDB',
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
  },
  dateItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing[2.5],
    gap: 12,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4EBDB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateTextGroup: {
    flex: 1,
    gap: 1,
  },
  dateLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11,
    color: '#7D8975',
  },
  dateValue: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14,
    color: theme.primitives.forest[800],
  },
  dateLineDivider: {
    height: 1,
    backgroundColor: '#E4EBDB',
    marginHorizontal: 4,
  },
  minInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.brand.subtle,
    borderWidth: 1,
    borderColor: theme.colors.brand.border,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.radius.md,
    gap: 6,
  },
  minInfoText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11,
    color: theme.colors.brand.main,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(4, 25, 18, 0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: theme.radius.card,
    borderTopRightRadius: theme.radius.card,
    maxHeight: '85%',
    paddingTop: 12,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D4DCD0',
    alignSelf: 'center',
    marginBottom: 8,
  },
  modalHeader: {
    paddingHorizontal: theme.spacing[4],
    paddingBottom: theme.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: '#E4EBDB',
  },
  modalTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 18,
    color: theme.primitives.forest[800],
  },
  modalSubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    color: '#5F6B59',
    marginTop: 2,
  },
  calendarWrap: {
    padding: theme.spacing[4],
  },
  modalFooter: {
    padding: theme.spacing[4],
    borderTopWidth: 1,
    borderTopColor: '#E4EBDB',
    backgroundColor: '#FFFFFF',
  },
});
