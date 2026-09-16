import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import {
  Car,
  TrendingUp,
  Plus,
  Clock,
} from 'lucide-react-native';
import { OwnerVehicle } from '../api/ownerApi';
import { formatCurrency, CurrencyCode } from '../../../core/utils/currency';
import { theme } from '../../../core/theme';

interface OwnerFleetHeaderWidgetProps {
  vehicles: OwnerVehicle[];
  selectedCurrency?: CurrencyCode;
  onAddVehicle: () => void;
}

export const OwnerFleetHeaderWidget: React.FC<OwnerFleetHeaderWidgetProps> = ({
  vehicles = [],
  selectedCurrency = 'XOF',
  onAddVehicle,
}) => {
  const totalCount = vehicles.length;
  const inRentalCount = vehicles.filter((v) => v.statut === 'EN_LOCATION').length;
  const availableCount = vehicles.filter((v) => v.statut === 'DISPONIBLE' || v.statut === 'VERIFIE').length;
  const pendingCount = vehicles.filter((v) => v.statut === 'EN_ATTENTE_VALIDATION').length;

  // Calcul du potentiel de revenu mensuel
  const estimatedMonthlyRevenue = vehicles.reduce((sum, v) => {
    if (v.statut === 'DISPONIBLE' || v.statut === 'EN_LOCATION' || v.statut === 'VERIFIE') {
      return sum + Number(v.prixParJour || 0) * 15;
    }
    return sum;
  }, 0);

  return (
    <View style={styles.container}>
      <View style={styles.cardBox}>
        {/* Top Action Row */}
        <View style={styles.topRow}>
          <View style={styles.kpiTitleGroup}>
            <View style={styles.kpiBadge}>
              <Car size={13} color="#34D399" />
              <Text style={styles.kpiBadgeText}>SYNTHÈSE FLOTTE</Text>
            </View>
            <Text style={styles.kpiSubText}>
              {totalCount} véhicule{totalCount > 1 ? 's' : ''} dans la flotte
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addVehicleBtn}
            onPress={onAddVehicle}
            activeOpacity={0.8}
          >
            <Plus size={13} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.addVehicleBtnText}>+ Nouveau</Text>
          </TouchableOpacity>
        </View>

        {/* Stat Cards Grid */}
        <View style={styles.metricsGrid}>
          {/* Total Vehicles */}
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{totalCount}</Text>
            <Text style={styles.metricLabel}>Flotte totale</Text>
          </View>

          <View style={styles.metricDivider} />

          {/* En Location */}
          <View style={styles.metricItem}>
            <View style={styles.rowLabel}>
              <View style={[styles.dot, { backgroundColor: '#3B82F6' }]} />
              <Text style={styles.metricValue}>{inRentalCount}</Text>
            </View>
            <Text style={styles.metricLabel}>En location</Text>
          </View>

          <View style={styles.metricDivider} />

          {/* Disponibles */}
          <View style={styles.metricItem}>
            <View style={styles.rowLabel}>
              <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.metricValue}>{availableCount}</Text>
            </View>
            <Text style={styles.metricLabel}>Disponible{availableCount > 1 ? 's' : ''}</Text>
          </View>
        </View>

        {/* Revenue Potential Bar */}
        <View style={styles.revenueBar}>
          <View style={styles.revenueInfo}>
            <TrendingUp size={15} color="#10B981" />
            <View style={{ flex: 1 }}>
              <Text style={styles.revenueTitle}>Revenu potentiel estimé</Text>
              <Text style={styles.revenueSub} numberOfLines={1}>
                Est. sur 15j/mois par véhicule
              </Text>
            </View>
          </View>

          <View style={styles.revenueAmountBox}>
            <Text style={styles.revenueAmount} numberOfLines={1} adjustsFontSizeToFit>
              {formatCurrency(estimatedMonthlyRevenue, selectedCurrency)}
            </Text>
            <Text style={styles.revenueMonth}>/mois</Text>
          </View>
        </View>

        {/* Pending Approval Notice */}
        {pendingCount > 0 && (
          <View style={styles.pendingNotice}>
            <Clock size={13} color="#D97706" />
            <Text style={styles.pendingNoticeText} numberOfLines={2}>
              {pendingCount} véhicule{pendingCount > 1 ? 's' : ''} en attente de vérification par AutoLoc
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  cardBox: {
    backgroundColor: '#051B14',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#0B3D2E',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 8,
  },
  kpiTitleGroup: {
    flex: 1,
    gap: 3,
  },
  kpiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  kpiBadgeText: {
    fontSize: 9.5,
    fontFamily: 'Inter_700Bold',
    color: '#34D399',
    letterSpacing: 0.5,
  },
  kpiSubText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#94A3B8',
  },
  addVehicleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    flexShrink: 0,
  },
  addVehicleBtnText: {
    fontSize: 11.5,
    fontFamily: 'Fraunces_600SemiBold',
    color: '#FFFFFF',
  },
  metricsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  rowLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  metricValue: {
    fontSize: 18,
    fontFamily: 'Fraunces_600SemiBold',
    color: '#FFFFFF',
  },
  metricLabel: {
    fontSize: 10.5,
    fontFamily: 'Inter_400Regular',
    color: '#94A3B8',
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  revenueBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    gap: 8,
  },
  revenueInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  revenueTitle: {
    fontSize: 11.5,
    fontFamily: 'Inter_700Bold',
    color: '#ECFDF5',
  },
  revenueSub: {
    fontSize: 9.5,
    fontFamily: 'Inter_400Regular',
    color: '#A7F3D0',
  },
  revenueAmountBox: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  revenueAmount: {
    fontSize: 15,
    fontFamily: 'Fraunces_600SemiBold',
    color: '#34D399',
  },
  revenueMonth: {
    fontSize: 9.5,
    fontFamily: 'Inter_400Regular',
    color: '#A7F3D0',
  },
  pendingNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(217, 119, 6, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.25)',
  },
  pendingNoticeText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: '#FDE68A',
    flex: 1,
  },
});

