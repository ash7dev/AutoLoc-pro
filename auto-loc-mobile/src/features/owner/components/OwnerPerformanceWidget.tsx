import React from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { Car, Star, Zap, BarChart3 } from 'lucide-react-native';
import { theme } from '../../../core/theme';
import { OwnerDashboardStats } from '../api/ownerApi';

interface OwnerPerformanceWidgetProps {
  stats: OwnerDashboardStats | null;
}

export const OwnerPerformanceWidget: React.FC<OwnerPerformanceWidgetProps> = ({ stats }) => {
  const occupancy = stats?.tauxOccupation ?? 0;
  const rating = stats?.noteMoyenneFlotte ? stats.noteMoyenneFlotte.toFixed(1) : 'N/A';
  const totalVehicles = stats?.totalVehiculesCount ?? 0;
  const litigesCount = stats?.litigesOuverts ?? 0;

  return (
    <View style={styles.container}>
      {/* En-tête de section avec badge d'icône signature & indicateur En Direct */}
      <View style={styles.sectionHeader}>
        <View style={styles.titleRow}>
          <View style={styles.titleIconBadge}>
            <BarChart3 size={14} color="#4ADE80" strokeWidth={2.25} />
          </View>
          <Text style={styles.sectionTitle}>Performance Générale</Text>
        </View>

        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>En direct</Text>
        </View>
      </View>

      {/* Grille des 2 Cartes Majeures KPI */}
      <View style={styles.kpiGrid}>
        {/* KPI 1 : Taux d'occupation */}
        <View style={styles.kpiCard}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
              <Car size={18} color="#059669" strokeWidth={2.2} />
            </View>
            <View style={styles.occupancyBadge}>
              <Zap size={10} color="#059669" />
              <Text style={styles.occupancyBadgeText}>Actif</Text>
            </View>
          </View>

          <View style={styles.valueBox}>
            <Text style={styles.kpiValue}>{occupancy}%</Text>
            <Text style={styles.kpiLabel}>Taux d'occupation</Text>
          </View>

          {/* Jauge / Barre de progression visuelle */}
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${Math.min(occupancy, 100)}%` }]} />
          </View>
        </View>

        {/* KPI 2 : Note moyenne de la Flotte */}
        <View style={styles.kpiCard}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#FEF3C7' }]}>
              <Star size={18} color="#D97706" strokeWidth={2.2} fill="#D97706" />
            </View>
            {Number(rating) >= 4.8 ? (
              <View style={styles.starBadge}>
                <Text style={styles.starBadgeText}>Top 5%</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.valueBox}>
            <Text style={[styles.kpiValue, { color: '#B45309' }]}>
              {rating === 'N/A' ? 'N/A' : `${rating} ★`}
            </Text>
            <Text style={styles.kpiLabel}>Note globale flotte</Text>
          </View>

          {/* Micro Subtitle */}
          <Text style={styles.kpiSubLabel} numberOfLines={1}>
            Avis locataires vérifiés
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    fontSize: 17,
    color: '#041912',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.2)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
  },
  liveText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
    color: '#059669',
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    justifyContent: 'space-between',
    minHeight: 118,
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  occupancyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
  },
  occupancyBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
    color: '#059669',
  },
  starBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.25)',
  },
  starBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
    color: '#D97706',
  },
  valueBox: {
    gap: 2,
  },
  kpiValue: {
    fontFamily: theme.typography.fontFamily.displayBold,
    fontVariant: ['tabular-nums'],
    fontSize: 22,
    color: '#041912',
    letterSpacing: -0.4,
  },
  kpiLabel: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 12,
    color: '#475569',
  },
  kpiSubLabel: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 10.5,
    color: '#94A3B8',
    marginTop: 4,
  },
  progressBarTrack: {
    height: 4,
    width: '100%',
    backgroundColor: '#F1F5F9',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#059669',
    borderRadius: 2,
  },
});
