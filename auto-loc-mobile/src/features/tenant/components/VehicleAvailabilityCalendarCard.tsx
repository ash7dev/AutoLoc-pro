import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
} from 'lucide-react-native';

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
  const [loading, setLoading] = useState<boolean>(false);
  const [blockedDatesList, setBlockedDatesList] = useState<BlockedRange[]>(blockedRanges);

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
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.headerTitleRow}>
          <View style={styles.iconBg}>
            <Calendar size={18} color="#059669" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Disponibilité en Temps Réel</Text>
            <Text style={styles.cardSub}>Aperçu des 14 prochains jours à {ville}</Text>
          </View>
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
            {isTodayAvailable ? 'Disponible Aujourd’hui' : 'Indisponible Aujourd’hui'}
          </Text>
        </View>
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
            <Text style={styles.monthText}>{day.monthName}</Text>

            <View style={styles.iconIndicator}>
              {day.isBlocked ? (
                <XCircle size={14} color="#EF4444" />
              ) : (
                <CheckCircle2 size={14} color="#059669" />
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Footer Info Box */}
      <View style={styles.infoFooter}>
        <Sparkles size={14} color="#059669" style={{ marginTop: 1 }} />
        <Text style={styles.infoFooterText}>
          Réservation instantanée avec confirmation automatique dès validation du dossier.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    marginBottom: 14,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    color: '#0F172A',
  },
  cardSub: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#64748B',
    marginTop: 1,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
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
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusDotAvailable: {
    backgroundColor: '#10B981',
  },
  statusDotBusy: {
    backgroundColor: '#EF4444',
  },
  statusText: {
    fontSize: 11.5,
    fontFamily: 'Inter_700Bold',
  },
  statusTextAvailable: {
    color: '#047857',
  },
  statusTextBusy: {
    color: '#B91C1C',
  },
  stripContent: {
    gap: 8,
    paddingVertical: 4,
  },
  dayCard: {
    width: 60,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    gap: 2,
  },
  dayCardToday: {
    backgroundColor: '#051B14',
    borderColor: '#051B14',
  },
  dayCardBlocked: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FEE2E2',
    opacity: 0.7,
  },
  dayNameText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: '#64748B',
  },
  dayNumText: {
    fontSize: 16,
    fontFamily: 'Inter_800Bold',
    color: '#0F172A',
  },
  monthText: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    color: '#94A3B8',
    textTransform: 'lowercase',
  },
  textToday: {
    color: '#FFFFFF',
  },
  iconIndicator: {
    marginTop: 4,
  },
  infoFooter: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: 10,
    marginTop: 14,
  },
  infoFooterText: {
    flex: 1,
    fontSize: 11.5,
    fontFamily: 'Inter_400Regular',
    color: '#166534',
    lineHeight: 16,
  },
});
