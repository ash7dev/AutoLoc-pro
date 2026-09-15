import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
  Dimensions,
  LayoutChangeEvent,
} from 'react-native';
import { Image } from 'expo-image';
import { Heart, Star, MapPin, Fuel, Settings, Users } from 'lucide-react-native';
import { VehicleFeedItem } from '../types';
import { theme } from '../../../core/theme';
import { useAppStore } from '../../../core/store/useAppStore';
import { formatConvertedPrice } from '../../../core/utils/currency';

const DEFAULT_CAR_PHOTO =
  'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800&auto=format&fit=crop';

const DEMO_EXTRA_CAR_PHOTOS = [
  'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?q=80&w=800&auto=format&fit=crop',
];

export interface AirbnbVehicleCardProps {
  vehicle: VehicleFeedItem & { photos?: Array<{ url: string }> | string[] };
  onPress: (vehicle: VehicleFeedItem) => void;
  onFavoriteToggle?: (vehicleId: string) => void;
  isFavorited?: boolean;
}

export const AirbnbVehicleCard: React.FC<AirbnbVehicleCardProps> = ({
  vehicle,
  onPress,
  onFavoriteToggle,
  isFavorited = false,
}) => {
  const selectedCurrency = useAppStore((state) => state.selectedCurrency);
  const listRef = useRef<FlatList>(null);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [cardWidth, setCardWidth] = useState<number>(
    Dimensions.get('window').width - 32
  );

  // Extrait la liste de photos, ou retombe sur photoUrl / set de démo
  const photosList: string[] = React.useMemo(() => {
    let list: string[] = [];
    if (vehicle.photos && Array.isArray(vehicle.photos) && vehicle.photos.length > 0) {
      list = vehicle.photos
        .map((p) => (typeof p === 'string' ? p : p?.url))
        .filter(Boolean) as string[];
    } else if (vehicle.photoUrl) {
      list = [vehicle.photoUrl];
    }

    if (list.length === 0) {
      return DEMO_EXTRA_CAR_PHOTOS;
    }

    // Garantit au moins 3 photos pour que le swipe fonctionne partout
    if (list.length === 1) {
      const charCode = vehicle.id ? vehicle.id.charCodeAt(0) : 0;
      const extra1 = DEMO_EXTRA_CAR_PHOTOS[charCode % DEMO_EXTRA_CAR_PHOTOS.length];
      const extra2 = DEMO_EXTRA_CAR_PHOTOS[(charCode + 1) % DEMO_EXTRA_CAR_PHOTOS.length];
      return [list[0], extra1, extra2];
    }

    return list;
  }, [vehicle.photos, vehicle.photoUrl, vehicle.id]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    if (width > 0 && Math.abs(width - cardWidth) > 2) {
      setCardWidth(width);
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const viewSize = event.nativeEvent.layoutMeasurement.width || cardWidth;
    if (viewSize > 0) {
      const index = Math.round(contentOffset / viewSize);
      if (index !== activeImageIndex && index >= 0 && index < photosList.length) {
        setActiveImageIndex(index);
      }
    }
  };

  const formattedPrice = formatConvertedPrice(vehicle.prixParJour, selectedCurrency);
  const hasRating = vehicle.note && vehicle.note > 0;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.cardContainer,
        pressed && styles.cardPressed,
      ]}
      onPress={() => onPress(vehicle)}
    >
      {/* Container d'image avec carrousel horizontal */}
      <View style={styles.imageWrapper} onLayout={handleLayout}>
        <FlatList
          ref={listRef}
          data={photosList}
          horizontal
          pagingEnabled
          snapToInterval={cardWidth}
          snapToAlignment="start"
          decelerationRate="fast"
          disableIntervalMomentum
          bounces={false}
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.imageScroll}
          keyExtractor={(_, idx) => `${vehicle.id}-img-${idx}`}
          getItemLayout={(_, index) => ({
            length: cardWidth,
            offset: cardWidth * index,
            index,
          })}
          renderItem={({ item: imgUri, index: idx }) => (
            <Image
              key={`${vehicle.id}-img-${idx}`}
              source={{ uri: imgUri }}
              style={[styles.cardImage, { width: cardWidth }]}
              contentFit="cover"
              transition={200}
            />
          )}
        />

        {/* Bouton favori flottant style Airbnb glassmorphism */}
        {onFavoriteToggle && (
          <Pressable
            style={styles.favoriteBtn}
            onPress={(e) => {
              e.stopPropagation();
              onFavoriteToggle(vehicle.id);
            }}
            hitSlop={8}
          >
            <Heart
              size={19}
              color={isFavorited ? '#EF4444' : '#111827'}
              fill={isFavorited ? '#EF4444' : 'transparent'}
            />
          </Pressable>
        )}

        {/* Dots de pagination si plusieurs photos */}
        {photosList.length > 1 && (
          <View style={styles.paginationDots}>
            {photosList.slice(0, 5).map((_, idx) => (
              <View
                key={`dot-${idx}`}
                style={[
                  styles.dot,
                  activeImageIndex === idx && styles.activeDot,
                ]}
              />
            ))}
          </View>
        )}
      </View>

      {/* Contenu texte & infos véhicule (style Airbnb épuré) */}
      <View style={styles.contentBody}>
        {/* Ligne 1 : Titre marque/modèle + étoile note */}
        <View style={styles.titleRow}>
          <Text style={styles.titleText} numberOfLines={1}>
            {vehicle.marque} {vehicle.modele} {vehicle.annee ? `(${vehicle.annee})` : ''}
          </Text>

          {hasRating ? (
            <View style={styles.ratingBox}>
              <Star size={13} color="#111827" fill="#111827" />
              <Text style={styles.ratingVal}>{vehicle.note.toFixed(1)}</Text>
              {vehicle.totalAvis > 0 && (
                <Text style={styles.ratingCount}>({vehicle.totalAvis})</Text>
              )}
            </View>
          ) : (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>Nouveau</Text>
            </View>
          )}
        </View>

        {/* Ligne 2 : Localisation zone & ville */}
        <View style={styles.locationRow}>
          <MapPin size={13} color="#64748B" />
          <Text style={styles.locationText} numberOfLines={1}>
            {vehicle.ville || 'Dakar'} • Sénégal
          </Text>
        </View>

        {/* Ligne 3 : Spécifications techniques */}
        <View style={styles.specsRow}>
          {vehicle.transmission && (
            <View style={styles.specChip}>
              <Settings size={11} color="#475569" />
              <Text style={styles.specText}>{vehicle.transmission}</Text>
            </View>
          )}
          {vehicle.carburant && (
            <View style={styles.specChip}>
              <Fuel size={11} color="#475569" />
              <Text style={styles.specText}>{vehicle.carburant}</Text>
            </View>
          )}
          {vehicle.nombrePlaces && (
            <View style={styles.specChip}>
              <Users size={11} color="#475569" />
              <Text style={styles.specText}>{vehicle.nombrePlaces} pl.</Text>
            </View>
          )}
        </View>

        {/* Ligne 4 : Prix par jour en devises */}
        <View style={styles.priceRow}>
          <Text style={styles.priceValue}>{formattedPrice}</Text>
          <Text style={styles.pricePeriod}>/ jour</Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.card, // 20px
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardPressed: {
    opacity: 0.96,
    transform: [{ scale: 0.995 }],
  },
  imageWrapper: {
    width: '100%',
    height: 220,
    backgroundColor: '#0F172A',
    position: 'relative',
  },
  imageScroll: {
    width: '100%',
    height: '100%',
  },
  cardImage: {
    height: 220,
  },
  favoriteBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.90)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  paginationDots: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  contentBody: {
    padding: theme.spacing[4],
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleText: {
    fontFamily: theme.typography.fontFamily.displaySemiBold, // Fraunces_600SemiBold
    fontSize: 17,
    color: theme.primitives.forest[800],
    flex: 1,
    marginRight: 8,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingVal: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13,
    color: '#0F172A',
  },
  ratingCount: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    color: '#64748B',
  },
  newBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  newBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 13,
    color: '#64748B',
  },
  specsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 2,
  },
  specChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  specText: {
    fontSize: 11,
    fontFamily: theme.typography.fontFamily.medium,
    color: '#475569',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  priceValue: {
    fontFamily: theme.typography.fontFamily.extraBold, // Inter_800ExtraBold
    fontVariant: ['tabular-nums'],
    fontSize: 18,
    color: theme.primitives.forest[800],
  },
  pricePeriod: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 13,
    color: '#64748B',
    marginLeft: 4,
  },
});