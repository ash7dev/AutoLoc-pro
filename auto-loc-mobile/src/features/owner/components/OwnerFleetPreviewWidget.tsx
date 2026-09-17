import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import {
  Car,
  Star,
  TrendingUp,
  MapPin,
  Fuel,
  Users,
  ChevronRight,
  PlusCircle,
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
    label: 'En pause',
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
  const disponibleCount = vehicles.filter(
    (v) => v.statut === 'DISPONIBLE' || v.statut === 'VERIFIE'
  ).length;
  const enLocationCount = vehicles.filter((v) => v.statut === 'EN_LOCATION').length;
  const totalRevenue = vehicles.reduce((sum, v) => sum + safeNumber(v.revenusCumules), 0);

  return (
    <View style={styles.container}>
      {/* En-tête Widget Signature Dark Obsidian */}
      <View style={styles.headerRow}>
        <View style={styles.titleBox}>
          <View style={styles.titleIconBadge}>
            <Car size={14} color="#4ADE80" strokeWidth={2.25} />
          </View>
          <View style={styles.titleColumn}>
            <Text style={styles.title}>Ma Flotte</Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              Gestion de votre parc automobile
            </Text>
          </View>
        </View>

        {onNavigateToFleet && (
          <TouchableOpacity
            style={styles.manageBtn}
            onPress={onNavigateToFleet}
            activeOpacity={0.7}
          >
            <Text style={styles.manageBtnText}>Tout voir</Text>
            <ChevronRight size={14} color="#059669" />
          </TouchableOpacity>
        )}
      </View>

      {/* Barre de Synthèse Rapide */}
      {vehicles.length > 0 && (
        <View style={styles.summaryBar}>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryDot, { backgroundColor: '#34D399' }]} />
            <Text style={styles.summaryText}>
              <Text style={styles.summaryNum}>{disponibleCount}</Text> dispo.
            </Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <View style={[styles.summaryDot, { backgroundColor: '#60A5FA' }]} />
            <Text style={styles.summaryText}>
              <Text style={styles.summaryNum}>{enLocationCount}</Text> loué{enLocationCount > 1 ? 's' : ''}
            </Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <TrendingUp size={12} color="#059669" />
            <Text style={styles.summaryRevenueText}>
              {formatCurrency(totalRevenue, selectedCurrency)}
            </Text>
          </View>
        </View>
      )}

      {/* Liste des Véhicules en Vertical UX Spacieux */}
      {vehicles.length > 0 ? (
        <View style={styles.verticalList}>
          {vehicles.map((vehicle) => {
            const statusCfg = STATUS_CONFIG[vehicle.statut] ?? FALLBACK_STATUS_CONFIG;
            const rating = safeNumber(vehicle.noteMoyenne);
            const reservationsCount = safeNumber(vehicle.totalReservations);

            return (
              <TouchableOpacity
                key={vehicle.id}
                style={styles.vehicleRowCard}
                onPress={() => onSelectVehicle?.(vehicle)}
                activeOpacity={0.88}
              >
                {/* Section Supérieure : Photo + Détails */}
                <View style={styles.cardTopRow}>
                  {/* Image HD Agrandie (115x85px) */}
                  <View style={styles.imageBox}>
                    <Image
                      source={{ uri: vehicle.photoUrl }}
                      style={styles.vehicleImage}
                      contentFit="cover"
                      transition={150}
                    />
                    <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
                      <View style={[styles.statusDot, { backgroundColor: statusCfg.dotColor }]} />
                      <Text style={[styles.statusText, { color: statusCfg.color }]}>
                        {statusCfg.label}
                      </Text>
                    </View>
                  </View>

                  {/* Détails Véhicule */}
                  <View style={styles.infoContent}>
                    <View style={styles.titleRow}>
                      <Text style={styles.vehicleTitle} numberOfLines={1}>
                        {vehicle.marque} {vehicle.modele}
                      </Text>
                      {rating > 0 && (
                        <View style={styles.ratingInline}>
                          <Star size={11} color="#F59E0B" fill="#F59E0B" />
                          <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
                          {reservationsCount > 0 && (
                            <Text style={styles.resCountText}>({reservationsCount})</Text>
                          )}
                        </View>
                      )}
                    </View>

                    {/* Ville */}
                    <View style={styles.metaRow}>
                      <View style={styles.locationBox}>
                        <MapPin size={11} color="#64748B" />
                        <Text style={styles.locationText} numberOfLines={1}>
                          {vehicle.ville}
                        </Text>
                      </View>
                    </View>

                    {/* Chips Caractéristiques */}
                    <View style={styles.specsRow}>
                      <View style={styles.specChip}>
                        <Fuel size={10} color="#64748B" />
                        <Text style={styles.specChipText}>{vehicle.carburant}</Text>
                      </View>
                      <View style={styles.specChip}>
                        <Zap size={10} color="#64748B" />
                        <Text style={styles.specChipText}>{vehicle.transmission}</Text>
                      </View>
                      <View style={styles.specChip}>
                        <Users size={10} color="#64748B" />
                        <Text style={styles.specChipText}>{vehicle.places} pl.</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Section Inférieure : Tarifs & Gains Mis en Valeur (Zéro Débordement) */}
                <View style={styles.pricingFooterBar}>
                  <View style={styles.pricePillBox}>
                    <Text style={styles.priceAmount}>
                      {formatCurrency(vehicle.prixParJour, selectedCurrency)}
                    </Text>
                    <Text style={styles.priceUnit}>/jour</Text>
                  </View>

                  <View style={styles.revenuePillBox}>
                    <Text style={styles.revenueLabel}>Gains :</Text>
                    <Text style={styles.revenueAmount}>
                      {formatCurrency(vehicle.revenusCumules, selectedCurrency)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Bouton d'ajout sous forme de ligne d'action complète */}
          <TouchableOpacity
            style={styles.addVehicleBtn}
            onPress={onAddVehicle}
            activeOpacity={0.8}
          >
            <View style={styles.addIconCircle}>
              <PlusCircle size={16} color="#4ADE80" />
            </View>
            <Text style={styles.addVehicleBtnText}>Ajouter un nouveau véhicule</Text>
            <ChevronRight size={16} color="#4ADE80" />
          </TouchableOpacity>
        </View>
      ) : (
        /* État Vide */
        <TouchableOpacity
          style={styles.emptyCard}
          onPress={onAddVehicle}
          activeOpacity={0.85}
        >
          <View style={styles.emptyIconBadge}>
            <PlusCircle size={24} color="#4ADE80" />
          </View>
          <Text style={styles.emptyTitle}>Aucun véhicule enregistré</Text>
          <Text style={styles.emptySubtitle}>
            Publiez votre premier véhicule en moins de 3 minutes et recevez des réservations qualifiées.
          </Text>
          <View style={styles.emptyBtn}>
            <PlusCircle size={15} color="#FFFFFF" />
            <Text style={styles.emptyBtnText}>Ajouter mon véhicule</Text>
          </View>
        </TouchableOpacity>
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
    marginBottom: 12,
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
  manageBtn: {
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
  manageBtnText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11.5,
    color: '#059669',
  },
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  summaryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  summaryText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11.5,
    color: '#475569',
  },
  summaryNum: {
    fontFamily: theme.typography.fontFamily.bold,
    color: '#0F172A',
  },
  summaryRevenueText: {
    fontFamily: theme.typography.fontFamily.displayBold,
    fontSize: 12,
    color: '#047857',
    fontVariant: ['tabular-nums'],
  },
  summaryDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#E2E8F0',
  },
  verticalList: {
    gap: 12,
  },
  vehicleRowCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    overflow: 'hidden',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  imageBox: {
    width: 110,
    height: 85,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#041912',
  },
  vehicleImage: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    right: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingHorizontal: 4,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  statusDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  statusText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 9.5,
    letterSpacing: 0.1,
  },
  infoContent: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  vehicleTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 15,
    color: '#0F172A',
    flex: 1,
  },
  ratingInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10.5,
    color: '#B45309',
  },
  resCountText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 10,
    color: '#B45309',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flex: 1,
  },
  locationText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: '#64748B',
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
    flexWrap: 'wrap',
  },
  specChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2.5,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  specChipText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 9.5,
    color: '#475569',
  },
  pricingFooterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 6,
  },
  pricePillBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
    flexShrink: 1,
  },
  priceAmount: {
    fontFamily: theme.typography.fontFamily.displayBold,
    fontSize: 13.5,
    color: '#0F172A',
    fontVariant: ['tabular-nums'],
  },
  priceUnit: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 10.5,
    color: '#64748B',
  },
  revenuePillBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 3.5,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    flexShrink: 0,
  },
  revenueLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 10.5,
    color: '#047857',
  },
  revenueAmount: {
    fontFamily: theme.typography.fontFamily.displayBold,
    fontSize: 12.5,
    color: '#047857',
    fontVariant: ['tabular-nums'],
  },
  addVehicleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#041912',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.4)',
    marginTop: 4,
  },
  addIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addVehicleBtnText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13,
    color: '#FFFFFF',
    flex: 1,
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
    gap: 8,
  },
  emptyIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#041912',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 14,
    color: '#0F172A',
  },
  emptySubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 17,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#041912',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.4)',
    marginTop: 4,
  },
  emptyBtnText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12,
    color: '#FFFFFF',
  },
});