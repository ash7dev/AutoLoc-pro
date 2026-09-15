import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { theme } from '../../core/theme';
import { apiClient } from '../../core/api/apiClient';

export interface BlockedRange {
  from: string;
  to: string;
  type?: string;
}

export interface AutoCalendarProps {
  vehicleId?: string;
  blockedRanges?: BlockedRange[];
  startDate?: string; // Format ISO YYYY-MM-DD
  endDate?: string;   // Format ISO YYYY-MM-DD
  onSelectDates: (startDate: string, endDate?: string) => void;
  minDate?: Date;
}

const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export const AutoCalendar: React.FC<AutoCalendarProps> = ({
  vehicleId,
  blockedRanges: blockedRangesProp,
  startDate,
  endDate,
  onSelectDates,
  minDate = new Date(),
}) => {
  // Mois actuellement affiché (défaut : mois de startDate ou date actuelle)
  const initialDate = startDate ? new Date(startDate) : new Date();
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth()); // 0-indexed
  const [fetchedBlockedRanges, setFetchedBlockedRanges] = useState<BlockedRange[]>([]);

  // Chargement des dates bloquées depuis l'API backend si vehicleId est fourni
  useEffect(() => {
    if (vehicleId && !blockedRangesProp) {
      apiClient
        .get<{ blockedRanges: BlockedRange[] }>(`/vehicles/${vehicleId}/blocked-dates`)
        .then((res) => {
          if (res.data?.blockedRanges) {
            setFetchedBlockedRanges(res.data.blockedRanges);
          }
        })
        .catch((err) => {
          console.warn('Erreur lors du chargement des dates bloquées:', err);
        });
    }
  }, [vehicleId, blockedRangesProp]);

  const activeBlockedRanges = blockedRangesProp ?? fetchedBlockedRanges;

  // Réinitialiser l'heure du minDate à 00:00:00
  const normalizedMinDate = new Date(minDate);
  normalizedMinDate.setHours(0, 0, 0, 0);

  const parseIsoDate = (s: string): Date => {
    const parts = s.split('T')[0].split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  };

  // Set des dates bloquées sous forme YYYY-MM-DD
  const blockedSet = useMemo(() => {
    const set = new Set<string>();
    if (!activeBlockedRanges || activeBlockedRanges.length === 0) return set;

    for (const range of activeBlockedRanges) {
      if (!range.from || !range.to) continue;
      const start = parseIsoDate(range.from);
      const end = parseIsoDate(range.to);

      const diffDays = Math.round((end.getTime() - start.getTime()) / 86400000);
      if (diffDays > 365 || diffDays < 0) continue;

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const y = d.getFullYear();
        const m = (d.getMonth() + 1).toString().padStart(2, '0');
        const dayStr = d.getDate().toString().padStart(2, '0');
        set.add(`${y}-${m}-${dayStr}`);
      }
    }

    return set;
  }, [activeBlockedRanges]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  // Calcul du nombre de jours dans le mois et du décalage du premier jour
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOffset = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay(); // 0 = Dimanche
    return day === 0 ? 6 : day - 1; // Ajustement pour débuter à Lundi (0)
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const offset = getFirstDayOffset(currentYear, currentMonth);

  const formatDateString = (year: number, month: number, day: number): string => {
    const m = (month + 1).toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const handleDayPress = (day: number) => {
    const dateStr = formatDateString(currentYear, currentMonth, day);
    if (blockedSet.has(dateStr)) return;

    const selectedTime = new Date(`${dateStr}T00:00:00`).getTime();

    if (!startDate || (startDate && endDate)) {
      onSelectDates(dateStr, undefined);
    } else if (startDate && !endDate) {
      const startTime = new Date(`${startDate}T00:00:00`).getTime();
      if (selectedTime < startTime) {
        onSelectDates(dateStr, undefined);
      } else {
        // Empêcher la sélection d'une plage incluant une date bloquée au milieu
        const start = parseIsoDate(startDate);
        const end = parseIsoDate(dateStr);
        let hasBlockedInRange = false;

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const y = d.getFullYear();
          const m = (d.getMonth() + 1).toString().padStart(2, '0');
          const dayStr = d.getDate().toString().padStart(2, '0');
          if (blockedSet.has(`${y}-${m}-${dayStr}`)) {
            hasBlockedInRange = true;
            break;
          }
        }

        if (hasBlockedInRange) {
          onSelectDates(dateStr, undefined);
        } else {
          onSelectDates(startDate, dateStr);
        }
      }
    }
  };

  // Génération des cellules du calendrier
  const renderCalendarDays = () => {
    const cells = [];

    // Cellules vides d'alignement
    for (let i = 0; i < offset; i++) {
      cells.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }

    const startTimestamp = startDate ? new Date(`${startDate}T00:00:00`).getTime() : null;
    const endTimestamp = endDate ? new Date(`${endDate}T00:00:00`).getTime() : null;

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDateString(currentYear, currentMonth, day);
      const cellDate = new Date(`${dateStr}T00:00:00`);
      const cellTimestamp = cellDate.getTime();

      const isBlocked = blockedSet.has(dateStr);
      const isDisabled = cellDate < normalizedMinDate || isBlocked;
      const isStart = startTimestamp !== null && cellTimestamp === startTimestamp;
      const isEnd = endTimestamp !== null && cellTimestamp === endTimestamp;
      const isInRange =
        startTimestamp !== null &&
        endTimestamp !== null &&
        cellTimestamp > startTimestamp &&
        cellTimestamp < endTimestamp;

      cells.push(
        <TouchableOpacity
          key={`day-${day}`}
          style={[
            styles.dayCell,
            isInRange && styles.inRangeCell,
            isStart && styles.startDayCell,
            isEnd && styles.endDayCell,
          ]}
          disabled={isDisabled}
          onPress={() => handleDayPress(day)}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.dayCircle,
              (isStart || isEnd) && styles.activeDayCircle,
              isBlocked && styles.blockedDayCircle,
            ]}
          >
            <Text
              style={[
                styles.dayText,
                isDisabled && styles.disabledDayText,
                isBlocked && styles.blockedDayText,
                isInRange && styles.inRangeDayText,
                (isStart || isEnd) && styles.activeDayText,
              ]}
            >
              {day}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    return cells;
  };

  return (
    <View style={styles.container}>
      {/* Navigation En-Tête du Mois */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.navButton} onPress={handlePrevMonth} activeOpacity={0.6}>
          <ChevronLeft size={20} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {MONTH_NAMES[currentMonth]} {currentYear}
        </Text>
        <TouchableOpacity style={styles.navButton} onPress={handleNextMonth} activeOpacity={0.6}>
          <ChevronRight size={20} color={theme.colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* En-Tête des Jours de la Semaine */}
      <View style={styles.weekHeaderRow}>
        {DAY_NAMES.map((d, index) => (
          <Text key={index} style={styles.weekDayText}>
            {d}
          </Text>
        ))}
      </View>

      {/* Grille des Jours du Mois */}
      <View style={styles.daysGrid}>{renderCalendarDays()}</View>

      {/* Légende */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#051B14' }]} />
          <Text style={styles.legendText}>Sélectionné</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: '#EF4444' }]} />
          <Text style={styles.legendText}>Occupé / Réservé</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F3F4F6' }]} />
          <Text style={styles.legendText}>Passé</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.xl,
    padding: theme.spacing[3],
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[3],
  },
  navButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
  },
  weekHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[2],
  },
  weekDayText: {
    width: '14.28%',
    textAlign: 'center',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
    color: theme.colors.text.tertiary,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  inRangeCell: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderRadius: 0,
  },
  startDayCell: {
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  endDayCell: {
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeDayCircle: {
    backgroundColor: '#051B14',
  },
  blockedDayCircle: {
    backgroundColor: '#FEE2E2',
  },
  dayText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
  },
  disabledDayText: {
    color: '#D1D5DB',
  },
  blockedDayText: {
    color: '#EF4444',
    textDecorationLine: 'line-through',
    fontFamily: theme.typography.fontFamily.medium,
  },
  inRangeDayText: {
    color: '#051B14',
    fontFamily: theme.typography.fontFamily.bold,
  },
  activeDayText: {
    color: '#34D399',
    fontFamily: theme.typography.fontFamily.extraBold,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: theme.spacing[3],
    paddingTop: theme.spacing[2],
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 10,
    color: '#5F6B59',
  },
});
