import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { AutoSkeleton } from '../../../shared/components/AutoSkeleton';
import { theme } from '../../../core/theme';

export interface BookingCardSkeletonProps {
  count?: number;
}

export const BookingCardSkeleton: React.FC<BookingCardSkeletonProps> = ({
  count = 2,
}) => {
  return (
    <View style={styles.skeletonListContainer}>
      {Array.from({ length: count }).map((_, idx) => (
        <View key={`booking-skeleton-${idx}`} style={styles.cardContainer}>
          {/* Ligne 1 : Statut & ID */}
          <View style={styles.statusRow}>
            <View style={styles.idGroup}>
              <AutoSkeleton width={60} height={10} borderRadius={4} />
              <AutoSkeleton width={90} height={14} borderRadius={4} />
            </View>
            <AutoSkeleton width={95} height={24} borderRadius={theme.radius.full} />
          </View>

          {/* Ligne 2 : Vignette + Infos véhicule */}
          <View style={styles.carRow}>
            <AutoSkeleton width={76} height={76} borderRadius={14} />
            <View style={styles.carInfo}>
              <AutoSkeleton width="80%" height={18} borderRadius={6} />
              <AutoSkeleton width="65%" height={14} borderRadius={4} />
              <AutoSkeleton width="50%" height={13} borderRadius={4} />
            </View>
          </View>

          {/* Ligne 3 : Bloc Récapitulatif Sombre */}
          <View style={styles.recapCardDark}>
            <View style={styles.recapHeaderRow}>
              <AutoSkeleton width={110} height={12} borderRadius={4} />
              <AutoSkeleton width={80} height={12} borderRadius={4} />
            </View>

            <View style={styles.recapLine}>
              <AutoSkeleton width={150} height={13} borderRadius={4} />
              <AutoSkeleton width={65} height={13} borderRadius={4} />
            </View>

            <View style={styles.recapLine}>
              <AutoSkeleton width={140} height={13} borderRadius={4} />
              <AutoSkeleton width={60} height={13} borderRadius={4} />
            </View>

            <View style={styles.recapDivider} />

            <View style={styles.totalRow}>
              <AutoSkeleton width={90} height={15} borderRadius={4} />
              <AutoSkeleton width={95} height={20} borderRadius={6} />
            </View>
          </View>

          {/* Ligne 4 : Boutons d'action */}
          <View style={styles.actionsRow}>
            <AutoSkeleton width="65%" height={40} borderRadius={theme.radius.full} />
            <AutoSkeleton width="30%" height={40} borderRadius={theme.radius.full} />
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  skeletonListContainer: {
    gap: 16,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: theme.spacing[4],
    gap: theme.spacing[4],
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  idGroup: {
    gap: 4,
  },
  carRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  carInfo: {
    flex: 1,
    gap: 6,
  },
  recapCardDark: {
    backgroundColor: '#072A20',
    borderRadius: 16,
    padding: theme.spacing[4],
    gap: 12,
  },
  recapHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recapLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recapDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    marginVertical: 2,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 4,
  },
});
