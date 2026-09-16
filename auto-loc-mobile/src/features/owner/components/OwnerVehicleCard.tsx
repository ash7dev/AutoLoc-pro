import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Switch } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Star, MapPin, Fuel, Gauge, MoreVertical, Sparkles, TrendingUp, Users } from 'lucide-react-native';
import { formatDirectPrice } from '../../../core/utils/currency';
import { useAppStore } from '../../../core/store/useAppStore';
import { OwnerVehicle } from '../api/ownerApi';

interface OwnerVehicleCardProps {
  vehicle: OwnerVehicle;
  onToggleStatus: (vehicleId: string, currentStatus: OwnerVehicle['statut']) => void;
  onQuickActionPress?: (vehicle: OwnerVehicle) => void;
  onEditPress?: (vehicle: OwnerVehicle) => void;
}

export const OwnerVehicleCard: React.FC<OwnerVehicleCardProps> = ({
  vehicle,
  onToggleStatus,
  onQuickActionPress,
  onEditPress,
}) => {
  const selectedCurrency = useAppStore((state) => state.selectedCurrency);
  const isAvailable = vehicle.statut === 'DISPONIBLE' || vehicle.statut === 'VERIFIE';

  const getStatusBadge = () => {
    switch (vehicle.statut) {
      case 'DISPONIBLE':
      case 'VERIFIE':
        return { label: 'Disponible', bg: 'rgba(236, 253, 245, 0.92)', text: '#047857', border: '#A7F3D0', dot: '#10B981' };
      case 'EN_LOCATION':
        return { label: 'En location', bg: 'rgba(239, 246, 255, 0.92)', text: '#1D4ED8', border: '#BFDBFE', dot: '#3B82F6' };
      case 'EN_ATTENTE_VALIDATION':
        return { label: 'En vérification', bg: 'rgba(255, 251, 235, 0.92)', text: '#B45309', border: '#FDE68A', dot: '#F59E0B' };
      case 'REFUSE':
        return { label: 'Dossier Refusé', bg: 'rgba(254, 242, 242, 0.92)', text: '#B91C1C', border: '#FCA5A5', dot: '#EF4444' };
      case 'MAINTENANCE':
        return { label: 'En maintenance', bg: 'rgba(254, 243, 199, 0.92)', text: '#B45309', border: '#FDE68A', dot: '#F59E0B' };
      default:
        return { label: 'Inactif', bg: 'rgba(241, 245, 249, 0.92)', text: '#475569', border: '#E2E8F0', dot: '#64748B' };
    }
  };

  const status = getStatusBadge();
  const noteVal = vehicle.noteMoyenne ? Number(vehicle.noteMoyenne) : 0;
  const hasReviews = (vehicle.totalReservations || 0) > 0 && noteVal > 0;
  const hasCumulativeEarnings = (vehicle.revenusCumules || 0) > 0;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.94}
      onPress={() => (onQuickActionPress ? onQuickActionPress(vehicle) : onEditPress?.(vehicle))}
    >
      {/* Photo & Badges Flottants Ultra-Premium */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: vehicle.photoUrl }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
        
        {/* Ombre dégradée pour lisibilité parfaite */}
        <LinearGradient
          colors={['rgba(0,0,0,0.35)', 'transparent', 'rgba(5,27,20,0.85)']}
          locations={[0, 0.45, 1]}
          style={styles.gradientOverlay}
        />

        {/* Status Badge avec Glassmorphism */}
        <View style={[styles.statusBadge, { backgroundColor: status.bg, borderColor: status.border }]}>
          <View style={[styles.statusDot, { backgroundColor: status.dot }]} />
          <Text style={[styles.statusBadgeText, { color: status.text }]}>{status.label}</Text>
        </View>

        {/* Immatriculation Plaque Métallique */}
        <View style={styles.plateBadge}>
          <Text style={styles.plateText}>{vehicle.immatriculation}</Text>
        </View>

        {/* Revenus Cumulés du Véhicule sur la photo */}
        {hasCumulativeEarnings && (
          <View style={styles.earningsTag}>
            <TrendingUp size={12} color="#34D399" />
            <Text style={styles.earningsTagText}>
              {formatDirectPrice(vehicle.revenusCumules || 0, selectedCurrency)} générés
            </Text>
          </View>
        )}
      </View>

      {/* Contenu et Spécifications */}
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.titleBox}>
            <Text style={styles.title} numberOfLines={1}>
              {vehicle.marque} {vehicle.modele}
            </Text>
            <View style={styles.locationRow}>
              <MapPin size={13} color="#64748B" />
              <Text style={styles.locationText}>
                {vehicle.ville} · {vehicle.annee}
              </Text>
            </View>
          </View>

          {/* Rating ou Badge Nouveau */}
          {hasReviews ? (
            <View style={styles.ratingBadge}>
              <Star size={12} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.ratingText}>{noteVal.toFixed(1)}</Text>
            </View>
          ) : (
            <View style={styles.newBadge}>
              <Sparkles size={11} color="#059669" />
              <Text style={styles.newBadgeText}>Nouveau</Text>
            </View>
          )}
        </View>

        {/* Spec Chips (Carburant, Transmission, Places, Locations) */}
        <View style={styles.specsRow}>
          {vehicle.carburant ? (
            <View style={styles.specChip}>
              <Fuel size={12} color="#059669" />
              <Text style={styles.specText}>{vehicle.carburant}</Text>
            </View>
          ) : null}

          {vehicle.transmission ? (
            <View style={styles.specChip}>
              <Gauge size={12} color="#2563EB" />
              <Text style={styles.specText}>{vehicle.transmission}</Text>
            </View>
          ) : null}

          {vehicle.places ? (
            <View style={styles.specChip}>
              <Users size={12} color="#7C3AED" />
              <Text style={styles.specText}>{vehicle.places} pl.</Text>
            </View>
          ) : null}
        </View>

        {/* Footer : Prix & Interrupteur / Actions */}
        <View style={styles.footerRow}>
          <View>
            <Text style={styles.priceValue}>
              {formatDirectPrice(vehicle.prixParJour, selectedCurrency)}
            </Text>
            <Text style={styles.pricePeriod}>/ jour de location</Text>
          </View>

          <View style={styles.actionsBox}>
            <View style={styles.toggleGroup}>
              <Text style={[styles.toggleLabel, isAvailable && styles.toggleLabelActive]}>
                {isAvailable ? 'Actif' : 'Inactif'}
              </Text>
              <Switch
                value={isAvailable}
                onValueChange={() => onToggleStatus(vehicle.id, vehicle.statut)}
                trackColor={{ false: '#E2E8F0', true: '#A7F3D0' }}
                thumbColor={isAvailable ? '#059669' : '#94A3B8'}
              />
            </View>

            <TouchableOpacity
              style={styles.actionMenuBtn}
              onPress={(e) => {
                e.stopPropagation();
                if (onQuickActionPress) onQuickActionPress(vehicle);
                else onEditPress?.(vehicle);
              }}
              activeOpacity={0.7}
              hitSlop={10}
            >
              <MoreVertical size={18} color="#0F172A" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#051B14',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 16,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
    backgroundColor: '#051B14',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFill,
  },
  statusBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 5.5,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusBadgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
  },
  plateBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: 'rgba(5, 27, 20, 0.92)',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  plateText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11.5,
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  earningsTag: {
    position: 'absolute',
    bottom: 12,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(5, 27, 20, 0.88)',
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.35)',
  },
  earningsTagText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#ECFDF5',
  },
  content: {
    padding: 16,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleBox: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 18,
    color: '#0F172A',
    lineHeight: 23,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12.5,
    color: '#64748B',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 4,
  },
  ratingText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11.5,
    color: '#92400E',
  },
  newBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    gap: 4,
  },
  newBadgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11.5,
    color: '#047857',
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  specChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 5,
  },
  specText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11.5,
    color: '#334155',
  },

  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 2,
  },
  priceValue: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 19,
    color: '#059669',
  },
  pricePeriod: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  actionsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  toggleLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11.5,
    color: '#64748B',
  },
  toggleLabelActive: {
    fontFamily: 'Inter_700Bold',
    color: '#047857',
  },
  actionMenuBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
});


