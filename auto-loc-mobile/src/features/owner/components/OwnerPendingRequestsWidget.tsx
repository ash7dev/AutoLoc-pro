import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Clock, ChevronRight, CheckCircle2 } from 'lucide-react-native';
import { theme } from '../../../core/theme';
import { OwnerBooking } from '../api/ownerApi';
import { OwnerBookingCard } from './OwnerBookingCard';

interface OwnerPendingRequestsWidgetProps {
  pendingBookings: OwnerBooking[];
  onApproveBooking: (bookingId: string) => void;
  onRejectBooking: (bookingId: string) => void;
  onViewAllPress?: () => void;
}

export const OwnerPendingRequestsWidget: React.FC<OwnerPendingRequestsWidgetProps> = ({
  pendingBookings,
  onApproveBooking,
  onRejectBooking,
  onViewAllPress,
}) => {
  const hasPending = pendingBookings.length > 0;

  return (
    <View style={styles.container}>
      {/* En-tête Widget Signature Dark Obsidian */}
      <View style={styles.headerRow}>
        <View style={styles.titleBox}>
          <View style={styles.titleIconBadge}>
            <Clock size={14} color="#4ADE80" strokeWidth={2.25} />
          </View>
          <View style={styles.titleColumn}>
            <View style={styles.titleTitleRow}>
              <Text style={styles.title}>Demandes en attente</Text>
              {hasPending && (
                <View style={styles.countBadge}>
                  <View style={styles.pulseDot} />
                  <Text style={styles.countBadgeText}>{pendingBookings.length}</Text>
                </View>
              )}
            </View>
            <Text style={styles.subtitle} numberOfLines={1}>
              À valider sous 24h
            </Text>
          </View>
        </View>

        {onViewAllPress && (
          <TouchableOpacity
            style={styles.seeAllBtn}
            onPress={onViewAllPress}
            activeOpacity={0.7}
          >
            <Text style={styles.seeAllText}>Voir tout</Text>
            <ChevronRight size={14} color="#059669" />
          </TouchableOpacity>
        )}
      </View>

      {/* Cartes des Demandes ou État Vide */}
      {hasPending ? (
        <View style={styles.cardsList}>
          {pendingBookings.map((booking) => (
            <OwnerBookingCard
              key={booking.id}
              booking={booking}
              onApprove={onApproveBooking}
              onReject={onRejectBooking}
              onDetailPress={onViewAllPress}
            />
          ))}
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconCircle}>
            <CheckCircle2 size={24} color="#059669" />
          </View>
          <Text style={styles.emptyTitle}>Toutes les demandes ont été traitées !</Text>
          <Text style={styles.emptySubtitle}>
            Vous n'avez aucune réservation en attente d'approbation. Vos véhicules restent visibles et disponibles pour de nouvelles locations.
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
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
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
    flex: 1,
    marginRight: 8,
  },
  titleColumn: {
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
  titleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 17,
    color: '#041912',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D97706',
  },
  countBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10.5,
    color: '#B45309',
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: theme.radius.full,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.2)',
  },
  seeAllText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11.5,
    color: '#059669',
  },
  cardsList: {
    gap: 12,
  },
  emptyCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 4,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 17,
  },
});
