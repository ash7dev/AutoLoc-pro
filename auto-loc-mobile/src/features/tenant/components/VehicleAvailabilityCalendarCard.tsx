import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Platform,
} from 'react-native';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Sparkles,
} from 'lucide-react-native';
import { theme } from '../../../core/theme';

interface BlockedRange {
  id?: string;
  dateDebut: string;
  dateFin: string;
  motif?: string;
}

interface VehicleAvailabilityCalendarCardProps {
  vehicleId?: string;
  ville?: string;
  blockedRanges?: BlockedRange[];
}

export const VehicleAvailabilityCalendarCard: React.FC<VehicleAvailabilityCalendarCardProps> = ({
  vehicleId,
  ville = 'Dakar',
  blockedRanges = [],
}) => {
  const [blockedDatesList] = useState<BlockedRange[]>(blockedRanges);

  // Génère les 14 prochains jours pour le strip calendrier
  const nextDays = React.useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const isoStr = d.toISOString().split('T')[0];

      // Vérifie si la date est dans une période bloquée
      const isBlocked = blockedDatesList.some((range) => {
        const start = range.dateDebut ? range.dateDebut.split('T')[0] : '';
        const end = range.dateFin ? range.dateFin.split('T')[0] : '';
        return isoStr >= start && isoStr <= end;
      });

      const dayName = d.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '');
      const dayNum = d.getDate();
      const monthName = d.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '');

      days.push({
        dateStr: isoStr,
        dayName: dayName.charAt(0).toUpperCase() + dayName.slice(1),
        dayNum,
        monthName,
        isToday: i === 0,
        isBlocked,
      });
    }
    return days;
  }, [blockedDatesList]);

  const isTodayAvailable = !nextDays[0]?.isBlocked;

  return (
    <View style={styles.cardContainer}>
      {/* Header avec Icône Badge & Typographie Fraunces */}
      <View style={styles.cardHeader}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerLeftRow}>
            <View style={styles.titleIconBadge}>
              <Calendar size={14} color="#4ADE80" strokeWidth={2.25} />
            </View>
            <Text
              style={styles.sectionTitle}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.85}
            >
              Disponibilité en temps réel
            </Text>
          </View>

          {/* Live Status Pill */}
          <View
            style={[
              styles.statusPill,
              isTodayAvailable ? styles.statusPillAvailable : styles.statusPillBusy,
            ]}
          >
            <View
              style={[
                styles.statusDot,
                isTodayAvailable ? styles.statusDotAvailable : styles.statusDotBusy,
              ]}
            />
            <Text
              style={[
                styles.statusText,
                isTodayAvailable ? styles.statusTextAvailable : styles.statusTextBusy,
              ]}
            >
              {isTodayAvailable ? 'Disponible' : 'Occupé'}
            </Text>
          </View>
        </View>

        <Text
          style={styles.subtitleText}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
        >
          Aperçu du calendrier des 14 prochains jours
        </Text>
      </View>

      {/* 14 Days Horizontal Strip */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.stripContent}
      >
        {nextDays.map((day) => (
          <View
            key={day.dateStr}
            style={[
              styles.dayCard,
              day.isToday && styles.dayCardToday,
              day.isBlocked && styles.dayCardBlocked,
            ]}
          >
            <Text style={[styles.dayNameText, day.isToday && styles.textToday]}>
              {day.dayName}
            </Text>
            <Text style={[styles.dayNumText, day.isToday && styles.textToday]}>
              {day.dayNum}
            </Text>
            <Text style={[styles.monthText, day.isToday && styles.textTodayMuted]}>
              {day.monthName}
            </Text>

            <View style={styles.iconIndicator}>
              {day.isBlocked ? (
                <XCircle size={14} color="#EF4444" strokeWidth={2.2} />
              ) : (
                <CheckCircle2
                  size={14}
                  color={day.isToday ? '#4ADE80' : '#059669'}
                  strokeWidth={2.2}
                />
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Footer Info Box */}
      <View style={styles.infoFooter}>
        <Sparkles size={14} color="#059669" style={{ marginTop: 1 }} />
        <Text style={styles.infoFooterText}>
          Réservation instantanée avec confirmation automatique dès validation.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  cardHeader: {
    marginBottom: 14,
    gap: 4,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  headerLeftRow: {
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
    fontSize: 17.5,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#041912',
    letterSpacing: -0.3,
    flex: 1,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 2,
  },
  subtitleText: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.regular,
    color: '#5F6B59',
    flex: 1,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 14,
  },
  statusPillAvailable: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  statusPillBusy: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusDotAvailable: {
    backgroundColor: '#10B981',
  },
  statusDotBusy: {
    backgroundColor: '#EF4444',
  },
  statusText: {
    fontSize: 11,
    fontFamily: theme.typography.fontFamily.bold,
  },
  statusTextAvailable: {
    color: '#059669',
  },
  statusTextBusy: {
    color: '#B91C1C',
  },
  stripContent: {
    gap: 8,
    paddingVertical: 6,
  },
  dayCard: {
    width: 62,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4EBDB',
    alignItems: 'center',
    gap: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#041912',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  dayCardToday: {
    backgroundColor: '#041912',
    borderColor: 'rgba(74, 222, 128, 0.40)',
  },
  dayCardBlocked: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FEE2E2',
    opacity: 0.75,
  },
  dayNameText: {
    fontSize: 11,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: '#5F6B59',
  },
  dayNumText: {
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.bold,
    color: '#041912',
    fontVariant: ['tabular-nums'],
  },
  monthText: {
    fontSize: 10,
    fontFamily: theme.typography.fontFamily.regular,
    color: '#94A3B8',
    textTransform: 'lowercase',
  },
  textToday: {
    color: '#FFFFFF',
  },
  textTodayMuted: {
    color: 'rgba(255, 255, 255, 0.70)',
  },
  iconIndicator: {
    marginTop: 4,
  },
  infoFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    marginTop: 14,
  },
  infoFooterText: {
    flex: 1,
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.regular,
    color: '#059669',
    lineHeight: 17,
  },
});
