import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Linking,
  Alert,
  Image,
} from 'react-native';
import {
  Calendar as CalendarIcon,
  Phone,
  FileText,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from 'lucide-react-native';
import { theme } from '../../../core/theme';
import { OwnerBooking } from '../api/ownerApi';

export interface ScheduleEvent {
  id: string;
  type: 'CHECK_IN' | 'CHECK_OUT' | 'IN_PROGRESS';
  timeLabel: string;
  dateLabel: string;
  isToday: boolean;
  isTomorrow: boolean;
  vehicleTitle: string;
  vehiclePhoto: string;
  immatriculation: string;
  locataireName: string;
  locatairePhone: string;
  locataireKycVerified: boolean;
  bookingCode: string;
  rawBooking: OwnerBooking;
}

interface OwnerDailyScheduleWidgetProps {
  bookings: OwnerBooking[];
  onSelectBooking?: (booking: OwnerBooking) => void;
  onViewFullCalendar?: () => void;
}

export const OwnerDailyScheduleWidget: React.FC<OwnerDailyScheduleWidgetProps> = ({
  bookings,
  onSelectBooking,
  onViewFullCalendar,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'CHECK_IN' | 'CHECK_OUT'>('ALL');

  // Transformer les réservations en événements de planning du jour/à venir
  const scheduleEvents: ScheduleEvent[] = React.useMemo(() => {
    const events: ScheduleEvent[] = [];
    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    bookings.forEach((booking) => {
      // Ignorer les annulées ou rejetées pour le planning
      if (booking.statut === 'CANCELLED' || booking.statut === 'REJECTED') return;

      const startDate = booking.dateDebut;
      const endDate = booking.dateFin;

      const isStartToday = startDate === todayStr;
      const isStartTomorrow = startDate === tomorrowStr;
      const isEndToday = endDate === todayStr;
      const isEndTomorrow = endDate === tomorrowStr;

      if (isStartToday || isStartTomorrow) {
        events.push({
          id: `checkin-${booking.id}`,
          type: 'CHECK_IN',
          timeLabel: '14:00', // Heure standard de check-in
          dateLabel: isStartToday ? "Aujourd'hui" : 'Demain',
          isToday: isStartToday,
          isTomorrow: isStartTomorrow,
          vehicleTitle: booking.vehicleTitle,
          vehiclePhoto: booking.vehiclePhoto,
          immatriculation: booking.immatriculation,
          locataireName: booking.locataireName,
          locatairePhone: booking.locatairePhone,
          locataireKycVerified: booking.locataireKycVerified,
          bookingCode: booking.codeReservation,
          rawBooking: booking,
        });
      }

      if (isEndToday || isEndTomorrow) {
        events.push({
          id: `checkout-${booking.id}`,
          type: 'CHECK_OUT',
          timeLabel: '11:00', // Heure standard de check-out
          dateLabel: isEndToday ? "Aujourd'hui" : 'Demain',
          isToday: isEndToday,
          isTomorrow: isEndTomorrow,
          vehicleTitle: booking.vehicleTitle,
          vehiclePhoto: booking.vehiclePhoto,
          immatriculation: booking.immatriculation,
          locataireName: booking.locataireName,
          locatairePhone: booking.locatairePhone,
          locataireKycVerified: booking.locataireKycVerified,
          bookingCode: booking.codeReservation,
          rawBooking: booking,
        });
      }

      // Si location en cours sans tomber pile aujourd'hui sur debut/fin
      if (booking.statut === 'IN_PROGRESS' && !isStartToday && !isEndToday) {
        events.push({
          id: `inprogress-${booking.id}`,
          type: 'IN_PROGRESS',
          timeLabel: 'En cours',
          dateLabel: 'Actuellement',
          isToday: true,
          isTomorrow: false,
          vehicleTitle: booking.vehicleTitle,
          vehiclePhoto: booking.vehiclePhoto,
          immatriculation: booking.immatriculation,
          locataireName: booking.locataireName,
          locatairePhone: booking.locatairePhone,
          locataireKycVerified: booking.locataireKycVerified,
          bookingCode: booking.codeReservation,
          rawBooking: booking,
        });
      }
    });

    return events;
  }, [bookings]);

  const filteredEvents = scheduleEvents.filter((e) => {
    if (filter === 'CHECK_IN') return e.type === 'CHECK_IN';
    if (filter === 'CHECK_OUT') return e.type === 'CHECK_OUT';
    return true;
  });

  const handleCall = (phone: string, name: string) => {
    if (!phone) {
      Alert.alert('Information', 'Numéro de téléphone indisponible.');
      return;
    }
    Alert.alert(
      'Appeler le locataire',
      `Voulez-vous composer le numéro de ${name} (${phone}) ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Appeler',
          onPress: () => Linking.openURL(`tel:${phone.replace(/\s+/g, '')}`),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* En-tête Widget */}
      <View style={styles.headerRow}>
        <View style={styles.titleBox}>
          <View style={styles.iconCircle}>
            <CalendarIcon size={18} color="#059669" />
          </View>
          <View>
            <Text style={styles.title}>Planning du Jour</Text>
            <Text style={styles.subtitle}>Prises en charge & Restitutions</Text>
          </View>
        </View>

        {onViewFullCalendar && (
          <TouchableOpacity
            style={styles.fullCalendarBtn}
            onPress={onViewFullCalendar}
            activeOpacity={0.7}
          >
            <Text style={styles.fullCalendarText}>Tout voir</Text>
            <ChevronRight size={14} color="#059669" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filtres Rapides */}
      <View style={styles.filtersRow}>
        <TouchableOpacity
          style={[styles.filterChip, filter === 'ALL' && styles.filterChipActive]}
          onPress={() => setFilter('ALL')}
          activeOpacity={0.8}
        >
          <Text style={[styles.filterChipText, filter === 'ALL' && styles.filterChipTextActive]}>
            Tous ({scheduleEvents.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filter === 'CHECK_IN' && styles.filterChipActiveCheckin]}
          onPress={() => setFilter('CHECK_IN')}
          activeOpacity={0.8}
        >
          <ArrowDownLeft size={13} color={filter === 'CHECK_IN' ? '#047857' : '#6B7280'} />
          <Text
            style={[
              styles.filterChipText,
              filter === 'CHECK_IN' && styles.filterChipTextCheckin,
            ]}
          >
            Prises ({scheduleEvents.filter((e) => e.type === 'CHECK_IN').length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filter === 'CHECK_OUT' && styles.filterChipActiveCheckout]}
          onPress={() => setFilter('CHECK_OUT')}
          activeOpacity={0.8}
        >
          <ArrowUpRight size={13} color={filter === 'CHECK_OUT' ? '#B91C1C' : '#6B7280'} />
          <Text
            style={[
              styles.filterChipText,
              filter === 'CHECK_OUT' && styles.filterChipTextCheckout,
            ]}
          >
            Restitutions ({scheduleEvents.filter((e) => e.type === 'CHECK_OUT').length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Liste des Événements */}
      {filteredEvents.length > 0 ? (
        <View style={styles.eventsList}>
          {filteredEvents.map((event) => {
            const isCheckIn = event.type === 'CHECK_IN';
            const isInProgress = event.type === 'IN_PROGRESS';

            return (
              <TouchableOpacity
                key={event.id}
                style={[
                  styles.eventCard,
                  isCheckIn ? styles.eventCardCheckin : isInProgress ? styles.eventCardInProgress : styles.eventCardCheckout,
                ]}
                onPress={() => onSelectBooking?.(event.rawBooking)}
                activeOpacity={0.88}
              >
                {/* Ligne Supérieure Badge et Heure */}
                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.typeBadge,
                      isCheckIn
                        ? styles.badgeCheckin
                        : isInProgress
                        ? styles.badgeInProgress
                        : styles.badgeCheckout,
                    ]}
                  >
                    {isCheckIn ? (
                      <ArrowDownLeft size={12} color="#047857" />
                    ) : isInProgress ? (
                      <Clock size={12} color="#D97706" />
                    ) : (
                      <ArrowUpRight size={12} color="#DC2626" />
                    )}
                    <Text
                      style={[
                        styles.typeBadgeText,
                        isCheckIn
                          ? styles.textCheckin
                          : isInProgress
                          ? styles.textInProgress
                          : styles.textCheckout,
                      ]}
                    >
                      {isCheckIn ? 'PRISE EN CHARGE (CHECK-IN)' : isInProgress ? 'LOCATION EN COURS' : 'RESTITUTION (CHECK-OUT)'}
                    </Text>
                  </View>

                  <View style={styles.timeBadge}>
                    <Clock size={12} color="#4B5563" />
                    <Text style={styles.timeText}>
                      {event.dateLabel} • {event.timeLabel}
                    </Text>
                  </View>
                </View>

                {/* Corps de la carte avec image véhicule & infos locataire */}
                <View style={styles.cardBody}>
                  <Image source={{ uri: event.vehiclePhoto }} style={styles.vehicleThumb} />

                  <View style={styles.infoBox}>
                    <Text style={styles.vehicleTitle} numberOfLines={1}>
                      {event.vehicleTitle}
                    </Text>
                    <View style={styles.immatRow}>
                      <View style={styles.immatPill}>
                        <Text style={styles.immatText}>{event.immatriculation}</Text>
                      </View>
                      <Text style={styles.codeText}>#{event.bookingCode}</Text>
                    </View>

                    <View style={styles.locataireRow}>
                      <Text style={styles.locataireLabel}>Locataire :</Text>
                      <Text style={styles.locataireName} numberOfLines={1}>
                        {event.locataireName}
                      </Text>
                      {event.locataireKycVerified && (
                        <ShieldCheck size={13} color="#34D399" style={styles.kycIcon} />
                      )}
                    </View>
                  </View>
                </View>

                {/* Actions au bas de la carte */}
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.actionBtnCall}
                    onPress={() => handleCall(event.locatairePhone, event.locataireName)}
                    activeOpacity={0.7}
                  >
                    <Phone size={14} color="#059669" />
                    <Text style={styles.actionBtnCallText}>Appeler</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionBtnDetails}
                    onPress={() => onSelectBooking?.(event.rawBooking)}
                    activeOpacity={0.7}
                  >
                    <FileText size={14} color="#374151" />
                    <Text style={styles.actionBtnDetailsText}>Contrat & Détails</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        /* État vide très propre si rien n'est prévu aujourd'hui */
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconCircle}>
            <CheckCircle2 size={24} color="#059669" />
          </View>
          <Text style={styles.emptyTitle}>Tout est en ordre aujourd'hui !</Text>
          <Text style={styles.emptySubtitle}>
            Aucune remise ou restitution de véhicule prévue pour cette journée. Vos véhicules restants restent disponibles à la réservation.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  titleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 1,
  },
  fullCalendarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#ECFDF5',
  },
  fullCalendarText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  filterChipActive: {
    backgroundColor: '#111827',
  },
  filterChipActiveCheckin: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  filterChipActiveCheckout: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  filterChipTextCheckin: {
    color: '#047857',
  },
  filterChipTextCheckout: {
    color: '#B91C1C',
  },
  eventsList: {
    gap: 12,
  },
  eventCard: {
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
  },
  eventCardCheckin: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  eventCardCheckout: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  eventCardInProgress: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeCheckin: {
    backgroundColor: '#DCFCE7',
  },
  badgeCheckout: {
    backgroundColor: '#FEE2E2',
  },
  badgeInProgress: {
    backgroundColor: '#FEF3C7',
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  textCheckin: {
    color: '#047857',
  },
  textCheckout: {
    color: '#B91C1C',
  },
  textInProgress: {
    color: '#B45309',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
  },
  cardBody: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  vehicleThumb: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
  },
  infoBox: {
    flex: 1,
  },
  vehicleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  immatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 3,
  },
  immatPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  immatText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1F2937',
  },
  codeText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  locataireRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locataireLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  locataireName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
    maxWidth: 130,
  },
  kycIcon: {
    marginLeft: 2,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
  },
  actionBtnCall: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  actionBtnCallText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  actionBtnDetails: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionBtnDetailsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  emptyCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  emptyIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 17,
  },
});
