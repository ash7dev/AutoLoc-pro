import React, { useRef } from 'react';
import { StyleSheet, Text, View, Pressable, Animated } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Star, MapPin, Fuel, Gauge, MoreVertical, SlidersHorizontal, Sparkles, TrendingUp, Users, ChevronRight } from 'lucide-react-native';
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

  const scale = useRef(new Animated.Value(1)).current;
  const handlePressIn = () => Animated.spring(scale, { toValue: 0.975, useNativeDriver: true, speed: 40, bounciness: 4 }).start();
  const handlePressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 8 }).start();

  const getStatusMeta = () => {
    switch (vehicle.statut) {
      case 'DISPONIBLE':
      case 'VERIFIE':
        return { label: 'Disponible', text: '#065F46', dot: '#10B981' };
      case 'EN_LOCATION':
        return { label: 'En location', text: '#1E40AF', dot: '#3B82F6' };
      case 'EN_ATTENTE_VALIDATION':
        return { label: 'En vérification', text: '#92400E', dot: '#F59E0B' };
      case 'REFUSE':
        return { label: 'Dossier refusé', text: '#991B1B', dot: '#EF4444' };
      case 'MAINTENANCE':
        return { label: 'En maintenance', text: '#92400E', dot: '#F59E0B' };
      default:
        return { label: 'Inactif', text: '#334155', dot: '#64748B' };
    }
  };

  const status = getStatusMeta();
  const noteVal = vehicle.noteMoyenne ? Number(vehicle.noteMoyenne) : 0;
  const hasReviews = (vehicle.totalReservations || 0) > 0 && noteVal > 0;
  const hasCumulativeEarnings = (vehicle.revenusCumules || 0) > 0;
  const handleManagePress = () => (onQuickActionPress ? onQuickActionPress(vehicle) : onEditPress?.(vehicle));

  return (
    <Animated.View style={[styles.cardWrapper, { transform: [{ scale }] }]}>
      <Pressable
        style={styles.card}
        onPress={handleManagePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {/* ---------- Zone Photo ---------- */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: vehicle.photoUrl }} style={styles.image} contentFit="cover" transition={220} />

          <LinearGradient
            colors={['rgba(5,27,20,0.15)', 'transparent', 'rgba(4,20,15,0.9)']}
            locations={[0, 0.5, 1]}
            style={styles.gradientOverlay}
          />

          {/* Status — pastille gauche */}
          <View style={styles.glassBadge}>
            <View style={[styles.statusDot, { backgroundColor: status.dot }]} />
            <Text style={[styles.statusBadgeText, { color: status.text }]}>{status.label}</Text>
          </View>


          {/* Plaque d'immatriculation façon plaque métallique */}
          <View style={styles.plateBadge}>
            <Text style={styles.plateText}>{vehicle.immatriculation}</Text>
          </View>

          {/* Revenus cumulés */}
          {hasCumulativeEarnings && (
            <View style={styles.earningsTag}>
              <TrendingUp size={12} color="#6EE7B7" />
              <Text style={styles.earningsTagText}>
                {formatDirectPrice(vehicle.revenusCumules || 0, selectedCurrency)} générés
              </Text>
            </View>
          )}
        </View>

        {/* ---------- Contenu ---------- */}
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View style={styles.titleBox}>
              <Text style={styles.title} numberOfLines={1}>
                {vehicle.marque} {vehicle.modele}
              </Text>
              <View style={styles.locationRow}>
                <MapPin size={12.5} color="#94A3B8" />
                <Text style={styles.locationText}>
                  {vehicle.ville} <Text style={styles.locationDot}>•</Text> {vehicle.annee}
                </Text>
              </View>
            </View>

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

          {/* Spec pills — icônes en pastille colorée sur une seule ligne */}
          <View style={styles.specsRow}>
            {vehicle.carburant ? (
              <View style={styles.specChip}>
                <View style={[styles.specIconDot, { backgroundColor: '#ECFDF5' }]}>
                  <Fuel size={12} color="#059669" />
                </View>
                <Text style={styles.specText}>{vehicle.carburant}</Text>
              </View>
            ) : null}

            {vehicle.transmission ? (
              <View style={styles.specChip}>
                <View style={[styles.specIconDot, { backgroundColor: '#EFF6FF' }]}>
                  <Gauge size={12} color="#2563EB" />
                </View>
                <Text style={styles.specText}>{vehicle.transmission}</Text>
              </View>
            ) : null}

            {vehicle.places ? (
              <View style={styles.specChip}>
                <View style={[styles.specIconDot, { backgroundColor: '#F5F3FF' }]}>
                  <Users size={12} color="#7C3AED" />
                </View>
                <Text style={styles.specText}>{vehicle.places} pl.</Text>
              </View>
            ) : null}
          </View>

          {/* ---------- Footer : Prix & Actions ---------- */}
          <View style={styles.footerRow}>
            <View style={styles.priceBox}>
              <Text style={styles.priceValue}>{formatDirectPrice(vehicle.prixParJour, selectedCurrency)}</Text>
              <Text style={styles.pricePeriod}>/ jour</Text>
            </View>

            <Pressable
              style={({ pressed }) => [styles.manageBtn, pressed && styles.manageBtnPressed]}
              onPress={(e) => {
                e.stopPropagation();
                handleManagePress();
              }}
              hitSlop={6}
            >
              <SlidersHorizontal size={14} color="#FFFFFF" />
              <Text style={styles.manageBtnText}>Gérer</Text>
              <ChevronRight size={14} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 18,
    borderRadius: 28,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  imageContainer: {
    width: '100%',
    height: 208,
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
  glassBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
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
  topToggleBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingLeft: 10,
    paddingRight: 4,
    paddingVertical: 3,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  floatingMenuBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  floatingMenuBlur: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(5, 27, 20, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  plateBadge: {
    position: 'absolute',
    bottom: 12,
    right: 14,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#0F172A',
  },
  plateText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11.5,
    color: '#0F172A',
    letterSpacing: 0.8,
  },
  earningsTag: {
    position: 'absolute',
    bottom: 12,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: 'rgba(5, 27, 20, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(110,231,183,0.35)',
  },
  earningsTagText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#ECFDF5',
  },
  content: {
    padding: 18,
    gap: 14,
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
    fontSize: 19,
    color: '#0F172A',
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 5,
  },
  locationText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12.5,
    color: '#64748B',
  },
  locationDot: {
    color: '#CBD5E1',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 9,
    paddingVertical: 5,
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
    paddingVertical: 5,
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
    flexWrap: 'nowrap',
  },
  specChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingLeft: 4,
    paddingRight: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    gap: 6,
  },
  specIconDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  priceBox: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  priceValue: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 21,
    color: '#059669',
    letterSpacing: -0.3,
  },
  pricePeriod: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11.5,
    color: '#94A3B8',
    marginBottom: 3,
  },
  actionsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
  manageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: '#0F172A',
  },
  manageBtnPressed: {
    backgroundColor: '#059669',
  },
  manageBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#FFFFFF',
  },
});