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
      {/* En-tête : Badge Icône Sombre + Titre Fraunces + Badge Durée */}
      <View style={styles.headerRow}>
        <View style={styles.headerTitleGroup}>
          <View style={styles.titleIconBadge}>
            <CalendarIcon size={14} color="#4ADE80" strokeWidth={2.25} />
          </View>
          <Text style={styles.sectionTitle}>Dates de réservation</Text>
        </View>

        <View style={styles.durationChip}>
          <Clock size={12} color="#059669" />
          <Text style={styles.durationChipText}>
            {durationDays} jour{durationDays > 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {/* Carte des Dates : Ligne par Ligne (Chacune sur sa propre ligne) */}
      <TouchableOpacity
        style={styles.datesBox}
        onPress={handleOpenCalendar}
        activeOpacity={0.85}
      >
        {/* Ligne 1 : Date de départ */}
        <View style={styles.dateItemRow}>
          <View style={styles.iconCircle}>
            <CalendarIcon size={13} color="#4ADE80" strokeWidth={2.25} />
          </View>
          <View style={styles.dateTextGroup}>
            <Text style={styles.dateLabel}>Date de départ</Text>
            <Text style={styles.dateValue} numberOfLines={1}>
              {formatDateDisplay(dateDebut)}
            </Text>
          </View>
        </View>

        {/* Ligne séparatrice */}
        <View style={styles.dateLineDivider} />

        {/* Ligne 2 : Date de retour */}
        <View style={styles.dateItemRow}>
          <View style={styles.iconCircle}>
            <CalendarIcon size={13} color="#4ADE80" strokeWidth={2.25} />
          </View>
          <View style={styles.dateTextGroup}>
            <Text style={styles.dateLabel}>Date de retour</Text>
            <Text style={styles.dateValue} numberOfLines={1}>
              {formatDateDisplay(dateFin)}
            </Text>
          </View>
          <ChevronRight size={18} color="#5F6B59" />
        </View>
      </TouchableOpacity>

      {/* Info durée minimale */}
      {joursMinimum > 1 && (
        <View style={styles.minInfoRow}>
          <Info size={13} color="#059669" />
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
                variant="dark"
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
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E4EBDB',
    padding: 16,
    gap: 12,
    shadowColor: '#041912',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  titleIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: '#041912',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.35)',
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 17.5,
    color: '#041912',
    letterSpacing: -0.3,
  },
  durationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  durationChipText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
    color: '#059669',
  },
  datesBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  dateItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: '#041912',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateTextGroup: {
    flex: 1,
    gap: 2,
  },
  dateLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11.5,
    color: '#5F6B59',
  },
  dateValue: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14.5,
    color: '#041912',
  },
  dateLineDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  minInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 8,
  },
  minInfoText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11.5,
    color: '#059669',
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
