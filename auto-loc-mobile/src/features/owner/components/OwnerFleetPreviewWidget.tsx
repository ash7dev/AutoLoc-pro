import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Car,
  Star,
  TrendingUp,
  MapPin,
  Fuel,
  Users,
  ChevronRight,
  PlusCircle,
  ShieldAlert,
  Zap,
} from 'lucide-react-native';
import { theme } from '../../../core/theme';
import { OwnerVehicle } from '../api/ownerApi';
import { formatCurrency, CurrencyCode } from '../../../core/utils/currency';

interface OwnerFleetPreviewWidgetProps {
  vehicles: OwnerVehicle[];
  selectedCurrency: CurrencyCode;
  onNavigateToFleet?: () => void;
  onAddVehicle?: () => void;
  onSelectVehicle?: (vehicle: OwnerVehicle) => void;
}

const STATUS_CONFIG: Record<
  OwnerVehicle['statut'],
  { label: string; bg: string; color: string; dotColor: string }
> = {
  DISPONIBLE: {
    label: 'Disponible',
    bg: '#ECFDF5',
    color: '#047857',
    dotColor: '#34D399',
  },
  VERIFIE: {
    label: 'Disponible',
    bg: '#ECFDF5',
    color: '#047857',
    dotColor: '#34D399',
  },
  EN_LOCATION: {
    label: 'En location',
    bg: '#EFF6FF',
    color: '#1D4ED8',
    dotColor: '#60A5FA',
  },
  EN_ATTENTE_VALIDATION: {
    label: 'En vérification',
    bg: '#FFFBEB',
    color: '#B45309',
    dotColor: '#FBBF24',
  },
  MAINTENANCE: {
    label: 'En attente',
    bg: '#FFFBEB',
    color: '#B45309',
    dotColor: '#FBBF24',
  },
  DESACTIVE: {
    label: 'Désactivé',
    bg: '#F3F4F6',
    color: '#6B7280',
    dotColor: '#9CA3AF',
  },
  REFUSE: {
    label: 'Refusé',
    bg: '#FEF2F2',
    color: '#B91C1C',
    dotColor: '#EF4444',
  },
  ARCHIVE: {
    label: 'Archivé',
    bg: '#F1F5F9',
    color: '#475569',
    dotColor: '#94A3B8',
  },
};

// Filet de sécurité si un statut inattendu arrive de l'API
const FALLBACK_STATUS_CONFIG = STATUS_CONFIG.DESACTIVE;

const safeNumber = (val: unknown): number => {
  const n = Number(val);
  return Number.isFinite(n) ? n : 0;
};

export const OwnerFleetPreviewWidget: React.FC<OwnerFleetPreviewWidgetProps> = ({
  vehicles,
  selectedCurrency,
  onNavigateToFleet,
  onAddVehicle,
  onSelectVehicle,
}) => {
  const disponibleCount = vehicles.filter((v) => v.statut === 'DISPONIBLE').length;
  const enLocationCount = vehicles.filter((v) => v.statut === 'EN_LOCATION').length;
  const totalRevenue = vehicles.reduce((sum, v) => sum + safeNumber(v.revenusCumules), 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleBox}>
          <View style={styles.iconCircle}>
            <Car size={18} color={theme.colors.brand.main} />
          </View>
          <View>
            <Text style={styles.title}>Ma Flotte</Text>
            <Text style={styles.subtitle}>
              {vehicles.length} véhicule{vehicles.length !== 1 ? 's' : ''} enregistré{vehicles.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.manageBtn}
          onPress={onNavigateToFleet}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Gérer ma flotte de véhicules"
        >
          <Text style={styles.manageBtnText}>Gérer</Text>
          <ChevronRight size={14} color={theme.colors.brand.main} />
        </TouchableOpacity>
      </View>

      {/* Mini Summary Bar */}
      {vehicles.length > 0 && (
        <View style={styles.summaryBar}>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryDot, { backgroundColor: '#34D399' }]} />
            <Text style={styles.summaryText}>
              {disponibleCount} disponible{disponibleCount !== 1 ? 's' : ''}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <View style={[styles.summaryDot, { backgroundColor: '#60A5FA' }]} />
            <Text style={styles.summaryText}>
              {enLocationCount} en location
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <TrendingUp size={12} color={theme.colors.brand.main} />
            <Text style={[styles.summaryText, styles.summaryTextAccent]}>
              {formatCurrency(totalRevenue, selectedCurrency)}
            </Text>
          </View>
        </View>
      )}

      {/* Vehicle Cards */}
      {vehicles.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsScrollContent}
        >
          {vehicles.map((vehicle) => {
            const statusCfg = STATUS_CONFIG[vehicle.statut] ?? FALLBACK_STATUS_CONFIG;
            const rating = safeNumber(vehicle.noteMoyenne);
            const reservationsCount = safeNumber(vehicle.totalReservations);

            return (
              <TouchableOpacity
                key={vehicle.id}
                style={styles.vehicleCard}
                onPress={() => onSelectVehicle?.(vehicle)}
                activeOpacity={0.88}
                accessibilityRole="button"
                accessibilityLabel={`${vehicle.marque} ${vehicle.modele}, ${statusCfg.label}, ${formatCurrency(vehicle.prixParJour, selectedCurrency)} par jour`}
              >
                {/* Photo + Overlay */}
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: vehicle.photoUrl }}
                    style={styles.vehicleImage}
                    contentFit="cover"
                    transition={200}
                  />

                  {/* Vrai dégradé pour profondeur et lisibilité, façon Airbnb/Uber */}
                  <LinearGradient
                    colors={['transparent', 'rgba(7, 42, 32, 0.45)']}
                    locations={[0.45, 1]}
                    style={styles.imageGradient}
                    pointerEvents="none"
                  />

                  <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
                    <View style={[styles.statusDot, { backgroundColor: statusCfg.dotColor }]} />
                    <Text style={[styles.statusText, { color: statusCfg.color }]}>
                      {statusCfg.label}
                    </Text>
                  </View>

                  <View style={styles.priceTag}>
                    <Text style={styles.priceTagText}>
                      {formatCurrency(vehicle.prixParJour, selectedCurrency)}
                    </Text>
                    <Text style={styles.priceTagSuffix}>/jour</Text>
                  </View>
                </View>

                {/* Card Body */}
                <View style={styles.cardBody}>
                  <Text style={styles.vehicleTitle} numberOfLines={1}>
                    {vehicle.marque} {vehicle.modele}
                  </Text>

                  <View style={styles.metaRow}>
                    <View style={styles.immatPill}>
                      <Text style={styles.immatText}>{vehicle.immatriculation}</Text>
                    </View>
                    <View style={styles.locationChip}>
                      <MapPin size={10} color="#6B7280" />
                      <Text style={styles.locationText} numberOfLines={1}>
                        {vehicle.ville}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.specsRow}>
                    <View style={styles.specItem}>
                      <Fuel size={11} color="#9CA3AF" />
                      <Text style={styles.specText}>{vehicle.carburant}</Text>
                    </View>
                    <View style={styles.specDot} />
                    <View style={styles.specItem}>
                      <Zap size={11} color="#9CA3AF" />
                      <Text style={styles.specText}>{vehicle.transmission}</Text>
                    </View>
                    <View style={styles.specDot} />
                    <View style={styles.specItem}>
                      <Users size={11} color="#9CA3AF" />
                      <Text style={styles.specText}>{vehicle.places} pl.</Text>
                    </View>
                  </View>

                  <View style={styles.perfRow}>
                    <View style={styles.perfItem}>
                      <Star size={12} color="#F59E0B" fill={rating > 0 ? '#F59E0B' : 'transparent'} />
                      <Text style={styles.perfValue}>{rating > 0 ? rating.toFixed(1) : 'N/A'}</Text>
                    </View>
                    <View style={styles.perfDivider} />
                    <View style={styles.perfItem}>
                      <Car size={12} color="#64748B" />
                      <Text style={styles.perfValue}>{reservationsCount} rés.</Text>
                    </View>
                    <View style={styles.perfDivider} />
                    <View style={styles.perfItem}>
                      <TrendingUp size={12} color={theme.colors.brand.main} />
                      <Text style={[styles.perfValue, styles.perfValueAccent]}>
                        {formatCurrency(vehicle.revenusCumules, selectedCurrency)}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Add Vehicle CTA Card */}
          <TouchableOpacity
            style={styles.addVehicleCard}
            onPress={onAddVehicle}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Ajouter un véhicule à ma flotte"
          >
            <View style={styles.addIconCircle}>
              <PlusCircle size={28} color={theme.colors.brand.main} />
            </View>
            <Text style={styles.addTitle} numberOfLines={1}>
              Ajouter un véhicule
            </Text>
            <Text style={styles.addSubtitle} numberOfLines={1}>
              Rentabilisez votre auto en la louant sur AutoLoc
            </Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        /* Empty State */
        <TouchableOpacity
          style={styles.emptyCard}
          onPress={onAddVehicle}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Ajouter mon premier véhicule"
        >
          <View style={styles.emptyIconCircle}>
            <ShieldAlert size={28} color="#D97706" />
          </View>
          <Text style={styles.emptyTitle}>Aucun véhicule enregistré</Text>
          <Text style={styles.emptySubtitle}>
            Ajoutez votre premier véhicule pour commencer à générer des revenus sur AutoLoc.
          </Text>
          <View style={styles.emptyActionBtn}>
            <PlusCircle size={16} color="#FFFFFF" />
            <Text style={styles.emptyActionText}>Ajouter mon premier véhicule</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 17,
    color: theme.primitives.forest[800],
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    color: '#6B7280',
    marginTop: 1,
  },
  manageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#ECFDF5',
  },
  manageBtnText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12,
    color: theme.colors.brand.main,
  },
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  summaryDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  summaryText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 11,
    color: '#374151',
  },
  summaryTextAccent: {
    color: theme.colors.brand.main,
    fontFamily: theme.typography.fontFamily.bold,
  },
  summaryDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#E5E7EB',
  },
  cardsScrollContent: {
    paddingRight: 16,
    gap: 12,
  },
  vehicleCard: {
    width: 230,
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: 130,
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  vehicleImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
    letterSpacing: 0.2,
  },
  priceTag: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: 'rgba(7, 42, 32, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 2,
  },
  priceTagText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  priceTagSuffix: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 10,
    color: '#D1D5DB',
  },
  cardBody: {
    padding: 12,
    gap: 6,
  },
  vehicleTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 15,
    color: theme.primitives.forest[800],
    letterSpacing: -0.1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  immatPill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  immatText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 9,
    color: '#1F2937',
    letterSpacing: 0.3,
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    flex: 1,
  },
  locationText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: '#6B7280',
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingTop: 2,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  specText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 10,
    color: '#9CA3AF',
  },
  specDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
  },
  perfRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 6,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 6,
  },
  perfItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    flex: 1,
  },
  perfValue: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 11,
    color: '#374151',
  },
  perfValueAccent: {
    color: theme.colors.brand.main,
  },
  perfDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#E5E7EB',
  },
  addVehicleCard: {
    width: 200,
    alignSelf: 'stretch',
    backgroundColor: '#F0FDF4',
    borderRadius: theme.radius.card,
    borderWidth: 2,
    borderColor: '#A7F3D0',
    borderStyle: 'dashed',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 14,
    color: '#047857',
    textAlign: 'center',
  },
  addSubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 15,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.card,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  emptyIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 16,
    color: theme.primitives.forest[800],
  },
  emptySubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 17,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.brand.main,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: theme.colors.brand.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyActionText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13,
    color: '#FFFFFF',
  },
});