import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Switch } from 'react-native';
import { Star, MapPin, Fuel, Gauge, Settings } from 'lucide-react-native';
import { theme } from '../../../core/theme';
import { formatCurrency } from '../../../core/utils/currency';
import { useAppStore } from '../../../core/store/useAppStore';
import { OwnerVehicle } from '../api/ownerApi';

interface OwnerVehicleCardProps {
  vehicle: OwnerVehicle;
  onToggleStatus: (vehicleId: string, currentStatus: OwnerVehicle['statut']) => void;
  onEditPress?: (vehicle: OwnerVehicle) => void;
}

export const OwnerVehicleCard: React.FC<OwnerVehicleCardProps> = ({
  vehicle,
  onToggleStatus,
  onEditPress,
}) => {
  const selectedCurrency = useAppStore((state) => state.selectedCurrency);
  const isAvailable = vehicle.statut === 'DISPONIBLE';

  const getStatusBadge = () => {
    switch (vehicle.statut) {
      case 'DISPONIBLE':
        return { label: 'Disponible', bg: '#ECFDF5', text: '#047857', border: '#A7F3D0' };
      case 'EN_LOCATION':
        return { label: 'En location', bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' };
      case 'MAINTENANCE':
        return { label: 'En maintenance', bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' };
      default:
        return { label: 'Inactif', bg: '#F3F4F6', text: '#4B5563', border: '#E5E7EB' };
    }
  };

  const status = getStatusBadge();

  return (
    <View style={styles.card}>
      {/* Photo & Badge Statut */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: vehicle.photoUrl }} style={styles.image} resizeMode="cover" />
        <View style={[styles.statusBadge, { backgroundColor: status.bg, borderColor: status.border }]}>
          <Text style={[styles.statusBadgeText, { color: status.text }]}>{status.label}</Text>
        </View>

        <View style={styles.plateBadge}>
          <Text style={styles.plateText}>{vehicle.immatriculation}</Text>
        </View>
      </View>

      {/* Détails du véhicule */}
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.titleBox}>
            <Text style={styles.title} numberOfLines={1}>
              {vehicle.marque} {vehicle.modele} ({vehicle.annee})
            </Text>
            <View style={styles.locationRow}>
              <MapPin size={12} color="#6B7280" />
              <Text style={styles.locationText}>{vehicle.ville}</Text>
            </View>
          </View>

          <View style={styles.ratingBadge}>
            <Star size={12} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.ratingText}>{vehicle.noteMoyenne.toFixed(1)}</Text>
          </View>
        </View>

        {/* Specs rapides */}
        <View style={styles.specsRow}>
          <View style={styles.specChip}>
            <Fuel size={12} color="#4B5563" />
            <Text style={styles.specText}>{vehicle.carburant}</Text>
          </View>
          <View style={styles.specChip}>
            <Gauge size={12} color="#4B5563" />
            <Text style={styles.specText}>{vehicle.transmission}</Text>
          </View>
          <View style={styles.specChip}>
            <Text style={styles.specText}>{vehicle.totalReservations} locations</Text>
          </View>
        </View>

        {/* Ligne Tarif & Switch de statut */}
        <View style={styles.footerRow}>
          <View>
            <Text style={styles.priceValue}>
              {formatCurrency(vehicle.prixParJour, selectedCurrency)}
            </Text>
            <Text style={styles.pricePeriod}>par jour</Text>
          </View>

          <View style={styles.actionsBox}>
            <View style={styles.toggleGroup}>
              <Text style={styles.toggleLabel}>
                {isAvailable ? 'Actif' : 'Inactif'}
              </Text>
              <Switch
                value={isAvailable}
                onValueChange={() => onToggleStatus(vehicle.id, vehicle.statut)}
                trackColor={{ false: '#D1D5DB', true: '#34D399' }}
                thumbColor="#FFFFFF"
              />
            </View>

            {onEditPress && (
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => onEditPress(vehicle)}
                activeOpacity={0.7}
              >
                <Settings size={16} color="#041912" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 16,
  },
  imageContainer: {
    width: '100%',
    height: 160,
    position: 'relative',
    backgroundColor: '#F3F4F6',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
  },
  plateBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(5, 27, 20, 0.85)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  plateText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
    color: '#FFFFFF',
    letterSpacing: 0.5,
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
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 16,
    color: '#041912',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  locationText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: '#6B7280',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  ratingText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
    color: '#92400E',
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  specChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    gap: 4,
  },
  specText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11,
    color: '#4B5563',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  priceValue: {
    fontFamily: theme.typography.fontFamily.displayBold,
    fontSize: 17,
    color: '#041912',
  },
  pricePeriod: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: '#6B7280',
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
  },
  toggleLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: '#4B5563',
  },
  editBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
