import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Sparkles,
  Heart,
  MapPin,
  Star,
  Settings,
  Flame,
  Users,
} from 'lucide-react-native';
import { VehicleFeedItem } from '../types';
import { useAppStore } from '../../../core/store/useAppStore';
import { formatConvertedPrice } from '../../../core/utils/currency';

interface VehicleFeedCardProps {
  vehicle: VehicleFeedItem;
  onPress: (vehicle: VehicleFeedItem) => void;
  onFavoriteToggle?: (vehicleId: string) => void;
  isFavorited?: boolean;
}

const DEFAULT_CAR_PHOTO = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800&auto=format&fit=crop';

export const VehicleFeedCard: React.FC<VehicleFeedCardProps> = ({
  vehicle,
  onPress,
  onFavoriteToggle,
  isFavorited = false,
}) => {
  const selectedCurrency = useAppStore((state) => state.selectedCurrency);

  const photoUri = vehicle.photoUrl || DEFAULT_CAR_PHOTO;
  const isPremium = vehicle.isFeatured || vehicle.scoreGlobal > 8;

  // Instant converted price
  const formattedPrice = formatConvertedPrice(vehicle.prixParJour, selectedCurrency);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.cardContainer,
        pressed && styles.cardPressed,
      ]}
      onPress={() => onPress(vehicle)}
    >
      {/* Photo de fond pleine largeur */}
      <Image
        source={{ uri: photoUri }}
        style={styles.backgroundImage}
        contentFit="cover"
        transition={300}
      />

      {/* Gradient de protection visuelle (Tiers inférieur) */}
      <LinearGradient
        colors={['transparent', 'rgba(0, 0, 0, 0.35)', 'rgba(0, 0, 0, 0.90)']}
        locations={[0.3, 0.65, 1]}
        style={styles.gradientOverlay}
      />

      {/* Top Header Overlay */}
      <View style={styles.topHeader}>
        {isPremium ? (
          <View style={styles.premiumBadge}>
            <Sparkles size={12} color="#F59E0B" style={styles.badgeIcon} />
            <Text style={styles.premiumText}>PREMIUM</Text>
          </View>
        ) : (
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{vehicle.type || 'LUXE'}</Text>
          </View>
        )}

        {/* Bouton Favoris Glassmorphism */}
        {onFavoriteToggle && (
          <Pressable
            style={styles.favoriteButton}
            onPress={(e) => {
              e.stopPropagation();
              onFavoriteToggle(vehicle.id);
            }}
            hitSlop={8}
          >
            <Heart
              size={18}
              color={isFavorited ? '#EF4444' : '#111827'}
              fill={isFavorited ? '#EF4444' : 'transparent'}
            />
          </Pressable>
        )}
      </View>

      {/* Bottom Content Overlay */}
      <View style={styles.bottomContent}>
        {/* Titre Marque + Modèle */}
        <Text style={styles.titleText} numberOfLines={1}>
          {vehicle.marque} {vehicle.modele}
        </Text>

        {/* Ligne Sub-title : Ville & Note */}
        <View style={styles.subInfoRow}>
          <View style={styles.infoPill}>
            <MapPin size={13} color="#E5E7EB" />
            <Text style={styles.subInfoText}>{vehicle.ville || 'Dakar'}</Text>
          </View>

          <Text style={styles.dotSeparator}>•</Text>

          <View style={styles.infoPill}>
            <Star size={13} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.ratingText}>
              {vehicle.note > 0 ? vehicle.note.toFixed(1) : '5.0'}
            </Text>
            {vehicle.totalAvis > 0 && (
              <Text style={styles.reviewCountText}>({vehicle.totalAvis})</Text>
            )}
          </View>
        </View>

        {/* Badges d'équipement dépolis (Glassmorphism) */}
        <View style={styles.specPillsContainer}>
          {vehicle.transmission && (
            <View style={styles.specPill}>
              <Settings size={12} color="#D1D5DB" />
              <Text style={styles.specText}>{vehicle.transmission}</Text>
            </View>
          )}

          {vehicle.carburant && (
            <View style={styles.specPill}>
              <Flame size={12} color="#D1D5DB" />
              <Text style={styles.specText}>{vehicle.carburant}</Text>
            </View>
          )}

          {vehicle.nombrePlaces && (
            <View style={styles.specPill}>
              <Users size={12} color="#D1D5DB" />
              <Text style={styles.specText}>{vehicle.nombrePlaces} pl.</Text>
            </View>
          )}
        </View>

        {/* Ligne de Prix Net en Devise sélectionnée */}
        <View style={styles.priceRow}>
          <Text style={styles.priceMain}>{formattedPrice}</Text>
          <Text style={styles.pricePeriod}>/ jour</Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: 285,
    height: 370,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    marginRight: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 14,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  cardPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.95,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topHeader: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  badgeIcon: {
    marginRight: 4,
  },
  premiumText: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  typeBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  typeText: {
    color: '#F9FAFB',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  favoriteButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  bottomContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    zIndex: 10,
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  subInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subInfoText: {
    color: '#E5E7EB',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 3,
  },
  dotSeparator: {
    color: '#9CA3AF',
    fontSize: 12,
    marginHorizontal: 6,
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 3,
  },
  reviewCountText: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '400',
    marginLeft: 2,
  },
  specPillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  specPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  specText: {
    color: '#F3F4F6',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceMain: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  pricePeriod: {
    color: '#D1D5DB',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
});
