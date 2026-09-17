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
        return { label: 'Disponible', text: '#34D399', dot: '#34D399' };
      case 'EN_LOCATION':
        return { label: 'En location', text: '#60A5FA', dot: '#60A5FA' };
      case 'EN_ATTENTE_VALIDATION':
        return { label: 'En vérification', text: '#FBBF24', dot: '#FBBF24' };
      case 'REFUSE':
        return { label: 'Dossier refusé', text: '#F87171', dot: '#F87171' };
      case 'MAINTENANCE':
        return { label: 'En maintenance', text: '#FBBF24', dot: '#FBBF24' };
      default:
        return { label: 'Inactif', text: '#94A3B8', dot: '#94A3B8' };
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
            colors={['rgba(4,25,18,0.4)', 'transparent', 'rgba(4,25,18,0.85)']}
            locations={[0, 0.45, 1]}
            style={styles.gradientOverlay}
          />

          {/* Status — Pastille verre somptueuse à gauche */}
          <View style={styles.glassBadge}>
            <View style={[styles.statusDot, { backgroundColor: status.dot }]} />
            <Text style={[styles.statusBadgeText, { color: status.text }]}>{status.label}</Text>
          </View>

          {/* Bouton Options Rapides à droite */}
          <Pressable
            style={styles.floatingMenuBtn}
            onPress={(e) => {
              e.stopPropagation();
              onQuickActionPress?.(vehicle);
            }}
            hitSlop={8}
          >
            <View style={styles.floatingMenuCircle}>
              <MoreVertical size={16} color="#FFFFFF" />
            </View>
          </Pressable>

          {/* Plaque d'immatriculation Dark Glass */}
          <View style={styles.plateBadge}>
            <Text style={styles.plateText}>{vehicle.immatriculation}</Text>
          </View>

          {/* Revenus cumulés */}
          {hasCumulativeEarnings && (
            <View style={styles.earningsTag}>
              <TrendingUp size={12} color="#34D399" />
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
                <MapPin size={12.5} color="#059669" />
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
            ) : null}
          </View>

          {/* Spec pills — icônes en pastille colorée */}
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
              <SlidersHorizontal size={13} color="#4ADE80" />
              <Text style={styles.manageBtnText}>Gérer</Text>
              <ChevronRight size={13} color="#4ADE80" />
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 16,
    borderRadius: 24,
    shadowColor: '#041912',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  imageContainer: {
    width: '100%',
    height: 205,
    position: 'relative',
    backgroundColor: '#041912',
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
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 5.5,
    borderRadius: 20,
    backgroundColor: 'rgba(4, 25, 18, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.35)',
  },
  statusDot: {
    width: 6.5,
    height: 6.5,
    borderRadius: 3.25,
  },
  statusBadgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
  },
  floatingMenuBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  floatingMenuCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(4, 25, 18, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  plateBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(4, 25, 18, 0.88)',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
  },
  plateText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    color: '#ECFDF5',
    letterSpacing: 0.8,
  },
  earningsTag: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 5.5,
    borderRadius: 14,
    backgroundColor: 'rgba(4, 25, 18, 0.90)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.4)',
  },
  earningsTagText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#34D399',
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
    fontFamily: 'Fraunces_700Bold',
    fontSize: 18.5,
    color: '#0F172A',
    lineHeight: 23,
    letterSpacing: -0.2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
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
    borderColor: '#E2E8F0',
    gap: 5,
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
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  priceBox: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  priceValue: {
    fontFamily: 'Fraunces_700Bold',
    fontVariant: ['tabular-nums'],
    fontSize: 21,
    color: '#047857',
    letterSpacing: -0.3,
  },
  pricePeriod: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11.5,
    color: '#94A3B8',
    marginBottom: 2.5,
  },
  manageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
    backgroundColor: '#041912',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.35)',
  },
  manageBtnPressed: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  manageBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#FFFFFF',
  },
});